---
name: GEN ERA screenshot rendering
description: R3F temple scene appears black in screenshot tool; not a bug
---

The GEN ERA temple uses a very dark scene (`ambientLight color="#0d0520"`) with heavy WebGL/shader initialization. The screenshot tool opens a fresh headless browser each time — R3F needs several seconds to compile shaders and render first frames. Screenshots consistently appear black/particle-only even when the app works perfectly.

**Why:** Heavy 3D scene + dark ambient + fresh WebGL context per screenshot.

**How to apply:** Trust browser console logs (no errors = working). Don't diagnose a blank screenshot as a rendering bug without first checking the console.
