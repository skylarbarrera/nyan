#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const projectName = process.argv[2];

if (!projectName) {
  console.log('Usage: npm run new <project-name>');
  process.exit(1);
}

// Validate project name (alphanumeric, hyphens, underscores)
if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(projectName)) {
  console.error('ERROR: Project name must start with a letter and contain only letters, numbers, hyphens, and underscores');
  process.exit(1);
}

const rootDir = path.join(__dirname, '..');
const templateDir = path.join(rootDir, 'template');
const tdDir = path.join(rootDir, 'td');
const projectDir = path.join(tdDir, projectName);

// Check template exists
if (!fs.existsSync(templateDir)) {
  console.error('ERROR: template folder not found');
  console.error('Create a template folder with your base project structure first.');
  process.exit(1);
}

// Check project doesn't exist
if (fs.existsSync(projectDir)) {
  console.error(`ERROR: Project '${projectName}' already exists at ${projectDir}`);
  process.exit(1);
}

console.log(`Creating project: ${projectName}`);
console.log(`From template: ${templateDir}`);
console.log('');

// Copy directory recursively, renaming files that contain "template"
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });

  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);

    // Rename files/folders that contain "template" in the name
    let destName = entry.name.replace(/template/gi, projectName);
    const destPath = path.join(dest, destName);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);

      // For text files, also replace "template" inside the content
      const textExtensions = ['.py', '.json', '.md', '.txt', '.html', '.js', '.css'];
      const ext = path.extname(entry.name).toLowerCase();

      if (textExtensions.includes(ext)) {
        try {
          let content = fs.readFileSync(destPath, 'utf8');
          const originalContent = content;

          // Replace template with project name (case-sensitive replacements)
          content = content.replace(/template/g, projectName);
          content = content.replace(/Template/g, projectName.charAt(0).toUpperCase() + projectName.slice(1));
          content = content.replace(/TEMPLATE/g, projectName.toUpperCase());

          if (content !== originalContent) {
            fs.writeFileSync(destPath, content, 'utf8');
          }
        } catch (e) {
          // Skip binary files or files that can't be read as text
        }
      }
    }
  }
}

console.log('Copying template files...');
copyDir(templateDir, projectDir);

// List what was created
console.log('');
console.log('Created project structure:');
function listDir(dir, indent = '  ') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    console.log(`${indent}${entry.name}${entry.isDirectory() ? '/' : ''}`);
    if (entry.isDirectory()) {
      listDir(path.join(dir, entry.name), indent + '  ');
    }
  }
}
listDir(projectDir);

console.log('');
console.log('Done! Project created at:');
console.log(`  ${projectDir}`);
console.log('');

// Check if .toe file exists
const toeFile = path.join(projectDir, `${projectName}.toe`);
if (fs.existsSync(toeFile)) {
  console.log('Next steps:');
  console.log(`  1. Open ${toeFile} in TouchDesigner`);
  console.log('  2. Check Textport (Alt+T) for "server active"');
  console.log('  3. Run "claude" in this repo');
} else {
  console.log('Next steps:');
  console.log('  1. Open TouchDesigner');
  console.log(`  2. Save new project as: ${toeFile}`);
  console.log('  3. Drag mcp_webserver_base.tox into project');
  console.log('  4. Check Textport (Alt+T) for "server active"');
  console.log('  5. Run "claude" in this repo');
}
