# TouchDesigner Knowledge Base

You have MCP tools to control TouchDesigner directly. **USE THEM.** Don't just describe - create nodes, wire them, set parameters.

**Quick reference:** See `td-essentials.md` for decision tree + top operators.
**Operator params:** Read `data/operators/{name}_{family}.json` before creating any operator.
**Workflow patterns:** Check `data/patterns.json` for common operator chains.

---

## Naming Conventions

### Pattern: `purpose_type` or `source_purpose`
```
noise_base          # Base noise texture
noise_displacement  # Noise for displacement
level_contrast      # Level for contrast adjustment
audio_fft           # Audio spectrum analysis
midi_cc             # MIDI CC values
null_output         # Final output null
render_main         # Main render
laser_path          # Laser path points
```

### Prefixes by Role
```
in_*      # Inputs (in_audio, in_midi, in_video)
out_*     # Outputs (out_main, out_laser)
ctrl_*    # Controls (ctrl_slider, ctrl_speed)
fx_*      # Effects (fx_blur, fx_feedback)
gen_*     # Generators (gen_noise, gen_pattern)
path_*    # Paths/lines (path_laser, path_trail)
```

### Container Organization
```
/project1/audio
/project1/midi
/project1/visuals
/project1/laser
/project1/output
```

---

## Resolution Management

Always set resolution explicitly:
```python
op('noise1').par.resolutionw = 1920
op('noise1').par.resolutionh = 1080
```

Common resolutions:
- Preview: 640x360, 960x540
- HD: 1920x1080
- 4K: 3840x2160

Use `Resolution TOP` to standardize chains.

---

## Performance Tips

1. **Null at outputs** - End chains with null (easy reference, cook optimization)
2. **Lower res for effects** - Blur, feedback at half res, upscale at end
3. **Limit cooking** - `bypass` or `lock` unused branches
4. **Select over wires** - Use `Select TOP/CHOP` for long-distance refs
5. **Container organization** - Group related ops, collapse when done
6. **POPs for particles** - Use POPs (GPU) not legacy Particle SOP (CPU)
7. **Instancing for copies** - CHOP + instancing beats Copy SOP for 100+ copies

---

## Parameter Exports

Make parameters reactive to CHOPs:
```python
# Expression-based
op('noise1').par.period.expr = "op('audio_bass')['chan1']"

# Or export CHOP
op('audio_bass').export = True
op('audio_bass').par.exportmethod = 'replace'
```

---

## Don't Do

- Don't create geometry for no reason (no demo torus/sphere)
- Don't leave default names (noise1, level1)
- Don't create without wiring
- Don't skip nulls at outputs
- Don't use maximum resolution unnecessarily
- Don't create operators you weren't asked for
- Don't use Particle SOP for large counts (use POPs)
- Don't describe what you would do - USE THE MCP TOOLS
