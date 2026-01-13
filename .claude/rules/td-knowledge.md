# TouchDesigner Knowledge Base

You have MCP tools to control TouchDesigner directly. USE THEM. Don't just describe what to do - create the nodes, wire them, set parameters.

## MCP Tools - Use Heavily

### Creating Nodes
```
create_node(type, name, parent_path)
```
Always specify meaningful names. Never use defaults like "noise1" - use "noise_base" or "noise_displacement".

### Wiring
```
connect_nodes(from_op, to_op)
```
Wire as you build. Don't create all nodes then wire - create, wire, create, wire.

### Parameters
```
set_parameter(op_path, param_name, value)
update_parameters(op_path, {param: value, ...})
```
Set parameters immediately after creating. Don't leave defaults.

### Query Before Building
```
get_nodes(parent_path)
get_node_detail(op_path)
```
Check what exists before creating. Avoid duplicates.

---

## Operator Families

### TOPs (Texture Operators) - 2D Images/Video
| Operator | Use When |
|----------|----------|
| `noiseTOP` | Procedural textures, displacement maps |
| `levelTOP` | Brightness, contrast, color correction |
| `compositeTOP` | Layering, blending multiple sources |
| `feedbackTOP` | Trails, echo effects, recursive visuals |
| `blurTOP` | Softening, glow effects |
| `edgeTOP` | Line detection, outlines |
| `transformTOP` | Scale, rotate, translate images |
| `cropTOP` | Cut to specific region |
| `resolutionTOP` | Change image dimensions |
| `nullTOP` | Clean output point, reference target |
| `switchTOP` | Toggle between inputs |
| `selectTOP` | Reference another TOP's output |
| `moviefileinTOP` | Load video/image files |
| `videodevinTOP` | Camera/capture card input |
| `renderTOP` | Render 3D scene to 2D |
| `outTOP` | Final output to window/display |

### CHOPs (Channel Operators) - Numbers/Data/Animation
| Operator | Use When |
|----------|----------|
| `audiodeviceinCHOP` | Live audio input |
| `audiospectCHOP` | FFT frequency analysis |
| `midiinCHOP` | MIDI controller input |
| `oscin CHOP` | OSC messages input |
| `lfoC HOP` | Oscillating values (sine, saw, etc) |
| `noiseCHOP` | Random/organic animation |
| `mathCHOP` | Arithmetic on channels |
| `filterCHOP` | Smooth, lag values |
| `selectCHOP` | Pick specific channels |
| `renameCHOP` | Clean channel names |
| `mergeCHOP` | Combine multiple CHOPs |
| `nullCHOP` | Clean output point |
| `constantCHOP` | Fixed values |
| `countCHOP` | Counting, triggers |
| `speedCHOP` | Velocity from position |
| `choptoTOP` | Visualize CHOP as image |
| `chopexecDAT` | Trigger scripts from values |

### SOPs (Surface Operators) - 3D Geometry
| Operator | Use When |
|----------|----------|
| `sphereSOP` | Basic 3D sphere |
| `boxSOP` | Cubes, rectangular prisms |
| `gridSOP` | Flat plane, displacement base |
| `circleSOP` | 2D circles, rings |
| `lineSOP` | Lines, laser paths |
| `noiseSOP` | Deform geometry organically |
| `transformSOP` | Move, rotate, scale geo |
| `copySOP` | Duplicate geometry |
| `mergeSOP` | Combine multiple SOPs |
| `nullSOP` | Clean output |
| `scriptSOP` | Procedural geometry via Python |

### DATs (Data Operators) - Text/Tables/Scripts
| Operator | Use When |
|----------|----------|
| `textDAT` | Store text, code |
| `tableDAT` | Spreadsheet data |
| `scriptDAT` | Python execution |
| `chopexecDAT` | React to CHOP changes |
| `opexecuteDAT` | React to operator events |
| `oscin DAT` | OSC as text |
| `selectDAT` | Reference another DAT |
| `nullDAT` | Clean output |
| `jsonDAT` | JSON data handling |
| `webDAT` | HTTP requests |

### COMPs (Component Operators) - Containers/3D Objects
| Operator | Use When |
|----------|----------|
| `containerCOMP` | Group operators, organization |
| `baseCOMP` | Reusable modules |
| `geometryCOMP` | 3D object with material |
| `cameraCOMP` | 3D camera |
| `lightCOMP` | 3D lighting |
| `nullCOMP` | Empty 3D transform |

### MATs (Material Operators) - Shaders/Surfaces
| Operator | Use When |
|----------|----------|
| `phongMAT` | Basic lit surface |
| `pbrMAT` | Physically based rendering |
| `constantMAT` | Unlit, flat color |
| `wireframeMAT` | Outline rendering |
| `glslMAT` | Custom shaders |

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
geo_particles       # Particle geometry
```

### Prefixes by Role
```
in_*      # Input sources (in_audio, in_midi, in_video)
out_*     # Final outputs (out_main, out_preview)
ctrl_*    # Control/UI elements (ctrl_slider, ctrl_speed)
fx_*      # Effects (fx_blur, fx_feedback)
gen_*     # Generators (gen_noise, gen_pattern)
```

### Containers
```
/project1/audio_processing
/project1/visual_generation
/project1/midi_control
/project1/output
```

---

## Common Patterns

### Audio-Reactive
```
audiodeviceinCHOP → audiospectCHOP → mathCHOP (scale) →
  split into bands via selectCHOP →
  use channels to drive TOP parameters or geometry
```
Create:
1. `in_audio` (audiodevicein)
2. `audio_fft` (audiospec)
3. `audio_scale` (math - multiply to useful range)
4. `audio_bass`, `audio_mid`, `audio_high` (select specific bands)
5. Wire to target parameters via exports or expressions

### Feedback Loop
```
feedbackTOP → compositeTOP (mix with source) →
  levelTOP (fade) → back to feedback
```
Create:
1. `feedback_loop` (feedback)
2. `comp_mix` (composite - Over or Add)
3. `level_fade` (level - reduce opacity slightly)
4. Wire output back to feedback input

### MIDI Control
```
midiinCHOP → selectCHOP (pick CCs) →
  mathCHOP (scale 0-127 to useful range) →
  export to parameters
```
Create:
1. `in_midi` (midiin)
2. `midi_select` (select specific channels)
3. `midi_scale` (math - map to target range)
4. `null_midi` (null - clean reference point)
5. Set up parameter exports

### Instancing (Many Copies)
```
Source geometry → geometryCOMP with instancing enabled
Instance CHOP provides tx, ty, tz, scale, etc per instance
```
Create:
1. Source SOP (sphere, custom geo)
2. `geo_instances` (geometry) - enable instancing
3. CHOP with instance data (tx, ty, tz channels, N samples = N instances)
4. Point geometry to instance CHOP

### Particles
```
Particle SOP system or custom point-based approach
Modern TD: use instancing over legacy particles
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

Use `resolutionTOP` to standardize chains.

---

## Performance Tips

1. **Null at outputs** - Always end chains with null (easy to reference, cook optimization)
2. **Lower resolution for effects** - Blur, feedback at half res, scale up at end
3. **Limit cooking** - Use `bypass` or `lock` on unused branches
4. **selectTOP over wires** - For long-distance references, cleaner than long wires
5. **Container organization** - Group related ops, collapse when not editing

---

## Workflow

### When Asked to Build Something:

1. **Query first**: Check existing network with `get_nodes()`
2. **Plan the chain**: List operators needed
3. **Create inputs first**: Audio, MIDI, video sources
4. **Build processing**: Effects, math, logic
5. **Create outputs last**: Renders, nulls, outs
6. **Wire as you go**: Connect immediately after creating
7. **Set parameters**: Don't leave defaults
8. **Add nulls**: At key output points

### Example Build Sequence:
```
"Create audio-reactive noise texture"

1. get_nodes('/project1') - check what exists
2. create audiodeviceinCHOP 'in_audio'
3. create audiospectCHOP 'audio_fft', wire from in_audio
4. create mathCHOP 'audio_scale', set multiply=10, wire from audio_fft
5. create selectCHOP 'audio_bass', set channames='chan1-chan4', wire from audio_scale
6. create noiseTOP 'noise_base', set resolution
7. export audio_bass:chan1 → noise_base:par.period
8. create nullTOP 'null_output', wire from noise_base
```

---

## Parameter Exports

To make parameters reactive to CHOPs:
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
