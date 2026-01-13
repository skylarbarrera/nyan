# TouchDesigner ASCII Editing Guide

Edit and create TouchDesigner projects using `toeexpand` and `toecollapse` without opening TD.

## Overview

TouchDesigner projects (`.toe` / `.tox`) are binary files. The `toeexpand` utility converts them to readable ASCII format that can be edited with any text editor. `toecollapse` converts back to binary.

**Use cases:**
- Edit projects without TD running
- Batch modify multiple nodes/parameters
- Create project templates programmatically
- Version control friendly format
- Scripted project generation

---

## Tools Location

```
Windows:
C:\Program Files\Derivative\TouchDesigner.2025.XXXXX\bin\toeexpand.exe
C:\Program Files\Derivative\TouchDesigner.2025.XXXXX\bin\toecollapse.exe

Mac:
/Applications/TouchDesigner.app/Contents/MacOS/toeexpand
/Applications/TouchDesigner.app/Contents/MacOS/toecollapse
```

---

## Basic Workflow

### Expand to ASCII
```bash
toeexpand project.toe
```

Creates:
- `project.toe.dir/` - folder with ASCII files
- `project.toe.toc` - table of contents

### Edit Files
Modify the ASCII files in the `.dir` folder.

### Collapse to Binary
```bash
toecollapse project.toe.toc
```

Recreates `project.toe` (backs up original to `.bkp1`, `.bkp2`, etc.)

---

## File Structure

After expanding, you get:

```
project.toe.dir/
├── .build          # TD version info
├── .start          # Project settings (cookrate, realtime, etc.)
├── .grps           # Groups
├── .parm           # Root parameters
├── .root           # Root node reference
├── .application    # Application settings
├── project1.n      # Main container node definition
├── project1.parm   # Main container parameters
├── project1/       # Children of project1
│   ├── mynode.n    # Node definition
│   ├── mynode.parm # Node parameters
│   └── mynode.text # Script/text content (if applicable)
├── local.n         # Local container
├── local/          # Local children
└── perform.n       # Perform container
```

### Table of Contents (.toc)

Lists all files in the expanded project, one per line:
```
.build
.start
.grps
.root
.parm
project1.n
project1.parm
project1/mynode.n
project1/mynode.parm
...
.application
```

**Important:** When adding new files, you MUST add them to the `.toc` or they won't be included in the collapse.

---

## Node Definition Files (.n)

The `.n` file defines a node's type, position, connections, and flags.

### Basic Structure

```
FAMILY:type
tile X Y WIDTH HEIGHT
flags =  [flag options]
color R G B
end
```

### Family Types

| Family | Examples |
|--------|----------|
| `TOP` | noise, level, composite, blur, render, null |
| `CHOP` | noise, lfo, math, audiodevicein, null |
| `SOP` | sphere, box, grid, noise, null |
| `DAT` | text, table, script, select, null |
| `COMP` | container, base, geometry, camera, light |
| `MAT` | phong, pbr, constant, glsl |

### Example: NoiseTOP

```
TOP:noise
tile 100 200 130 90
flags =  viewer 1 parlanguage 0
color 0.5 0.5 0.5
end
```

### Example: Container COMP

```
COMP:container
tile 0 0 200 100
flags =  picked on current on viewer 1 parlanguage 0
color 0.56 0.56 0.56
end
```

### Node Position

`tile X Y WIDTH HEIGHT`

- X, Y: Position in network (left-top origin)
- WIDTH, HEIGHT: Node tile size (typically 130x90 for operators, larger for COMPs)

Standard spacing:
- Horizontal: 150-200 units between nodes
- Vertical: 100-150 units between rows

### Connections (Wiring)

Add an `inputs` block to connect nodes:

```
TOP:level
tile 250 200 130 90
flags =  viewer 1 parlanguage 0
inputs
{
0 	noise1
}
color 0.5 0.5 0.5
end
```

Format: `INPUT_INDEX TAB SOURCE_NODE_NAME`

Multiple inputs:
```
inputs
{
0 	source1
1 	source2
}
```

**Note:** Use TAB character between index and name, not spaces.

### Common Flags

```
flags =  viewer 1 parlanguage 0           # Standard
flags =  picked on viewer 1 parlanguage 0 # Selected
flags =  current on viewer 1 parlanguage 0 # Current/active
flags =  bypass on viewer 1 parlanguage 0  # Bypassed
```

---

## Parameter Files (.parm)

Parameters are stored in `.parm` files with the same base name as the node.

### Format

```
?
paramname flags value [expression]
paramname flags value
?
```

- Lines start and end with `?` delimiter
- Each parameter: `name flags value [optional_expression]`

### Flags

| Flag | Meaning |
|------|---------|
| `0` | Constant value |
| `17` | Expression mode |

### Examples

**Simple constant values:**
```
?
resolutionw 0 1920
resolutionh 0 1080
period 0 2.5
?
```

**With expressions:**
```
?
period 17 1 "op('audio_bass')['chan1']"
opacity 17 0.5 "op('ctrl_slider')['chan1']"
?
```

**String values:**
```
?
file 0 ./assets/texture.png
?
```

**Reference to another operator:**
```
?
dat 0 /local/midi/device
top 0 ./render1
?
```

### Common Parameters by Type

**TOP (resolution):**
```
?
resolutionw 0 1920
resolutionh 0 1080
?
```

**Noise TOP:**
```
?
resolutionw 0 1920
resolutionh 0 1080
period 0 1.0
harmonics 0 3
?
```

**Level TOP:**
```
?
opacity 0 0.8
brightness1 0 1.0
contrast 0 1.0
?
```

**CHOP Math:**
```
?
gain 0 10
?
```

---

## Text/Script Files (.text)

DATs with text content have a `.text` file.

### Format

```
LINE_COUNT
*                 FIRST_LINE_CONTENT
REMAINING LINES...
```

The header is: `LINE_COUNT` then `* ` followed by spaces and the first line.

### Example: Python Script

```
2
*                 # My script
print('hello')
```

### Example: Longer Script

```
5
*                 import td
def onStart():
    print('Starting')

setup()
```

**Note:** The `*` line padding is important. Use spaces to align with actual content start.

---

## Creating Nodes

### Step 1: Create the .n file

Create `project1/mynode.n`:
```
TOP:noise
tile 100 100 130 90
flags =  viewer 1 parlanguage 0
color 0.5 0.5 0.5
end
```

### Step 2: Create the .parm file (optional)

Create `project1/mynode.parm`:
```
?
resolutionw 0 1920
resolutionh 0 1080
period 0 2.0
?
```

### Step 3: Add to .toc

Add the new file paths to the `.toc` file:
```
project1/mynode.n
project1/mynode.parm
```

### Step 4: Collapse

```bash
toecollapse project.toe.toc
```

---

## Creating a Chain of Nodes

Example: noise → level → null

### noise_source.n
```
TOP:noise
tile 100 100 130 90
flags =  viewer 1 parlanguage 0
color 0.5 0.5 0.5
end
```

### noise_source.parm
```
?
resolutionw 0 1920
resolutionh 0 1080
?
```

### level_adjust.n
```
TOP:level
tile 250 100 130 90
flags =  viewer 1 parlanguage 0
inputs
{
0 	noise_source
}
color 0.5 0.5 0.5
end
```

### level_adjust.parm
```
?
opacity 0 0.8
?
```

### null_output.n
```
TOP:null
tile 400 100 130 90
flags =  viewer 1 parlanguage 0
inputs
{
0 	level_adjust
}
color 0.5 0.5 0.5
end
```

### Update .toc
```
project1/noise_source.n
project1/noise_source.parm
project1/level_adjust.n
project1/level_adjust.parm
project1/null_output.n
```

---

## Creating Containers (COMPs)

Containers have children in a subfolder.

### Structure
```
project1/
├── mycontainer.n
├── mycontainer.parm
└── mycontainer/
    ├── child1.n
    ├── child1.parm
    └── child2.n
```

### mycontainer.n
```
COMP:container
tile 100 100 200 150
flags =  viewer 1 parlanguage 0
color 0.55 0.55 0.55
end
```

### .toc entries
```
project1/mycontainer.n
project1/mycontainer.parm
project1/mycontainer/child1.n
project1/mycontainer/child1.parm
project1/mycontainer/child2.n
```

---

## Common Node Types Reference

### TOPs
| Type | .n declaration |
|------|----------------|
| Noise | `TOP:noise` |
| Level | `TOP:level` |
| Composite | `TOP:composite` |
| Blur | `TOP:blur` |
| Transform | `TOP:transform` |
| Feedback | `TOP:feedback` |
| Render | `TOP:render` |
| Null | `TOP:null` |
| Constant | `TOP:constant` |
| Ramp | `TOP:ramp` |
| Movie File In | `TOP:moviefilein` |

### CHOPs
| Type | .n declaration |
|------|----------------|
| Noise | `CHOP:noise` |
| LFO | `CHOP:lfo` |
| Math | `CHOP:math` |
| Audio Device In | `CHOP:audiodevicein` |
| Audio Spectrum | `CHOP:audiospectrum` |
| MIDI In | `CHOP:midiin` |
| OSC In | `CHOP:oscin` |
| Constant | `CHOP:constant` |
| Null | `CHOP:null` |
| Select | `CHOP:select` |
| Filter | `CHOP:filter` |

### SOPs
| Type | .n declaration |
|------|----------------|
| Sphere | `SOP:sphere` |
| Box | `SOP:box` |
| Grid | `SOP:grid` |
| Circle | `SOP:circle` |
| Line | `SOP:line` |
| Noise | `SOP:noise` |
| Transform | `SOP:transform` |
| Null | `SOP:null` |

### DATs
| Type | .n declaration |
|------|----------------|
| Text | `DAT:text` |
| Table | `DAT:table` |
| Script | `DAT:script` |
| Select | `DAT:select` |
| Null | `DAT:null` |
| CHOP Execute | `DAT:chopexec` |

### COMPs
| Type | .n declaration |
|------|----------------|
| Container | `COMP:container` |
| Base | `COMP:base` |
| Geometry | `COMP:geometry` |
| Camera | `COMP:camera` |
| Light | `COMP:light` |
| Null | `COMP:null` |

---

## Project Settings

### .build
TD version info:
```
version 099
build 2025.32050
time Mon Jan 13 12:00:00 2026
osname Windows
osversion 10
```

### .start
Project settings:
```
cookrate 60
clock -f 1 -s 1 -o 0 -w 0
realtime on
viewers off
```

---

## Tips and Best Practices

### 1. Always Backup
```bash
cp project.toe project.toe.backup
```

### 2. Close TD First
TouchDesigner must NOT have the file open when collapsing.

### 3. Validate TOC
Every file in `.dir` that you want included must be in `.toc`.

### 4. Use Consistent Naming
Match file names to node names:
- `noise_base.n` → node named `noise_base`

### 5. Test Incrementally
After adding nodes, collapse and open in TD to verify before making more changes.

### 6. Check Errors
If TD shows errors after opening, expand again and compare with a known-good project.

### 7. Parameter Discovery
To find correct parameter names:
1. Create a node in TD with desired settings
2. Save and expand
3. Look at the `.parm` file

---

## Scripting Example (Python)

Automate project creation:

```python
import os
import shutil

def create_node(dir_path, name, family, type, x, y, inputs=None, params=None):
    """Create a node's .n and .parm files."""

    # Node definition
    n_content = f"""{family}:{type}
tile {x} {y} 130 90
flags =  viewer 1 parlanguage 0
"""
    if inputs:
        n_content += "inputs\n{\n"
        for idx, src in enumerate(inputs):
            n_content += f"{idx} \t{src}\n"
        n_content += "}\n"

    n_content += """color 0.5 0.5 0.5
end
"""

    with open(os.path.join(dir_path, f"{name}.n"), 'w') as f:
        f.write(n_content)

    # Parameters
    if params:
        parm_content = "?\n"
        for k, v in params.items():
            parm_content += f"{k} 0 {v}\n"
        parm_content += "?\n"

        with open(os.path.join(dir_path, f"{name}.parm"), 'w') as f:
            f.write(parm_content)

    return [f"{name}.n"] + ([f"{name}.parm"] if params else [])


def create_project(base_path, nodes):
    """Create a complete project structure."""

    dir_path = os.path.join(base_path, "project1")
    os.makedirs(dir_path, exist_ok=True)

    toc_entries = []

    for node in nodes:
        entries = create_node(
            dir_path,
            node['name'],
            node['family'],
            node['type'],
            node['x'],
            node['y'],
            node.get('inputs'),
            node.get('params')
        )
        toc_entries.extend([f"project1/{e}" for e in entries])

    return toc_entries


# Example usage
nodes = [
    {
        'name': 'noise_base',
        'family': 'TOP',
        'type': 'noise',
        'x': 100,
        'y': 100,
        'params': {'resolutionw': 1920, 'resolutionh': 1080}
    },
    {
        'name': 'level_adjust',
        'family': 'TOP',
        'type': 'level',
        'x': 250,
        'y': 100,
        'inputs': ['noise_base'],
        'params': {'opacity': 0.8}
    },
    {
        'name': 'null_output',
        'family': 'TOP',
        'type': 'null',
        'x': 400,
        'y': 100,
        'inputs': ['level_adjust']
    }
]

# entries = create_project('./myproject.toe.dir', nodes)
```

---

## Troubleshooting

### "directory not found" on collapse
Ensure both `.toc` and `.dir` exist in the same location.

### Node doesn't appear
Check that the `.n` file is listed in `.toc`.

### Parameters not applied
Verify `.parm` file syntax - must have `?` delimiters and correct format.

### Connections broken
- Check node names match exactly (case-sensitive)
- Use TAB between index and name in inputs block
- Referenced node must exist

### TD crashes on open
- Check `.build` version matches your TD version
- Validate all files have proper `end` markers
- Look for syntax errors in `.parm` files

---

## Quick Reference

### Create a TOP
```
# mynode.n
TOP:noise
tile 100 100 130 90
flags =  viewer 1 parlanguage 0
color 0.5 0.5 0.5
end

# mynode.parm
?
resolutionw 0 1920
resolutionh 0 1080
?
```

### Wire nodes
```
inputs
{
0 	source_node_name
}
```

### Expression parameter
```
paramname 17 default_value "expression_string"
```

### Add to TOC
```
path/to/mynode.n
path/to/mynode.parm
```

### Collapse
```bash
toecollapse project.toe.toc
```
