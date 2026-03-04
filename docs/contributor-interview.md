# TouchDesigner Contributor Interview

Structured interview for TD engineers with boutique projects. Responses will feed into the Nyan Cat TD build system to improve AI-generated networks.

---

## 1. Project Collection

We need 5-8 small `.toe` files spanning different categories. These will be expanded via `toeexpand` and only the ASCII `.toe.dir` contents committed to the repo.

### Requested Project Categories

| # | Category | Example | Priority |
|---|----------|---------|----------|
| 1 | Audio Reactive Visuals | Audio input driving noise/texture params | High |
| 2 | Feedback Loop | Recursive feedback with compositing | High |
| 3 | MIDI Control | MIDI CC mapped to visual parameters | Medium |
| 4 | Laser / POP Pipeline | POP-based path generation for laser output | High |
| 5 | Instancing | CHOP data driving geometry instances | Medium |
| 6 | GLSL Shader | Custom GLSL TOP or material | Medium |
| 7 | Generative Pattern | Noise-based procedural visuals | Low |
| 8 | Data Visualization | DAT-to-geometry pipeline | Low |

### Questions

- Which of these do you have ready-to-share `.toe` files for?
- Are there categories above that overlap in your projects? (e.g., audio reactive + feedback in one file)
- Do you have "starter templates" you reuse when beginning new projects? If so, can you share 1-2?
- **Licensing:** Are you comfortable including these in an open-source (MIT) repo? If not, should they be `.gitignore`d or stored in LFS?

---

## 2. Parameter Presets

Our system uses `data/patterns.json` to define operator chains for common workflows. We need **typical parameter values** for each pattern.

For each row below, fill in the key parameters and their typical values. Mark whether a value is a "safe default" (works in most projects) or "needs tuning" (project-dependent).

### Audio Analysis Chain
`Audio Device In -> Audio Spectrum -> Math -> Lag -> Null`

| Operator | Parameter | Typical Value | Safe Default? | Notes |
|----------|-----------|---------------|---------------|-------|
| Audio Spectrum | | | | |
| Math | gain | | | |
| Lag | lag | | | |

### Audio Processing Chain
`Audio Device In -> Audio Filter -> Audio Dynamics -> Math -> Audio Device Out`

| Operator | Parameter | Typical Value | Safe Default? | Notes |
|----------|-----------|---------------|---------------|-------|
| Audio Filter | | | | |
| Audio Dynamics | | | | |
| Math | | | | |

### Audio Reactive Visuals
`Audio Device In -> Audio Spectrum -> Math -> CHOP to -> Noise -> Level -> Out`

| Operator | Parameter | Typical Value | Safe Default? | Notes |
|----------|-----------|---------------|---------------|-------|
| Audio Spectrum | | | | |
| Math | gain | | | |
| CHOP to | | | | |
| Noise | period | | | |
| Noise | harmonics | | | |
| Level | opacity | | | |

### MIDI Control Chain
`MIDI In -> Select -> Math -> Lag -> Null`

| Operator | Parameter | Typical Value | Safe Default? | Notes |
|----------|-----------|---------------|---------------|-------|
| Select | channames | | | |
| Math | fromrange1-4 | | | MIDI sends 0-127 |
| Math | torange1-4 | | | Map to what range? |
| Lag | lag | | | Smoothing amount |

### Feedback Loop Effect
`Movie File In -> Transform -> Feedback -> Composite -> Level -> Out`

| Operator | Parameter | Typical Value | Safe Default? | Notes |
|----------|-----------|---------------|---------------|-------|
| Transform | scalex/y | | | Zoom per frame |
| Transform | rotatez | | | Rotation per frame |
| Composite | operand | | | over/add/multiply? |
| Level | opacity | | | Fade amount |

### Generative Pattern
`Noise -> Math -> Ramp -> Composite -> Transform -> Feedback`

| Operator | Parameter | Typical Value | Safe Default? | Notes |
|----------|-----------|---------------|---------------|-------|
| Noise | period | | | |
| Noise | harmonics | | | |
| Noise | type | | | Which noise type? |
| Math | | | | |
| Ramp | | | | |
| Transform | | | | |

### Basic 3D Geometry
`Sphere -> Transform -> Material -> Render`

| Operator | Parameter | Typical Value | Safe Default? | Notes |
|----------|-----------|---------------|---------------|-------|
| Sphere | rows/cols | | | |
| Material | | | | Which material type? |
| Render | resolutionw/h | | | |

### Particle System Basic
`Particle -> Force -> Render`

| Operator | Parameter | Typical Value | Safe Default? | Notes |
|----------|-----------|---------------|---------------|-------|
| Particle | birthrate | | | |
| Particle | life | | | |
| Force | forcex/y/z | | | |

### Advanced Particle System
`Particle -> Attractor -> Force -> Collision -> Limit -> Render`

| Operator | Parameter | Typical Value | Safe Default? | Notes |
|----------|-----------|---------------|---------------|-------|
| Particle | | | | |
| Attractor | | | | |
| Force | | | | |
| Collision | | | | |
| Limit | | | | |

### Procedural Geometry
`Grid -> Noise -> Point -> Copy -> Transform -> Material`

| Operator | Parameter | Typical Value | Safe Default? | Notes |
|----------|-----------|---------------|---------------|-------|
| Grid | rows/cols | | | |
| Noise | amplitude | | | |
| Copy | copies | | | |

### Data Visualization
`Table -> DAT to -> Point -> Copy -> Material -> Render`

| Operator | Parameter | Typical Value | Safe Default? | Notes |
|----------|-----------|---------------|---------------|-------|
| Table | | | | |
| DAT to | | | | |
| Copy | | | | |

### Real-time Compositing
`Movie File In -> Video Device In -> Chroma Key -> Composite -> Over -> Level -> Out`

| Operator | Parameter | Typical Value | Safe Default? | Notes |
|----------|-----------|---------------|---------------|-------|
| Chroma Key | keycolor | | | |
| Composite | operand | | | |
| Over | | | | |

### OSC Control Network
`OSC In -> Convert -> Math -> Null`

| Operator | Parameter | Typical Value | Safe Default? | Notes |
|----------|-----------|---------------|---------------|-------|
| OSC In | port | | | |
| Convert | | | | |
| Math | | | | |

### Parameter Relationships

Are there parameter relationships the system should enforce? Examples:

- "Noise `period` should scale with resolution" (how?)
- "Feedback `opacity` should be < 1.0 or it blows out"
- "Math `gain` for audio should be 5-20 depending on source"

Please list any such relationships you know of:

1.
2.
3.

---

## 3. Architecture Patterns

### Multi-Container Organization

How do you typically structure a mid-size TD project? Example:

```
/project1/
  audio/         <- audio input + analysis
  midi/          <- MIDI controllers
  visuals/       <- main visual chain
  laser/         <- laser output path
  output/        <- final renders, NDI, etc.
  ctrl/          <- control panel / UI
```

- Does this match your structure, or do you organize differently?
- Do you use `Base COMP` or `Container COMP` for grouping? When each?
- How do you handle cross-container references (Select ops vs long wires vs exports)?

### Top 5 Beginner Mistakes in TD

What are the most common mistakes you see beginners make?

1.
2.
3.
4.
5.

### POP Configurations for Laser Output

For laser output (EtherDream, Helios, Pangolin):

- Which POP operators do you use for path generation?
- What are the key parameters for point count, order, blanking?
- How do you convert POP points to laser DAC output (POP -> CHOP -> DAC path)?
- Any gotchas with point ordering or blanking points?

### When to Use Each Approach

| Approach | Best For | Avoid When |
|----------|----------|------------|
| Expressions (`par.expr`) | | |
| CHOP Exports | | |
| Python Callbacks | | |
| Execute DATs | | |

Please fill in when you prefer each approach.

### Instancing Setup Patterns

For instancing (e.g., 1000+ copies of geometry driven by CHOP data):

- What CHOP channels do you typically set up? (tx, ty, tz, sx, sy, sz, rx, ry, rz?)
- How do you organize the instancing CHOP data?
- Geometry COMP settings: which instancing parameters matter most?
- Performance limits: at what instance count do you start optimizing?

---

## 4. Validation Knowledge

Our validator (`scripts/validate-toe.ts`) catches structural errors (TAB/space in wiring, missing `end`, bad `.text` headers, Python syntax). But it cannot catch semantic errors.

### What Breaks Silently in TD?

Things that load without errors but produce wrong results:

1.
2.
3.

### Bad Parameter Combinations

Combinations that won't throw errors but look wrong or perform badly:

| Operator | Params | What Goes Wrong |
|----------|--------|-----------------|
| | | |
| | | |
| | | |

### "Never Do This" Rules

Hard-won rules from experience:

1.
2.
3.
4.
5.

---

## 5. Delivery

### Format Options

You can respond via:
- Fill in this document directly (copy/paste into email, Discord, etc.)
- Screen-share walkthrough (we can record and transcribe)
- Send annotated `.toe` files with comments in Text DATs

### Level of Detail

Here is an example of the detail level that is most useful:

> **Audio Reactive Visuals - Audio Spectrum params:**
> - `spectype` = 1 (power spectrum, not raw FFT)
> - `binsize` = 512 (good balance of frequency resolution vs responsiveness)
> - `window` = 1 (Hanning - smooths spectral leakage)
>
> **Math after Audio Spectrum:**
> - `gain` = 10 (audio levels are typically 0.0-0.1, need to scale up)
> - `chanop` = 0 (per-sample, not combine)
>
> **Notes:** Always put a Lag CHOP after Math to smooth the output. Without it, visuals will flicker. Lag value of 0.1-0.3 works for most music. Lower for percussion, higher for ambient.

### Timeline

No rush. Partial responses are welcome -- even 2-3 filled-in pattern tables would be a significant improvement over what we have now.

---

*Thank you for contributing to the Nyan Cat TD project.*
