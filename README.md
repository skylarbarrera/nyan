# Nyan

TouchDesigner project with Claude Code integration for building nodes, creating systems, and automating workflows.

## Quick Start

### 1. Set Up TouchDesigner

Download from the [latest MCP release](https://github.com/8beeeaaat/touchdesigner-mcp/releases/latest):
- `touchdesigner-mcp-td.zip`

Extract and load into TouchDesigner:

1. Open your TD project
2. Drag `mcp_webserver_base.tox` into your project (e.g., `/project1/mcp_webserver_base`)
3. **Keep the folder structure intact** - the .tox references `modules/` via relative paths
4. Check Textport (Alt+T) for "server active" confirmation

The webserver runs at `http://127.0.0.1:9981` by default.

### 2. Run Claude Code

```bash
cd nyan-cat-td
claude
```

The MCP servers are pre-configured in `.claude/settings.local.json`.

### 3. Start Building

Ask Claude to create nodes:
```
"Create a noise TOP feeding into a level with contrast 1.5"
"Build an audio-reactive system with 4 frequency bands"
"Make a feedback loop with blur and composite"
```

## MCP Servers

| Server | Purpose |
|--------|---------|
| `touchdesigner` | Live control - create/delete nodes, set parameters, run Python |
| `touchdesigner-docs` | Documentation lookup - 629 operators, Python API, tutorials |

## Project Structure

```
nyan/
├── .claude/           # MCP server config
├── src/               # Python scripts for TD
│   ├── components/    # Reusable COMP scripts
│   ├── operators/     # Custom operator logic
│   └── utils/         # Helper utilities
├── td/                # TouchDesigner files (.toe, .tox)
└── assets/            # Textures, media, data
```

## Requirements

- **TouchDesigner** 2021.x+ (latest recommended)
- **Node.js** 18+ (for MCP servers via npx)
- **Claude Code** CLI

## Troubleshooting

### MCP server not connecting
- Verify TD is running with `mcp_webserver_base.tox` loaded
- Check Textport for errors
- Default port is 9981 - ensure nothing else is using it

### Custom port
If using a different port, update `.claude/settings.local.json`:
```json
{
  "mcpServers": {
    "touchdesigner": {
      "command": "npx",
      "args": ["-y", "touchdesigner-mcp-server@latest", "--stdio", "--port", "YOUR_PORT"]
    }
  }
}
```

## Windows Setup

### Step 1: Install Windows Terminal & PowerShell 7

Open PowerShell as Administrator and run:

```powershell
# Install Windows Terminal (best terminal for Windows)
winget install Microsoft.WindowsTerminal

# Install PowerShell 7 (modern PowerShell)
winget install Microsoft.PowerShell
```

Close and reopen Windows Terminal. Set PowerShell 7 as default in Settings.

### Step 2: Install Node.js

```powershell
# Install Node.js (required for MCP servers)
winget install OpenJS.NodeJS.LTS

# Verify installation (restart terminal first)
node --version   # Should show v18+
npm --version
```

### Step 3: Install Claude Code

```powershell
# Install Claude Code CLI
npm install -g @anthropic-ai/claude-code

# Verify installation
claude --version
```

### Step 4: Install TouchDesigner

Download and install from [derivative.ca](https://derivative.ca/download).

### Step 5: Clone and Run

```powershell
# Clone this repo
git clone https://github.com/skylarbarrera/nyan.git
cd nyan

# Start Claude Code
claude
```

### All-in-One Script

Save as `setup.ps1` and run as Administrator:

```powershell
# Nyan Windows Setup
Write-Host "Installing dependencies..." -ForegroundColor Cyan

winget install Microsoft.WindowsTerminal --accept-source-agreements --accept-package-agreements
winget install Microsoft.PowerShell --accept-source-agreements --accept-package-agreements
winget install OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements
winget install Git.Git --accept-source-agreements --accept-package-agreements

Write-Host "Restart terminal, then run:" -ForegroundColor Green
Write-Host "  npm install -g @anthropic-ai/claude-code" -ForegroundColor Yellow
Write-Host "  git clone https://github.com/skylarbarrera/nyan.git" -ForegroundColor Yellow
Write-Host "  cd nyan && claude" -ForegroundColor Yellow
```

## Links

- [touchdesigner-mcp-server](https://github.com/8beeeaaat/touchdesigner-mcp)
- [TouchDesigner Docs MCP](https://github.com/bottobot/touchdesigner-mcp-server)
