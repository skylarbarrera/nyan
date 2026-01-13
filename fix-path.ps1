# Fix Claude PATH Issue
# Run this if 'claude' command not recognized after npm install

Write-Host "Fixing Claude PATH..." -ForegroundColor Cyan

$npmPrefix = npm config get prefix
if (-not $npmPrefix) {
    Write-Host "ERROR: npm not found. Install Node.js first." -ForegroundColor Red
    exit 1
}

Write-Host "npm global directory: $npmPrefix" -ForegroundColor Gray

# Add to User PATH permanently
$currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
if ($currentPath -notlike "*$npmPrefix*") {
    [Environment]::SetEnvironmentVariable("PATH", "$currentPath;$npmPrefix", "User")
    Write-Host "Added to PATH permanently" -ForegroundColor Green
} else {
    Write-Host "Already in PATH" -ForegroundColor Yellow
}

# Add to current session
$env:PATH += ";$npmPrefix"

# Test
Write-Host "`nTesting claude..." -ForegroundColor Cyan
& "$npmPrefix\claude.cmd" --version

Write-Host "`nDone! Restart terminal for permanent fix." -ForegroundColor Green
