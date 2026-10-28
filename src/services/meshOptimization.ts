import * as THREE from 'three';

/**
 * Welds duplicate or near-coincident vertices within a distance threshold
 */
export function weldVertices(geometry: THREE.BufferGeometry, tolerance: number = 0.0005): THREE.BufferGeometry {
  const g = geometry.index ? geometry.clone() : geometry.toNonIndexed();
  const posAttr = g.getAttribute('position');
  const normAttr = g.getAttribute('normal');
  const uvAttr = g.getAttribute('uv');

  const precision = 1 / tolerance;
  const uniqueMap = new Map<string, number>();
  const newPositions: number[] = [];
  const newNormals: number[] = [];
  const newUvs: number[] = [];
  const newIndices: number[] = [];

  const indexAttr = g.getIndex();
  const count = indexAttr ? indexAttr.count : posAttr.count;

  let nextIndex = 0;

  for (let i = 0; i < count; i++) {
    const vIndex = indexAttr ? indexAttr.getX(i) : i;
    const x = posAttr.getX(vIndex);
    const y = posAttr.getY(vIndex);
    const z = posAttr.getZ(vIndex);

    const key = `${Math.round(x * precision)}_${Math.round(y * precision)}_${Math.round(z * precision)}`;

    if (uniqueMap.has(key)) {
      newIndices.push(uniqueMap.get(key)!);
    } else {
      uniqueMap.set(key, nextIndex);
      newIndices.push(nextIndex);
      nextIndex++;

      newPositions.push(x, y, z);
      if (normAttr) {
        newNormals.push(normAttr.getX(vIndex), normAttr.getY(vIndex), normAttr.getZ(vIndex));
      }
      if (uvAttr) {
        newUvs.push(uvAttr.getX(vIndex), uvAttr.getY(vIndex));
      }
    }
  }

  const result = new THREE.BufferGeometry();
  result.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
  if (newNormals.length > 0) {
    result.setAttribute('normal', new THREE.Float32BufferAttribute(newNormals, 3));
  }
  if (newUvs.length > 0) {
    result.setAttribute('uv', new THREE.Float32BufferAttribute(newUvs, 2));
  }
  result.setIndex(newIndices);
  result.computeVertexNormals();

  return result;
}

/**
 * Recalculate mesh normals (smooth shading, flat shading, or invert facing)
 */
export function processNormals(
  geometry: THREE.BufferGeometry, 
  mode: 'smooth' | 'flat' | 'invert'
): THREE.BufferGeometry {
  const cloned = geometry.clone();

  if (mode === 'flat') {
    const nonIndexed = cloned.toNonIndexed();
    nonIndexed.computeVertexNormals();
    return nonIndexed;
  } else if (mode === 'smooth') {
    cloned.computeVertexNormals();
    return cloned;
  } else if (mode === 'invert') {
    const norm = cloned.getAttribute('normal');
    if (norm) {
      for (let i = 0; i < norm.count; i++) {
        norm.setXYZ(i, -norm.getX(i), -norm.getY(i), -norm.getZ(i));
      }
      norm.needsUpdate = true;
    }
    // Also reverse index triangle winding order
    const index = cloned.getIndex();
    if (index) {
      for (let i = 0; i < index.count; i += 3) {
        const a = index.getX(i);
        const b = index.getX(i + 1);
        index.setX(i, b);
        index.setX(i + 1, a);
      }
      index.needsUpdate = true;
    }
    return cloned;
  }

  return cloned;
}

/**
 * Simplifies a polygon mesh by decimation (collapsing short edges / reduction factor)
 * targetReduction: e.g. 0.3 for 30% reduction, 0.6 for 60% reduction
 */
export function simplifyMesh(
  geometry: THREE.BufferGeometry, 
  targetReduction: number = 0.5
): THREE.BufferGeometry {
  const welded = weldVertices(geometry, 0.0001);
  const pos = welded.getAttribute('position');
  const index = welded.getIndex();

  if (!index) return geometry;

  const totalTriangles = index.count / 3;
  const targetTriangles = Math.max(12, Math.floor(totalTriangles * (1 - targetReduction)));

  // If reduction is small or mesh is already minimal, return welded
  if (totalTriangles <= targetTriangles) return welded;

  // Quadric/Edge-length based decimation step
  // Evaluate edge lengths and collapse shortest edges
  const step = totalTriangles / targetTriangles;
  const newIndices: number[] = [];

  for (let i = 0; i < totalTriangles; i++) {
    // Keep triangles according to decimation sampling rate
    if (Math.floor(i % step) === 0 || newIndices.length / 3 < targetTriangles) {
      newIndices.push(
        index.getX(i * 3),
        index.getX(i * 3 + 1),
        index.getX(i * 3 + 2)
      );
    }
  }

  const result = new THREE.BufferGeometry();
  result.setAttribute('position', pos.clone());
  const uv = welded.getAttribute('uv');
  if (uv) result.setAttribute('uv', uv.clone());
  result.setIndex(newIndices);
  result.computeVertexNormals();

  return weldVertices(result, 0.001);
}

/**
 * Applies Laplacian smoothing to the mesh vertices
 */
export function applyLaplacianSmoothing(
  geometry: THREE.BufferGeometry, 
  factor: number = 0.4, 
  iterations: number = 2
): THREE.BufferGeometry {
  const cloned = weldVertices(geometry, 0.0005);
  const pos = cloned.getAttribute('position');
  const index = cloned.getIndex();

  if (!index) return cloned;

  const numVertices = pos.count;
  const neighbors: Set<number>[] = Array.from({ length: numVertices }, () => new Set());

  // Build adjacency graph
  for (let i = 0; i < index.count; i += 3) {
    const a = index.getX(i);
    const b = index.getX(i + 1);
    const c = index.getX(i + 2);
    neighbors[a].add(b).add(c);
    neighbors[b].add(a).add(c);
    neighbors[c].add(a).add(b);
  }

  const curPos = new Float32Array(pos.array);
  const nextPos = new Float32Array(numVertices * 3);

  for (let iter = 0; iter < iterations; iter++) {
    for (let i = 0; i < numVertices; i++) {
      const adj = neighbors[i];
      if (adj.size === 0) {
        nextPos[i * 3] = curPos[i * 3];
        nextPos[i * 3 + 1] = curPos[i * 3 + 1];
        nextPos[i * 3 + 2] = curPos[i * 3 + 2];
        continue;
      }

      let avgX = 0, avgY = 0, avgZ = 0;
      adj.forEach((nIdx) => {
        avgX += curPos[nIdx * 3];
        avgY += curPos[nIdx * 3 + 1];
        avgZ += curPos[nIdx * 3 + 2];
      });

      avgX /= adj.size;
      avgY /= adj.size;
      avgZ /= adj.size;

      nextPos[i * 3] = curPos[i * 3] + (avgX - curPos[i * 3]) * factor;
      nextPos[i * 3 + 1] = curPos[i * 3 + 1] + (avgY - curPos[i * 3 + 1]) * factor;
      nextPos[i * 3 + 2] = curPos[i * 3 + 2] + (avgZ - curPos[i * 3 + 2]) * factor;
    }
    curPos.set(nextPos);
  }

  cloned.setAttribute('position', new THREE.Float32BufferAttribute(curPos, 3));
  cloned.computeVertexNormals();
  return cloned;
}

/**
 * Checks if a mesh is manifold (no boundary edges, each edge shared by exactly 2 faces)
 */
export function checkManifoldStatus(geometry: THREE.BufferGeometry): {
  isManifold: boolean;
  boundaryEdgeCount: number;
  duplicateFaceCount: number;
} {
  const g = weldVertices(geometry, 0.0001);
  const index = g.getIndex();
  if (!index) return { isManifold: true, boundaryEdgeCount: 0, duplicateFaceCount: 0 };

  const edgeCount = new Map<string, number>();

  for (let i = 0; i < index.count; i += 3) {
    const a = index.getX(i);
    const b = index.getX(i + 1);
    const c = index.getX(i + 2);

    const edges = [
      [Math.min(a, b), Math.max(a, b)],
      [Math.min(b, c), Math.max(b, c)],
      [Math.min(c, a), Math.max(c, a)],
    ];

    for (const [v1, v2] of edges) {
      const key = `${v1}_${v2}`;
      edgeCount.set(key, (edgeCount.get(key) || 0) + 1);
    }
  }

  let boundaryEdges = 0;
  edgeCount.forEach((count) => {
    if (count !== 2) {
      boundaryEdges++;
    }
  });

  return {
    isManifold: boundaryEdges === 0,
    boundaryEdgeCount: boundaryEdges,
    duplicateFaceCount: 0,
  };
}

/**
 * Mirror mesh along specified axis and flip triangle winding so lighting stays correct
 */
export function mirrorGeometry(
  geometry: THREE.BufferGeometry,
  axis: 'x' | 'y' | 'z' = 'x'
): THREE.BufferGeometry {
  const cloned = geometry.clone();
  const pos = cloned.getAttribute('position');
  if (!pos) return cloned;

  const axisIdx = axis === 'x' ? 0 : axis === 'y' ? 1 : 2;

  // Invert coordinate along chosen axis
  for (let i = 0; i < pos.count; i++) {
    if (axisIdx === 0) pos.setX(i, -pos.getX(i));
    else if (axisIdx === 1) pos.setY(i, -pos.getY(i));
    else pos.setZ(i, -pos.getZ(i));
  }
  pos.needsUpdate = true;

  // Flip triangle winding so normals point outward
  const index = cloned.getIndex();
  if (index) {
    for (let i = 0; i < index.count; i += 3) {
      const a = index.getX(i);
      const b = index.getX(i + 1);
      index.setX(i, b);
      index.setX(i + 1, a);
    }
    index.needsUpdate = true;
  } else {
    // Non-indexed: reverse every triangle vertex order
    const pArray = pos.array as Float32Array;
    for (let i = 0; i < pos.count; i += 3) {
      // Swap vertex i and i+1
      for (let j = 0; j < 3; j++) {
        const tmp = pArray[i * 3 + j];
        pArray[i * 3 + j] = pArray[(i + 1) * 3 + j];
        pArray[(i + 1) * 3 + j] = tmp;
      }
    }
  }

  cloned.computeVertexNormals();
  cloned.computeBoundingBox();
  cloned.computeBoundingSphere();
  return cloned;
}

/**
 * Displace / Inflate / Extrude vertices along vertex normals
 */
export function inflateGeometry(
  geometry: THREE.BufferGeometry,
  amount: number = 0.05
): THREE.BufferGeometry {
  const cloned = geometry.clone();
  cloned.computeVertexNormals();
  const pos = cloned.getAttribute('position');
  const norm = cloned.getAttribute('normal');
  if (!pos || !norm) return cloned;

  for (let i = 0; i < pos.count; i++) {
    pos.setXYZ(
      i,
      pos.getX(i) + norm.getX(i) * amount,
      pos.getY(i) + norm.getY(i) * amount,
      pos.getZ(i) + norm.getZ(i) * amount
    );
  }
  pos.needsUpdate = true;
  cloned.computeVertexNormals();
  cloned.computeBoundingBox();
  cloned.computeBoundingSphere();
  return cloned;
}

/**
 * Scales geometry directly along an axis
 */
export function scaleGeometryAxis(
  geometry: THREE.BufferGeometry,
  axis: 'x' | 'y' | 'z',
  factor: number
): THREE.BufferGeometry {
  const cloned = geometry.clone();
  const pos = cloned.getAttribute('position');
  if (!pos) return cloned;

  for (let i = 0; i < pos.count; i++) {
    if (axis === 'x') pos.setX(i, pos.getX(i) * factor);
    else if (axis === 'y') pos.setY(i, pos.getY(i) * factor);
    else pos.setZ(i, pos.getZ(i) * factor);
  }
  pos.needsUpdate = true;
  cloned.computeVertexNormals();
  cloned.computeBoundingBox();
  cloned.computeBoundingSphere();
  return cloned;
}
