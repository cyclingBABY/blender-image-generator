import * as THREE from 'three';
import { mergeBufferGeometries } from './meshGenerators';

/**
 * HIGH-FIDELITY REAL 3D STAGE LIGHTING MODELS
 * Authentic procedural 3D models for moving heads, LED PARs, and concert fixtures:
 * - Octagonal/chamfered cast base with rubber feet, powerCON, DMX 5-pin, LCD menu
 * - Dual-arm cast aluminum U-yoke with tilt lock lever, degree gradations, and cooling fins
 * - Aerodynamic moving head housing with ventilation louvers, rear transport handles
 * - Stepped optical bezel with hex socket bolts and convex optical lens
 * - Signature wash multi-lens honeycomb matrix face (19 individual micro-lenses)
 * - Volumetric light beam cone and articulated Pan/Tilt hierarchy
 */

// Helper to create a positioned/rotated box
function box(w: number, h: number, d: number, pos: [number, number, number] = [0, 0, 0], rot: [number, number, number] = [0, 0, 0]): THREE.BufferGeometry {
  const g = new THREE.BoxGeometry(w, h, d);
  if (rot[0] || rot[1] || rot[2]) {
    g.rotateX(rot[0]);
    g.rotateY(rot[1]);
    g.rotateZ(rot[2]);
  }
  g.translate(pos[0], pos[1], pos[2]);
  return g;
}

// Helper to create a positioned/rotated cylinder
function cyl(rTop: number, rBot: number, height: number, segs = 24, pos: [number, number, number] = [0, 0, 0], rot: [number, number, number] = [0, 0, 0]): THREE.BufferGeometry {
  const g = new THREE.CylinderGeometry(rTop, rBot, height, segs);
  if (rot[0] || rot[1] || rot[2]) {
    g.rotateX(rot[0]);
    g.rotateY(rot[1]);
    g.rotateZ(rot[2]);
  }
  g.translate(pos[0], pos[1], pos[2]);
  return g;
}

// Helper to create a positioned/rotated sphere or hemisphere
function sphere(radius: number, widthSegs = 24, heightSegs = 16, phiLength = Math.PI * 2, thetaLength = Math.PI, pos: [number, number, number] = [0, 0, 0], rot: [number, number, number] = [0, 0, 0]): THREE.BufferGeometry {
  const g = new THREE.SphereGeometry(radius, widthSegs, heightSegs, 0, phiLength, 0, thetaLength);
  if (rot[0] || rot[1] || rot[2]) {
    g.rotateX(rot[0]);
    g.rotateY(rot[1]);
    g.rotateZ(rot[2]);
  }
  g.translate(pos[0], pos[1], pos[2]);
  return g;
}

// Helper to create a torus (e.g. handle, safety eyelet, lock ring)
function torus(radius: number, tube: number, radialSegs = 12, tubularSegs = 24, pos: [number, number, number] = [0, 0, 0], rot: [number, number, number] = [0, 0, 0]): THREE.BufferGeometry {
  const g = new THREE.TorusGeometry(radius, tube, radialSegs, tubularSegs);
  if (rot[0] || rot[1] || rot[2]) {
    g.rotateX(rot[0]);
    g.rotateY(rot[1]);
    g.rotateZ(rot[2]);
  }
  g.translate(pos[0], pos[1], pos[2]);
  return g;
}

/**
 * 1. REALISTIC CAST BASE CHASSIS
 * Heavy-duty base common to professional tour moving heads
 */
export function createRealisticMovingHeadBase(): THREE.BufferGeometry[] {
  const parts: THREE.BufferGeometry[] = [];

  // Main chamfered octagonal base chassis (0.40m wide, 0.12m high, 0.40m deep)
  parts.push(cyl(0.24, 0.26, 0.12, 8, [0, 0.07, 0], [0, Math.PI / 8, 0]));

  // Base top plate collar with bevel
  parts.push(cyl(0.23, 0.24, 0.02, 24, [0, 0.13, 0]));

  // Base bottom plate
  parts.push(cyl(0.25, 0.25, 0.015, 8, [0, 0.01, 0], [0, Math.PI / 8, 0]));

  // 4 Anti-vibration rubber base feet
  const footPositions: [number, number, number][] = [
    [-0.14, 0.005, -0.14],
    [0.14, 0.005, -0.14],
    [-0.14, 0.005, 0.14],
    [0.14, 0.005, 0.14],
  ];
  for (const p of footPositions) {
    parts.push(cyl(0.022, 0.026, 0.015, 12, p));
  }

  // Dual side recessed transport carry handles
  parts.push(box(0.03, 0.05, 0.14, [-0.21, 0.07, 0]));
  parts.push(box(0.03, 0.05, 0.14, [0.21, 0.07, 0]));
  // Inner handle grip bars
  parts.push(cyl(0.008, 0.008, 0.12, 12, [-0.20, 0.07, 0], [Math.PI / 2, 0, 0]));
  parts.push(cyl(0.008, 0.008, 0.12, 12, [0.20, 0.07, 0], [Math.PI / 2, 0, 0]));

  // Front Control Panel: Inset LCD graphic screen with bezel
  parts.push(box(0.14, 0.07, 0.008, [0, 0.07, 0.205]));
  parts.push(box(0.11, 0.05, 0.012, [0, 0.07, 0.208])); // LCD display glass
  // 4 tactile navigation buttons (Menu, Up, Down, Enter)
  for (let b = 0; b < 4; b++) {
    const bx = -0.045 + b * 0.03;
    parts.push(cyl(0.005, 0.005, 0.008, 8, [bx, 0.032, 0.208], [Math.PI / 2, 0, 0]));
  }
  // Indicator LEDs (Power, DMX, Error)
  parts.push(cyl(0.003, 0.003, 0.006, 8, [-0.05, 0.11, 0.208], [Math.PI / 2, 0, 0]));
  parts.push(cyl(0.003, 0.003, 0.006, 8, [0, 0.11, 0.208], [Math.PI / 2, 0, 0]));
  parts.push(cyl(0.003, 0.003, 0.006, 8, [0.05, 0.11, 0.208], [Math.PI / 2, 0, 0]));

  // Rear I/O Panel: DMX & powerCON connections
  parts.push(box(0.18, 0.07, 0.008, [0, 0.07, -0.205]));
  // 5-Pin XLR DMX In & Out ports
  parts.push(cyl(0.012, 0.012, 0.012, 12, [-0.05, 0.07, -0.208], [Math.PI / 2, 0, 0]));
  parts.push(cyl(0.012, 0.012, 0.012, 12, [0.05, 0.07, -0.208], [Math.PI / 2, 0, 0]));
  // powerCON TRUE1 In & Thru ports
  parts.push(cyl(0.014, 0.014, 0.012, 12, [-0.05, 0.04, -0.208], [Math.PI / 2, 0, 0]));
  parts.push(cyl(0.014, 0.014, 0.012, 12, [0.05, 0.04, -0.208], [Math.PI / 2, 0, 0]));
  // RJ45 etherCON / ArtNet port
  parts.push(box(0.02, 0.02, 0.01, [0, 0.05, -0.208]));

  // Base Bottom: Dual Omega Bracket Clamps & Forged Safety Eyelet
  parts.push(box(0.07, 0.03, 0.14, [-0.09, -0.01, 0]));
  parts.push(box(0.07, 0.03, 0.14, [0.09, -0.01, 0]));
  // 1/4-turn quick lock cam pins
  parts.push(cyl(0.008, 0.008, 0.02, 12, [-0.09, -0.025, -0.04]));
  parts.push(cyl(0.008, 0.008, 0.02, 12, [-0.09, -0.025, 0.04]));
  parts.push(cyl(0.008, 0.008, 0.02, 12, [0.09, -0.025, -0.04]));
  parts.push(cyl(0.008, 0.008, 0.02, 12, [0.09, -0.025, 0.04]));
  // Safety wire D-ring eyelet
  parts.push(torus(0.014, 0.004, 8, 16, [0, -0.015, -0.12], [Math.PI / 2, 0, 0]));

  return parts;
}

/**
 * 2. REALISTIC DUAL-ARM CAST ALUMINUM U-YOKE (Pan Kinematics)
 */
export function createRealisticMovingHeadYoke(): THREE.BufferGeometry[] {
  const parts: THREE.BufferGeometry[] = [];

  // Pan turntable bearing disc
  parts.push(cyl(0.18, 0.19, 0.03, 32, [0, 0.15, 0]));
  parts.push(cyl(0.16, 0.16, 0.015, 32, [0, 0.165, 0])); // bearing collar

  // Horizontal central yoke saddle
  parts.push(box(0.42, 0.05, 0.14, [0, 0.18, 0]));

  // Left Yoke Arm (Curved, with cooling fins and tilt lock lever)
  parts.push(box(0.065, 0.32, 0.14, [-0.18, 0.34, 0]));
  // Outer arm reinforcement rib
  parts.push(box(0.02, 0.28, 0.11, [-0.21, 0.34, 0]));
  // Tilt lock handle mechanism on left arm
  parts.push(cyl(0.024, 0.024, 0.02, 16, [-0.22, 0.46, 0], [0, 0, Math.PI / 2]));
  parts.push(box(0.015, 0.08, 0.025, [-0.23, 0.46, 0.03], [Math.PI / 6, 0, 0])); // knurled lever

  // Right Yoke Arm (Curved, with tilt degree indicator ring)
  parts.push(box(0.065, 0.32, 0.14, [0.18, 0.34, 0]));
  parts.push(box(0.02, 0.28, 0.11, [0.21, 0.34, 0]));
  // Tilt pivot bearing hub on right arm
  parts.push(cyl(0.03, 0.03, 0.02, 24, [0.215, 0.46, 0], [0, 0, Math.PI / 2]));
  parts.push(torus(0.026, 0.003, 8, 20, [0.225, 0.46, 0], [0, Math.PI / 2, 0])); // calibration bezel

  // Inner pivot hubs where head mounts
  parts.push(cyl(0.025, 0.025, 0.02, 16, [-0.14, 0.46, 0], [0, 0, Math.PI / 2]));
  parts.push(cyl(0.025, 0.025, 0.02, 16, [0.14, 0.46, 0], [0, 0, Math.PI / 2]));

  // Yoke internal cable pass-through conduits
  parts.push(cyl(0.01, 0.01, 0.26, 8, [-0.165, 0.33, 0.05]));
  parts.push(cyl(0.01, 0.01, 0.26, 8, [0.165, 0.33, 0.05]));

  return parts;
}

/**
 * 3. BEAM MOVING HEAD 3D GEOMETRY
 * High-intensity narrow beam fixture (Chauvet Rogue 1L / Clay Paky Sharpy style)
 */
export function createRealBeamMovingHeadGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];

  // 1. Base assembly
  parts.push(...createRealisticMovingHeadBase());

  // 2. Yoke assembly
  parts.push(...createRealisticMovingHeadYoke());

  // 3. Head casing (Aerodynamic housing centered at Y=0.46)
  // Main rear bulb housing (lamp chamber)
  parts.push(cyl(0.13, 0.14, 0.20, 24, [0, 0.38, 0]));
  // Rear dome cover with molded cooling slots
  parts.push(sphere(0.13, 20, 12, Math.PI * 2, Math.PI / 2, [0, 0.28, 0], [Math.PI, 0, 0]));

  // Lateral cooling louvers / ventilation intake slits (4 on each side)
  for (let s = -2; s <= 2; s++) {
    const yOff = 0.38 + s * 0.035;
    parts.push(box(0.02, 0.008, 0.12, [-0.135, yOff, 0]));
    parts.push(box(0.02, 0.008, 0.12, [0.135, yOff, 0]));
  }

  // Dual rear positioning handles
  parts.push(torus(0.04, 0.007, 8, 16, [0, 0.26, -0.10], [Math.PI / 4, 0, 0]));
  parts.push(torus(0.04, 0.007, 8, 16, [0, 0.26, 0.10], [-Math.PI / 4, 0, 0]));

  // Mid optical barrel section
  parts.push(cyl(0.125, 0.13, 0.14, 24, [0, 0.52, 0]));

  // Front tapered optical snoot (characteristic deep beam cone)
  parts.push(cyl(0.105, 0.125, 0.10, 24, [0, 0.62, 0]));

  // Heavy-duty front lens retaining bezel ring
  parts.push(cyl(0.115, 0.115, 0.03, 32, [0, 0.68, 0]));
  parts.push(cyl(0.10, 0.105, 0.015, 32, [0, 0.695, 0]));

  // 8 industrial hex socket cap screws around front lens perimeter
  for (let a = 0; a < 8; a++) {
    const angle = (a * Math.PI) / 4;
    const sx = Math.cos(angle) * 0.108;
    const sz = Math.sin(angle) * 0.108;
    parts.push(cyl(0.004, 0.004, 0.006, 6, [sx, 0.70, sz]));
  }

  // Massive 160mm Convex Optical Front Lens Element (thick curved glass element)
  parts.push(sphere(0.10, 32, 16, Math.PI * 2, 0.7, [0, 0.64, 0]));

  // Internal lamp reflector / burner core (visible through front lens)
  parts.push(cyl(0.04, 0.01, 0.06, 16, [0, 0.63, 0]));
  parts.push(sphere(0.015, 12, 12, Math.PI * 2, Math.PI, [0, 0.61, 0]));

  return mergeBufferGeometries(parts);
}

/**
 * 4. SPOT / PROFILE MOVING HEAD 3D GEOMETRY
 * Martin MAC Viper / Robe Spot style with dual stepped zoom barrels & gobo section
 */
export function createRealSpotMovingHeadGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];

  parts.push(...createRealisticMovingHeadBase());
  parts.push(...createRealisticMovingHeadYoke());

  // Head housing (Slightly larger optical train for gobos & zoom lenses)
  parts.push(cyl(0.15, 0.16, 0.22, 24, [0, 0.38, 0]));
  parts.push(sphere(0.15, 20, 12, Math.PI * 2, Math.PI / 2, [0, 0.27, 0], [Math.PI, 0, 0]));

  // Ventilation grilles
  for (let s = -3; s <= 3; s++) {
    const yOff = 0.38 + s * 0.03;
    parts.push(box(0.02, 0.008, 0.14, [-0.155, yOff, 0]));
    parts.push(box(0.02, 0.008, 0.14, [0.155, yOff, 0]));
  }

  // Stepped optical zoom chassis
  parts.push(cyl(0.145, 0.15, 0.12, 24, [0, 0.52, 0]));

  // Dual ribbed rubber focus & zoom calibration rings
  parts.push(cyl(0.152, 0.152, 0.03, 32, [0, 0.50, 0]));
  parts.push(cyl(0.152, 0.152, 0.03, 32, [0, 0.55, 0]));

  // Front projection lens barrel
  parts.push(cyl(0.13, 0.14, 0.12, 24, [0, 0.63, 0]));

  // Front bezel and lens hood
  parts.push(cyl(0.14, 0.14, 0.025, 32, [0, 0.70, 0]));
  parts.push(torus(0.135, 0.006, 8, 24, [0, 0.71, 0], [Math.PI / 2, 0, 0]));

  // Wide-aperture projection front lens
  parts.push(sphere(0.12, 32, 16, Math.PI * 2, 0.75, [0, 0.65, 0]));

  // 4 framing shutter guide slots on sides
  parts.push(box(0.015, 0.006, 0.12, [-0.145, 0.44, 0]));
  parts.push(box(0.015, 0.006, 0.12, [0.145, 0.44, 0]));

  return mergeBufferGeometries(parts);
}

/**
 * 5. WASH MOVING HEAD 3D GEOMETRY
 * Martin MAC Aura / Clay Paky B-EYE style with 19-cell LED honeycomb face
 */
export function createRealWashMovingHeadGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];

  parts.push(...createRealisticMovingHeadBase());
  parts.push(...createRealisticMovingHeadYoke());

  // Compact aerodynamic wash dome housing
  parts.push(cyl(0.16, 0.15, 0.18, 24, [0, 0.38, 0]));
  parts.push(sphere(0.15, 20, 12, Math.PI * 2, Math.PI / 2, [0, 0.29, 0], [Math.PI, 0, 0]));

  // Rear heat sink fin block
  for (let f = -3; f <= 3; f++) {
    parts.push(box(0.006, 0.10, 0.12, [f * 0.03, 0.32, -0.11]));
  }

  // Front lens bezel ring
  parts.push(cyl(0.165, 0.165, 0.04, 32, [0, 0.48, 0]));
  // Frosted outer aura diffusion ring
  parts.push(torus(0.158, 0.008, 12, 32, [0, 0.50, 0], [Math.PI / 2, 0, 0]));

  // Recessed honeycomb faceplate
  parts.push(cyl(0.155, 0.155, 0.01, 32, [0, 0.49, 0]));

  // SIGNATURE 19-CELL MULTI-LENS HONEYCOMB MATRIX
  // 1. Center Lens (1x)
  parts.push(cyl(0.024, 0.026, 0.018, 16, [0, 0.505, 0]));
  parts.push(sphere(0.024, 16, 12, Math.PI * 2, 0.8, [0, 0.50, 0]));

  // 2. Inner Ring: 6 Micro-Lenses at radius R=0.055m (60° apart)
  for (let i = 0; i < 6; i++) {
    const ang = (i * Math.PI) / 3;
    const lx = Math.cos(ang) * 0.055;
    const lz = Math.sin(ang) * 0.055;
    parts.push(cyl(0.023, 0.025, 0.016, 16, [lx, 0.504, lz]));
    parts.push(sphere(0.023, 16, 12, Math.PI * 2, 0.8, [lx, 0.50, lz]));
  }

  // 3. Outer Ring: 12 Micro-Lenses at radius R=0.110m (30° apart)
  for (let j = 0; j < 12; j++) {
    const ang = (j * Math.PI) / 6;
    const lx = Math.cos(ang) * 0.110;
    const lz = Math.sin(ang) * 0.110;
    parts.push(cyl(0.023, 0.025, 0.016, 16, [lx, 0.504, lz]));
    parts.push(sphere(0.023, 16, 12, Math.PI * 2, 0.8, [lx, 0.50, lz]));
  }

  return mergeBufferGeometries(parts);
}

/**
 * 6. HYBRID IP65 OUTDOOR ALL-WEATHER MOVING HEAD
 * Elation Proteus Smarty Hybrid style with rugged armor and sealed housing
 */
export function createRealHybridMovingHeadGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];

  // Heavy duty reinforced base
  parts.push(...createRealisticMovingHeadBase());

  // 4 Heavy duty rubber corner bumpers on base
  const bumperPositions: [number, number, number][] = [
    [-0.18, 0.07, -0.18],
    [0.18, 0.07, -0.18],
    [-0.18, 0.07, 0.18],
    [0.18, 0.07, 0.18],
  ];
  for (const bp of bumperPositions) {
    parts.push(box(0.05, 0.10, 0.05, bp));
  }

  parts.push(...createRealisticMovingHeadYoke());

  // Heavy ribbed IP65 housing
  parts.push(cyl(0.17, 0.18, 0.26, 24, [0, 0.40, 0]));
  // Gasket weather seals
  parts.push(torus(0.175, 0.006, 8, 24, [0, 0.42, 0], [Math.PI / 2, 0, 0]));
  parts.push(torus(0.175, 0.006, 8, 24, [0, 0.48, 0], [Math.PI / 2, 0, 0]));

  // Large multi-stage front optical group
  parts.push(cyl(0.155, 0.165, 0.18, 24, [0, 0.60, 0]));
  parts.push(cyl(0.16, 0.16, 0.035, 32, [0, 0.70, 0])); // Heavy front rim

  // Front protective lens armor ring
  parts.push(torus(0.155, 0.008, 8, 32, [0, 0.72, 0], [Math.PI / 2, 0, 0]));
  // Massive front convex lens
  parts.push(sphere(0.14, 32, 16, Math.PI * 2, 0.7, [0, 0.65, 0]));

  return mergeBufferGeometries(parts);
}

/**
 * 7. REALISTIC LED PAR CAN (PAR64 Floor/Truss Uplight)
 */
export function createRealLedParCanGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];

  // Spun aluminum cylinder body with rear bell curve
  parts.push(cyl(0.12, 0.10, 0.26, 24, [0, 0.22, 0]));
  parts.push(sphere(0.10, 20, 12, Math.PI * 2, Math.PI / 2, [0, 0.09, 0], [Math.PI, 0, 0]));

  // Rolled front retaining bezel with gel frame holder clips
  parts.push(cyl(0.13, 0.13, 0.03, 24, [0, 0.35, 0]));
  parts.push(torus(0.128, 0.006, 8, 24, [0, 0.365, 0], [Math.PI / 2, 0, 0]));
  // 3 Gel frame spring clips
  parts.push(box(0.015, 0.02, 0.01, [0, 0.37, 0.13]));
  parts.push(box(0.015, 0.02, 0.01, [-0.12, 0.37, -0.05]));
  parts.push(box(0.015, 0.02, 0.01, [0.12, 0.37, -0.05]));

  // High-density honeycomb LED lens face
  parts.push(cyl(0.118, 0.118, 0.01, 24, [0, 0.34, 0]));
  for (let r = 0; r < 7; r++) {
    const rx = (r % 3 - 1) * 0.045;
    const rz = (Math.floor(r / 3) - 1) * 0.045;
    parts.push(cyl(0.018, 0.018, 0.015, 12, [rx, 0.35, rz]));
  }

  // Dual scissor yoke brackets (allows sitting on floor or hanging on truss)
  parts.push(box(0.015, 0.32, 0.28, [0, 0.18, 0]));
  parts.push(box(0.015, 0.32, 0.30, [0, 0.18, 0]));
  // Threaded star friction lock knobs
  parts.push(cyl(0.025, 0.025, 0.02, 12, [-0.15, 0.22, 0], [0, 0, Math.PI / 2]));
  parts.push(cyl(0.025, 0.025, 0.02, 12, [0.15, 0.22, 0], [0, 0, Math.PI / 2]));

  // Floor standing stabilizer foot plate
  parts.push(box(0.24, 0.015, 0.18, [0, 0.01, 0]));

  return mergeBufferGeometries(parts);
}

/**
 * 8. REALISTIC 2-LIGHT COB AUDIENCE BLINDER
 */
export function createRealBlinder2LightGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];

  // Main folded steel enclosure
  parts.push(box(0.44, 0.26, 0.14, [0, 0.18, 0]));
  // Rear heat sink fin arrays
  for (let i = -5; i <= 5; i++) {
    parts.push(box(0.005, 0.22, 0.05, [i * 0.035, 0.18, -0.09]));
  }

  // Left & Right Parabolic Reflector Pods
  const pods = [-0.12, 0.12];
  for (const px of pods) {
    // Outer reflector rim
    parts.push(cyl(0.10, 0.10, 0.06, 24, [px, 0.18, 0.09], [Math.PI / 2, 0, 0]));
    // Inner dish
    parts.push(cyl(0.09, 0.04, 0.04, 24, [px, 0.18, 0.10], [Math.PI / 2, 0, 0]));
    // Center 100W COB warm-white LED chip
    parts.push(cyl(0.025, 0.025, 0.008, 16, [px, 0.18, 0.11], [Math.PI / 2, 0, 0]));
    // Protective wire grille
    parts.push(torus(0.09, 0.003, 6, 20, [px, 0.18, 0.12], [0, 0, 0]));
  }

  // Heavy duty hanging bracket with truss clamp
  parts.push(box(0.48, 0.30, 0.03, [0, 0.18, -0.04]));
  parts.push(cyl(0.025, 0.025, 0.03, 12, [-0.25, 0.18, 0], [0, 0, Math.PI / 2]));
  parts.push(cyl(0.025, 0.025, 0.03, 12, [0.25, 0.18, 0], [0, 0, Math.PI / 2]));
  // Top clamp
  parts.push(cyl(0.03, 0.03, 0.05, 12, [0, 0.35, -0.04]));

  return mergeBufferGeometries(parts);
}

/**
 * Creates an articulated, interactive Moving Head THREE.Group
 * with separate Base, Pan Yoke, Tilt Head, and Volumetric Light Beam!
 */
export interface ArticulatedMovingHeadGroup extends THREE.Group {
  yokeGroup: THREE.Group;
  headGroup: THREE.Group;
  beamGroup: THREE.Group;
  lensMesh: THREE.Mesh;
  beamConeMesh: THREE.Mesh;
  beamCoreMesh: THREE.Mesh;
  floorSpotMesh: THREE.Mesh;
  spotLight: THREE.SpotLight;
  setPanAngle: (deg: number) => void;
  setTiltAngle: (deg: number) => void;
  setBeamColor: (hex: string) => void;
  setBeamIntensity: (intensity: number) => void;
  setBeamEnabled: (enabled: boolean) => void;
}

export function createArticulatedMovingHead(type: 'beam' | 'spot' | 'wash' | 'hybrid' = 'beam'): ArticulatedMovingHeadGroup {
  const root = new THREE.Group() as ArticulatedMovingHeadGroup;

  // Materials
  const chassisMaterial = new THREE.MeshStandardMaterial({
    color: '#1a1b1f',
    roughness: 0.45,
    metalness: 0.3,
  });

  const aluminumMaterial = new THREE.MeshStandardMaterial({
    color: '#2b2d35',
    roughness: 0.35,
    metalness: 0.6,
  });

  const displayMaterial = new THREE.MeshBasicMaterial({
    color: '#00f0ff',
  });

  const lensMaterial = new THREE.MeshPhysicalMaterial({
    color: '#00f0ff',
    roughness: 0.1,
    metalness: 0.1,
    transmission: 0.75,
    transparent: true,
    opacity: 0.9,
    emissive: new THREE.Color('#00f0ff'),
    emissiveIntensity: 0.4,
  });

  // 1. BASE GROUP
  const baseGroup = new THREE.Group();
  const baseGeom = mergeBufferGeometries(createRealisticMovingHeadBase());
  const baseMesh = new THREE.Mesh(baseGeom, chassisMaterial);
  baseMesh.castShadow = true;
  baseMesh.receiveShadow = true;
  baseGroup.add(baseMesh);
  root.add(baseGroup);

  // 2. YOKE GROUP (Pan Axis: rotates around Y at [0, 0.16, 0])
  const yokeGroup = new THREE.Group();
  yokeGroup.position.set(0, 0.16, 0);
  const yokeGeom = mergeBufferGeometries(createRealisticMovingHeadYoke());
  // Offset yoke geometry to be local to yokeGroup position
  yokeGeom.translate(0, -0.16, 0);
  const yokeMesh = new THREE.Mesh(yokeGeom, aluminumMaterial);
  yokeMesh.castShadow = true;
  yokeGroup.add(yokeMesh);
  root.add(yokeGroup);
  root.yokeGroup = yokeGroup;

  // 3. HEAD GROUP (Tilt Axis: rotates around X at [0, 0.30, 0] relative to yokeGroup, so world Y=0.46)
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.30, 0);

  // Build head geometry based on type
  let headParts: THREE.BufferGeometry[] = [];
  if (type === 'wash') {
    headParts = [
      cyl(0.16, 0.15, 0.18, 24, [0, -0.08, 0]),
      sphere(0.15, 20, 12, Math.PI * 2, Math.PI / 2, [0, -0.17, 0], [Math.PI, 0, 0]),
      cyl(0.165, 0.165, 0.04, 32, [0, 0.02, 0]),
      torus(0.158, 0.008, 12, 32, [0, 0.04, 0], [Math.PI / 2, 0, 0]),
      cyl(0.155, 0.155, 0.01, 32, [0, 0.03, 0]),
    ];
    // Honeycomb lenses
    headParts.push(cyl(0.024, 0.026, 0.018, 16, [0, 0.045, 0]));
    for (let i = 0; i < 6; i++) {
      const ang = (i * Math.PI) / 3;
      headParts.push(cyl(0.023, 0.025, 0.016, 16, [Math.cos(ang) * 0.055, 0.044, Math.sin(ang) * 0.055]));
    }
  } else if (type === 'spot') {
    headParts = [
      cyl(0.15, 0.16, 0.22, 24, [0, -0.08, 0]),
      sphere(0.15, 20, 12, Math.PI * 2, Math.PI / 2, [0, -0.19, 0], [Math.PI, 0, 0]),
      cyl(0.145, 0.15, 0.12, 24, [0, 0.06, 0]),
      cyl(0.152, 0.152, 0.03, 32, [0, 0.04, 0]),
      cyl(0.13, 0.14, 0.12, 24, [0, 0.17, 0]),
      cyl(0.14, 0.14, 0.025, 32, [0, 0.24, 0]),
      sphere(0.12, 32, 16, Math.PI * 2, 0.75, [0, 0.19, 0]),
    ];
  } else {
    // Beam default
    headParts = [
      cyl(0.13, 0.14, 0.20, 24, [0, -0.08, 0]),
      sphere(0.13, 20, 12, Math.PI * 2, Math.PI / 2, [0, -0.18, 0], [Math.PI, 0, 0]),
      cyl(0.125, 0.13, 0.14, 24, [0, 0.06, 0]),
      cyl(0.105, 0.125, 0.10, 24, [0, 0.16, 0]),
      cyl(0.115, 0.115, 0.03, 32, [0, 0.22, 0]),
    ];
  }

  const headGeom = mergeBufferGeometries(headParts);
  const headMesh = new THREE.Mesh(headGeom, chassisMaterial);
  headMesh.castShadow = true;
  headGroup.add(headMesh);

  // Front Lens Element & Internal Lamp Engine
  const lensY = type === 'wash' ? 0.04 : type === 'spot' ? 0.20 : 0.18;
  const lensRadius = type === 'wash' ? 0.14 : type === 'spot' ? 0.11 : 0.10;

  // Authentic internal high-output LED/Arc lamp engine emitter inside the glass
  const emitterGeom = new THREE.SphereGeometry(0.04, 16, 16);
  const emitterMat = new THREE.MeshBasicMaterial({
    color: '#ffffff',
  });
  const emitterMesh = new THREE.Mesh(emitterGeom, emitterMat);
  emitterMesh.position.set(0, lensY - 0.02, 0);
  headGroup.add(emitterMesh);

  // Optical Glass Lens Dome
  const lensGeom = sphere(lensRadius, 32, 20, Math.PI * 2, 0.72, [0, lensY, 0]);
  const lensMesh = new THREE.Mesh(lensGeom, lensMaterial);
  headGroup.add(lensMesh);
  root.lensMesh = lensMesh;

  // 4. VOLUMETRIC LIGHT BEAM EMISSION GROUP
  // Positioned directly INSIDE the glass from within the moving head
  const beamGroup = new THREE.Group();
  beamGroup.position.set(0, lensY, 0); // Originates from within the glass

  // Volumetric Beam Outer Cone (Transparent glowing falloff)
  // Extends strictly along the head's optical axis (+Y) through the glass dome
  const beamLength = 9.0;
  const beamRadius = type === 'wash' ? 2.5 : type === 'spot' ? 1.4 : 0.65;
  const emitterRadius = type === 'wash' ? 0.12 : 0.055;

  // Three.js CylinderGeometry is aligned with Y:
  // Base at y=0 (inside the glass) with radius = emitterRadius
  // Top at y=beamLength (projection in space) with radius = beamRadius
  const beamConeGeom = new THREE.CylinderGeometry(beamRadius, emitterRadius, beamLength, 32, 1, true);
  beamConeGeom.translate(0, beamLength / 2, 0);

  const beamMaterial = new THREE.MeshBasicMaterial({
    color: '#00f0ff',
    transparent: true,
    opacity: 0.30,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const beamConeMesh = new THREE.Mesh(beamConeGeom, beamMaterial);
  beamGroup.add(beamConeMesh);
  root.beamConeMesh = beamConeMesh;

  // Core High-Intensity Piercing Center Ray
  const coreConeGeom = new THREE.CylinderGeometry(beamRadius * 0.32, emitterRadius * 0.45, beamLength, 20, 1, true);
  coreConeGeom.translate(0, beamLength / 2, 0);

  const coreMaterial = new THREE.MeshBasicMaterial({
    color: '#ffffff',
    transparent: true,
    opacity: 0.65,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const beamCoreMesh = new THREE.Mesh(coreConeGeom, coreMaterial);
  beamGroup.add(beamCoreMesh);
  root.beamCoreMesh = beamCoreMesh;

  // Projected floor/target light spot
  const floorSpotGeom = new THREE.RingGeometry(0.01, beamRadius, 32);
  floorSpotGeom.rotateX(Math.PI / 2); // Make ring lie perpendicular to beam axis (+Y)
  const floorSpotMat = new THREE.MeshBasicMaterial({
    color: '#00f0ff',
    transparent: true,
    opacity: 0.65,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const floorSpotMesh = new THREE.Mesh(floorSpotGeom, floorSpotMat);
  floorSpotMesh.position.set(0, beamLength, 0);
  beamGroup.add(floorSpotMesh);
  root.floorSpotMesh = floorSpotMesh;

  // Real Three.js SpotLight source for physical scene illumination
  const spotLight = new THREE.SpotLight(0x00f0ff, 8.0, 25, Math.PI / (type === 'wash' ? 5 : 12), 0.35, 1.2);
  spotLight.position.set(0, 0, 0);
  const spotTarget = new THREE.Object3D();
  spotTarget.position.set(0, beamLength, 0);
  beamGroup.add(spotTarget);
  spotLight.target = spotTarget;
  beamGroup.add(spotLight);
  root.spotLight = spotLight;

  headGroup.add(beamGroup);
  yokeGroup.add(headGroup);

  root.headGroup = headGroup;
  root.beamGroup = beamGroup;

  // Controller API
  root.setPanAngle = (deg: number) => {
    yokeGroup.rotation.y = THREE.MathUtils.degToRad(deg);
  };

  root.setTiltAngle = (deg: number) => {
    headGroup.rotation.x = THREE.MathUtils.degToRad(deg);
  };

  root.setBeamColor = (hex: string) => {
    const col = new THREE.Color(hex);
    (lensMesh.material as THREE.MeshPhysicalMaterial).emissive = col;
    (lensMesh.material as THREE.MeshPhysicalMaterial).color = col;
    (beamConeMesh.material as THREE.MeshBasicMaterial).color = col;
    (floorSpotMesh.material as THREE.MeshBasicMaterial).color = col;
    spotLight.color = col;
  };

  root.setBeamIntensity = (intensity: number) => {
    (beamConeMesh.material as THREE.MeshBasicMaterial).opacity = 0.30 * intensity;
    (beamCoreMesh.material as THREE.MeshBasicMaterial).opacity = 0.65 * intensity;
    (floorSpotMesh.material as THREE.MeshBasicMaterial).opacity = 0.65 * intensity;
    (lensMesh.material as THREE.MeshPhysicalMaterial).emissiveIntensity = 0.5 * intensity;
    spotLight.intensity = 8.0 * intensity;
  };

  root.setBeamEnabled = (enabled: boolean) => {
    beamGroup.visible = enabled;
  };

  return root;
}
