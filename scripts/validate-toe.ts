#!/usr/bin/env bun
/**
 * TouchDesigner ASCII Validator (TypeScript)
 *
 * Validates expanded .toe.dir projects before collapse.
 * Catches errors that TD silently fails on.
 *
 * Usage:
 *   bun scripts/validate-toe.ts ./project.toe.dir
 *   bun scripts/validate-toe.ts ./project.toe.dir --verbose
 */

import {
  readFileSync,
  readdirSync,
  existsSync,
  statSync,
} from "fs";
import { join, basename, extname } from "path";

// ─── Types ─────────────────────────────────────────────────────────

export interface NodeInfo {
  name: string;
  family: string;
  type: string;
  inputs: Record<number, string>;
  path: string;
}

// ─── ValidationResult ──────────────────────────────────────────────

export class ValidationResult {
  errors: string[] = [];
  warnings: string[] = [];
  info: string[] = [];

  addError(file: string, line: number | null, msg: string): void {
    const loc = line != null ? `${file}:${line}` : file;
    this.errors.push(`${loc} - ${msg}`);
  }

  addWarning(file: string, msg: string): void {
    this.warnings.push(`${file} - ${msg}`);
  }

  addInfo(msg: string): void {
    this.info.push(msg);
  }

  get hasErrors(): boolean {
    return this.errors.length > 0;
  }

  get hasWarnings(): boolean {
    return this.warnings.length > 0;
  }
}

// ─── Constants ─────────────────────────────────────────────────────

const VALID_FAMILIES = new Set([
  "TOP",
  "CHOP",
  "SOP",
  "DAT",
  "COMP",
  "MAT",
  "POP",
]);

// Types that are expected to have no incoming references (sources and terminals)
const ORPHAN_EXEMPT_TYPES = new Set([
  "noise",
  "constant",
  "moviefilein",
  "audiodevicein",
  "midiin",
  "oscin",
  "null",
]);

// ─── Helpers ───────────────────────────────────────────────────────

function walkDir(dir: string): string[] {
  const results: string[] = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkDir(full));
    } else if (entry.isFile()) {
      results.push(full);
    }
  }
  return results;
}

// ─── Validators ────────────────────────────────────────────────────

export function validateNFile(
  filepath: string,
  result: ValidationResult
): NodeInfo | null {
  const relPath = basename(filepath);
  let content: string;
  try {
    content = readFileSync(filepath, "utf-8");
  } catch (e: any) {
    result.addError(relPath, null, `Cannot read file: ${e.message}`);
    return null;
  }

  const lines = content.trim().split("\n");

  if (lines.length === 0 || (lines.length === 1 && lines[0].trim() === "")) {
    result.addError(relPath, null, "Empty file");
    return null;
  }

  // Check first line: FAMILY:type
  const firstLine = lines[0].trim();
  if (!firstLine.includes(":")) {
    result.addError(
      relPath,
      1,
      `Invalid format, expected FAMILY:type, got: ${firstLine}`
    );
    return null;
  }

  const colonIdx = firstLine.indexOf(":");
  const family = firstLine.substring(0, colonIdx);
  const opType = firstLine.substring(colonIdx + 1);

  if (!VALID_FAMILIES.has(family)) {
    result.addError(
      relPath,
      1,
      `Invalid family '${family}', must be one of: ${[...VALID_FAMILIES].join(", ")}`
    );
    return null;
  }

  // Check for 'end' keyword
  if (lines[lines.length - 1].trim() !== "end") {
    result.addError(relPath, lines.length, "File must end with 'end'");
  }

  // Check for required sections
  const hasTile = lines.some((l) => l.trim().startsWith("tile "));
  const hasFlags = lines.some((l) => l.trim().startsWith("flags ="));
  const hasColor = lines.some((l) => l.trim().startsWith("color "));

  if (!hasTile) result.addWarning(relPath, "Missing 'tile' definition");
  if (!hasFlags) result.addWarning(relPath, "Missing 'flags' definition");
  if (!hasColor) result.addWarning(relPath, "Missing 'color' definition");

  // Extract inputs (wiring)
  const inputs: Record<number, string> = {};
  let inInputsBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const stripped = lines[i].trim();
    const lineNum = i + 1;

    if (stripped === "inputs") {
      inInputsBlock = true;
      continue;
    }

    if (inInputsBlock) {
      if (stripped === "{") continue;
      if (stripped === "}") {
        inInputsBlock = false;
        continue;
      }

      // Check for TAB vs spaces
      if (!lines[i].includes("\t") && stripped) {
        result.addError(
          relPath,
          lineNum,
          `inputs entry uses SPACES, must use TAB: '${stripped}'`
        );
      } else {
        // Parse input: INDEX\tSOURCE_NAME
        const parts = stripped.split("\t");
        if (parts.length >= 2) {
          const idx = parseInt(parts[0], 10);
          if (isNaN(idx)) {
            result.addError(
              relPath,
              lineNum,
              `Invalid input index: ${parts[0]}`
            );
          } else {
            const source = parts[1].trim();
            inputs[idx] = source;
          }
        }
      }
    }
  }

  const nodeName = basename(filepath, extname(filepath));
  return {
    name: nodeName,
    family,
    type: opType,
    inputs,
    path: relPath,
  };
}

export function validateParmFile(
  filepath: string,
  result: ValidationResult
): void {
  const relPath = basename(filepath);
  let content: string;
  try {
    content = readFileSync(filepath, "utf-8");
  } catch (e: any) {
    result.addError(relPath, null, `Cannot read file: ${e.message}`);
    return;
  }

  const lines = content.trim().split("\n");

  if (lines.length === 0) {
    result.addWarning(relPath, "Empty parameter file");
    return;
  }

  // Check for ? delimiters
  if (lines[0].trim() !== "?") {
    result.addError(relPath, 1, "Parameter file must start with '?'");
  }

  if (lines[lines.length - 1].trim() !== "?") {
    result.addError(
      relPath,
      lines.length,
      "Parameter file must end with '?'"
    );
  }

  // Check parameter format (lines between delimiters)
  for (let i = 1; i < lines.length - 1; i++) {
    const stripped = lines[i].trim();
    if (!stripped) continue;

    const parts = stripped.split(/\s+/);
    if (parts.length < 2) {
      result.addWarning(
        relPath,
        `Line ${i + 1}: Invalid format, expected 'name flags value'`
      );
      continue;
    }

    // Check flags
    const flags = parseInt(parts[1], 10);
    if (isNaN(flags)) {
      result.addError(relPath, i + 1, `Invalid flags value: ${parts[1]}`);
    } else if (flags !== 0 && flags !== 17) {
      result.addWarning(
        relPath,
        `Line ${i + 1}: Unusual flags value ${flags} (typically 0 or 17)`
      );
    }
  }
}

export function validateTextFile(
  filepath: string,
  result: ValidationResult
): void {
  const relPath = basename(filepath);
  let buf: Buffer;
  try {
    buf = readFileSync(filepath) as Buffer;
  } catch (e: any) {
    result.addError(relPath, null, `Cannot read file: ${e.message}`);
    return;
  }

  // Check format marker first: 2\n*  (0x32, 0x0A, 0x2A)
  if (buf.length < 3 || buf[0] !== 0x32 || buf[1] !== 0x0a || buf[2] !== 0x2a) {
    result.addError(
      relPath,
      null,
      "Missing binary header - file appears to be plain text, not TD format"
    );
    result.addInfo(
      `  Hint: Use write_td_text_file() from the editing guide to create proper .text files`
    );
    return;
  }

  // Check minimum size for valid binary .text file
  if (buf.length < 27) {
    result.addError(
      relPath,
      null,
      `File too short (${buf.length} bytes), missing binary header (need 27+ bytes)`
    );
    return;
  }

  // Extract script content (skip 27-byte header)
  let scriptContent: string;
  try {
    scriptContent = buf.subarray(27).toString("utf-8");
  } catch (e: any) {
    result.addError(relPath, null, `Cannot decode script content: ${e.message}`);
    return;
  }

  // Check for ChopExec callbacks
  const stem = basename(filepath, extname(filepath)).toLowerCase();
  if (stem.includes("chopexec") || stem.includes("chop_exec")) {
    const expectedCallbacks = [
      "onOffToOn",
      "onOnToOff",
      "onValueChange",
      "whileOn",
    ];
    for (const cb of expectedCallbacks) {
      if (!scriptContent.includes(cb)) {
        result.addWarning(relPath, `ChopExec missing callback: ${cb}`);
      }
    }
  }
}

export function validateToc(
  tocPath: string,
  dirPath: string,
  result: ValidationResult
): void {
  let tocContent: string;
  try {
    tocContent = readFileSync(tocPath, "utf-8");
  } catch (e: any) {
    result.addError(".toc", null, `Cannot read file: ${e.message}`);
    return;
  }

  const tocEntries = new Set(
    tocContent
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0)
  );

  // Check all toc entries exist as files
  for (const entry of tocEntries) {
    const entryPath = join(dirPath, entry);
    if (!existsSync(entryPath)) {
      result.addError(".toc", null, `Listed file does not exist: ${entry}`);
    }
  }

  // Check all files in dirPath are listed in toc (skip hidden files)
  const allFiles = walkDir(dirPath);
  for (const filePath of allFiles) {
    const rel = filePath.substring(dirPath.length + 1); // strip dirPath + separator
    if (rel.startsWith(".")) continue;
    if (!tocEntries.has(rel)) {
      result.addWarning(".toc", `File not listed in .toc: ${rel}`);
    }
  }
}

export function validateWiring(
  nodes: Record<string, NodeInfo>,
  result: ValidationResult
): void {
  const nodeNames = new Set(Object.keys(nodes));

  // Check all input references exist
  for (const [, node] of Object.entries(nodes)) {
    for (const [idx, source] of Object.entries(node.inputs)) {
      if (!nodeNames.has(source)) {
        // Check for case-insensitive near matches
        const closeMatches = [...nodeNames].filter(
          (n) => n.toLowerCase() === source.toLowerCase()
        );
        if (closeMatches.length > 0) {
          result.addError(
            node.path,
            null,
            `Input ${idx} references '${source}' (not found). Did you mean '${closeMatches[0]}'?`
          );
        } else {
          result.addError(
            node.path,
            null,
            `Input ${idx} references non-existent node: '${source}'`
          );
        }
      }
    }
  }

  // Check for orphans (no incoming connections)
  const referenced = new Set<string>();
  for (const node of Object.values(nodes)) {
    for (const source of Object.values(node.inputs)) {
      referenced.add(source);
    }
  }

  for (const name of nodeNames) {
    if (!referenced.has(name)) {
      const node = nodes[name];
      if (!ORPHAN_EXEMPT_TYPES.has(node.type)) {
        result.addWarning(
          node.path,
          "No incoming connections (orphan source)"
        );
      }
    }
  }
}

export function validateProject(
  dirPath: string,
  verbose: boolean = false
): ValidationResult {
  const result = new ValidationResult();

  if (!existsSync(dirPath)) {
    result.addError(dirPath, null, "Directory does not exist");
    return result;
  }

  const stat = statSync(dirPath);
  if (!stat.isDirectory()) {
    result.addError(dirPath, null, "Path is not a directory");
    return result;
  }

  // Collect all files
  const allFiles = walkDir(dirPath);
  const nodes: Record<string, NodeInfo> = {};
  let nCount = 0;
  let parmCount = 0;
  let textCount = 0;

  // Validate .n files
  for (const f of allFiles) {
    if (extname(f) === ".n") {
      nCount++;
      const nodeInfo = validateNFile(f, result);
      if (nodeInfo) {
        nodes[nodeInfo.name] = nodeInfo;
      }
    }
  }

  // Validate .parm files
  for (const f of allFiles) {
    if (extname(f) === ".parm") {
      parmCount++;
      validateParmFile(f, result);
    }
  }

  // Validate .text files
  for (const f of allFiles) {
    if (extname(f) === ".text") {
      textCount++;
      validateTextFile(f, result);
    }
  }

  // Validate .toc
  const tocInDir = join(dirPath, ".toc");
  if (existsSync(tocInDir)) {
    validateToc(tocInDir, dirPath, result);
  } else {
    // Try parent directory for .toc
    const dirName = basename(dirPath);
    const parentToc = join(
      dirPath,
      "..",
      dirName.replace(".dir", ".toc")
    );
    if (existsSync(parentToc)) {
      validateToc(parentToc, dirPath, result);
    } else {
      result.addWarning(".toc", "No .toc file found");
    }
  }

  // Validate wiring
  validateWiring(nodes, result);

  // Summary
  result.addInfo(
    `Checked: ${nCount} .n files, ${parmCount} .parm files, ${textCount} .text files`
  );

  return result;
}

// ─── CLI ───────────────────────────────────────────────────────────

function main(): void {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.every((a) => a.startsWith("-"))) {
    console.log(
      "Usage: bun scripts/validate-toe.ts <project.toe.dir> [--verbose]"
    );
    console.log(
      "\nValidates expanded TouchDesigner projects before collapse."
    );
    process.exit(2);
  }

  const dirPath = args.find((a) => !a.startsWith("-"))!;
  const verbose = args.includes("--verbose") || args.includes("-v");

  console.log(`Validating: ${dirPath}\n`);

  const result = validateProject(dirPath, verbose);

  // Print results
  for (const info of result.info) {
    console.log(`  ${info}`);
  }

  console.log();

  if (result.errors.length > 0) {
    console.log(`ERRORS (${result.errors.length}):`);
    for (const err of result.errors) {
      console.log(`  \u2717 ${err}`);
    }
    console.log();
  }

  if (result.warnings.length > 0) {
    console.log(`WARNINGS (${result.warnings.length}):`);
    for (const warn of result.warnings) {
      console.log(`  \u26A0 ${warn}`);
    }
    console.log();
  }

  if (!result.hasErrors && !result.hasWarnings) {
    console.log("\u2713 All checks passed!");
  } else if (result.hasErrors) {
    console.log(
      `\u2717 ${result.errors.length} error(s), ${result.warnings.length} warning(s)`
    );
  } else {
    console.log(
      `\u26A0 ${result.warnings.length} warning(s), no errors`
    );
  }

  // Exit code
  if (result.hasErrors) {
    process.exit(2);
  } else if (result.hasWarnings) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

// Run CLI if executed directly
if (import.meta.main) {
  main();
}
