# TouchDesigner MCP Tools Reference

## ALWAYS USE THESE TOOLS - DO NOT JUST DESCRIBE

You have 12 MCP tools. Use them directly to control TouchDesigner.

---

## The Tools

### Creating & Deleting
| Tool | Use |
|------|-----|
| `create_td_node` | Create new operators |
| `delete_td_node` | Remove operators |

### Querying
| Tool | Use |
|------|-----|
| `get_td_nodes` | List operators under a path |
| `get_td_node_parameters` | Get an operator's parameters |
| `get_td_node_errors` | Check for errors |
| `get_td_info` | Server/environment info |

### Modifying
| Tool | Use |
|------|-----|
| `update_td_node_parameters` | Set parameter values |
| `exec_node_method` | Call Python methods on operators |
| `execute_python_script` | Run arbitrary Python in TD |

### Documentation Lookup
| Tool | Use |
|------|-----|
| `get_td_classes` | List available TD Python classes |
| `get_td_class_details` | Get class documentation |
| `get_module_help` | Python help() for TD modules |

---

## Workflow Pattern

### Step 1: Check What Exists
```
get_td_nodes(parent_path="/project1")
```
ALWAYS do this first. Don't create duplicates.

### Step 2: Create Node
```
create_td_node(
  type="noiseTOP",
  name="noise_base",
  parent_path="/project1"
)
```
Use descriptive names. Never use defaults.

### Step 3: Set Parameters
```
update_td_node_parameters(
  path="/project1/noise_base",
  parameters={
    "resolutionw": 1920,
    "resolutionh": 1080,
    "period": 2.0
  }
)
```
Set parameters immediately after creating.

### Step 4: Wire Nodes (via Python)
```
execute_python_script(
  script="op('/project1/noise_base').outputConnectors[0].connect(op('/project1/level1').inputConnectors[0])"
)
```
Wire as you build. Don't batch.

### Step 5: Verify
```
get_td_node_errors(path="/project1")
```
Check for errors after building.

---

## Common Operations via Python Script

### Connect Two Operators
```python
execute_python_script(script='''
op('/project1/noise1').outputConnectors[0].connect(
  op('/project1/level1').inputConnectors[0]
)
''')
```

### Create + Wire in One Script
```python
execute_python_script(script='''
parent = op('/project1')
noise = parent.create(noiseTOP, 'noise_base')
level = parent.create(levelTOP, 'level_adjust')
noise.outputConnectors[0].connect(level.inputConnectors[0])
noise.par.resolutionw = 1920
noise.par.resolutionh = 1080
level.par.opacity = 0.8
''')
```

### Set Export/Expression
```python
execute_python_script(script='''
op('/project1/noise_base').par.period.expr = "op('audio_bass')['chan1']"
''')
```

---

## Don't Ask - Just Do

BAD:
```
"I would create a noiseTOP and connect it to a levelTOP..."
```

GOOD:
```
create_td_node(type="noiseTOP", name="noise_base", parent_path="/project1")
update_td_node_parameters(path="/project1/noise_base", parameters={"resolutionw": 1920, "resolutionh": 1080})
create_td_node(type="levelTOP", name="level_adjust", parent_path="/project1")
execute_python_script(script="op('/project1/noise_base').outputConnectors[0].connect(op('/project1/level_adjust').inputConnectors[0])")
```

---

## When Unsure About Operator Types

Use the docs MCP:
```
get_td_classes()  # List all classes
get_td_class_details(class_name="noiseTOP")  # Get specific details
get_module_help(module="td")  # General TD help
```

Or use `touchdesigner-docs` MCP server for operator documentation.
