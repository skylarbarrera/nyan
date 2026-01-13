# template

TouchDesigner project with Claude Code MCP integration.

## Structure

```
template/
├── template.toe          # Main TouchDesigner project
├── mcp_webserver_base.tox # MCP server component
├── import_modules.py     # Module importer
├── modules/              # MCP server Python modules
├── src/                  # Python scripts for TD
│   ├── components/       # Reusable COMP scripts
│   ├── operators/        # Custom operator logic
│   └── utils/            # Helper utilities
└── assets/               # Textures, media, data files
```

## Setup

1. Open `template.toe` in TouchDesigner
2. Check Textport (Alt+T) for "server active"
3. Run `claude` from the nyan repo root

## MCP Tools Available

- **touchdesigner** - Direct TouchDesigner control
- **touchdesigner-docs** - Documentation lookup
