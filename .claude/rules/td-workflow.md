# TouchDesigner Build Workflow

## Context First: toeexpand is Source of Truth

Before building anything, understand what exists using **expanded ASCII files**.

### Getting Context (Preferred Method)

```bash
# Expand project to readable ASCII
toeexpand project.toe

# Read the structure
cat project.toe.dir/project1.n          # Main container
ls project.toe.dir/project1/            # All child nodes
cat project.toe.dir/project1/*.n        # Node definitions
cat project.toe.dir/project1/*.parm     # Parameters
```

This gives you **complete context** in one pass:
- Full node hierarchy
- All parameter values
- Connection wiring
- Scripts and expressions

See `docs/toeexpand-editing-guide.md` for full format reference.

### When to Use Each Approach

| Task | Use |
|------|-----|
| Understand existing project | toeexpand → read ASCII files |
| Create new nodes (live) | MCP `execute_python_script` |
| Batch modify parameters | Edit ASCII → toecollapse |
| Quick live tweaks | MCP `update_td_node_parameters` |
| Scaffold new project | Write ASCII files → toecollapse |

## Building with MCP

When TD is running and you need live changes:

### Batch Operations (Preferred)

Use `execute_python_script` for 3+ operations:

```python
execute_python_script(script='''
parent = op('/project1')

# Create nodes
noise = parent.create(noiseTOP, 'noise_base')
level = parent.create(levelTOP, 'level_adjust')
null = parent.create(nullTOP, 'null_output')

# Configure
noise.par.resolutionw = 1920
noise.par.resolutionh = 1080
level.par.opacity = 0.8

# Wire
noise.outputConnectors[0].connect(level.inputConnectors[0])
level.outputConnectors[0].connect(null.inputConnectors[0])
''')
```

**One call instead of 9+.**

### Build Order

1. **Inputs**: Audio, MIDI, video, OSC sources
2. **Processing**: Math, effects, logic
3. **Outputs**: Renders, nulls, display

### Verify After Building

```python
get_td_node_errors('/project1')
```

## Building with ASCII (Offline)

When TD is closed or you want version control:

1. Write `.n` and `.parm` files (see editing guide)
2. Update `.toc` with new file paths
3. Run `toecollapse project.toe.toc`
4. Open in TD to verify

### CRITICAL: Wiring Nodes

**Nodes without `inputs` blocks are ORPHANED.** Every node that receives input MUST declare its source:

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

**Rules:**
- `inputs` block goes AFTER `flags`, BEFORE `color`
- Format: `INPUT_INDEX<TAB>SOURCE_NODE_NAME` (use actual TAB, not spaces)
- Source node must exist (name must match exactly, case-sensitive)
- Multi-input nodes list each input on separate line:
  ```
  inputs
  {
  0 	background_layer
  1 	foreground_layer
  }
  ```

**Common mistakes:**
- Forgetting `inputs` block entirely → nodes created but not connected
- Using spaces instead of TAB → connection fails silently
- Wrong node name → connection fails silently

**Verify your chain:** Before collapsing, check every `.n` file that should receive input has an `inputs` block pointing to the correct source.

### CRITICAL: .text Files Are Binary

**`.text` files (scripts/text DATs) have a binary header - NOT plain text!**

```
Bytes 0-2:   "2\n*"           (format marker)
Bytes 3-24:  Binary metadata  (22 bytes)
Bytes 25-26: Content length   (big-endian uint16)
Bytes 27+:   Actual content   (UTF-8)
```

Use Python to write `.text` files:
```python
import struct
header = b'2\n*'
meta = bytes([0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,2,0,0])
content = script.encode('utf-8')
with open('node.text', 'wb') as f:
    f.write(header + meta + struct.pack('>H', len(content)) + content)
```

See `docs/toeexpand-editing-guide.md` for full details.

## Naming

Always use descriptive names:
```
GOOD: in_audio, audio_fft, null_output
BAD:  audioin1, audiospec1, null1
```

## No Junk

- No demo objects (random spheres, torus)
- No operators you weren't asked for
- Clean up mistakes immediately
