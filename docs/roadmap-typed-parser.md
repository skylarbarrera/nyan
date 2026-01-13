# Typed TD Parser - Future Roadmap

Potential next steps if we need programmatic TD project generation at scale.

## Current State

- `docs/toeexpand-editing-guide.md` documents the ASCII format (750 lines)
- Manual read/write works for Claude workflows
- No public parser exists - we'd be first

## When to Build This

Build typed parser when you hit these pain points:
- Repeated errors from malformed ASCII files
- Need to generate many projects programmatically
- Want validation before collapse (catch errors early)
- Building a CLI tool for TD project scaffolding

## Phase 1: Core Models (2-4 hours)

```python
# src/td_parser/models.py
from pydantic import BaseModel
from typing import Literal

class TilePosition(BaseModel):
    x: int
    y: int
    width: int = 130
    height: int = 90

class NodeDef(BaseModel):
    family: Literal["TOP", "CHOP", "SOP", "DAT", "COMP", "MAT", "POP"]
    type: str
    tile: TilePosition
    inputs: dict[int, str] = {}
    flags: str = "viewer 1 parlanguage 0"
    color: tuple[float, float, float] = (0.5, 0.5, 0.5)

class Parameter(BaseModel):
    name: str
    flags: Literal[0, 17]  # 0=constant, 17=expression
    value: str | int | float
    expression: str | None = None

class Node(BaseModel):
    name: str
    path: str  # e.g., "project1/mynode"
    definition: NodeDef
    parameters: list[Parameter] = []
    text: str | None = None
    children: list["Node"] = []

class Project(BaseModel):
    name: str
    build_version: str
    nodes: list[Node]
```

## Phase 2: Parser (4-6 hours)

```python
# src/td_parser/parser.py
def parse_n_file(path: str) -> NodeDef:
    """Parse .n file to NodeDef"""
    pass

def parse_parm_file(path: str) -> list[Parameter]:
    """Parse .parm file to Parameter list"""
    pass

def parse_expanded_project(dir_path: str) -> Project:
    """Parse entire expanded .toe.dir to Project"""
    pass
```

## Phase 3: Serializer (4-6 hours)

```python
# src/td_parser/serializer.py
def serialize_node(node: Node, base_path: str) -> list[str]:
    """Write node to .n and .parm files, return TOC entries"""
    pass

def serialize_project(project: Project, output_dir: str) -> None:
    """Write entire project to expanded format with .toc"""
    pass
```

## Phase 4: Validation (2-3 hours)

```python
# src/td_parser/validate.py
def validate_connections(project: Project) -> list[str]:
    """Check all input references exist"""
    pass

def validate_parameters(node: Node) -> list[str]:
    """Check parameter names are valid for node type"""
    pass
```

## Phase 5: CLI Tool (2-3 hours)

```bash
# Create project from template
td-gen create my-project --template audio-reactive

# Validate expanded project
td-gen validate ./project.toe.dir

# Add node to existing project
td-gen add-node project1/my_noise --type TOP:noise --params "resolutionw=1920,resolutionh=1080"
```

## Data Collection Needed

To make this robust, expand and catalog:
- [ ] All parameter names per node type
- [ ] All flag options
- [ ] Expression syntax variations
- [ ] Container/hierarchy edge cases
- [ ] Multi-input node wiring patterns
- [ ] Custom parameter definitions

## Estimated Total Effort

| Phase | Hours | Priority |
|-------|-------|----------|
| Core Models | 2-4 | High (if building) |
| Parser | 4-6 | High |
| Serializer | 4-6 | High |
| Validation | 2-3 | Medium |
| CLI Tool | 2-3 | Low |
| Data Collection | 8-16 | Ongoing |

**Total: 20-40 hours for complete solution**

## Alternative: Stay Manual

The 750-line guide is enough for Claude to:
- Read expanded projects
- Write ASCII files by hand
- Let TD catch errors on open

Only build typed tooling if manual becomes painful.
