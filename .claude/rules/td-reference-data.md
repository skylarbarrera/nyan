# TouchDesigner Reference Data

Local operator documentation in `data/`. Use this instead of MCP docs.

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

Look up its parameters in `data/operators/`:

1. Convert name to filename: `Noise TOP` → `noise_top.json`
2. Read `data/operators/noise_top.json`
3. Set required parameters from the JSON

**Example:**
```
Creating a Noise TOP?
→ Read data/operators/noise_top.json
→ See 88 parameters with types, defaults, descriptions
→ Set resolution, period, harmonics, etc. correctly
```

**Do NOT** read multiple operator files at once. Read one at a time as you create each node.

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

## Token Efficiency

| Data | When to Load |
|------|--------------|
| `patterns.json` (12KB) | Upfront when planning |
| `operators/*.json` (~80KB each) | One at a time, per operator |
| `python-api/*.json` (~10KB each) | Only when writing scripts |

Don't bulk-load. Query what you need, when you need it.
