# TouchDesigner MCP Tools Reference

## BATCH OPERATIONS - MINIMIZE CALLS

MCP calls have latency. **Batch multiple operations into single `execute_python_script` calls.**

---

## Primary Tool: `execute_python_script`

Use this for almost everything. One call can create, wire, and configure multiple nodes:

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

# Wire chain
noise.outputConnectors[0].connect(level.inputConnectors[0])
level.outputConnectors[0].connect(null.inputConnectors[0])
''')
```

**This replaces 9+ individual MCP calls with 1.**

---

## When to Use Individual Tools

| Tool | Use When |
|------|----------|
| `get_td_nodes` | Checking what exists before building |
| `get_td_node_parameters` | Need to read current values |
| `get_td_node_errors` | Debugging after build |
| `create_td_node` | Single node, simple case |
| `update_td_node_parameters` | Quick param tweak |
| `delete_td_node` | Remove single node |

For **building systems** (3+ nodes) → always use `execute_python_script`

---

## Python Script Patterns

### Create + Wire Chain
```python
execute_python_script(script='''
p = op('/project1')
a = p.create(audiodeviceinCHOP, 'in_audio')
fft = p.create(audiospectrumCHOP, 'audio_fft')
math = p.create(mathCHOP, 'audio_scale')
null = p.create(nullCHOP, 'null_audio')

a.outputConnectors[0].connect(fft.inputConnectors[0])
fft.outputConnectors[0].connect(math.inputConnectors[0])
math.outputConnectors[0].connect(null.inputConnectors[0])

math.par.gain = 10
''')
```

### POPs for Laser
```python
execute_python_script(script='''
p = op('/project1')
line = p.create(linePOP, 'laser_path')
xform = p.create(transformPOP, 'laser_xform')
null = p.create(nullPOP, 'null_laser')

line.outputConnectors[0].connect(xform.inputConnectors[0])
xform.outputConnectors[0].connect(null.inputConnectors[0])

line.par.points = 100
''')
```

### Parameter Expressions
```python
execute_python_script(script='''
op('/project1/noise_base').par.period.expr = "op('audio_bass')['chan1']"
op('/project1/level1').par.opacity.expr = "op('midi_cc')['chan1']"
''')
```

### Query + Build
```python
execute_python_script(script='''
# Check existing
existing = [c.name for c in op('/project1').children]
print(f"Existing: {existing}")

# Only create if missing
if 'noise_base' not in existing:
    op('/project1').create(noiseTOP, 'noise_base')
''')
```

---

## Operator Type Names for Python

```python
# TOPs
noiseTOP, levelTOP, compositeTOP, feedbackTOP, blurTOP
transformTOP, renderTOP, nullTOP, moviefileinTOP

# CHOPs
audiodeviceinCHOP, audiospectrumCHOP, midiinCHOP, oscinCHOP
noiseCHOP, lfoCHOP, mathCHOP, filterCHOP, selectCHOP, nullCHOP

# SOPs
gridSOP, sphereSOP, boxSOP, noiseSOP, transformSOP, nullSOP

# POPs
linePOP, circlePOP, gridPOP, pointgeneratorPOP, noisePOP
transformPOP, particlePOP, nullPOP

# DATs
tableDATT, textDAT, scriptDAT, oscin DAT, nullDAT

# COMPs
geometryCOMP, cameraCOMP, lightCOMP, containerCOMP, baseCOMP, nullCOMP
```

---

## Don't Do

- Don't make 10 separate `create_td_node` calls - batch them
- Don't wire one connection at a time - batch all wiring
- Don't query after every operation - query once at start, verify once at end
