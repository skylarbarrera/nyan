#!/usr/bin/env node
const { execSync, spawnSync } = require('child_process');
const os = require('os');
const path = require('path');

const isWindows = os.platform() === 'win32';

console.log('=== Nyan Setup ===\n');

if (!isWindows) {
  console.log('This setup script is for Windows.');
  console.log('On Mac/Linux, just run: npm install -g @anthropic-ai/claude-code');
  process.exit(0);
}

function run(cmd, description) {
  console.log(`${description}...`);
  try {
    execSync(cmd, { stdio: 'inherit', shell: true });
    return true;
  } catch (e) {
    console.log(`  Warning: ${description} may have failed`);
    return false;
  }
}

// Check for winget
try {
  execSync('winget --version', { stdio: 'ignore' });
} catch {
  console.error('ERROR: winget not found. Please install App Installer from Microsoft Store.');
  process.exit(1);
}

console.log('[1/4] Installing Windows Terminal...');
run('winget install Microsoft.WindowsTerminal --accept-source-agreements --accept-package-agreements -e', 'Windows Terminal');

console.log('\n[2/4] Installing PowerShell 7...');
run('winget install Microsoft.PowerShell --accept-source-agreements --accept-package-agreements -e', 'PowerShell 7');

console.log('\n[3/4] Installing Git...');
run('winget install Git.Git --accept-source-agreements --accept-package-agreements -e', 'Git');

console.log('\n[4/4] Installing Claude Code...');
run('npm install -g @anthropic-ai/claude-code', 'Claude Code');

// Fix PATH
console.log('\n=== Fixing PATH ===');
const npmPrefix = execSync('npm config get prefix', { encoding: 'utf8' }).trim();
console.log(`npm global directory: ${npmPrefix}`);

const currentPath = process.env.PATH || '';
if (!currentPath.includes(npmPrefix)) {
  console.log('Adding npm global bin to PATH...');
  try {
    execSync(`setx PATH "%PATH%;${npmPrefix}"`, { stdio: 'inherit', shell: true });
    console.log('PATH updated! Restart your terminal.');
  } catch {
    console.log(`Manual fix: Add ${npmPrefix} to your PATH`);
  }
} else {
  console.log('npm path already in PATH');
}

console.log('\n=== Setup Complete ===');
console.log('\nRestart your terminal, then run:');
console.log('  claude');
