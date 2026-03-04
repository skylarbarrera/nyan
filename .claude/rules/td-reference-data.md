# TouchDesigner Reference Data

Local operator documentation in `data/`. Use this instead of MCP docs.

**MANDATORY: Before creating ANY operator, extract its parameters:**
```bash
bun scripts/extract-params.ts <operator_name>
```
This reduces ~150KB per operator JSON → ~1KB of actionable parameter IDs for `.parm` authoring. **Never guess parameter names.**

---

## Planning a Build

**First**, read `data/patterns.json` to understand common workflows:

```json
{
  "name": "Audio Reactive Visuals",
  "workflow": ["Audio Device In", "Audio Spectrum", "Math", "CHOP to", "Noise", "Level", "Out"],
  "use_case": "Create visuals that react to audio input"
}
```

This tells you what operators chain together for common tasks.

---

## Before Creating Any Operator

**MANDATORY:** Extract parameter IDs using the extractor:

```bash
# By filename
bun scripts/extract-params.ts noise_top

# By display name (fuzzy match)
bun scripts/extract-params.ts "Audio Device In"

# Full params including common/shared
bun scripts/extract-params.ts level_top --verbose
```

The extractor parses the raw operator JSON (~150KB) and outputs only the parameter IDs you need (~1KB).

### Filename Convention

Operator names map to filenames:
```
Noise TOP       → noise_top.json
Audio Device In → audiodevicein_chop.json
Movie File In   → moviefilein_top.json
CHOP Execute    → chopexecute_dat.json
```

The extractor handles fuzzy matching, so `"Audio Device In"` works directly.

### Why Not Read the JSON Directly?

Each operator JSON is ~80-150KB with a giant embedded description blob. The extractor:
- Parses the description to find real parameter IDs
- Filters common/shared params (resolution, format, etc.)
- Outputs clean, compact format ready for `.parm` authoring
- Shows menu options for enum parameters

**Do NOT** read operator JSONs directly — use the extractor.

---

## Filename Convention

Operator names map to filenames:
```
Noise TOP       → noise_top.json
Audio Device In → audio_device_in_chop.json
Movie File In   → movie_file_in_top.json
CHOP Execute    → chop_execute_dat.json
```

Pattern: `lowercase_with_underscores_{family}.json`

---

## When Writing Python Scripts

Read `data/python-api/{ClassName}.json` for method signatures:

```
Writing CHOP script?
→ Read data/python-api/CHOP.json
→ See methods: chan(), chans(), numpyArray(), etc.
→ Get correct signatures and return types
```

---

## Tutorials

Read `data/tutorials/` for in-depth guides on specific topics:

| Tutorial | Read When |
|----------|-----------|
| `introduction_to_python_tutorial.json` | Writing Script DATs, Python in TD |
| `write_a_glsl_top.json` | Creating custom GLSL TOP shaders |
| `write_a_glsl_material.json` | Writing GLSL materials for 3D |
| `anatomy_of_a_chop.json` | Need to understand CHOP internals |
| `build_a_list_comp.json` | Building dynamic UI lists |
| `video_streaming_user_guide.json` | Video streaming, NDI, Syphon/Spout |

**Triggers:**
- User mentions "Python script" or "Script DAT" → read python tutorial
- User mentions "GLSL", "shader", "custom effect" → read glsl tutorials
- User mentions "streaming", "NDI", "Syphon", "Spout" → read video streaming guide
- User building UI with lists → read list comp tutorial

---

## Token Efficiency

| Data | When to Load |
|------|--------------|
| `patterns.json` (12KB) | Upfront when planning |
| `operators/*.json` (~80KB each) | One at a time, per operator |
| `python-api/*.json` (~10KB each) | Only when writing scripts |
| `tutorials/*.json` (~50-400KB each) | Only when topic matches |

Don't bulk-load. Query what you need, when you need it.
