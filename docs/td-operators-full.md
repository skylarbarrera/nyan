# TouchDesigner Operator Reference

Complete operator reference. Use this to pick the right operator for the job.

---

## TOPs (Texture Operators) - 151 Total

### Generators (Create Images)
| Operator | Use |
|----------|-----|
| `Constant` | Solid color |
| `Noise` | Procedural noise patterns |
| `Ramp` | Gradients |
| `Circle` | Circular shapes |
| `Rectangle` | Rectangular shapes |
| `Text` | Text rendering |
| `Pattern` | Test patterns |
| `Script` | Python-generated images |
| `Web Render` | Render web page |

### File/Input
| Operator | Use |
|----------|-----|
| `Movie File In` | Video/image files |
| `Video Device In` | Cameras, capture cards |
| `Screen Grab` | Capture screen |
| `NDI In` | NDI video input |
| `Syphon Spout In` | Syphon/Spout input |
| `Touch In` | TouchDesigner remote |
| `DirectX In` | DirectX capture |
| `Kinect` | Kinect sensor |
| `Kinect Azure` | Azure Kinect |
| `RealSense` | Intel RealSense |
| `Leap Motion` | Leap Motion |
| `ZED` | ZED camera |
| `OAK Select` | OAK-D camera |
| `Orbbec` | Orbbec sensors |
| `Ouster` | Ouster LiDAR |

### Color/Levels
| Operator | Use |
|----------|-----|
| `Level` | Brightness, contrast, gamma |
| `HSV Adjust` | Hue, saturation, value |
| `HSV to RGB` | Color space convert |
| `RGB to HSV` | Color space convert |
| `Lookup` | Color lookup table |
| `Monochrome` | Convert to grayscale |
| `Threshold` | Binary threshold |
| `Tone Map` | HDR tone mapping |

### Blur/Filter
| Operator | Use |
|----------|-----|
| `Blur` | Gaussian blur |
| `Luma Blur` | Luminance-based blur |
| `Anti Alias` | Smooth edges |
| `Edge` | Edge detection |
| `Emboss` | Emboss effect |
| `Convolve` | Custom convolution |
| `Slope` | Gradient/slope |

### Composite/Combine
| Operator | Use |
|----------|-----|
| `Composite` | Layer multiple images |
| `Over` | A over B |
| `Under` | A under B |
| `Add` | Additive blend |
| `Multiply` | Multiply blend |
| `Subtract` | Subtract blend |
| `Difference` | Difference blend |
| `Inside` | Use B as matte for A |
| `Outside` | Inverse matte |
| `Switch` | Switch between inputs |
| `Cross` | Crossfade between inputs |

### Keying/Matte
| Operator | Use |
|----------|-----|
| `Chroma Key` | Green/blue screen |
| `RGB Key` | RGB-based keying |
| `Matte` | Matte manipulation |
| `Luma Level` | Luma-based matte |

### Transform/Distort
| Operator | Use |
|----------|-----|
| `Transform` | Scale, rotate, translate |
| `Flip` | Mirror image |
| `Crop` | Crop region |
| `Fit` | Fit to resolution |
| `Tile` | Tile/repeat |
| `Corner Pin` | 4-corner transform |
| `Displace` | Displacement map |
| `Lens Distort` | Lens distortion |
| `Mirror` | Mirror effects |
| `Remap` | UV remapping |

### Resolution/Format
| Operator | Use |
|----------|-----|
| `Resolution` | Change resolution |
| `Reorder` | Change pixel format |
| `Cache` | Cache frames |
| `Cache Select` | Select from cache |

### Analysis
| Operator | Use |
|----------|-----|
| `Analyze` | Image statistics |
| `Blob Track` | Blob detection |
| `Optical Flow` | Motion vectors |
| `Depth` | Depth processing |

### 3D/Render
| Operator | Use |
|----------|-----|
| `Render` | Render 3D scene |
| `Render Simple` | Simple 3D render |
| `Render Pass` | Multi-pass render |
| `Render Select` | Select render output |
| `SSAO` | Screen space AO |
| `Normal Map` | Generate normal maps |
| `Cube Map` | Cubemap render |
| `Point File In` | Point cloud render |
| `Projection` | Projection mapping |

### GLSL/Custom
| Operator | Use |
|----------|-----|
| `GLSL` | Custom GLSL shader |
| `GLSL Multi` | Multi-pass GLSL |
| `CPlusPlus` | Custom C++ TOP |

### Output
| Operator | Use |
|----------|-----|
| `Null` | Clean output point |
| `Out` | Output to parent |
| `Movie File Out` | Save to file |
| `Video Device Out` | Output to device |
| `NDI Out` | NDI output |
| `Syphon Spout Out` | Syphon/Spout out |
| `Touch Out` | TouchDesigner remote |
| `Direct Display Out` | Direct to display |

### Special
| Operator | Use |
|----------|-----|
| `Feedback` | Feedback loop |
| `Time Machine` | Time delay/offset |
| `Select` | Reference other TOP |
| `CHOP to` | CHOP data to image |
| `POP to` | Point cloud to image |
| `OP Viewer` | View any operator |
| `NVIDIA Background` | AI background removal |
| `NVIDIA Denoise` | AI denoising |
| `NVIDIA Upscaler` | AI upscaling |
| `Substance` | Substance materials |

---

## CHOPs (Channel Operators) - 172 Total

### Audio
| Operator | Use |
|----------|-----|
| `Audio Device In` | Audio input |
| `Audio Device Out` | Audio output |
| `Audio File In` | Load audio file |
| `Audio File Out` | Save audio file |
| `Audio Spectrum` | FFT analysis |
| `Audio Oscillator` | Generate audio |
| `Audio Filter` | EQ/filter |
| `Audio Dynamics` | Compressor/limiter |
| `Audio Band EQ` | Band EQ |
| `Audio Para EQ` | Parametric EQ |
| `Audio Render` | Render audio from timeline |
| `Audio VST` | VST plugins |
| `Audio Play` | Play audio |

### MIDI/OSC/DMX
| Operator | Use |
|----------|-----|
| `MIDI In` | MIDI input |
| `MIDI Out` | MIDI output |
| `MIDI In Map` | MIDI mapping |
| `OSC In` | OSC input |
| `OSC Out` | OSC output |
| `DMX In` | DMX input |
| `DMX Out` | DMX output |

### Input Devices
| Operator | Use |
|----------|-----|
| `Keyboard In` | Keyboard input |
| `Mouse In` | Mouse input |
| `Joystick` | Joystick/gamepad |
| `Tablet` | Drawing tablet |
| `Leap Motion` | Leap Motion |
| `Kinect` | Kinect |
| `Kinect Azure` | Azure Kinect |
| `RealSense` | Intel RealSense |
| `ZED` | ZED camera |

### Generators
| Operator | Use |
|----------|-----|
| `Constant` | Fixed values |
| `Pattern` | Patterns (ramp, etc) |
| `Noise` | Random/organic values |
| `LFO` | Oscillators |
| `Wave` | Waveforms |
| `Timer` | Timer/stopwatch |
| `Count` | Counter |
| `Clock` | Clock/time |
| `Beat` | Beat/tempo |

### Math/Logic
| Operator | Use |
|----------|-----|
| `Math` | Arithmetic operations |
| `Expression` | Custom expressions |
| `Logic` | Boolean logic |
| `Limit` | Clamp values |
| `Filter` | Smooth/filter |
| `Lag` | Lag/ease values |
| `Slope` | Derivative/slope |
| `Speed` | Velocity from position |
| `Trigger` | Trigger pulses |
| `Envelope` | ADSR envelope |
| `S Curve` | S-curve interpolation |

### Channel Operations
| Operator | Use |
|----------|-----|
| `Select` | Pick channels |
| `Merge` | Combine CHOPs |
| `Rename` | Rename channels |
| `Shuffle` | Reorder channels |
| `Replace` | Replace channels |
| `Delete` | Remove channels |
| `Copy` | Copy channels |
| `Trim` | Trim time range |
| `Extend` | Extend/loop |
| `Resample` | Change sample rate |
| `Shift` | Time shift |
| `Stretch` | Time stretch |
| `Delay` | Time delay |
| `Hold` | Sample and hold |
| `Lookup` | Value lookup |

### Animation
| Operator | Use |
|----------|-----|
| `Keyframe` | Keyframe animation |
| `Interpolate` | Interpolate values |
| `Blend` | Blend channels |
| `Spring` | Spring physics |
| `Fan` | Fan out values |
| `Cycle` | Cycle/loop |

### Data
| Operator | Use |
|----------|-----|
| `DAT to` | DAT to CHOP |
| `SOP to` | SOP to CHOP |
| `TOP to` | TOP to CHOP |
| `POP to` | POP to CHOP |
| `Parameter` | Get parameters |
| `Info` | Get operator info |
| `Object` | Object transforms |

### Network/Protocol
| Operator | Use |
|----------|-----|
| `Serial` | Serial port |
| `Pipe In` | Named pipe input |
| `Pipe Out` | Named pipe output |
| `Shared Mem In` | Shared memory in |
| `Shared Mem Out` | Shared memory out |
| `Touch In` | TD remote input |
| `Touch Out` | TD remote output |

### Tracking
| Operator | Use |
|----------|-----|
| `Face Track` | Face tracking |
| `Body Track` | Body tracking |
| `Blob Track` | Blob tracking |
| `OptiTrack In` | OptiTrack |

### Utility
| Operator | Use |
|----------|-----|
| `Null` | Clean output point |
| `Switch` | Switch inputs |
| `Feedback` | Feedback loop |
| `Analyze` | Analyze channels |
| `Record` | Record channels |
| `Trail` | Show channel history |
| `Script` | Python script |

---

## SOPs (Surface Operators) - 115 Total

### Primitives (Generators)
| Operator | Use |
|----------|-----|
| `Box` | Cube |
| `Sphere` | Sphere |
| `Torus` | Donut shape |
| `Tube` | Cylinder/tube |
| `Grid` | Flat grid |
| `Circle` | 2D circle |
| `Rectangle` | 2D rectangle |
| `Line` | Line |
| `Superquad` | Superquadric |
| `Metaball` | Metaballs |
| `LSystem` | L-system plants |

### File/Import
| Operator | Use |
|----------|-----|
| `File In` | Load geometry |
| `Alembic` | Alembic files |
| `Font` | 3D text |
| `Text` | Text geometry |
| `Trace` | Image to geometry |

### Transform
| Operator | Use |
|----------|-----|
| `Transform` | Move, rotate, scale |
| `Lattice` | Lattice deform |
| `Twist` | Twist deformation |
| `Bend` | (via Transform) |
| `Magnet` | Point attraction |
| `Creep` | Creep along surface |

### Deformation
| Operator | Use |
|----------|-----|
| `Noise` | Noise displacement |
| `Point` | Edit points |
| `Spring` | Spring physics |
| `Deform` | General deform |
| `Blend` | Blend shapes |

### Modeling
| Operator | Use |
|----------|-----|
| `Extrude` | Extrude faces |
| `Sweep` | Sweep along path |
| `Revolve` | Revolve profile |
| `Loft` | (Polyloft) |
| `Bridge` | Bridge edges |
| `Fillet` | Fillet edges |
| `Boolean` | Boolean operations |
| `Cap` | Cap holes |
| `Hole` | Create holes |
| `Divide` | Subdivide |
| `Subdivide` | Smooth subdivision |
| `Facet` | Facet normals |

### Copy/Instance
| Operator | Use |
|----------|-----|
| `Copy` | Copy geometry |
| `Sprinkle` | Scatter points |
| `Particle` | Legacy particles |
| `Sprite` | Sprites |

### Combine
| Operator | Use |
|----------|-----|
| `Merge` | Combine SOPs |
| `Switch` | Switch inputs |
| `Object Merge` | Reference other SOPs |
| `Join` | Join curves |

### Topology
| Operator | Use |
|----------|-----|
| `Convert` | Convert geo type |
| `Polyreduce` | Reduce polygons |
| `Resample` | Resample curves |
| `Delete` | Delete elements |
| `Group` | Group points/prims |
| `Sort` | Sort points |

### Data
| Operator | Use |
|----------|-----|
| `CHOP to` | CHOP to SOP |
| `DAT to` | DAT to SOP |
| `POP to` | POP to SOP |
| `Attribute Create` | Create attributes |
| `Attribute` | Modify attributes |

### Utility
| Operator | Use |
|----------|-----|
| `Null` | Clean output |
| `Select` | Reference other SOP |
| `Script` | Python script |
| `Trail` | Motion trail |
| `Ray` | Ray cast |
| `Project` | Project to surface |

---

## POPs (Point Operators) - 100 Total (GPU-Based)

### Input/Generate
| Operator | Use |
|----------|-----|
| `Point Generator` | Create points |
| `Grid` | Grid of points |
| `Sphere` | Sphere of points |
| `Box` | Box of points |
| `Circle` | Circle of points |
| `Line` | Line of points |
| `Rectangle` | Rectangle points |
| `Torus` | Torus points |
| `Tube` | Tube points |
| `Pattern` | Point patterns |
| `SOP to` | SOP to points |
| `CHOP to` | CHOP to points |
| `DAT to` | DAT to points |
| `TOP to` | TOP to points |
| `File In` | Load point data |
| `Point File In` | Point cloud files |
| `Alembic In` | Alembic points |
| `ZED` | ZED point cloud |
| `OAK Select` | OAK-D points |

### Forces/Motion
| Operator | Use |
|----------|-----|
| `Force Radial` | Radial force |
| `Noise` | Noise motion |
| `Phaser` | Phase motion |
| `Particle` | Particle simulation |
| `Spring` | Spring physics |

### Modify Points
| Operator | Use |
|----------|-----|
| `Transform` | Transform points |
| `Math` | Math on attributes |
| `Math Combine` | Combine attributes |
| `Math Mix` | Mix attributes |
| `Attribute` | Modify attributes |
| `Attribute Combine` | Combine attrs |
| `Attribute Convert` | Convert attrs |
| `Sort` | Sort points |
| `Delete` | Delete points |
| `Limit` | Limit bounds |
| `Quantize` | Quantize positions |
| `Random` | Randomize |
| `ReRange` | Remap ranges |
| `Trig` | Trigonometry |

### Lines/Curves
| Operator | Use |
|----------|-----|
| `Line` | Create lines |
| `Line Break` | Break lines |
| `Line Divide` | Divide lines |
| `Line Resample` | Resample lines |
| `Line Smooth` | Smooth lines |
| `Line Thick` | Thicken lines |
| `Line Metrics` | Line measurements |
| `Curve` | Curve operations |

### Analysis
| Operator | Use |
|----------|-----|
| `Analyze` | Analyze points |
| `Neighbor` | Find neighbors |
| `Proximity` | Proximity detection |
| `Connectivity` | Find connected |
| `Histogram` | Value histogram |
| `Ray` | Ray casting |

### Geometry Generation
| Operator | Use |
|----------|-----|
| `Extrude` | Extrude points |
| `Polygonize` | Points to polygons |
| `Revolve` | Revolve points |
| `Skin` | Skin points |
| `Subdivide` | Subdivide |
| `Facet` | Facet normals |
| `Normal` | Calculate normals |
| `Normalize` | Normalize values |

### Lookup/Map
| Operator | Use |
|----------|-----|
| `Lookup Attribute` | Lookup by attr |
| `Lookup Channel` | Lookup CHOP |
| `Lookup Texture` | Lookup TOP |
| `Texture Map` | Map texture |
| `Projection` | Project texture |

### GLSL/Custom
| Operator | Use |
|----------|-----|
| `GLSL` | Custom GLSL |
| `GLSL Advanced` | Advanced GLSL |
| `GLSL Copy` | GLSL copy |
| `GLSL Create` | GLSL generator |
| `GLSL Select` | GLSL select |

### Utility
| Operator | Use |
|----------|-----|
| `Null` | Clean output |
| `Select` | Reference other POP |
| `Switch` | Switch inputs |
| `Merge` | Combine POPs |
| `Copy` | Copy points |
| `Cache` | Cache frames |
| `Cache Blend` | Blend cached |
| `Cache Select` | Select from cache |
| `Feedback` | Feedback loop |
| `Trail` | Motion trail |
| `In` | Input from parent |
| `Out` | Output to parent |
| `File Out` | Save point data |

---

## DATs (Data Operators) - 76 Total

### Tables/Text
| Operator | Use |
|----------|-----|
| `Table` | Spreadsheet data |
| `Text` | Text content |
| `JSON` | JSON data |
| `XML` | XML data |
| `Evaluate` | Evaluate expressions |
| `Convert` | Convert format |
| `Substitute` | Find/replace |
| `Merge` | Merge DATs |
| `Sort` | Sort data |
| `Transpose` | Transpose table |
| `Select` | Reference other DAT |

### File
| Operator | Use |
|----------|-----|
| `File In` | Load file |
| `File Out` | Save file |
| `Folder` | List folder |
| `Media File Info` | Media metadata |

### Script/Execute
| Operator | Use |
|----------|-----|
| `Script` | Python script |
| `Execute` | Execute on events |
| `CHOP Execute` | Execute on CHOP |
| `DAT Execute` | Execute on DAT |
| `OP Execute` | Execute on OP |
| `Panel Execute` | Execute on panel |
| `Parameter Execute` | Execute on param |
| `ParGroup Execute` | Execute on pargroup |

### Network
| Operator | Use |
|----------|-----|
| `TCP/IP` | TCP socket |
| `UDP In` | UDP receive |
| `UDP Out` | UDP send |
| `OSC In` | OSC messages |
| `OSC Out` | OSC send |
| `Serial` | Serial port |
| `Web Client` | HTTP client |
| `Web Server` | HTTP server |
| `WebSocket` | WebSocket |
| `WebRTC` | WebRTC |
| `MQTT Client` | MQTT |
| `SocketIO` | Socket.IO |

### MIDI
| Operator | Use |
|----------|-----|
| `MIDI In` | MIDI events |
| `MIDI Event` | MIDI messages |

### Device Info
| Operator | Use |
|----------|-----|
| `Audio Devices` | List audio devices |
| `Video Devices` | List video devices |
| `Serial Devices` | List serial ports |
| `Monitors` | List monitors |

### Data Conversion
| Operator | Use |
|----------|-----|
| `CHOP to` | CHOP to DAT |
| `SOP to` | SOP to DAT |
| `POP to` | POP to DAT |

### Utility
| Operator | Use |
|----------|-----|
| `Null` | Clean output |
| `Switch` | Switch inputs |
| `Info` | Operator info |
| `Error` | Error log |
| `Parameter` | Get parameters |
| `OP Find` | Find operators |
| `Examine` | Examine data |
| `Indices` | Index data |
| `FIFO` | FIFO buffer |
| `Lookup` | Value lookup |
| `Reorder` | Reorder columns |
| `Insert` | Insert rows |

---

## COMPs (Components) - 44 Total

### Containers
| Operator | Use |
|----------|-----|
| `Container` | UI container |
| `Base` | Reusable module |
| `Engine` | Engine COMP |

### 3D Objects
| Operator | Use |
|----------|-----|
| `Geometry` | 3D geometry |
| `Camera` | Camera |
| `Light` | Point/spot light |
| `Ambient Light` | Ambient light |
| `Environment Light` | Environment/IBL |
| `Null` | Empty transform |
| `Bone` | Skeleton bone |
| `FBX` | FBX import |
| `USD` | USD import |
| `Geo Text` | 3D text |

### Camera
| Operator | Use |
|----------|-----|
| `Camera Blend` | Blend cameras |

### Physics
| Operator | Use |
|----------|-----|
| `Bullet Solver` | Bullet physics |
| `NVIDIA Flex Solver` | Flex physics |
| `NVIDIA Flow Emitter` | Flow simulation |
| `Force` | Force field |
| `Impulse Force` | Impulse force |

### Animation
| Operator | Use |
|----------|-----|
| `Animation` | Animation data |
| `Constraint` | Constraints |
| `Blend` | Blend transforms |

### UI Widgets
| Operator | Use |
|----------|-----|
| `Button` | Button |
| `Slider` | Slider |
| `Field` | Input field |
| `List` | List view |
| `Table` | Table view |
| `Text` | Text display |
| `OP Viewer` | Operator viewer |
| `Parameter` | Parameter panel |

### System
| Operator | Use |
|----------|-----|
| `Time` | Time control |
| `Window` | Window output |
| `Widget` | Custom widget |
| `Replicator` | Clone operators |
| `Select` | Reference COMP |
| `Handle` | Handle UI |
| `Actor` | Actor system |
| `Annotate` | Annotations |
