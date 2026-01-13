#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const projectName = process.argv[2];

if (!projectName) {
  console.log('Usage: npm run new <project-name>');
  process.exit(1);
}

const rootDir = path.join(__dirname, '..');
const mcpServerDir = path.join(rootDir, 'mcp-server');
const tdDir = path.join(rootDir, 'td');
const projectDir = path.join(tdDir, projectName);

// Check mcp-server exists
if (!fs.existsSync(mcpServerDir)) {
  console.error('ERROR: mcp-server folder not found');
  process.exit(1);
}

// Check project doesn't exist
if (fs.existsSync(projectDir)) {
  console.error(`ERROR: Project '${projectName}' already exists`);
  process.exit(1);
}

console.log(`Creating project: ${projectName}`);

// Create project folder
fs.mkdirSync(projectDir, { recursive: true });

// Copy files
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('Copying MCP server files...');
fs.copyFileSync(
  path.join(mcpServerDir, 'mcp_webserver_base.tox'),
  path.join(projectDir, 'mcp_webserver_base.tox')
);
fs.copyFileSync(
  path.join(mcpServerDir, 'import_modules.py'),
  path.join(projectDir, 'import_modules.py')
);
copyDir(
  path.join(mcpServerDir, 'modules'),
  path.join(projectDir, 'modules')
);

console.log('');
console.log('Done! Project created at:');
console.log(`  ${projectDir}`);
console.log('');
console.log('Next steps:');
console.log('  1. Open TouchDesigner');
console.log(`  2. Save new project as: ${path.join(projectDir, projectName + '.toe')}`);
console.log('  3. Drag mcp_webserver_base.tox into project');
console.log('  4. Check Textport (Alt+T) for "server active"');
console.log('  5. Run "claude" in this repo');
