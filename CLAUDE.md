# Nyan - TouchDesigner Project

A TouchDesigner project with Claude Code integration for building nodes, creating systems, and automating workflows.

## MCP Tools Available

- **touchdesigner** - Direct TouchDesigner control via MCP
- **touchdesigner-docs** - TouchDesigner documentation lookup

## Project Structure

```
nyan/
├── .claude/           # Claude Code configuration
├── src/               # Python scripts for TD
│   ├── components/    # Reusable COMP scripts
│   ├── operators/     # Custom operator logic
│   └── utils/         # Helper utilities
├── td/                # TouchDesigner project files (.toe, .tox)
└── assets/            # Textures, media, data files
```

## TouchDesigner Python Guidelines

- TD uses Python 3.9+ internally
- Access operators via `op('path/to/operator')`
- Use `mod.` prefix for imported modules in TD
- Scripts in `/src` can be referenced via DAT operators

## Common Patterns

### Creating Operators
```python
# Create a new operator
new_op = parent().create(constantTOP, 'my_constant')
new_op.par.colorr = 1.0
```

### Connecting Nodes
```python
# Wire operators together
op('noise1').outputConnectors[0].connect(op('level1').inputConnectors[0])
```

### Parameter Access
```python
op('geo1').par.tx = 0.5
op('geo1').pars('t?')  # Get tx, ty, tz
```

## Windows Compatibility

- Use forward slashes in paths (TD handles conversion)
- Environment: Python 3.9+ via TouchDesigner's bundled interpreter
- External packages: Install to TD's site-packages or use virtualenv for dev

## Development Workflow

1. Use MCP tools to query TD state and create nodes
2. Write Python scripts in `/src` for complex logic
3. Reference scripts from Script DATs in TD
4. Test changes live in TouchDesigner

## TouchDesigner Rules

Detailed TD best practices are in `.claude/rules/`:

- `td-essentials.md` - Which operator family to use, top operators
- `td-knowledge.md` - Naming conventions, performance tips
- `td-workflow.md` - Build workflow, ASCII format, wiring
- `td-reference-data.md` - How to use `data/operators/` and `data/patterns.json`
- `mcp-tools.md` - MCP batching, execute_python_script patterns
