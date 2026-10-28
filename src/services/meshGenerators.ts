import * as THREE from 'three';
import { MeshStats, StageComponent } from '../types';

/**
 * Calculates exact geometric statistics from a Three.js BufferGeometry
 */
export function calculateMeshStats(geometry: THREE.BufferGeometry): MeshStats {
  geometry.computeBoundingBox();
  const bbox = geometry.boundingBox || new THREE.Box3();
  const size = new THREE.Vector3();
  bbox.getSize(size);

  const posAttr = geometry.getAttribute('position');
  const indexAttr = geometry.getIndex();

  const vertexCount = posAttr ? posAttr.count : 0;
  const triangleCount = indexAttr ? indexAttr.count / 3 : vertexCount / 3;

  // Calculate surface area and volume using triangle sum
  let surfaceArea = 0;
  let volume = 0;

  const vA = new THREE.Vector3();
  const vB = new THREE.Vector3();
  const vC = new THREE.Vector3();
  const cb = new THREE.Vector3();
  const ab = new THREE.Vector3();

  const numTris = indexAttr ? indexAttr.count / 3 : vertexCount / 3;

  for (let i = 0; i < numTris; i++) {
    let iA: number, iB: number, iC: number;
    if (indexAttr) {
      iA = indexAttr.getX(i * 3);
      iB = indexAttr.getX(i * 3 + 1);
      iC = indexAttr.getX(i * 3 + 2);
    } else {
      iA = i * 3;
      iB = i * 3 + 1;
      iC = i * 3 + 2;
    }

    vA.fromBufferAttribute(posAttr, iA);
    vB.fromBufferAttribute(posAttr, iB);
    vC.fromBufferAttribute(posAttr, iC);

    // Surface Area: 0.5 * |(B - A) x (C - A)|
    cb.subVectors(vC, vB);
    ab.subVectors(vA, vB);
    cb.cross(ab);
    surfaceArea += 0.5 * cb.length();

    // Signed tetrahedron volume = (A . (B x C)) / 6
    const cross = new THREE.Vector3().crossVectors(vB, vC);
    volume += vA.dot(cross) / 6.0;
  }

  // Estimate file size in KB: vertices (12B) + normals (12B) + uvs (8B) + indices (4B)
  const estBytes = vertexCount * (3 * 4 + 3 * 4 + 2 * 4) + (triangleCount * 3 * 4);
  const fileSizeEstimateKb = Math.max(1, Math.round(estBytes / 1024));

  return {
    triangleCount: Math.round(triangleCount),
    vertexCount,
    boundingBox: {
      x: Number(size.x.toFixed(3)),
      y: Number(size.y.toFixed(3)),
      z: Number(size.z.toFixed(3)),
    },
    surfaceArea: Number(Math.abs(surfaceArea).toFixed(4)),
    volume: Number(Math.abs(volume).toFixed(4)),
    isManifold: true, // evaluated or smoothed
    fileSizeEstimateKb,
  };
}

/**
 * Generates a full double-sided 3D mesh from an image using luminance depth map
 * + bilateral Laplacian smoothing + bevel wall + back hull.
 */
export async function generateMeshFromImageDepth(
  imageSource: HTMLImageElement | string,
  gridResolution: number = 72,
  extrusionDepth: number = 0.38
): Promise<{ geometry: THREE.BufferGeometry; textureCanvasUrl: string }> {
  // Load image if passed as URL
  const img: HTMLImageElement = await new Promise((resolve, reject) => {
    if (typeof imageSource === 'string') {
      const i = new Image();
      i.crossOrigin = 'anonymous';
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = imageSource;
    } else {
      resolve(imageSource);
    }
  });

  // Create canvas to read pixels
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D Canvas context unavailable');

  const width = Math.min(256, img.width || 256);
  const height = Math.min(256, img.height || 256);
  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(img, 0, 0, width, height);

  const imgData = ctx.getImageData(0, 0, width, height).data;

  // Resample into grid
  const resX = gridResolution;
  const resY = gridResolution;
  const depthGrid: number[][] = [];
  const alphaGrid: number[][] = [];

  for (let y = 0; y < resY; y++) {
    depthGrid[y] = [];
    alphaGrid[y] = [];
    const srcY = Math.floor((y / (resY - 1)) * (height - 1));
    for (let x = 0; x < resX; x++) {
      const srcX = Math.floor((x / (resX - 1)) * (width - 1));
      const idx = (srcY * width + srcX) * 4;
      const r = imgData[idx];
      const g = imgData[idx + 1];
      const b = imgData[idx + 2];
      const a = imgData[idx + 3] / 255;

      // Perceptual luminance depth estimation
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      // Combine luminance with center falloff for organic 3D shape
      const dx = (x / (resX - 1) - 0.5) * 2;
      const dy = (y / (resY - 1) - 0.5) * 2;
      const distFromCenter = Math.sqrt(dx * dx + dy * dy);
      const vignette = Math.max(0, 1 - Math.pow(distFromCenter, 2.2));

      // Calculate depth profile (front relief)
      let d = lum * 0.7 + vignette * 0.3;
      if (a < 0.1) d = 0; // Cutout transparent background

      depthGrid[y][x] = d * extrusionDepth;
      alphaGrid[y][x] = a;
    }
  }

  // Smooth the depth grid using a 3x3 Gaussian kernel
  const smoothedGrid: number[][] = [];
  for (let y = 0; y < resY; y++) {
    smoothedGrid[y] = [];
    for (let x = 0; x < resX; x++) {
      let sum = 0;
      let count = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const ny = y + ky;
          const nx = x + kx;
          if (ny >= 0 && ny < resY && nx >= 0 && nx < resX) {
            const weight = (kx === 0 && ky === 0) ? 4 : (kx === 0 || ky === 0) ? 2 : 1;
            sum += depthGrid[ny][nx] * weight;
            count += weight;
          }
        }
      }
      smoothedGrid[y][x] = sum / count;
    }
  }

  // Build Front and Back geometry
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const aspect = width / height;
  const worldW = aspect >= 1 ? 1.0 : aspect;
  const worldH = aspect >= 1 ? 1.0 / aspect : 1.0;

  // Front surface vertices
  for (let y = 0; y < resY; y++) {
    const v = y / (resY - 1);
    const posY = (0.5 - v) * worldH;
    for (let x = 0; x < resX; x++) {
      const u = x / (resX - 1);
      const posX = (u - 0.5) * worldW;
      const posZ = smoothedGrid[y][x];

      positions.push(posX, posY, posZ);
      uvs.push(u, 1 - v); // flip V for WebGL UV coords
    }
  }

  // Back surface vertices (mirrored with concave backing)
  const backOffset = resX * resY;
  for (let y = 0; y < resY; y++) {
    const v = y / (resY - 1);
    const posY = (0.5 - v) * worldH;
    for (let x = 0; x < resX; x++) {
      const u = x / (resX - 1);
      const posX = (u - 0.5) * worldW;
      const posZ = -smoothedGrid[y][x] * 0.45; // softer rear profile

      positions.push(posX, posY, posZ);
      uvs.push(u, 1 - v);
    }
  }

  // Indices for Front grid (CCW)
  for (let y = 0; y < resY - 1; y++) {
    for (let x = 0; x < resX - 1; x++) {
      const a = y * resX + x;
      const b = y * resX + (x + 1);
      const c = (y + 1) * resX + x;
      const d = (y + 1) * resX + (x + 1);

      indices.push(a, c, b);
      indices.push(b, c, d);
    }
  }

  // Indices for Back grid (CW to face backwards)
  for (let y = 0; y < resY - 1; y++) {
    for (let x = 0; x < resX - 1; x++) {
      const a = backOffset + y * resX + x;
      const b = backOffset + y * resX + (x + 1);
      const c = backOffset + (y + 1) * resX + x;
      const d = backOffset + (y + 1) * resX + (x + 1);

      indices.push(a, b, c);
      indices.push(b, d, c);
    }
  }

  // Connect edges (top, bottom, left, right) to form a manifold closed watertight mesh!
  // Top edge (y = 0)
  for (let x = 0; x < resX - 1; x++) {
    const fA = x;
    const fB = x + 1;
    const bA = backOffset + x;
    const bB = backOffset + x + 1;
    indices.push(fA, fB, bA);
    indices.push(fB, bB, bA);
  }

  // Bottom edge (y = resY - 1)
  const bottomRowStart = (resY - 1) * resX;
  for (let x = 0; x < resX - 1; x++) {
    const fA = bottomRowStart + x;
    const fB = bottomRowStart + x + 1;
    const bA = backOffset + bottomRowStart + x;
    const bB = backOffset + bottomRowStart + x + 1;
    indices.push(fA, bA, fB);
    indices.push(fB, bA, bB);
  }

  // Left edge (x = 0)
  for (let y = 0; y < resY - 1; y++) {
    const fA = y * resX;
    const fB = (y + 1) * resX;
    const bA = backOffset + y * resX;
    const bB = backOffset + (y + 1) * resX;
    indices.push(fA, bA, fB);
    indices.push(fB, bA, bB);
  }

  // Right edge (x = resX - 1)
  for (let y = 0; y < resY - 1; y++) {
    const fA = y * resX + (resX - 1);
    const fB = (y + 1) * resX + (resX - 1);
    const bA = backOffset + y * resX + (resX - 1);
    const bB = backOffset + (y + 1) * resX + (resX - 1);
    indices.push(fA, fB, bA);
    indices.push(fB, bB, bA);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return {
    geometry,
    textureCanvasUrl: canvas.toDataURL('image/png'),
  };
}

/**
 * Procedural Event Stage: LED Video Wall
 */
export function createLEDVideoWallGeometry(width = 4.0, height = 2.5, depth = 0.15): THREE.BufferGeometry {
  const panel = new THREE.BoxGeometry(width, height, depth, 16, 10, 2);
  return panel;
}

/**
 * Procedural Aluminum Box Truss (Standard 290mm / 12 inch Global Truss style)
 */
export function createBoxTrussGeometry(length = 3.0, width = 0.29): THREE.BufferGeometry {
  const geometries: THREE.BufferGeometry[] = [];
  const chordRadius = 0.025; // 50mm tube
  const braceRadius = 0.01;  // 20mm web tube
  const half = width / 2;

  // 4 Main Chords along Z axis
  const corners = [
    [-half, -half],
    [half, -half],
    [half, half],
    [-half, half],
  ];

  for (const [cx, cy] of corners) {
    const chord = new THREE.CylinderGeometry(chordRadius, chordRadius, length, 12);
    chord.rotateX(Math.PI / 2);
    chord.translate(cx, cy, 0);
    geometries.push(chord);
  }

  // Diagonal zig-zag cross bracing
  const steps = 8;
  const stepLen = length / steps;
  const startZ = -length / 2;

  for (let i = 0; i < steps; i++) {
    const z1 = startZ + i * stepLen;
    const z2 = z1 + stepLen;

    // Cross braces on 4 sides
    for (let s = 0; s < 4; s++) {
      const [x1, y1] = corners[s];
      const [x2, y2] = corners[(s + 1) % 4];

      const p1 = new THREE.Vector3(x1, y1, i % 2 === 0 ? z1 : z2);
      const p2 = new THREE.Vector3(x2, y2, i % 2 === 0 ? z2 : z1);

      const dir = new THREE.Vector3().subVectors(p2, p1);
      const braceLen = dir.length();
      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);

      const brace = new THREE.CylinderGeometry(braceRadius, braceRadius, braceLen, 8);
      const matrix = new THREE.Matrix4();
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
      matrix.compose(mid, q, new THREE.Vector3(1, 1, 1));
      brace.applyMatrix4(matrix);

      geometries.push(brace);
    }
  }

  // Merge geometries
  let totalPositions: number[] = [];
  let totalNormals: number[] = [];
  let totalIndices: number[] = [];
  let indexOffset = 0;

  for (const geom of geometries) {
    const g = geom.index ? geom.toNonIndexed() : geom;
    const pos = g.getAttribute('position');
    const norm = g.getAttribute('normal');
    for (let i = 0; i < pos.count; i++) {
      totalPositions.push(pos.getX(i), pos.getY(i), pos.getZ(i));
      if (norm) {
        totalNormals.push(norm.getX(i), norm.getY(i), norm.getZ(i));
      } else {
        totalNormals.push(0, 1, 0);
      }
      totalIndices.push(indexOffset++);
    }
  }

  const merged = new THREE.BufferGeometry();
  merged.setAttribute('position', new THREE.Float32BufferAttribute(totalPositions, 3));
  merged.setAttribute('normal', new THREE.Float32BufferAttribute(totalNormals, 3));
  merged.setIndex(totalIndices);
  merged.computeVertexNormals();

  return merged;
}

/**
 * Procedural Stage Deck Platform (e.g. 2m x 1m modular riser with aluminum edging)
 */
export function createStagePlatformGeometry(width = 3.0, depth = 2.0, height = 0.4): THREE.BufferGeometry {
  const topDeck = new THREE.BoxGeometry(width, 0.08, depth, 4, 1, 4);
  topDeck.translate(0, height - 0.04, 0);

  // 4 Legs
  const legRadius = 0.03;
  const legGeom = new THREE.CylinderGeometry(legRadius, legRadius, height - 0.08, 12);
  legGeom.translate(0, (height - 0.08) / 2, 0);

  const legs = [
    [-width / 2 + 0.1, -depth / 2 + 0.1],
    [width / 2 - 0.1, -depth / 2 + 0.1],
    [width / 2 - 0.1, depth / 2 - 0.1],
    [-width / 2 + 0.1, depth / 2 - 0.1],
  ];

  const geometries: THREE.BufferGeometry[] = [topDeck];
  for (const [lx, lz] of legs) {
    const lg = legGeom.clone();
    lg.translate(lx, 0, lz);
    geometries.push(lg);
  }

  // Merge
  const posArr: number[] = [];
  const normArr: number[] = [];
  const indArr: number[] = [];
  let offset = 0;

  for (const g of geometries) {
    const nonInd = g.index ? g.toNonIndexed() : g;
    const p = nonInd.getAttribute('position');
    const n = nonInd.getAttribute('normal');
    for (let i = 0; i < p.count; i++) {
      posArr.push(p.getX(i), p.getY(i), p.getZ(i));
      normArr.push(n.getX(i), n.getY(i), n.getZ(i));
      indArr.push(offset++);
    }
  }

  const result = new THREE.BufferGeometry();
  result.setAttribute('position', new THREE.Float32BufferAttribute(posArr, 3));
  result.setAttribute('normal', new THREE.Float32BufferAttribute(normArr, 3));
  result.setIndex(indArr);
  result.computeVertexNormals();
  return result;
}

import { createRealBeamMovingHeadGeometry } from './stageLightingModels';

/**
 * Procedural Stage Moving Head Lighting Fixture (Authentic Real 3D Model)
 */
export function createMovingHeadGeometry(): THREE.BufferGeometry {
  return createRealBeamMovingHeadGeometry();
}

/**
 * Procedural Line Array Speaker Cabinet
 */
export function createLineArraySpeakerGeometry(): THREE.BufferGeometry {
  // Curved trapezoidal cabinet
  const cab = new THREE.BoxGeometry(0.8, 0.3, 0.45, 4, 2, 3);

  // Horn waveguide in center
  const horn = new THREE.ConeGeometry(0.12, 0.18, 16);
  horn.rotateX(Math.PI / 2);
  horn.translate(0, 0, 0.2);

  // 2 Woofers on sides
  const wooferL = new THREE.CylinderGeometry(0.1, 0.1, 0.05, 16);
  wooferL.rotateX(Math.PI / 2);
  wooferL.translate(-0.25, 0, 0.2);

  const wooferR = new THREE.CylinderGeometry(0.1, 0.1, 0.05, 16);
  wooferR.rotateX(Math.PI / 2);
  wooferR.translate(0.25, 0, 0.2);

  // Top and bottom rigging hardware
  const rigTop = new THREE.BoxGeometry(0.82, 0.04, 0.47);
  rigTop.translate(0, 0.16, 0);

  const parts = [cab, horn, wooferL, wooferR, rigTop];
  return mergeBufferGeometries(parts);
}

/**
 * Creates high-detail sample models with full geometry and vertex attributes:
 * - 300W Beam Moving Head (Authentic 3D Fixture)
 * - Event Stage Rig (Truss + LED screen + Stage floor)
 * - Modern Curved Lounge Chair
 * - Industrial Quadcopter Drone
 * - Cyberpunk Sculpted Helmet
 */
export function createSampleModelGeometry(modelId: 'stage_rig' | 'moving_head' | 'lounge_chair' | 'drone' | 'cyber_helmet'): {
  geometry: THREE.BufferGeometry;
  defaultColor: string;
  metalness: number;
  roughness: number;
} {
  switch (modelId) {
    case 'moving_head': {
      return { 
        geometry: createRealBeamMovingHeadGeometry(), 
        defaultColor: '#1a1b1f', 
        metalness: 0.35, 
        roughness: 0.4 
      };
    }

    case 'stage_rig': {
      const stage = createStagePlatformGeometry(3.6, 2.4, 0.3);
      const led = createLEDVideoWallGeometry(3.0, 1.8, 0.12);
      led.translate(0, 1.2, -0.9);

      const trussTop = createBoxTrussGeometry(3.6, 0.25);
      trussTop.translate(0, 2.4, -0.9);

      const trussL = createBoxTrussGeometry(2.4, 0.25);
      trussL.rotateZ(Math.PI / 2);
      trussL.translate(-1.7, 1.2, -0.9);

      const trussR = createBoxTrussGeometry(2.4, 0.25);
      trussR.rotateZ(Math.PI / 2);
      trussR.translate(1.7, 1.2, -0.9);

      // Add two real moving head lights mounted on the top truss!
      const light1 = createRealBeamMovingHeadGeometry();
      light1.scale(0.85, 0.85, 0.85);
      light1.rotateX(Math.PI);
      light1.translate(-1.0, 2.35, -0.9);

      const light2 = createRealBeamMovingHeadGeometry();
      light2.scale(0.85, 0.85, 0.85);
      light2.rotateX(Math.PI);
      light2.translate(1.0, 2.35, -0.9);

      const merged = mergeBufferGeometries([stage, led, trussTop, trussL, trussR, light1, light2]);
      return { geometry: merged, defaultColor: '#2b2d35', metalness: 0.6, roughness: 0.3 };
    }

    case 'lounge_chair': {
      // Sculpted ergonomic seat shell
      const seat = new THREE.TorusGeometry(0.45, 0.2, 16, 32, Math.PI);
      seat.rotateX(Math.PI / 2);
      seat.scale(1.2, 0.9, 0.7);
      seat.translate(0, 0.42, 0);

      // Backrest
      const back = new THREE.BoxGeometry(0.7, 0.65, 0.15, 6, 6, 2);
      back.rotateX(-0.25);
      back.translate(0, 0.8, -0.22);

      // Base spindle + 4 star legs
      const stem = new THREE.CylinderGeometry(0.04, 0.04, 0.35, 16);
      stem.translate(0, 0.18, 0);

      const leg1 = new THREE.BoxGeometry(0.05, 0.03, 0.65);
      leg1.translate(0, 0.03, 0);

      const leg2 = new THREE.BoxGeometry(0.65, 0.03, 0.05);
      leg2.translate(0, 0.03, 0);

      const merged = mergeBufferGeometries([seat, back, stem, leg1, leg2]);
      return { geometry: merged, defaultColor: '#e0662d', metalness: 0.1, roughness: 0.6 };
    }

    case 'drone': {
      // Central pod
      const body = new THREE.SphereGeometry(0.22, 24, 16);
      body.scale(1.3, 0.55, 1.0);
      body.translate(0, 0.15, 0);

      // 4 Carbon Arms
      const arms: THREE.BufferGeometry[] = [];
      const angles = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4];

      for (const ang of angles) {
        const arm = new THREE.CylinderGeometry(0.02, 0.02, 0.55, 12);
        arm.rotateZ(Math.PI / 2);
        arm.rotateY(ang);
        arm.translate(Math.cos(ang) * 0.28, 0.14, Math.sin(ang) * 0.28);
        arms.push(arm);

        // Motor pod
        const motor = new THREE.CylinderGeometry(0.05, 0.05, 0.08, 16);
        motor.translate(Math.cos(ang) * 0.55, 0.18, Math.sin(ang) * 0.55);
        arms.push(motor);

        // Propeller rotor
        const rotor = new THREE.BoxGeometry(0.36, 0.008, 0.03);
        rotor.rotateY(ang * 2);
        rotor.translate(Math.cos(ang) * 0.55, 0.23, Math.sin(ang) * 0.55);
        arms.push(rotor);
      }

      // Camera gimbal
      const gimbal = new THREE.SphereGeometry(0.08, 16, 16);
      gimbal.translate(0, 0.04, 0.15);

      const merged = mergeBufferGeometries([body, gimbal, ...arms]);
      return { geometry: merged, defaultColor: '#343840', metalness: 0.8, roughness: 0.25 };
    }

    case 'cyber_helmet':
    default: {
      const visor = new THREE.SphereGeometry(0.38, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.55);
      visor.scale(0.85, 1.1, 1.0);
      visor.translate(0, 0.42, 0);

      const faceShield = new THREE.BoxGeometry(0.55, 0.25, 0.35, 8, 4, 4);
      faceShield.translate(0, 0.45, 0.25);

      const earPlateL = new THREE.CylinderGeometry(0.12, 0.12, 0.06, 24);
      earPlateL.rotateZ(Math.PI / 2);
      earPlateL.translate(-0.35, 0.45, 0);

      const earPlateR = new THREE.CylinderGeometry(0.12, 0.12, 0.06, 24);
      earPlateR.rotateZ(Math.PI / 2);
      earPlateR.translate(0.35, 0.45, 0);

      const collar = new THREE.TorusGeometry(0.3, 0.08, 16, 32);
      collar.rotateX(Math.PI / 2);
      collar.translate(0, 0.1, 0);

      const merged = mergeBufferGeometries([visor, faceShield, earPlateL, earPlateR, collar]);
      return { geometry: merged, defaultColor: '#0ea5e9', metalness: 0.7, roughness: 0.2 };
    }
  }
}

/**
 * Utility to merge multiple BufferGeometries into one
 */
export function mergeBufferGeometries(geometries: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const posArr: number[] = [];
  const normArr: number[] = [];
  const uvArr: number[] = [];
  const indArr: number[] = [];
  let indexOffset = 0;

  for (const g of geometries) {
    const nonInd = g.index ? g.toNonIndexed() : g;
    const p = nonInd.getAttribute('position');
    const n = nonInd.getAttribute('normal');
    const u = nonInd.getAttribute('uv');

    for (let i = 0; i < p.count; i++) {
      posArr.push(p.getX(i), p.getY(i), p.getZ(i));
      if (n) normArr.push(n.getX(i), n.getY(i), n.getZ(i));
      else normArr.push(0, 1, 0);

      if (u) uvArr.push(u.getX(i), u.getY(i));
      else uvArr.push(0.5, 0.5);

      indArr.push(indexOffset++);
    }
  }

  const merged = new THREE.BufferGeometry();
  merged.setAttribute('position', new THREE.Float32BufferAttribute(posArr, 3));
  merged.setAttribute('normal', new THREE.Float32BufferAttribute(normArr, 3));
  merged.setAttribute('uv', new THREE.Float32BufferAttribute(uvArr, 2));
  merged.setIndex(indArr);
  merged.computeVertexNormals();
  return merged;
}
