# TouchDesigner ASCII Validator Spec

Pre-collapse validation to catch errors before TD's unhelpful silent failures.

## Usage

```bash
python scripts/validate_toe.py ./project.toe.dir

# Output
✓ 12 .n files checked
✓ 8 .parm files checked
✓ 3 .text files checked
✓ All wiring references valid
✗ 2 errors, 1 warning

ERRORS:
  project1/level_adjust.n:7 - inputs uses SPACES, need TAB
  project1/script_init.text - Python SyntaxError line 15: unexpected indent

WARNINGS:
  project1/noise_base.n - No incoming connections (orphan source, ok if intentional)
```

## Checks Implemented

### 1. Node Definition Files (.n)

| Check | Error Level | Description |
|-------|-------------|-------------|
| Structure | ERROR | Must have: FAMILY:type, tile, flags, color, end |
| Order | ERROR | Order must be: tile → flags → [inputs] → color → end |
| End keyword | ERROR | File must end with `end` |
| Family valid | ERROR | Must be TOP/CHOP/SOP/DAT/COMP/MAT/POP |
| Tile format | WARNING | `tile X Y W H` - all integers |

### 2. Wiring / Inputs Blocks

| Check | Error Level | Description |
|-------|-------------|-------------|
| TAB character | ERROR | `inputs` entries must use TAB not spaces |
| Reference exists | ERROR | Source node must exist in project |
| Case sensitivity | WARNING | Near-match suggestions for typos |

### 3. Text Files (.text) - Scripts

| Check | Error Level | Description |
|-------|-------------|-------------|
| Binary header | ERROR | Must have 27-byte header (not plain text) |
| Header format | ERROR | Starts with `2\n*` |
| Python syntax | ERROR | `ast.parse()` on script content |
| Callback signatures | WARNING | ChopExec expected params |

### 4. Parameter Files (.parm)

| Check | Error Level | Description |
|-------|-------------|-------------|
| Delimiters | ERROR | Must start and end with `?` |
| Flag values | WARNING | Flags should be 0 or 17 |
| Format | WARNING | `name flags value [expression]` |

### 5. Table of Contents (.toc)

| Check | Error Level | Description |
|-------|-------------|-------------|
| Files exist | ERROR | Every .toc entry must exist in .dir |
| Files listed | WARNING | Every file in .dir should be in .toc |
| Order | INFO | .application should be last |

### 6. Project Integrity

| Check | Error Level | Description |
|-------|-------------|-------------|
| Orphan outputs | WARNING | Nodes with no incoming refs (sources ok) |
| Orphan inputs | WARNING | Nodes that reference nothing (sinks ok) |
| Circular refs | ERROR | A → B → A wiring loops |
| Missing pairs | WARNING | .n without .parm (ok for defaults) |

## Not Checked (Need More Data)

- Parameter names valid for operator type
- Expression syntax
- Operator-specific rules
- Custom parameter definitions
- Complex container hierarchies

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | All checks passed |
| 1 | Warnings only |
| 2 | Errors found |

## File Structure Expected

```
project.toe.dir/
├── .build
├── .start
├── .toc
├── project1.n
├── project1.parm
├── project1/
│   ├── node1.n
│   ├── node1.parm
│   ├── node2.n
│   └── script.text
└── .application
```
