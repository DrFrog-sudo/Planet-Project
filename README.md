# Planet-Project

## Overview

This repository contains a solar system simulation project split into two parts:

- `Partie C/`: A C program that computes orbital trajectories and exports results to JSON.
- `Partie WEB/`: A browser-based visualization using p5.js that displays solar system movement from generated JSON data.

The simulation includes the Sun, Earth, Venus, and Mars and supports:

- Euler integration
- Runge-Kutta 4 (RK4)
- Asymmetric Euler integration
- Single-body and multi-body interactions

## Project structure

- `Partie C/`
  - `main.c`: Program entry point, user menu, and JSON export logic.
  - `fonction.c` / `fonction.h`: Core physics, vector math, integration methods, and JSON serialization.
  - `euler.c`: Euler method implementation.
  - `rungekuta.c`: RK4 integration implementation.
  - `euler_asym.c`: Asymmetric Euler method implementation.
  - `makefile`: Build rules for compiling the simulation program.
  - `euler_sys.json`, `asym_sys.json`, `rk4_sys.json`: Example JSON data files for system trajectories.

- `Partie WEB/`
  - `page.html`: Web page that loads and renders simulation data.
  - `main.js`: Visualization logic, controls, and rendering with p5.js.
  - `helpers.js`: Utility functions for drawing and formatting.
  - `style.css`: Styling for the visualization page.
  - `variables.js`: Global variables and initial configuration.
  - `systeme_solaire.json`: Example data file loaded by the web visualization.

## How to build and run the C simulation

1. Open a terminal in `Partie C/`.
2. Build the program with:

```bash
make
```

3. Run the compiled executable:

```bash
./programme.exe
```

4. Follow the menu prompts to select:

- integration method: Euler, RK4, Euler Asymétrique, or all three
- target: Earth only or the full system of planets

5. Output files are generated in the `Partie C/` folder, for example:

- `terre.json`
- `systeme_solaire.json`
- `euler_sys.json`
- `rk4_sys.json`
- `asym_sys.json`

## How to view the web visualization

1. Copy or move the generated `systeme_solaire.json` file into `Partie WEB/`.
2. Open `Partie WEB/page.html` in a modern browser.

## Simulation details

- Time step: `3600` seconds (1 hour)
- Total simulation length: `15` years
- Planets simulated: Sun, Earth, Mars, Venus
- Output format: JSON arrays of position, velocity, time, and energy values

## Notes

- The C simulation exports trajectory data for both single-planet and multi-body configurations.
- The web visualization reads JSON data and renders the solar system with orbit trails, time display, and energy graphs.
- The project is designed for educational use and numerical comparison of integration techniques.

## Requirements

- `gcc` (GNU Compiler Collection)
- `make`
- A browser with JavaScript support
- Optional: Python for a local HTTP server when opening the web page