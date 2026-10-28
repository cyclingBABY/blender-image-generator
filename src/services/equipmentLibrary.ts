import * as THREE from 'three';
import { EquipmentCategory, EquipmentTemplate } from '../types';
import { mergeBufferGeometries } from './meshGenerators';

/**
 * 3D EVENT EQUIPMENT TEMPLATE LIBRARY
 * Comprehensive catalog of realistic procedural 3D models for stage lighting,
 * trussing, LED screens, audio equipment, stages, event décor, and power distribution.
 */

// Helper: Quick cylinder with orientation
function makeCylinder(rTop: number, rBot: number, height: number, radialSegs = 16, pos = [0, 0, 0], rot = [0, 0, 0]): THREE.BufferGeometry {
  const g = new THREE.CylinderGeometry(rTop, rBot, height, radialSegs);
  g.rotateX(rot[0]);
  g.rotateY(rot[1]);
  g.rotateZ(rot[2]);
  g.translate(pos[0], pos[1], pos[2]);
  return g;
}

// Helper: Quick box with position
function makeBox(w: number, h: number, d: number, pos = [0, 0, 0], rot = [0, 0, 0]): THREE.BufferGeometry {
  const g = new THREE.BoxGeometry(w, h, d);
  if (rot[0] || rot[1] || rot[2]) {
    g.rotateX(rot[0]);
    g.rotateY(rot[1]);
    g.rotateZ(rot[2]);
  }
  g.translate(pos[0], pos[1], pos[2]);
  return g;
}

// -------------------------------------------------------------
// 1. STAGE LIGHTING PROCEDURAL GENERATORS (AUTHENTIC REAL 3D MODELS)
// -------------------------------------------------------------
import { 
  createRealBeamMovingHeadGeometry, 
  createRealSpotMovingHeadGeometry, 
  createRealWashMovingHeadGeometry, 
  createRealHybridMovingHeadGeometry, 
  createRealLedParCanGeometry, 
  createRealBlinder2LightGeometry 
} from './stageLightingModels';

// Beam Moving Head (Narrow cowl, 160mm convex front lens, octagonal base, LCD menu, DMX ports, dual arm yoke)
export function createBeamMovingHeadGeometry(): THREE.BufferGeometry {
  return createRealBeamMovingHeadGeometry();
}

// Spot Moving Head (Dual stepped zoom barrels, gobo chamber, focus ring, dual arm yoke)
export function createSpotMovingHeadGeometry(): THREE.BufferGeometry {
  return createRealSpotMovingHeadGeometry();
}

// Wash Moving Head (Signature 19-cell LED honeycomb matrix face, frosted aura ring, aerodynamic dome)
export function createWashMovingHeadGeometry(): THREE.BufferGeometry {
  return createRealWashMovingHeadGeometry();
}

// Hybrid Moving Head (IP65 all-weather armor, rubber bumpers, massive zoom lens group)
export function createHybridMovingHeadGeometry(): THREE.BufferGeometry {
  return createRealHybridMovingHeadGeometry();
}

// LED PAR Can (PAR64 spun aluminum barrel, gel frame clips, dual scissor yoke, star lock knobs)
export function createLedParCanGeometry(): THREE.BufferGeometry {
  return createRealLedParCanGeometry();
}

// 2-Light Audience Blinder (Folded chassis, parabolic reflector dishes, center COB LED chips, heat sink fins)
export function createBlinder2LightGeometry(): THREE.BufferGeometry {
  return createRealBlinder2LightGeometry();
}

// 4-Light Matrix Audience Blinder
export function createBlinder4LightGeometry(): THREE.BufferGeometry {
  const frame = makeBox(0.44, 0.44, 0.14, [0, 0.26, 0]);
  const pots: THREE.BufferGeometry[] = [];
  const coords = [[-0.11, 0.37], [0.11, 0.37], [-0.11, 0.15], [0.11, 0.15]];
  for (const [x, y] of coords) {
    pots.push(makeCylinder(0.08, 0.08, 0.06, 20, [x, y, 0.08], [Math.PI / 2, 0, 0]));
  }
  return mergeBufferGeometries([frame, ...pots]);
}

// LED Strobe Light (High-output linear flash bar)
export function createLedStrobeGeometry(): THREE.BufferGeometry {
  const body = makeBox(0.50, 0.18, 0.12, [0, 0.16, 0]);
  const reflector = makeBox(0.46, 0.04, 0.03, [0, 0.16, 0.07]);
  const yoke = makeBox(0.54, 0.22, 0.03, [0, 0.16, -0.02]);
  return mergeBufferGeometries([body, reflector, yoke]);
}

// Pixel Batten Bar (1m 16-cell motorized batten)
export function createPixelBarGeometry(): THREE.BufferGeometry {
  const base = makeBox(1.0, 0.08, 0.14, [0, 0.04, 0]);
  const yokeL = makeBox(0.04, 0.18, 0.08, [-0.46, 0.14, 0]);
  const yokeR = makeBox(0.04, 0.18, 0.08, [0.46, 0.14, 0]);
  const bar = makeBox(0.96, 0.09, 0.09, [0, 0.20, 0]);
  // 16 individual lens pixels
  const cells: THREE.BufferGeometry[] = [];
  const step = 0.90 / 16;
  for (let i = 0; i < 16; i++) {
    const x = -0.45 + i * step + step / 2;
    cells.push(makeBox(0.04, 0.04, 0.015, [x, 0.20, 0.05]));
  }
  return mergeBufferGeometries([base, yokeL, yokeR, bar, ...cells]);
}

// Theatrical Fresnel Light with Barn Doors
export function createTheatricalFresnelGeometry(): THREE.BufferGeometry {
  const body = makeBox(0.26, 0.26, 0.36, [0, 0.24, 0]);
  const lens = makeCylinder(0.10, 0.10, 0.03, 24, [0, 0.24, 0.19], [Math.PI / 2, 0, 0]);
  // 4 rotatable barn door leaves
  const topLeaf = makeBox(0.24, 0.01, 0.14, [0, 0.38, 0.25], [-0.3, 0, 0]);
  const botLeaf = makeBox(0.24, 0.01, 0.14, [0, 0.10, 0.25], [0.3, 0, 0]);
  const leftLeaf = makeBox(0.01, 0.24, 0.14, [-0.14, 0.24, 0.25], [0, 0.3, 0]);
  const rightLeaf = makeBox(0.01, 0.24, 0.14, [0.14, 0.24, 0.25], [0, -0.3, 0]);
  const yoke = makeBox(0.32, 0.34, 0.04, [0, 0.24, 0]);
  return mergeBufferGeometries([body, lens, topLeaf, botLeaf, leftLeaf, rightLeaf, yoke]);
}

// Profile / Ellipsoidal Spot (ETC Source Four style)
export function createProfileSpotGeometry(): THREE.BufferGeometry {
  const rear = makeBox(0.20, 0.22, 0.28, [0, 0.26, -0.16]);
  const gate = makeBox(0.18, 0.20, 0.06, [0, 0.26, 0.02]);
  const barrel = makeCylinder(0.08, 0.09, 0.34, 20, [0, 0.26, 0.20], [Math.PI / 2, 0, 0]);
  const gelFrame = makeBox(0.18, 0.18, 0.02, [0, 0.26, 0.38]);
  const yoke = makeBox(0.26, 0.32, 0.03, [0, 0.26, 0]);
  return mergeBufferGeometries([rear, gate, barrel, gelFrame, yoke]);
}

// Followspot on Tripod Stand
export function createFollowspotGeometry(): THREE.BufferGeometry {
  // Long throw barrel
  const barrel = makeCylinder(0.12, 0.13, 0.95, 24, [0, 1.45, 0], [Math.PI / 2, 0, 0]);
  const handles = makeBox(0.32, 0.06, 0.08, [0, 1.45, -0.42]);
  const sight = makeBox(0.03, 0.05, 0.20, [0, 1.58, 0]);
  // Tripod Stand
  const pole = makeCylinder(0.03, 0.03, 1.25, 12, [0, 0.75, 0]);
  const leg1 = makeCylinder(0.02, 0.02, 0.85, 12, [0.35, 0.35, 0], [0, 0, -0.5]);
  const leg2 = makeCylinder(0.02, 0.02, 0.85, 12, [-0.35, 0.35, 0], [0, 0, 0.5]);
  const leg3 = makeCylinder(0.02, 0.02, 0.85, 12, [0, 0.35, 0.35], [0.5, 0, 0]);
  return mergeBufferGeometries([barrel, handles, sight, pole, leg1, leg2, leg3]);
}

// Atmospheric Haze / Fog Machine
export function createHazerGeometry(): THREE.BufferGeometry {
  const caseBody = makeBox(0.55, 0.32, 0.40, [0, 0.16, 0]);
  const fanNozzle = makeCylinder(0.07, 0.07, 0.06, 16, [0.15, 0.24, 0.22], [Math.PI / 2, 0, 0]);
  const handle = makeBox(0.24, 0.04, 0.04, [0, 0.34, 0]);
  return mergeBufferGeometries([caseBody, fanNozzle, handle]);
}

// Cold Spark Machine
export function createSparkMachineGeometry(): THREE.BufferGeometry {
  const cube = makeBox(0.22, 0.28, 0.22, [0, 0.14, 0]);
  const nozzle = makeCylinder(0.035, 0.035, 0.04, 16, [0, 0.30, 0]);
  return mergeBufferGeometries([cube, nozzle]);
}

// -------------------------------------------------------------
// 2. TRUSSING & RIGGING PROCEDURAL GENERATORS
// -------------------------------------------------------------

// Square 290mm Box Truss (Length variable)
export function createSquareTruss(length: number): THREE.BufferGeometry {
  const half = 0.145;
  const chords: THREE.BufferGeometry[] = [];
  const corners = [[-half, -half], [half, -half], [half, half], [-half, half]];

  // 4 Main Chords along Z
  for (const [cx, cy] of corners) {
    chords.push(makeCylinder(0.025, 0.025, length, 12, [cx, cy, 0], [Math.PI / 2, 0, 0]));
  }

  // Cross braces
  const steps = Math.max(2, Math.round(length / 0.35));
  const stepLen = length / steps;
  const startZ = -length / 2;

  for (let i = 0; i < steps; i++) {
    const z1 = startZ + i * stepLen;
    const z2 = z1 + stepLen;
    for (let s = 0; s < 4; s++) {
      const [x1, y1] = corners[s];
      const [x2, y2] = corners[(s + 1) % 4];
      const p1 = new THREE.Vector3(x1, y1, i % 2 === 0 ? z1 : z2);
      const p2 = new THREE.Vector3(x2, y2, i % 2 === 0 ? z2 : z1);
      const dir = new THREE.Vector3().subVectors(p2, p1);
      const bLen = dir.length();
      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);

      const brace = new THREE.CylinderGeometry(0.01, 0.01, bLen, 8);
      const m = new THREE.Matrix4();
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
      m.compose(mid, q, new THREE.Vector3(1, 1, 1));
      brace.applyMatrix4(m);
      chords.push(brace);
    }
  }

  return mergeBufferGeometries(chords);
}

// Triangular Truss 290mm (3-chord truss)
export function createTriangularTruss(length = 2.0): THREE.BufferGeometry {
  const r = 0.15;
  const angles = [Math.PI / 2, (7 * Math.PI) / 6, (11 * Math.PI) / 6];
  const chords: THREE.BufferGeometry[] = [];

  for (const a of angles) {
    chords.push(makeCylinder(0.025, 0.025, length, 12, [Math.cos(a) * r, Math.sin(a) * r, 0], [Math.PI / 2, 0, 0]));
  }

  return mergeBufferGeometries(chords);
}

// Heavy Steel Base Plate (800x800mm)
export function createBasePlateGeometry(): THREE.BufferGeometry {
  const plate = makeBox(0.80, 0.015, 0.80, [0, 0.0075, 0]);
  // 4 Corner Spigots
  const spigots: THREE.BufferGeometry[] = [];
  const half = 0.145;
  for (const [x, z] of [[-half, -half], [half, -half], [half, half], [-half, half]]) {
    spigots.push(makeCylinder(0.025, 0.025, 0.08, 12, [x, 0.05, z]));
  }
  return mergeBufferGeometries([plate, ...spigots]);
}

// Electric Chain Hoist Motor (1 Ton)
export function createChainHoistGeometry(): THREE.BufferGeometry {
  const body = makeCylinder(0.18, 0.18, 0.45, 18, [0, 0.22, 0], [0, 0, Math.PI / 2]);
  const chainBag = makeBox(0.24, 0.35, 0.20, [0.05, -0.15, 0]);
  const topHook = makeCylinder(0.02, 0.02, 0.16, 12, [0, 0.38, 0]);
  const botHook = makeCylinder(0.02, 0.02, 0.16, 12, [0, -0.38, 0]);
  return mergeBufferGeometries([body, chainBag, topHook, botHook]);
}

// -------------------------------------------------------------
// 3. LED SCREENS & VIDEO GENERATORS
// -------------------------------------------------------------

// Modular LED Rental Tile (500mm x 500mm)
export function createLedTile500Geometry(): THREE.BufferGeometry {
  const frame = makeBox(0.50, 0.50, 0.07, [0, 0.25, 0]);
  // Face grid module borders
  const moduleL = makeBox(0.245, 0.245, 0.01, [-0.125, 0.375, 0.04]);
  const moduleR = makeBox(0.245, 0.245, 0.01, [0.125, 0.375, 0.04]);
  const moduleBL = makeBox(0.245, 0.245, 0.01, [-0.125, 0.125, 0.04]);
  const moduleBR = makeBox(0.245, 0.245, 0.01, [0.125, 0.125, 0.04]);
  return mergeBufferGeometries([frame, moduleL, moduleR, moduleBL, moduleBR]);
}

// Modular LED Rental Tile (500mm x 1000mm)
export function createLedTile1000Geometry(): THREE.BufferGeometry {
  const frame = makeBox(0.50, 1.00, 0.07, [0, 0.50, 0]);
  return frame;
}

// Interactive LED Dance Floor Tile (500x500mm)
export function createLedFloorTileGeometry(): THREE.BufferGeometry {
  const base = makeBox(0.50, 0.06, 0.50, [0, 0.03, 0]);
  const glassTop = makeBox(0.48, 0.01, 0.48, [0, 0.065, 0]);
  return mergeBufferGeometries([base, glassTop]);
}

// Video Processor Rack 1U (NovaStar style)
export function createVideoProcessorGeometry(): THREE.BufferGeometry {
  const unit = makeBox(0.48, 0.05, 0.35, [0, 0.025, 0]);
  const screen = makeBox(0.12, 0.03, 0.01, [-0.10, 0.025, 0.18]);
  const knob = makeCylinder(0.015, 0.015, 0.015, 12, [0.15, 0.025, 0.18], [Math.PI / 2, 0, 0]);
  return mergeBufferGeometries([unit, screen, knob]);
}

// -------------------------------------------------------------
// 4. SOUND & AUDIO GENERATORS
// -------------------------------------------------------------

// Line Array Flown Cluster (3 linked speaker modules)
export function createLineArrayClusterGeometry(): THREE.BufferGeometry {
  const modules: THREE.BufferGeometry[] = [];
  const flybar = makeBox(0.85, 0.08, 0.55, [0, 1.15, 0]);
  modules.push(flybar);

  for (let i = 0; i < 3; i++) {
    const y = 0.95 - i * 0.32;
    const splayAngle = (i * 4 * Math.PI) / 180;
    const box = makeBox(0.80, 0.28, 0.46, [0, y, 0], [splayAngle, 0, 0]);
    modules.push(box);
  }

  return mergeBufferGeometries(modules);
}

// Dual 18-inch Subwoofer Touring Cabinet
export function createDualSubwooferGeometry(): THREE.BufferGeometry {
  const cab = makeBox(1.15, 0.58, 0.85, [0, 0.29, 0]);
  const coneL = makeCylinder(0.22, 0.18, 0.05, 24, [-0.28, 0.29, 0.43], [Math.PI / 2, 0, 0]);
  const coneR = makeCylinder(0.22, 0.18, 0.05, 24, [0.28, 0.29, 0.43], [Math.PI / 2, 0, 0]);
  const grill = makeBox(1.10, 0.52, 0.02, [0, 0.29, 0.44]);
  return mergeBufferGeometries([cab, coneL, coneR, grill]);
}

// Stage Wedge Coaxial Monitor (45 deg angle)
export function createStageWedgeGeometry(): THREE.BufferGeometry {
  const wedge = makeBox(0.55, 0.32, 0.42, [0, 0.16, 0], [-0.5, 0, 0]);
  return wedge;
}

// Digital Audio Mixing Console (Large format surface)
export function createAudioConsoleGeometry(): THREE.BufferGeometry {
  const base = makeBox(1.20, 0.25, 0.75, [0, 0.125, 0]);
  const screenL = makeBox(0.42, 0.28, 0.03, [-0.25, 0.32, -0.15], [-0.35, 0, 0]);
  const screenR = makeBox(0.42, 0.28, 0.03, [0.25, 0.32, -0.15], [-0.35, 0, 0]);
  const armrest = makeBox(1.20, 0.06, 0.12, [0, 0.25, 0.32]);
  return mergeBufferGeometries([base, screenL, screenR, armrest]);
}

// -------------------------------------------------------------
// 5. STAGING, DECOR & POWER GENERATORS
// -------------------------------------------------------------

// DJ Booth Facade / Riser
export function createDJBoothGeometry(): THREE.BufferGeometry {
  const deck = makeBox(1.60, 0.95, 0.75, [0, 0.475, 0]);
  const frontFacade = makeBox(1.64, 1.05, 0.05, [0, 0.525, 0.40]);
  return mergeBufferGeometries([deck, frontFacade]);
}

// Heavy Duty Crowd Mojo Barricade
export function createCrowdBarricadeGeometry(): THREE.BufferGeometry {
  const frame = makeBox(1.05, 1.15, 0.06, [0, 0.575, 0]);
  const basePlate = makeBox(1.00, 0.02, 0.90, [0, 0.01, -0.42]);
  const rearStep = makeBox(1.00, 0.45, 0.25, [0, 0.225, -0.35]);
  return mergeBufferGeometries([frame, basePlate, rearStep]);
}

// Wedding Floral Arch (Hexagonal structure)
export function createFloralArchGeometry(): THREE.BufferGeometry {
  const geoms: THREE.BufferGeometry[] = [];
  const radius = 1.35;
  const sides = 6;
  const tubeRadius = 0.025;

  for (let i = 0; i < sides - 1; i++) {
    const a1 = (i * 2 * Math.PI) / sides;
    const a2 = ((i + 1) * 2 * Math.PI) / sides;
    const p1 = new THREE.Vector3(Math.cos(a1) * radius, Math.sin(a1) * radius + 1.5, 0);
    const p2 = new THREE.Vector3(Math.cos(a2) * radius, Math.sin(a2) * radius + 1.5, 0);

    const dir = new THREE.Vector3().subVectors(p2, p1);
    const len = dir.length();
    const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);

    const tube = new THREE.CylinderGeometry(tubeRadius, tubeRadius, len, 12);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    m.compose(mid, q, new THREE.Vector3(1, 1, 1));
    tube.applyMatrix4(m);
    geoms.push(tube);
  }

  // 2 Floor feet
  geoms.push(makeBox(0.40, 0.02, 0.40, [-radius * 0.85, 0.01, 0]));
  geoms.push(makeBox(0.40, 0.02, 0.40, [radius * 0.85, 0.01, 0]));

  return mergeBufferGeometries(geoms);
}

// 10-Person Round Banquet Table with Chairs
export function createBanquetTableGeometry(): THREE.BufferGeometry {
  const tableTop = makeCylinder(0.90, 0.90, 0.04, 32, [0, 0.74, 0]);
  const stem = makeCylinder(0.08, 0.08, 0.70, 16, [0, 0.35, 0]);
  const foot = makeCylinder(0.45, 0.45, 0.02, 24, [0, 0.01, 0]);

  // 8 Surrounding chairs
  const chairs: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 8; i++) {
    const ang = (i * 2 * Math.PI) / 8;
    const cx = Math.cos(ang) * 1.35;
    const cz = Math.sin(ang) * 1.35;
    const seat = makeBox(0.42, 0.05, 0.42, [cx, 0.45, cz], [0, -ang + Math.PI / 2, 0]);
    const back = makeBox(0.42, 0.45, 0.04, [cx * 1.08, 0.70, cz * 1.08], [0, -ang + Math.PI / 2, 0]);
    chairs.push(seat, back);
  }

  return mergeBufferGeometries([tableTop, stem, foot, ...chairs]);
}

// grandMA3 Style Lighting Console
export function createLightingConsoleGeometry(): THREE.BufferGeometry {
  const base = makeBox(1.10, 0.18, 0.65, [0, 0.09, 0]);
  // Dual motorized angled widescreen touchscreens
  const screenL = makeBox(0.48, 0.32, 0.03, [-0.26, 0.32, -0.12], [-0.4, 0, 0]);
  const screenR = makeBox(0.48, 0.32, 0.03, [0.26, 0.32, -0.12], [-0.4, 0, 0]);
  const commandKeys = makeBox(1.05, 0.02, 0.30, [0, 0.19, 0.14]);
  return mergeBufferGeometries([base, screenL, screenR, commandKeys]);
}

// 63A 3-Phase Power Distribution Distro Rack
export function createPowerDistroGeometry(): THREE.BufferGeometry {
  const caseBox = makeBox(0.55, 0.75, 0.55, [0, 0.40, 0]);
  const wheels: THREE.BufferGeometry[] = [];
  for (const [x, z] of [[-0.22, -0.22], [0.22, -0.22], [-0.22, 0.22], [0.22, 0.22]]) {
    wheels.push(makeCylinder(0.04, 0.04, 0.04, 12, [x, 0.04, z], [Math.PI / 2, 0, 0]));
  }
  return mergeBufferGeometries([caseBox, ...wheels]);
}

// Touring ATA Road Flight Case
export function createFlightCaseGeometry(): THREE.BufferGeometry {
  const body = makeBox(0.85, 0.55, 0.60, [0, 0.32, 0]);
  return body;
}

// -------------------------------------------------------------
// COMPLETE CATALOG DATASET (50+ Templates across 7 Categories)
// -------------------------------------------------------------

export const EVENT_EQUIPMENT_TEMPLATES: EquipmentTemplate[] = [
  // --- 1. LIGHTING: MOVING HEADS ---
  {
    id: 'light_beam_moving_head',
    name: '300W Beam Moving Head Light',
    category: 'lighting',
    subcategory: 'Moving Heads',
    dimensions: { width: 0.38, height: 0.58, depth: 0.38 },
    weightKg: 16.5,
    powerWatts: 380,
    dmxChannels: 16,
    beamAngleDeg: 1.8,
    color: '#1a1b1e',
    tags: ['beam', 'moving head', 'aerial', 'concert', 'dmx'],
    description: 'High-intensity razor-sharp beam fixture with ultra-fast pan/tilt motors and prism wheel.',
    mountingType: 'truss_clamp',
    thumbnailSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="30" y="75" width="40" height="15" rx="3" fill="#38bdf8"/><path d="M35 75 L35 45 L65 45 L65 75 Z" fill="#24262b"/><ellipse cx="50" cy="35" rx="18" ry="22" fill="#0284c7"/><circle cx="50" cy="20" r="10" fill="#facc15"/></svg>',
    photometrics: { luxAt5m: 85000, colorTempK: 8000, cri: 75 },
    createGeometry: createBeamMovingHeadGeometry,
  },
  {
    id: 'light_spot_moving_head',
    name: 'Spot Profile Moving Head (Gobo/Focus)',
    category: 'lighting',
    subcategory: 'Moving Heads',
    dimensions: { width: 0.42, height: 0.62, depth: 0.42 },
    weightKg: 22.0,
    powerWatts: 450,
    dmxChannels: 24,
    beamAngleDeg: 12.0,
    color: '#18191c',
    tags: ['spot', 'gobo', 'moving head', 'theatre', 'focus'],
    description: 'Sharp projection spot fixture with dual rotating gobo wheels, motorized focus, and iris.',
    mountingType: 'truss_clamp',
    thumbnailSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="25" y="75" width="50" height="15" rx="3" fill="#a855f7"/><path d="M30 75 L30 40 L70 40 L70 75 Z" fill="#24262b"/><ellipse cx="50" cy="30" rx="20" ry="20" fill="#9333ea"/><circle cx="50" cy="18" r="12" fill="#c084fc"/></svg>',
    photometrics: { luxAt5m: 32000, colorTempK: 6500, cri: 90 },
    createGeometry: createSpotMovingHeadGeometry,
  },
  {
    id: 'light_wash_moving_head',
    name: '19x40W LED Wash Moving Head',
    category: 'lighting',
    subcategory: 'Moving Heads',
    dimensions: { width: 0.36, height: 0.46, depth: 0.36 },
    weightKg: 14.0,
    powerWatts: 760,
    dmxChannels: 21,
    beamAngleDeg: 45.0,
    color: '#1a1b1e',
    tags: ['wash', 'led', 'moving head', 'zoom', 'rgbw'],
    description: 'Vibrant RGBW LED wash fixture with motorized 4° to 55° zoom and individual pixel ring control.',
    mountingType: 'truss_clamp',
    thumbnailSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="30" y="75" width="40" height="15" rx="3" fill="#10b981"/><path d="M35 75 L35 45 L65 45 L65 75 Z" fill="#24262b"/><circle cx="50" cy="32" r="18" fill="#059669"/><circle cx="50" cy="32" r="12" fill="#34d399"/></svg>',
    photometrics: { luxAt5m: 18500, colorTempK: 6000, cri: 85 },
    createGeometry: createWashMovingHeadGeometry,
  },
  {
    id: 'light_hybrid_moving_head',
    name: '470W BSW Hybrid Moving Head',
    category: 'lighting',
    subcategory: 'Moving Heads',
    dimensions: { width: 0.46, height: 0.70, depth: 0.46 },
    weightKg: 28.5,
    powerWatts: 650,
    dmxChannels: 32,
    beamAngleDeg: 2.0,
    color: '#141517',
    tags: ['hybrid', 'beam', 'spot', 'wash', 'all in one'],
    description: 'Premium Beam-Spot-Wash hybrid fixture offering seamless optical versatility for festival stages.',
    mountingType: 'truss_clamp',
    thumbnailSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="25" y="75" width="50" height="16" rx="3" fill="#e87a24"/><path d="M30 75 L30 38 L70 38 L70 75 Z" fill="#24262b"/><ellipse cx="50" cy="30" rx="22" ry="24" fill="#ea580c"/><circle cx="50" cy="14" r="13" fill="#fed7aa"/></svg>',
    photometrics: { luxAt5m: 110000, colorTempK: 7500, cri: 80 },
    createGeometry: createHybridMovingHeadGeometry,
  },

  // --- 1. LIGHTING: STATIC & THEATRICAL FIXTURES ---
  {
    id: 'light_led_par_can',
    name: 'Indoor/Outdoor IP65 LED PAR Can',
    category: 'lighting',
    subcategory: 'Static Fixtures',
    dimensions: { width: 0.28, height: 0.35, depth: 0.24 },
    weightKg: 5.5,
    powerWatts: 180,
    dmxChannels: 9,
    beamAngleDeg: 25.0,
    color: '#1a1b1e',
    tags: ['par', 'led par', 'uplight', 'wash', 'rgbw'],
    description: 'Rugged aluminum dual-bracket PAR fixture for architectural uplighting, truss warming, and stage fill.',
    mountingType: 'floor_standing',
    thumbnailSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><ellipse cx="50" cy="50" rx="28" ry="28" fill="#3b82f6"/><circle cx="50" cy="50" r="22" fill="#1d4ed8"/><path d="M15 85 L50 65 L85 85" stroke="#71717a" stroke-width="6" fill="none"/></svg>',
    photometrics: { luxAt5m: 4200, colorTempK: 6500, cri: 88 },
    createGeometry: createLedParCanGeometry,
  },
  {
    id: 'light_blinder_2light',
    name: '2x100W COB Audience Blinder',
    category: 'lighting',
    subcategory: 'Audience Blinders',
    dimensions: { width: 0.42, height: 0.26, depth: 0.16 },
    weightKg: 6.2,
    powerWatts: 220,
    dmxChannels: 4,
    beamAngleDeg: 60.0,
    color: '#18191c',
    tags: ['blinder', 'audience', 'cob', 'warm white', 'concert'],
    description: 'Dual COB 3000K warm white blinder with tungsten amber halogen-dimming emulation curve.',
    mountingType: 'truss_clamp',
    thumbnailSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="15" y="30" width="70" height="40" rx="4" fill="#24262b"/><circle cx="35" cy="50" r="14" fill="#f59e0b"/><circle cx="65" cy="50" r="14" fill="#f59e0b"/></svg>',
    photometrics: { luxAt5m: 8900, colorTempK: 3000, cri: 92 },
    createGeometry: createBlinder2LightGeometry,
  },
  {
    id: 'light_blinder_4light',
    name: '4x100W Matrix Audience Blinder',
    category: 'lighting',
    subcategory: 'Audience Blinders',
    dimensions: { width: 0.44, height: 0.44, depth: 0.16 },
    weightKg: 11.5,
    powerWatts: 440,
    dmxChannels: 8,
    beamAngleDeg: 60.0,
    color: '#18191c',
    tags: ['blinder', '4 way', 'matrix', 'arena', 'crowd'],
    description: 'High-impact 4-cell arena blinder array with individual cell DMX dimming.',
    mountingType: 'truss_clamp',
    thumbnailSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="15" y="15" width="70" height="70" rx="4" fill="#24262b"/><circle cx="35" cy="35" r="12" fill="#f59e0b"/><circle cx="65" cy="35" r="12" fill="#f59e0b"/><circle cx="35" cy="65" r="12" fill="#f59e0b"/><circle cx="65" cy="65" r="12" fill="#f59e0b"/></svg>',
    createGeometry: createBlinder4LightGeometry,
  },
  {
    id: 'light_led_strobe',
    name: 'High-Power LED Tour Strobe & Wash',
    category: 'lighting',
    subcategory: 'Strobes & FX',
    dimensions: { width: 0.50, height: 0.22, depth: 0.14 },
    weightKg: 7.8,
    powerWatts: 1000,
    dmxChannels: 14,
    color: '#1e2025',
    tags: ['strobe', 'flash', 'blind', 'fx', 'edm'],
    description: 'Linear ultra-bright strobe tube accompanied by RGB backlight pixel zones for wash effects.',
    mountingType: 'truss_clamp',
    thumbnailSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="10" y="35" width="80" height="30" rx="3" fill="#27272a"/><rect x="16" y="46" width="68" height="8" rx="2" fill="#ffffff"/><path d="M48 25 L40 45 L52 45 L44 65 L60 42 L48 42 Z" fill="#38bdf8"/></svg>',
    createGeometry: createLedStrobeGeometry,
  },
  {
    id: 'light_pixel_batten',
    name: '1-Meter 16-Cell Motorized Tilting Batten',
    category: 'lighting',
    subcategory: 'Pixel Bars',
    dimensions: { width: 1.00, height: 0.24, depth: 0.14 },
    weightKg: 12.0,
    powerWatts: 320,
    dmxChannels: 64,
    beamAngleDeg: 10.0,
    color: '#18191c',
    tags: ['pixel bar', 'batten', 'tilt', 'curtain', 'color chase'],
    description: 'Motorized 200° tilt linear batten bar with 16 individually mapped RGBW cells for sweeping light curtains.',
    mountingType: 'truss_clamp',
    thumbnailSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="5" y="42" width="90" height="16" rx="3" fill="#24262b"/><circle cx="15" cy="50" r="4" fill="#e11d48"/><circle cx="27" cy="50" r="4" fill="#e11d48"/><circle cx="39" cy="50" r="4" fill="#e11d48"/><circle cx="51" cy="50" r="4" fill="#e11d48"/><circle cx="63" cy="50" r="4" fill="#e11d48"/><circle cx="75" cy="50" r="4" fill="#e11d48"/><circle cx="87" cy="50" r="4" fill="#e11d48"/></svg>',
    createGeometry: createPixelBarGeometry,
  },
  {
    id: 'light_fresnel_theatre',
    name: '1000W Theatrical Fresnel with Barn Doors',
    category: 'lighting',
    subcategory: 'Theatrical',
    dimensions: { width: 0.32, height: 0.40, depth: 0.38 },
    weightKg: 8.5,
    powerWatts: 1000,
    dmxChannels: 2,
    beamAngleDeg: 35.0,
    color: '#222328',
    tags: ['fresnel', 'theatre', 'barn doors', 'warm', 'key light'],
    description: 'Classic soft-edged beam theatrical Fresnel with 4-leaf rotating barn doors for beam shaping.',
    mountingType: 'truss_clamp',
    thumbnailSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="30" y="30" width="40" height="40" fill="#27272a"/><circle cx="50" cy="50" r="16" fill="#fef08a"/><path d="M25 25 L75 25 L65 15 L35 15 Z" fill="#52525b"/></svg>',
    createGeometry: createTheatricalFresnelGeometry,
  },
  {
    id: 'light_profile_spot',
    name: 'Ellipsoidal Profile Spot (Source 4 Style)',
    category: 'lighting',
    subcategory: 'Theatrical',
    dimensions: { width: 0.28, height: 0.35, depth: 0.65 },
    weightKg: 9.2,
    powerWatts: 750,
    dmxChannels: 3,
    beamAngleDeg: 19.0,
    color: '#1a1b1e',
    tags: ['profile', 'ellipsoidal', 'leko', 'gobo', 'framing'],
    description: 'Precision framing profile spot with 4 manual shutter blades, pattern slot, and crisp optics.',
    mountingType: 'truss_clamp',
    thumbnailSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="15" y="38" width="30" height="24" fill="#27272a"/><polygon points="45,38 75,42 75,58 45,62" fill="#3f3f46"/><rect x="75" y="36" width="6" height="28" fill="#71717a"/></svg>',
    createGeometry: createProfileSpotGeometry,
  },
  {
    id: 'light_followspot',
    name: 'Long-Throw Performer Followspot with Stand',
    category: 'lighting',
    subcategory: 'Theatrical',
    dimensions: { width: 0.40, height: 1.60, depth: 1.10 },
    weightKg: 35.0,
    powerWatts: 1200,
    color: '#1e2025',
    tags: ['followspot', 'spotlight', 'stand', 'operator', 'lead singer'],
    description: 'Heavy duty long-throw followspot mounted on a counterweighted swivel tripod stand with operator handles.',
    mountingType: 'floor_standing',
    thumbnailSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="25" y="25" width="55" height="18" rx="2" fill="#27272a"/><line x1="50" y1="43" x2="50" y2="85" stroke="#71717a" stroke-width="4"/><line x1="25" y1="85" x2="50" y2="70" stroke="#71717a" stroke-width="3"/><line x1="75" y1="85" x2="50" y2="70" stroke="#71717a" stroke-width="3"/></svg>',
    createGeometry: createFollowspotGeometry,
  },
  {
    id: 'fx_touring_hazer',
    name: 'Touring Atmospheric Oil/Water Hazer',
    category: 'lighting',
    subcategory: 'Atmospheric FX',
    dimensions: { width: 0.55, height: 0.36, depth: 0.40 },
    weightKg: 18.5,
    powerWatts: 1400,
    dmxChannels: 2,
    color: '#1a1b1e',
    tags: ['hazer', 'fog', 'smoke', 'atmosphere', 'beam visibility'],
    description: 'Continuous silent fine haze generator enclosed in flight case with directional output fan.',
    mountingType: 'floor_standing',
    thumbnailSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="20" y="35" width="60" height="40" rx="3" fill="#27272a"/><circle cx="65" cy="55" r="10" fill="#38bdf8"/><path d="M75 55 Q90 40 85 25" stroke="#94a3b8" stroke-width="3" fill="none"/></svg>',
    createGeometry: createHazerGeometry,
  },
  {
    id: 'fx_cold_spark',
    name: 'DMX Cold Spark Fountain Machine',
    category: 'lighting',
    subcategory: 'Atmospheric FX',
    dimensions: { width: 0.22, height: 0.32, depth: 0.22 },
    weightKg: 7.2,
    powerWatts: 600,
    dmxChannels: 2,
    color: '#1a1b1e',
    tags: ['cold spark', 'pyro', 'fountain', 'wedding', 'entrance'],
    description: 'Safe non-pyrotechnic indoor/outdoor titanium cold spark fountain reaching up to 5 meters.',
    mountingType: 'floor_standing',
    thumbnailSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="35" y="50" width="30" height="40" rx="2" fill="#24262b"/><path d="M50 50 L45 20 M50 50 L55 15 M50 50 L35 25 M50 50 L65 25" stroke="#facc15" stroke-width="2"/></svg>',
    createGeometry: createSparkMachineGeometry,
  },

  // --- 2. TRUSSING & RIGGING ---
  {
    id: 'truss_square_3m',
    name: '290mm Aluminum Square Box Truss (3.0m)',
    category: 'trussing',
    subcategory: 'Straight Truss',
    dimensions: { width: 0.29, height: 0.29, depth: 3.00 },
    weightKg: 17.5,
    powerWatts: 0,
    color: '#d1d5db',
    tags: ['truss', 'box truss', '290mm', 'aluminum', 'rigging'],
    description: 'Industry-standard 290mm (12") square 4-chord truss segment with conical coupling couplers.',
    mountingType: 'modular',
    thumbnailSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="10" y="38" width="80" height="24" fill="none" stroke="#e5e7eb" stroke-width="3"/><line x1="10" y1="38" x2="90" y2="62" stroke="#9ca3af" stroke-width="2"/><line x1="10" y1="62" x2="90" y2="38" stroke="#9ca3af" stroke-width="2"/></svg>',
    createGeometry: () => createSquareTruss(3.0),
  },
  {
    id: 'truss_square_2m',
    name: '290mm Aluminum Square Box Truss (2.0m)',
    category: 'trussing',
    subcategory: 'Straight Truss',
    dimensions: { width: 0.29, height: 0.29, depth: 2.00 },
    weightKg: 12.0,
    powerWatts: 0,
    color: '#d1d5db',
    tags: ['truss', 'box truss', '2m', 'rigging'],
    description: '2-meter straight 290mm aluminum box truss section.',
    mountingType: 'modular',
    thumbnailSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="15" y="38" width="70" height="24" fill="none" stroke="#e5e7eb" stroke-width="3"/><line x1="15" y1="38" x2="85" y2="62" stroke="#9ca3af" stroke-width="2"/></svg>',
    createGeometry: () => createSquareTruss(2.0),
  },
  {
    id: 'truss_square_1m',
    name: '290mm Aluminum Square Box Truss (1.0m)',
    category: 'trussing',
    subcategory: 'Straight Truss',
    dimensions: { width: 0.29, height: 0.29, depth: 1.00 },
    weightKg: 6.5,
    powerWatts: 0,
    color: '#d1d5db',
    tags: ['truss', 'box truss', '1m', 'short'],
    description: '1-meter modular box truss spacer section.',
    mountingType: 'modular',
    thumbnailSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="25" y="38" width="50" height="24" fill="none" stroke="#e5e7eb" stroke-width="3"/><line x1="25" y1="38" x2="75" y2="62" stroke="#9ca3af" stroke-width="2"/></svg>',
    createGeometry: () => createSquareTruss(1.0),
  },
  {
    id: 'truss_triangular_2m',
    name: '290mm Triangular Truss (2.0m)',
    category: 'trussing',
    subcategory: 'Straight Truss',
    dimensions: { width: 0.29, height: 0.26, depth: 2.00 },
    weightKg: 9.8,
    powerWatts: 0,
    color: '#d1d5db',
    tags: ['truss', 'triangle', '3 chord', 'lightweight'],
    description: 'Triangular 3-chord truss section ideal for lightweight roof spans and decorative hangs.',
    mountingType: 'modular',
    thumbnailSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><polygon points="50,25 20,75 80,75" fill="none" stroke="#d1d5db" stroke-width="4"/></svg>',
    createGeometry: () => createTriangularTruss(2.0),
  },
  {
    id: 'truss_base_plate',
    name: 'Heavy Steel Base Plate (800x800mm)',
    category: 'trussing',
    subcategory: 'Base & Support',
    dimensions: { width: 0.80, height: 0.08, depth: 0.80 },
    weightKg: 42.0,
    powerWatts: 0,
    color: '#1f2937',
    tags: ['base plate', 'totem', 'ballast', 'stand', 'steel'],
    description: '42kg solid steel floor ballast plate for free-standing truss totems and goalposts.',
    mountingType: 'floor_standing',
    thumbnailSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="15" y="45" width="70" height="12" rx="2" fill="#374151"/><rect x="35" y="35" width="30" height="10" fill="#6b7280"/></svg>',
    createGeometry: createBasePlateGeometry,
  },
  {
    id: 'rigging_chain_hoist',
    name: '1-Ton Electric Chain Hoist Motor',
    category: 'trussing',
    subcategory: 'Motors & Rigging',
    dimensions: { width: 0.45, height: 0.80, depth: 0.35 },
    weightKg: 55.0,
    powerWatts: 1500,
    color: '#1e2025',
    tags: ['hoist', 'chain motor', 'rigging', 'flown', '1 ton'],
    description: 'Heavy duty touring chain motor with chain bag, safety brake, and swivel latches.',
    mountingType: 'flown',
    thumbnailSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="30" y="30" width="40" height="35" rx="4" fill="#1f2937"/><path d="M50 15 L50 30 M50 65 L50 85" stroke="#f59e0b" stroke-width="4"/></svg>',
    createGeometry: createChainHoistGeometry,
  },

  // --- 3. LED SCREENS & VIDEO ---
  {
    id: 'video_led_panel_500',
    name: 'P3.91 Modular LED Video Wall Tile (500x500mm)',
    category: 'video',
    subcategory: 'LED Screens',
    dimensions: { width: 0.50, height: 0.50, depth: 0.08 },
    weightKg: 7.5,
    powerWatts: 180,
    color: '#111827',
    tags: ['led wall', 'tile', 'p3.9', 'display', 'screen'],
    description: 'High-refresh rate rental LED panel with magnetic front-service modules and fast-locking rigging pins.',
    mountingType: 'modular',
    thumbnailSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="20" y="20" width="60" height="60" fill="#0f172a" stroke="#38bdf8" stroke-width="3"/><line x1="50" y1="20" x2="50" y2="80" stroke="#1e293b" stroke-width="2"/><line x1="20" y1="50" x2="80" y2="50" stroke="#1e293b" stroke-width="2"/></svg>',
    createGeometry: createLedTile500Geometry,
  },
  {
    id: 'video_led_panel_1000',
    name: 'P2.6 High-Res LED Video Wall Tile (500x1000mm)',
    category: 'video',
    subcategory: 'LED Screens',
    dimensions: { width: 0.50, height: 1.00, depth: 0.08 },
    weightKg: 13.0,
    powerWatts: 340,
    color: '#111827',
    tags: ['led wall', '1000mm', 'portrait', 'stage background'],
    description: 'Tall 500x1000mm rental panel for faster assembly of large-scale stage backdrops.',
    mountingType: 'modular',
    thumbnailSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="30" y="10" width="40" height="80" fill="#0f172a" stroke="#38bdf8" stroke-width="3"/></svg>',
    createGeometry: createLedTile1000Geometry,
  },
  {
    id: 'video_led_dancefloor',
    name: 'Interactive Tempered Glass LED Floor Tile (500x500mm)',
    category: 'video',
    subcategory: 'LED Floors',
    dimensions: { width: 0.50, height: 0.07, depth: 0.50 },
    weightKg: 11.5,
    powerWatts: 150,
    color: '#1e2025',
    tags: ['dance floor', 'floor tile', 'interactive', 'wedding dancefloor'],
    description: 'Weight-bearing tempered glass LED dance floor panel with optical pressure sensors.',
    mountingType: 'floor_standing',
    thumbnailSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="20" y="35" width="60" height="30" rx="3" fill="#065f46" stroke="#34d399" stroke-width="3"/></svg>',
    createGeometry: createLedFloorTileGeometry,
  },
  {
    id: 'video_processor_rack',
    name: '4K Ultra-HD LED Video Processor (NovaStar Style)',
    category: 'video',
    subcategory: 'Video Processors',
    dimensions: { width: 0.48, height: 0.05, depth: 0.35 },
    weightKg: 5.0,
    powerWatts: 85,
    color: '#1e293b',
    tags: ['processor', 'novastar', 'sender', 'media', 'controller'],
    description: 'Rackmount 4K multi-input video sender with seamless switching, scaling, and low latency.',
    mountingType: 'tabletop',
    thumbnailSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="15" y="40" width="70" height="20" rx="2" fill="#1e293b"/><rect x="25" y="45" width="20" height="10" fill="#38bdf8"/></svg>',
    createGeometry: createVideoProcessorGeometry,
  },

  // --- 4. SOUND & AUDIO ---
  {
    id: 'audio_line_array_cluster',
    name: 'Flown 3-Element Line Array Array Module Cluster',
    category: 'audio',
    subcategory: 'Speakers',
    dimensions: { width: 0.85, height: 1.25, depth: 0.55 },
    weightKg: 85.0,
    powerWatts: 2400,
    color: '#1e2025',
    tags: ['line array', 'pa', 'speakers', 'flown', 'concert audio'],
    description: 'Flown concert sound array with top rigging fly-bar and three splayed line array cabinets.',
    mountingType: 'flown',
    thumbnailSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="20" y="20" width="60" height="12" fill="#475569"/><rect x="22" y="36" width="56" height="16" fill="#1e293b"/><rect x="23" y="55" width="54" height="16" fill="#1e293b"/><rect x="25" y="74" width="50" height="16" fill="#1e293b"/></svg>',
    createGeometry: createLineArrayClusterGeometry,
  },
  {
    id: 'audio_subwoofer_dual18',
    name: 'Dual 18" High-Power Touring Subwoofer',
    category: 'audio',
    subcategory: 'Speakers',
    dimensions: { width: 1.15, height: 0.58, depth: 0.85 },
    weightKg: 78.0,
    powerWatts: 3000,
    color: '#18191c',
    tags: ['subwoofer', 'bass', 'dual 18', 'ground stack', 'low end'],
    description: 'Ground-stack bass reflex touring subwoofer delivering intense low-frequency punch down to 28Hz.',
    mountingType: 'floor_standing',
    thumbnailSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="15" y="30" width="70" height="40" rx="3" fill="#18191c"/><circle cx="35" cy="50" r="14" fill="#374151"/><circle cx="65" cy="50" r="14" fill="#374151"/></svg>',
    createGeometry: createDualSubwooferGeometry,
  },
  {
    id: 'audio_stage_wedge',
    name: 'Low-Profile 12" Coaxial Stage Wedge Monitor',
    category: 'audio',
    subcategory: 'Speakers',
    dimensions: { width: 0.55, height: 0.32, depth: 0.42 },
    weightKg: 16.0,
    powerWatts: 600,
    color: '#18191c',
    tags: ['wedge', 'stage monitor', 'foldback', 'singer monitor'],
    description: 'Floor monitor delivering clean, feedback-resistant vocal foldback for performing artists.',
    mountingType: 'floor_standing',
    thumbnailSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><polygon points="20,70 80,70 70,35 30,35" fill="#1f2937"/><circle cx="50" cy="52" r="12" fill="#374151"/></svg>',
    createGeometry: createStageWedgeGeometry,
  },
  {
    id: 'audio_digital_mixer',
    name: 'Large-Format Digital Audio Mixing Console',
    category: 'audio',
    subcategory: 'Control & Mixers',
    dimensions: { width: 1.20, height: 0.35, depth: 0.75 },
    weightKg: 42.0,
    powerWatts: 250,
    color: '#1e2025',
    tags: ['mixer', 'console', 'foh', 'audio control', 'faders'],
    description: 'Touring digital audio desk with motorized fader banks, tactile rotary controls, and dual touchscreens.',
    mountingType: 'tabletop',
    thumbnailSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="15" y="30" width="70" height="45" rx="3" fill="#1e293b"/><rect x="22" y="35" width="26" height="16" fill="#38bdf8"/><rect x="52" y="35" width="26" height="16" fill="#38bdf8"/><line x1="25" y1="62" x2="75" y2="62" stroke="#64748b" stroke-width="4"/></svg>',
    createGeometry: createAudioConsoleGeometry,
  },

  // --- 5. STAGING & STRUCTURES ---
  {
    id: 'staging_deck_2x1',
    name: 'Modular 2.0m x 1.0m Stage Deck Platform',
    category: 'staging',
    subcategory: 'Platforms',
    dimensions: { width: 2.00, height: 0.40, depth: 1.00 },
    weightKg: 32.0,
    powerWatts: 0,
    color: '#2a2d34',
    tags: ['stage', 'riser', 'deck', 'platform', '2x1'],
    description: 'Heavy duty modular stage riser with non-slip phenolic plywood surface and adjustable leg sockets.',
    mountingType: 'floor_standing',
    thumbnailSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="15" y="40" width="70" height="12" fill="#334155"/><rect x="20" y="52" width="6" height="25" fill="#64748b"/><rect x="74" y="52" width="6" height="25" fill="#64748b"/></svg>',
    createGeometry: () => {
      const { createStagePlatformGeometry } = require('./meshGenerators');
      return createStagePlatformGeometry(2.0, 1.0, 0.4);
    },
  },
  {
    id: 'staging_dj_booth',
    name: 'Professional DJ Performance Booth & Facade',
    category: 'staging',
    subcategory: 'Booths & Risers',
    dimensions: { width: 1.64, height: 1.05, depth: 0.75 },
    weightKg: 38.0,
    powerWatts: 0,
    color: '#141517',
    tags: ['dj booth', 'facade', 'table', 'edm', 'club'],
    description: 'Clean matte black DJ console desk with front privacy fascia shielding audio cables.',
    mountingType: 'floor_standing',
    thumbnailSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="20" y="30" width="60" height="45" rx="3" fill="#18191c" stroke="#38bdf8" stroke-width="2"/><line x1="20" y1="50" x2="80" y2="50" stroke="#334155" stroke-width="2"/></svg>',
    createGeometry: createDJBoothGeometry,
  },
  {
    id: 'staging_crowd_barricade',
    name: 'Heavy Duty Mojo Stage Barricade',
    category: 'staging',
    subcategory: 'Barriers & Safety',
    dimensions: { width: 1.05, height: 1.15, depth: 0.90 },
    weightKg: 28.0,
    powerWatts: 0,
    color: '#9ca3af',
    tags: ['barricade', 'mojo', 'crowd control', 'front of stage', 'safety'],
    description: 'Heavy aluminum crowd barrier featuring anti-trip foot plate and security officer footstep.',
    mountingType: 'floor_standing',
    thumbnailSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="20" y="20" width="60" height="55" fill="none" stroke="#9ca3af" stroke-width="4"/><line x1="20" y1="75" x2="60" y2="75" stroke="#6b7280" stroke-width="6"/></svg>',
    createGeometry: createCrowdBarricadeGeometry,
  },

  // --- 6. EVENT DÉCOR & WEDDING ---
  {
    id: 'decor_floral_arch',
    name: 'Hexagonal Wedding Floral Arch Arbor',
    category: 'decor',
    subcategory: 'Décor Structures',
    dimensions: { width: 2.40, height: 2.60, depth: 0.40 },
    weightKg: 18.0,
    powerWatts: 0,
    color: '#d4af37',
    tags: ['wedding', 'arch', 'floral', 'arbor', 'reception', 'ceremony'],
    description: 'Gold-finish metallic hexagonal wedding ceremony arch with floral garland mount points.',
    mountingType: 'floor_standing',
    thumbnailSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><polygon points="50,15 80,35 80,70 50,90 20,70 20,35" fill="none" stroke="#eab308" stroke-width="4"/></svg>',
    createGeometry: createFloralArchGeometry,
  },
  {
    id: 'decor_banquet_table_10',
    name: '10-Person Round Banquet Table & Chairs',
    category: 'decor',
    subcategory: 'Furniture',
    dimensions: { width: 2.70, height: 0.90, depth: 2.70 },
    weightKg: 65.0,
    powerWatts: 0,
    color: '#f8fafc',
    tags: ['banquet table', 'chairs', 'wedding reception', 'dinner', 'round table'],
    description: 'Round 1.8m banquet table dressed in white linen with 8 surrounding Chiavari event chairs.',
    mountingType: 'floor_standing',
    thumbnailSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="24" fill="#f8fafc" stroke="#94a3b8" stroke-width="2"/><circle cx="50" cy="18" r="6" fill="#cbd5e1"/><circle cx="50" cy="82" r="6" fill="#cbd5e1"/><circle cx="18" cy="50" r="6" fill="#cbd5e1"/><circle cx="82" cy="50" r="6" fill="#cbd5e1"/></svg>',
    createGeometry: createBanquetTableGeometry,
  },

  // --- 7. CONTROL, POWER & NETWORKING ---
  {
    id: 'power_grandma_console',
    name: 'grandMA3 Style Advanced Lighting Console',
    category: 'power_control',
    subcategory: 'Lighting Consoles',
    dimensions: { width: 1.10, height: 0.40, depth: 0.65 },
    weightKg: 44.0,
    powerWatts: 300,
    color: '#1a1b1e',
    tags: ['grandma', 'lighting desk', 'dmx', 'artnet', 'programming'],
    description: 'Flagship lighting programming console with dual motorized widescreen touchscreens and command keypad.',
    mountingType: 'tabletop',
    thumbnailSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="15" y="32" width="70" height="42" rx="3" fill="#18191c"/><rect x="20" y="37" width="28" height="18" fill="#38bdf8"/><rect x="52" y="37" width="28" height="18" fill="#38bdf8"/><line x1="20" y1="62" x2="80" y2="62" stroke="#e87a24" stroke-width="3"/></svg>',
    createGeometry: createLightingConsoleGeometry,
  },
  {
    id: 'power_distro_63a',
    name: '63A 3-Phase Power Distribution Distro Rack',
    category: 'power_control',
    subcategory: 'Power Distros',
    dimensions: { width: 0.55, height: 0.75, depth: 0.55 },
    weightKg: 36.0,
    powerWatts: 0,
    color: '#1e293b',
    tags: ['power distro', '63a', '3 phase', 'socapex', 'electricity'],
    description: 'Flightcase-mounted main stage electrical distribution unit with RCD breakers and multi-channel Socapex outputs.',
    mountingType: 'floor_standing',
    thumbnailSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="25" y="25" width="50" height="55" rx="3" fill="#1e293b"/><circle cx="50" cy="40" r="8" fill="#ef4444"/><rect x="35" y="55" width="30" height="15" fill="#475569"/></svg>',
    createGeometry: createPowerDistroGeometry,
  },
  {
    id: 'power_flightcase_large',
    name: 'Touring Wheeled ATA Road Flight Case',
    category: 'power_control',
    subcategory: 'Flight Cases',
    dimensions: { width: 0.85, height: 0.55, depth: 0.60 },
    weightKg: 24.0,
    powerWatts: 0,
    color: '#1f242d',
    tags: ['flight case', 'road case', 'trunk', 'touring', 'hardware'],
    description: 'Heavy duty plywood equipment transport trunk featuring steel ball corners and recessed butterfly latches.',
    mountingType: 'floor_standing',
    thumbnailSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="20" y="30" width="60" height="40" rx="3" fill="#24262b" stroke="#64748b" stroke-width="2"/><circle cx="30" cy="74" r="4" fill="#94a3b8"/><circle cx="70" cy="74" r="4" fill="#94a3b8"/></svg>',
    createGeometry: createFlightCaseGeometry,
  },
];

/**
 * Searches and filters the 3D equipment catalog
 */
export function queryEquipmentCatalog(
  category: EquipmentCategory | 'all',
  searchQuery: string = '',
  subcategory?: string
): EquipmentTemplate[] {
  return EVENT_EQUIPMENT_TEMPLATES.filter((item) => {
    // Category match
    if (category !== 'all' && item.category !== category) return false;
    // Subcategory match
    if (subcategory && item.subcategory !== subcategory) return false;
    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchTags = item.tags.some((t) => t.toLowerCase().includes(q));
      const matchSub = item.subcategory.toLowerCase().includes(q);
      return matchName || matchDesc || matchTags || matchSub;
    }
    return true;
  });
}
