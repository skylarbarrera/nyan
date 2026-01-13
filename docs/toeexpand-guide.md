# toeexpand / toecollapse Guide

Convert TouchDesigner .toe files to readable ASCII format and back.

## Location

These utilities are in your TouchDesigner installation:

```
Windows: C:\Program Files\Derivative\TouchDesigner099\bin\
  - toeexpand.exe
  - toecollapse.exe

Mac: /Applications/TouchDesigner.app/Contents/MacOS/
  - toeexpand
  - toecollapse
```

## Usage

### Expand .toe to ASCII

```bash
# Windows
"C:\Program Files\Derivative\TouchDesigner099\bin\toeexpand.exe" project.toe expanded_folder/

# Mac
/Applications/TouchDesigner.app/Contents/MacOS/toeexpand project.toe expanded_folder/
```

This creates a folder with readable text files representing the project structure.

### Collapse ASCII back to .toe

```bash
# Windows
"C:\Program Files\Derivative\TouchDesigner099\bin\toecollapse.exe" expanded_folder/ project.toe

# Mac
/Applications/TouchDesigner.app/Contents/MacOS/toecollapse expanded_folder/ project.toe
```

## Workflow for Claude

1. **Read project structure**: Expand the .toe file, then read the ASCII files to understand what nodes exist

2. **Make changes**: Edit the ASCII files directly (add nodes, change parameters, wire connections)

3. **Rebuild project**: Collapse back to .toe for TD to open

```bash
# Example workflow
toeexpand myproject.toe ./myproject_expanded/
# ... read/edit files in myproject_expanded/ ...
toecollapse ./myproject_expanded/ myproject_modified.toe
```

## What You'll See

The expanded folder contains text files describing:
- Node hierarchy and types
- Parameter values
- Connections between nodes
- Scripts and expressions

## Notes

- Always back up the original .toe before modifying
- TD must NOT have the file open when collapsing
- The ASCII format is TD's internal representation (not documented, but readable)
- .tox files (components) can also be expanded/collapsed the same way
