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

## TouchDesigner Best Practices

### Node Organization
- Keep related nodes grouped together visually
- Use consistent left-to-right or top-to-bottom signal flow
- Place source/input nodes on the left, output nodes on the right
- Position COMPs (camera, light, geo) near their associated render TOPs
- Keep MCP server and utility components at the bottom or edge of network
- Use `nodeX` and `nodeY` properties to set positions programmatically

### Naming Conventions
- Use descriptive lowercase names with underscores: `particle_geo`, `audio_analysis`
- Suffix outputs with numbers or `_out`: `render1`, `final_out`
- Prefix by function when grouping: `fx_blur`, `fx_feedback`, `src_video`
- Keep names short but meaningful

### Network Layout Guidelines
```
Spacing: ~200-300 units between nodes horizontally
         ~100-150 units between nodes vertically
Signal flow: Left → Right (primary)
             Top → Bottom (secondary inputs like forces, controls)
```

### Performance Optimization
- Use Null TOPs as checkpoints to cache expensive operations
- Set appropriate resolution - don't render at 4K if 1080p works
- Cook only what's needed: use `bypass` and `lock` on unused branches
- Limit particle counts and lifespans to what's visually necessary
- Use `performanceMonitor` to identify bottlenecks
- Prefer TOPs over SOPs for 2D operations (GPU vs CPU)
- Keep CHOP sample rates as low as acceptable

### Particle Systems (POPs)
- Use Force SOPs on second input for physics behaviors
- Enable `dodrag` and `domass` for realistic motion
- Add turbulence (`turbx/y/z`) for organic movement
- Keep birth rates reasonable (100-1000 typical)
- Set appropriate limits to cull off-screen particles

### Rendering
- Always specify camera and lights explicitly on Render TOPs
- Use appropriate anti-aliasing (4x default, 8x for final)
- Match resolution to output requirements
- Use Null TOP after Render TOP for flexibility in downstream processing
