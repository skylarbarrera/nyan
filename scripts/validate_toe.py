#!/usr/bin/env python3
"""
TouchDesigner ASCII Validator

Validates expanded .toe.dir projects before collapse.
Catches errors that TD silently fails on.

Usage:
    python validate_toe.py ./project.toe.dir
    python validate_toe.py ./project.toe.dir --verbose
"""

import os
import sys
import ast
import re
from pathlib import Path
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class ValidationResult:
    errors: list = field(default_factory=list)
    warnings: list = field(default_factory=list)
    info: list = field(default_factory=list)

    def add_error(self, file: str, line: Optional[int], msg: str):
        loc = f"{file}:{line}" if line else file
        self.errors.append(f"{loc} - {msg}")

    def add_warning(self, file: str, msg: str):
        self.warnings.append(f"{file} - {msg}")

    def add_info(self, msg: str):
        self.info.append(msg)

    @property
    def has_errors(self) -> bool:
        return len(self.errors) > 0

    @property
    def has_warnings(self) -> bool:
        return len(self.warnings) > 0


VALID_FAMILIES = {"TOP", "CHOP", "SOP", "DAT", "COMP", "MAT", "POP"}


def validate_n_file(filepath: Path, result: ValidationResult) -> Optional[dict]:
    """Validate a .n node definition file. Returns node info if valid."""

    rel_path = filepath.name
    try:
        content = filepath.read_text()
    except Exception as e:
        result.add_error(rel_path, None, f"Cannot read file: {e}")
        return None

    lines = content.strip().split('\n')

    if not lines:
        result.add_error(rel_path, None, "Empty file")
        return None

    # Check first line: FAMILY:type
    first_line = lines[0].strip()
    if ':' not in first_line:
        result.add_error(rel_path, 1, f"Invalid format, expected FAMILY:type, got: {first_line}")
        return None

    family, op_type = first_line.split(':', 1)
    if family not in VALID_FAMILIES:
        result.add_error(rel_path, 1, f"Invalid family '{family}', must be one of: {VALID_FAMILIES}")
        return None

    # Check for 'end' keyword
    if not lines[-1].strip() == 'end':
        result.add_error(rel_path, len(lines), "File must end with 'end'")

    # Check for required sections
    has_tile = any(line.strip().startswith('tile ') for line in lines)
    has_flags = any(line.strip().startswith('flags =') for line in lines)
    has_color = any(line.strip().startswith('color ') for line in lines)

    if not has_tile:
        result.add_warning(rel_path, "Missing 'tile' definition")
    if not has_flags:
        result.add_warning(rel_path, "Missing 'flags' definition")
    if not has_color:
        result.add_warning(rel_path, "Missing 'color' definition")

    # Extract inputs (wiring)
    inputs = {}
    in_inputs_block = False
    for i, line in enumerate(lines, 1):
        stripped = line.strip()

        if stripped == 'inputs':
            in_inputs_block = True
            continue

        if in_inputs_block:
            if stripped == '{':
                continue
            if stripped == '}':
                in_inputs_block = False
                continue

            # Check for TAB vs spaces
            if '\t' not in line and stripped:
                result.add_error(rel_path, i, f"inputs entry uses SPACES, must use TAB: '{stripped}'")
            else:
                # Parse input: INDEX\tSOURCE_NAME
                parts = stripped.split('\t')
                if len(parts) >= 2:
                    try:
                        idx = int(parts[0])
                        source = parts[1].strip()
                        inputs[idx] = source
                    except ValueError:
                        result.add_error(rel_path, i, f"Invalid input index: {parts[0]}")

    node_name = filepath.stem
    return {
        'name': node_name,
        'family': family,
        'type': op_type,
        'inputs': inputs,
        'path': str(filepath)
    }


def validate_parm_file(filepath: Path, result: ValidationResult):
    """Validate a .parm parameter file."""

    rel_path = filepath.name
    try:
        content = filepath.read_text()
    except Exception as e:
        result.add_error(rel_path, None, f"Cannot read file: {e}")
        return

    lines = content.strip().split('\n')

    if not lines:
        result.add_warning(rel_path, "Empty parameter file")
        return

    # Check for ? delimiters
    if lines[0].strip() != '?':
        result.add_error(rel_path, 1, "Parameter file must start with '?'")

    if lines[-1].strip() != '?':
        result.add_error(rel_path, len(lines), "Parameter file must end with '?'")

    # Check parameter format
    for i, line in enumerate(lines[1:-1], 2):
        stripped = line.strip()
        if not stripped:
            continue

        parts = stripped.split(None, 2)  # Split into max 3 parts
        if len(parts) < 2:
            result.add_warning(rel_path, f"Line {i}: Invalid format, expected 'name flags value'")
            continue

        # Check flags
        try:
            flags = int(parts[1])
            if flags not in (0, 17):
                result.add_warning(rel_path, f"Line {i}: Unusual flags value {flags} (typically 0 or 17)")
        except ValueError:
            result.add_error(rel_path, i, f"Invalid flags value: {parts[1]}")


def validate_text_file(filepath: Path, result: ValidationResult):
    """Validate a .text script file (binary format)."""

    rel_path = filepath.name
    try:
        content = filepath.read_bytes()
    except Exception as e:
        result.add_error(rel_path, None, f"Cannot read file: {e}")
        return

    # Check binary header
    if len(content) < 27:
        result.add_error(rel_path, None, f"File too short ({len(content)} bytes), missing binary header (need 27+ bytes)")
        return

    # Check format marker
    if not content.startswith(b'2\n*'):
        result.add_error(rel_path, None, "Missing binary header - file appears to be plain text, not TD format")
        result.add_info(f"  Hint: Use write_td_text_file() from the editing guide to create proper .text files")
        return

    # Extract Python content (skip 27-byte header)
    try:
        script_content = content[27:].decode('utf-8')
    except UnicodeDecodeError as e:
        result.add_error(rel_path, None, f"Cannot decode script content: {e}")
        return

    # Validate Python syntax
    try:
        ast.parse(script_content)
    except SyntaxError as e:
        result.add_error(rel_path, e.lineno, f"Python SyntaxError: {e.msg}")

    # Check for ChopExec callbacks
    if 'chopexec' in filepath.stem.lower() or 'chop_exec' in filepath.stem.lower():
        expected_callbacks = ['onOffToOn', 'onOnToOff', 'onValueChange', 'whileOn']
        for cb in expected_callbacks:
            if cb not in script_content:
                result.add_warning(rel_path, f"ChopExec missing callback: {cb}")


def validate_toc(toc_path: Path, dir_path: Path, result: ValidationResult):
    """Validate .toc against actual files."""

    try:
        toc_content = toc_path.read_text()
    except Exception as e:
        result.add_error(".toc", None, f"Cannot read file: {e}")
        return

    toc_entries = set(line.strip() for line in toc_content.split('\n') if line.strip())

    # Check all toc entries exist
    for entry in toc_entries:
        entry_path = dir_path / entry
        if not entry_path.exists():
            result.add_error(".toc", None, f"Listed file does not exist: {entry}")

    # Check all files are in toc (excluding hidden files)
    for file_path in dir_path.rglob('*'):
        if file_path.is_file():
            rel = file_path.relative_to(dir_path)
            rel_str = str(rel)

            # Skip hidden files and toc itself
            if rel_str.startswith('.') or rel_str == '.toc':
                continue

            if rel_str not in toc_entries:
                result.add_warning(f".toc", f"File not listed in .toc: {rel_str}")


def validate_wiring(nodes: dict, result: ValidationResult):
    """Validate all wiring references exist."""

    node_names = set(nodes.keys())

    for name, node in nodes.items():
        for idx, source in node.get('inputs', {}).items():
            if source not in node_names:
                # Check for near matches
                close_matches = [n for n in node_names if n.lower() == source.lower()]
                if close_matches:
                    result.add_error(
                        node['path'], None,
                        f"Input {idx} references '{source}' (not found). Did you mean '{close_matches[0]}'?"
                    )
                else:
                    result.add_error(
                        node['path'], None,
                        f"Input {idx} references non-existent node: '{source}'"
                    )

    # Check for orphans (no incoming connections)
    referenced = set()
    for node in nodes.values():
        for source in node.get('inputs', {}).values():
            referenced.add(source)

    for name in node_names:
        if name not in referenced:
            # Only warn if it's not a typical source (noise, constant, etc.)
            node = nodes[name]
            if node['type'] not in ('noise', 'constant', 'moviefilein', 'audiodevicein', 'midiin', 'oscin'):
                result.add_warning(node['path'], f"No incoming connections (orphan source)")


def validate_project(dir_path: Path, verbose: bool = False) -> ValidationResult:
    """Validate an expanded .toe.dir project."""

    result = ValidationResult()

    if not dir_path.exists():
        result.add_error(str(dir_path), None, "Directory does not exist")
        return result

    if not dir_path.is_dir():
        result.add_error(str(dir_path), None, "Path is not a directory")
        return result

    # Collect all nodes
    nodes = {}
    n_count = 0
    parm_count = 0
    text_count = 0

    # Validate .n files
    for n_file in dir_path.rglob('*.n'):
        n_count += 1
        node_info = validate_n_file(n_file, result)
        if node_info:
            nodes[node_info['name']] = node_info

    # Validate .parm files
    for parm_file in dir_path.rglob('*.parm'):
        parm_count += 1
        validate_parm_file(parm_file, result)

    # Validate .text files
    for text_file in dir_path.rglob('*.text'):
        text_count += 1
        validate_text_file(text_file, result)

    # Validate .toc
    toc_path = dir_path / '.toc'
    if toc_path.exists():
        validate_toc(toc_path, dir_path, result)
    else:
        # Try parent directory for .toc
        parent_toc = dir_path.parent / f"{dir_path.name.replace('.dir', '.toc')}"
        if parent_toc.exists():
            validate_toc(parent_toc, dir_path, result)
        else:
            result.add_warning(".toc", "No .toc file found")

    # Validate wiring
    validate_wiring(nodes, result)

    # Summary
    result.add_info(f"Checked: {n_count} .n files, {parm_count} .parm files, {text_count} .text files")

    return result


def main():
    if len(sys.argv) < 2:
        print("Usage: python validate_toe.py <project.toe.dir> [--verbose]")
        print("\nValidates expanded TouchDesigner projects before collapse.")
        sys.exit(2)

    dir_path = Path(sys.argv[1])
    verbose = '--verbose' in sys.argv or '-v' in sys.argv

    print(f"Validating: {dir_path}\n")

    result = validate_project(dir_path, verbose)

    # Print results
    for info in result.info:
        print(f"  {info}")

    print()

    if result.errors:
        print(f"ERRORS ({len(result.errors)}):")
        for err in result.errors:
            print(f"  ✗ {err}")
        print()

    if result.warnings:
        print(f"WARNINGS ({len(result.warnings)}):")
        for warn in result.warnings:
            print(f"  ⚠ {warn}")
        print()

    if not result.errors and not result.warnings:
        print("✓ All checks passed!")
    elif result.errors:
        print(f"✗ {len(result.errors)} error(s), {len(result.warnings)} warning(s)")
    else:
        print(f"⚠ {len(result.warnings)} warning(s), no errors")

    # Exit code
    if result.errors:
        sys.exit(2)
    elif result.warnings:
        sys.exit(1)
    else:
        sys.exit(0)


if __name__ == '__main__':
    main()
