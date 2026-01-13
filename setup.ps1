# Nyan - Windows Setup Script
# Run as Administrator: Right-click PowerShell > Run as Administrator
# Then: Set-ExecutionPolicy Bypass -Scope Process -Force; .\setup.ps1

Write-Host "`n=== Nyan Windows Setup ===" -ForegroundColor Cyan

# Check if running as admin
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "WARNING: Not running as Administrator. Some installs may fail." -ForegroundColor Yellow
    Write-Host "Restart PowerShell as Admin for best results.`n" -ForegroundColor Yellow
}

# Install dependencies via winget
Write-Host "`n[1/4] Installing Windows Terminal..." -ForegroundColor Green
winget install Microsoft.WindowsTerminal --accept-source-agreements --accept-package-agreements -e 2>$null

Write-Host "`n[2/4] Installing PowerShell 7..." -ForegroundColor Green
winget install Microsoft.PowerShell --accept-source-agreements --accept-package-agreements -e 2>$null

Write-Host "`n[3/4] Installing Node.js LTS..." -ForegroundColor Green
winget install OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements -e 2>$null

Write-Host "`n[4/4] Installing Git..." -ForegroundColor Green
winget install Git.Git --accept-source-agreements --accept-package-agreements -e 2>$null

# Refresh PATH for current session
$env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")

# Install Claude Code
Write-Host "`n[5/5] Installing Claude Code..." -ForegroundColor Green
npm install -g @anthropic-ai/claude-code

# Fix PATH for npm global binaries
Write-Host "`n=== Fixing npm PATH ===" -ForegroundColor Cyan
$npmPrefix = npm config get prefix 2>$null
if ($npmPrefix) {
    $currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
    if ($currentPath -notlike "*$npmPrefix*") {
        Write-Host "Adding npm global bin to PATH: $npmPrefix" -ForegroundColor Yellow
        [Environment]::SetEnvironmentVariable("PATH", "$currentPath;$npmPrefix", "User")
        $env:PATH += ";$npmPrefix"
        Write-Host "PATH updated!" -ForegroundColor Green
    } else {
        Write-Host "npm path already in PATH" -ForegroundColor Green
    }
}

# Verify installations
Write-Host "`n=== Verification ===" -ForegroundColor Cyan

Write-Host "`nNode.js: " -NoNewline
try { node --version } catch { Write-Host "NOT FOUND" -ForegroundColor Red }

Write-Host "npm: " -NoNewline
try { npm --version } catch { Write-Host "NOT FOUND" -ForegroundColor Red }

Write-Host "Claude: " -NoNewline
try {
    & "$npmPrefix\claude.cmd" --version 2>$null
    if (-not $?) { throw }
} catch {
    Write-Host "NOT FOUND - Try restarting terminal" -ForegroundColor Red
}

Write-Host "`n=== Setup Complete ===" -ForegroundColor Cyan
Write-Host "`nNext steps:" -ForegroundColor White
Write-Host "  1. CLOSE and REOPEN your terminal" -ForegroundColor Yellow
Write-Host "  2. Run: claude" -ForegroundColor Yellow
Write-Host "  3. Download TouchDesigner from https://derivative.ca/download" -ForegroundColor Yellow
Write-Host "`nIf 'claude' still not found after restart, run:" -ForegroundColor White
Write-Host "  & `"`$(npm config get prefix)\claude.cmd`"" -ForegroundColor Gray
