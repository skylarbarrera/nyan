#!/usr/bin/env node
const { execSync } = require('child_process');
const os = require('os');

const isWindows = os.platform() === 'win32';

console.log('Fixing Claude PATH...\n');

// Get npm prefix
let npmPrefix;
try {
  npmPrefix = execSync('npm config get prefix', { encoding: 'utf8' }).trim();
} catch {
  console.error('ERROR: npm not found. Install Node.js first.');
  process.exit(1);
}

console.log(`npm global directory: ${npmPrefix}`);

if (isWindows) {
  const currentPath = process.env.PATH || '';
  if (!currentPath.includes(npmPrefix)) {
    console.log('Adding to PATH...');
    try {
      execSync(`setx PATH "%PATH%;${npmPrefix}"`, { stdio: 'inherit', shell: true });
      console.log('\nPATH updated! Restart your terminal.');
    } catch {
      console.log(`\nManual fix: Add this to your PATH:`);
      console.log(`  ${npmPrefix}`);
    }
  } else {
    console.log('Already in PATH');
  }

  console.log('\nTest claude:');
  console.log(`  "${npmPrefix}\\claude.cmd" --version`);
} else {
  // Mac/Linux
  const shell = process.env.SHELL || '/bin/bash';
  const rcFile = shell.includes('zsh') ? '~/.zshrc' : '~/.bashrc';

  console.log(`\nAdd to ${rcFile}:`);
  console.log(`  export PATH="$PATH:${npmPrefix}"`);
  console.log(`\nThen run: source ${rcFile}`);
}
