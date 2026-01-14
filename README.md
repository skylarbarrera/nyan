# Nyan

TouchDesigner + Claude Code. Build nodes, wire systems, automate workflows.

## Why This Exists

TouchDesigner's `.toe` files are binary. You can't read them, diff them, or generate them programmatically.

We reverse-engineered the undocumented `toeexpand` ASCII format so Claude can:

- **Read any TD project** as plain text
- **Generate nodes offline** - no TD running required
- **Diff your projects** - version control that actually works

## What's Included

| Component | What It Does |
|-----------|--------------|
| `data/operators/` | 630 operator JSONs with every parameter |
| `data/patterns.json` | 20 workflow recipes (audio-reactive, particles, etc.) |
| `scripts/validate_toe.py` | Catches errors TD silently swallows |
| `docs/toeexpand-editing-guide.md` | Full ASCII format reference |

## Quick Start

**With TD running (live editing):**
```bash
claude
> "Create an audio-reactive noise system"
```

**Without TD (offline generation):**
```bash
# Claude writes ASCII files
# Validate before collapse
python scripts/validate_toe.py project.toe.dir
# Collapse to .toe
toecollapse project.toe.toc
```

## Two Modes

### Live Mode
TD running + MCP server. Claude creates nodes in real-time:
```python
noise = op('/project1').create(noiseTOP, 'noise_base')
level = op('/project1').create(levelTOP, 'level_adjust')
noise.outputConnectors[0].connect(level.inputConnectors[0])
```

### Offline Mode
No TD needed. Claude writes ASCII, you collapse later:
```
TOP:noise
tile 100 100 130 90
flags =  viewer 1 parlanguage 0
inputs
{
0 	source_node
}
color 0.5 0.5 0.5
end
```

## Setup

### TouchDesigner
1. Download [mcp_webserver_base.tox](https://github.com/8beeeaaat/touchdesigner-mcp/releases/latest)
2. Drag into your TD project
3. Check Textport for "server active"

### Claude Code
```bash
npm install -g @anthropic-ai/claude-code
git clone https://github.com/skylarbarrera/nyan.git
cd nyan && claude
```

## Project Structure

```
nyan/
├── data/
│   ├── operators/      # 630 operator param docs
│   ├── patterns.json   # Workflow recipes
│   └── python-api/     # TD Python class docs
├── docs/               # Format specs, validator docs
├── scripts/            # Validator, project tools
└── .claude/rules/      # TD workflow rules
```

## Links

- [touchdesigner-mcp](https://github.com/8beeeaaat/touchdesigner-mcp) - Live control server
- [TouchDesigner](https://derivative.ca) - Get TD

## Credits

Operator documentation, patterns, and tutorials in `data/` extracted from [bottobot/touchdesigner-mcp-server](https://github.com/bottobot/touchdesigner-mcp-server).
