# TouchDesigner Essentials

Quick decision-making guide. For full operator params, read `data/operators/{name}_{family}.json`.

---

## Decision Tree: Which Operator Family?

| I need to... | Use |
|--------------|-----|
| Work with images, video, textures | **TOPs** |
| Work with numbers, audio, MIDI, data streams | **CHOPs** |
| Create/edit 3D geometry (small count) | **SOPs** |
| Particles, points, lasers (GPU, 10k+) | **POPs** |
| Text, tables, scripts, network | **DATs** |
| 3D scenes, containers, UI | **COMPs** |

### Special Cases
| Task | Family | Why |
|------|--------|-----|
| **Laser output** | POPs → CHOPs | POPs for paths, CHOPs for DAC output |
| **Audio-reactive** | CHOPs → TOPs/POPs | CHOPs analyze, drive visuals |
| **Instancing (many copies)** | CHOPs + COMPs | CHOP data drives geometry instances |
| **Point clouds** | POPs | GPU-accelerated point processing |
| **Video effects** | TOPs | All image processing |
| **3D rendering** | SOPs + COMPs + TOPs | SOP geo → COMP scene → TOP render |

---

## Top Operators Per Family

### TOPs (Images) - Use Most
| Op | For |
|----|-----|
| `Noise` | Procedural textures |
| `Level` | Brightness/contrast |
| `Composite` | Layer images |
| `Feedback` | Trails, echo |
| `Blur` | Softening, glow |
| `Transform` | Move, scale, rotate |
| `Render` | 3D to 2D |
| `Movie File In` | Load video |
| `CHOP to` | Data visualization |
| `Null` | Output point |

### CHOPs (Data) - Use Most
| Op | For |
|----|-----|
| `Audio Device In` | Live audio |
| `Audio Spectrum` | FFT analysis |
| `MIDI In` | MIDI controllers |
| `OSC In` | OSC messages |
| `Noise` | Random animation |
| `LFO` | Oscillators |
| `Math` | Arithmetic |
| `Filter` / `Lag` | Smooth values |
| `Select` | Pick channels |
| `Null` | Output point |

### SOPs (Geometry) - Use Most
| Op | For |
|----|-----|
| `Grid` | Flat plane |
| `Sphere` / `Box` | Basic shapes |
| `Circle` / `Line` | 2D shapes |
| `Noise` | Displace geo |
| `Transform` | Move/scale |
| `Copy` | Duplicate |
| `Merge` | Combine |
| `CHOP to` | Data to points |
| `Null` | Output point |

### POPs (Particles/Points/Lasers) - Use Most
| Op | For |
|----|-----|
| `Point Generator` | Create points |
| `Line` | Line/path creation |
| `Grid` / `Circle` | Point patterns |
| `Noise` | Organic motion |
| `Force Radial` | Forces |
| `Transform` | Move points |
| `CHOP to` | Data to points |
| `SOP to` | Geometry to points |
| `Particle` | Particle sim |
| `Null` | Output point |

### DATs (Data/Text) - Use Most
| Op | For |
|----|-----|
| `Table` | Spreadsheet |
| `Text` | Text content |
| `Script` | Python code |
| `CHOP Execute` | React to CHOPs |
| `OSC In` / `OSC Out` | OSC messages |
| `TCP/IP` | Network |
| `Web Client` | HTTP requests |
| `Null` | Output point |

### COMPs (Components) - Use Most
| Op | For |
|----|-----|
| `Geometry` | 3D object |
| `Camera` | 3D camera |
| `Light` | Lighting |
| `Container` | Group ops |
| `Base` | Reusable module |
| `Null` | Empty transform |

---

## Key Patterns

### Audio-Reactive
```
Audio Device In → Audio Spectrum → Math (scale) → Select (bands)
  → Export to TOP/POP parameters
```

### MIDI Control
```
MIDI In → Select (CCs) → Math (0-127 → useful range) → Null
  → Export to parameters
```

### Feedback Loop
```
Feedback TOP → Composite (mix source) → Level (fade) → back to Feedback
```

### Laser Path (POPs)
```
Line POP / Circle POP → Transform → Noise (optional)
  → POP to CHOP → Laser CHOP (EtherDream/Helios/Pangolin)
```

### Instancing
```
CHOP (tx,ty,tz,sx,sy,sz per instance) → Geometry COMP (instancing=on)
```

### Point Cloud
```
Kinect/ZED/RealSense → POP processing → Render or Instance
```

---

## Operator Details

For specific parameter names and details, read `data/operators/{name}_{family}.json`.

See `td-reference-data.md` for how to use local reference data.
