# TouchDesigner Build Workflow

## CRITICAL: Use MCP Tools - Don't Just Describe

You have direct control of TouchDesigner. **DO NOT** explain what you would do. **ACTUALLY DO IT.**

Tools you MUST use:
- `create_td_node` - make operators
- `update_td_node_parameters` - set values
- `execute_python_script` - wire nodes, complex operations
- `get_td_nodes` - check what exists first

See `mcp-tools.md` for full reference.

## Build Order

1. **Check existing**: `get_td_nodes('/project1')` first
2. **Inputs**: Audio, MIDI, video, OSC sources
3. **Processing**: Math, effects, logic
4. **Outputs**: Renders, nulls, display
5. **Wire immediately**: Don't batch - create → wire → create → wire

## STOP AND VERIFY

After every 3-4 operators:
```
get_td_node_errors('/project1')
```
Ask user: "Created X, Y, Z. Working correctly? Continue?"

Do NOT build 10+ operators without checking in.

## Phased Approach for Complex Builds

For systems with 5+ operators, build in phases:

```
Phase 1: Input chain (2-3 ops)
  → get_td_node_errors()
  → Ask: "Inputs working? Continue?"

Phase 2: Processing (2-4 ops)
  → get_td_node_errors()
  → Ask: "Processing correct? Continue?"

Phase 3: Output (2-3 ops)
  → get_td_node_errors()
  → Ask: "Final result good?"
```

NEVER skip these checkpoints.

## No Junk

- No demo objects (random spheres, torus)
- No operators you weren't asked for
- No placeholder geometry
- Clean up mistakes immediately

## Naming

Always use descriptive names:
```
GOOD: in_audio, audio_fft, null_output
BAD:  audioin1, audiospec1, null1
```
