import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { 
  CameraPreset, 
  LightingPreset, 
  MaterialSettings, 
  ShadingMode, 
  TransformState, 
  ViewportSettings 
} from '../../types';
import { 
  createArticulatedMovingHead, 
  ArticulatedMovingHeadGroup 
} from '../../services/stageLightingModels';
import { 
  StageLightController, 
  StageLightState 
} from './StageLightController';
import { 
  WorkspaceEditToolbar, 
  GizmoMode, 
  GizmoSpace 
} from './WorkspaceEditToolbar';

interface ThreeViewportProps {
  geometry: THREE.BufferGeometry | null;
  materialSettings: MaterialSettings;
  transformState: TransformState;
  viewportSettings: ViewportSettings;
  textureUrl?: string;
  projectName?: string;
  isUploadedModel?: boolean;
  onCameraChange?: (preset: CameraPreset) => void;
  onSwitchFixturePreset?: (type: 'beam' | 'spot' | 'wash' | 'hybrid') => void;
  onDropImageFile?: (file: File) => void;
  onTransformChange?: (newTransform: TransformState) => void;
  onUpdateGeometry?: (newGeometry: THREE.BufferGeometry, actionLabel: string) => void;
  onQuickEdit?: (action: 'ground' | 'center' | 'mirror_x' | 'smooth' | 'decimate' | 'flip_normals' | 'inflate' | 'deflate') => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  versionStep?: number;
  totalVersions?: number;
  onChangeMaterialColor?: (color: string) => void;
  className?: string;
}

export const ThreeViewport: React.FC<ThreeViewportProps> = ({
  geometry,
  materialSettings,
  transformState,
  viewportSettings,
  textureUrl,
  projectName = '',
  isUploadedModel = false,
  onSwitchFixturePreset,
  onDropImageFile,
  onTransformChange,
  onUpdateGeometry,
  onQuickEdit,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  versionStep = 1,
  totalVersions = 1,
  onChangeMaterialColor,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Three.js instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const transformControlsRef = useRef<TransformControls | null>(null);
  const transformHelperRef = useRef<THREE.Object3D | null>(null);
  const modelMeshRef = useRef<THREE.Mesh | null>(null);
  const wireframeMeshRef = useRef<THREE.LineSegments | null>(null);
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);
  const axesHelperRef = useRef<THREE.AxesHelper | null>(null);
  const bboxHelperRef = useRef<THREE.BoxHelper | null>(null);
  const lightsGroupRef = useRef<THREE.Group | null>(null);
  const textureMapRef = useRef<THREE.Texture | null>(null);

  // In-Workspace Editing & Gizmo State
  const [gizmoMode, setGizmoMode] = useState<GizmoMode>('select');
  const [gizmoSpace, setGizmoSpace] = useState<GizmoSpace>('world');
  const [snapEnabled, setSnapEnabled] = useState(false);
  const [sculptMode, setSculptMode] = useState<'push' | 'pull'>('push');

  const isDraggingGizmoRef = useRef(false);
  const isSculptingRef = useRef(false);
  const raycasterRef = useRef(new THREE.Raycaster());

  // Drag and drop overlay state for quick photo drop
  const [isDragOver, setIsDragOver] = useState(false);

  // Articulated Moving Head & Volumetric Light Beam
  const movingHeadRef = useRef<ArticulatedMovingHeadGroup | null>(null);
  const [lightState, setLightState] = useState<StageLightState>({
    beamEnabled: true,
    beamColor: '#00f0ff',
    beamIntensity: 1.0,
    beamAngle: 3.5,
    panAngle: 15,
    tiltAngle: -25,
    autoSweep: false,
    strobeMode: 'off',
    fixtureType: projectName.toLowerCase().includes('spot') ? 'spot' :
                 projectName.toLowerCase().includes('wash') ? 'wash' :
                 projectName.toLowerCase().includes('hybrid') ? 'hybrid' : 'beam',
  });
  const lightStateRef = useRef<StageLightState>(lightState);
  lightStateRef.current = lightState;

  const [isLoading, setIsLoading] = useState(false);

  // Detect whether current scene is a moving head or stage lighting model
  const isMovingHead = 
    !isUploadedModel && 
    Boolean(
      projectName && 
      /moving head|beam|spot|wash|hybrid|light fixture|stage fixture|par can|blinder/i.test(projectName)
    );

  // Keyboard Shortcuts for in-workspace editing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'q' || e.key === 'Q') {
        setGizmoMode('select');
      } else if (e.key === 'w' || e.key === 'W') {
        setGizmoMode('translate');
      } else if (e.key === 'e' || e.key === 'E') {
        setGizmoMode('rotate');
      } else if (e.key === 'r' || e.key === 'R') {
        setGizmoMode('scale');
      } else if (e.key === 's' || e.key === 'S') {
        setGizmoMode('sculpt');
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        if (e.shiftKey) {
          if (canRedo && onRedo) onRedo();
        } else {
          if (canUndo && onUndo) onUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y')) {
        e.preventDefault();
        if (canRedo && onRedo) onRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, onUndo, onRedo]);

  // Initialize Scene, Renderer, Camera, Controls, and TransformControls
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 600;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      viewportSettings.fieldOfView || 45,
      width / height,
      0.01,
      1000
    );
    camera.position.set(2.5, 2.0, 3.2);
    cameraRef.current = camera;

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    rendererRef.current = renderer;

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxDistance = 25;
    controls.minDistance = 0.2;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // TransformControls for direct in-workspace 3D manipulation
    const transformControls = new TransformControls(camera, renderer.domElement);
    const helper = transformControls.getHelper();
    helper.visible = false;
    scene.add(helper);
    transformControlsRef.current = transformControls;
    transformHelperRef.current = helper;

    transformControls.addEventListener('dragging-changed', (event) => {
      const isDragging = Boolean(event.value);
      isDraggingGizmoRef.current = isDragging;
      if (controlsRef.current) {
        controlsRef.current.enabled = !isDragging;
      }

      if (!isDragging) {
        // Sync final values back to react state
        const target = isMovingHead ? movingHeadRef.current : modelMeshRef.current;
        if (target && onTransformChange) {
          onTransformChange({
            position: [target.position.x, target.position.y, target.position.z],
            rotation: [
              THREE.MathUtils.radToDeg(target.rotation.x),
              THREE.MathUtils.radToDeg(target.rotation.y),
              THREE.MathUtils.radToDeg(target.rotation.z),
            ],
            scale: [target.scale.x, target.scale.y, target.scale.z],
            uniformScale: transformState.uniformScale,
          });
        }
      }
    });

    transformControls.addEventListener('objectChange', () => {
      if (bboxHelperRef.current) {
        bboxHelperRef.current.update();
      }
    });

    // Grid Floor
    const grid = new THREE.GridHelper(10, 20, 0x555866, 0x2e313d);
    grid.position.y = 0;
    scene.add(grid);
    gridHelperRef.current = grid;

    // Coordinate Axes (X=Red, Y=Green, Z=Blue)
    const axes = new THREE.AxesHelper(1.5);
    (axes.material as THREE.Material).depthTest = false;
    axes.renderOrder = 2;
    scene.add(axes);
    axesHelperRef.current = axes;

    // Lighting group
    const lightsGroup = new THREE.Group();
    scene.add(lightsGroup);
    lightsGroupRef.current = lightsGroup;

    // Ground shadow plane
    const shadowGeo = new THREE.PlaneGeometry(12, 12);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.2 });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -0.001;
    shadowMesh.receiveShadow = true;
    scene.add(shadowMesh);

    // Animation loop
    let reqId: number;
    const animate = () => {
      reqId = requestAnimationFrame(animate);

      // Handle live motorized sweep and strobe for moving head
      if (movingHeadRef.current) {
        const state = lightStateRef.current;
        if (state.autoSweep) {
          const t = performance.now() * 0.0015;
          const sweepPan = Math.sin(t * 1.4) * 60;
          const sweepTilt = -25 + Math.cos(t * 1.8) * 35;
          movingHeadRef.current.setPanAngle(sweepPan);
          movingHeadRef.current.setTiltAngle(sweepTilt);
        }

        if (state.strobeMode !== 'off') {
          const freq = state.strobeMode === 'fast' ? 14 : 4;
          const isFlash = Math.sin(performance.now() * 0.006 * freq) > 0.15;
          movingHeadRef.current.setBeamIntensity(isFlash ? state.beamIntensity : 0);
        }
      }

      if (controlsRef.current) {
        controlsRef.current.update();
      }
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    // Resize observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0 && cameraRef.current && rendererRef.current) {
          cameraRef.current.aspect = w / h;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      cancelAnimationFrame(reqId);
      resizeObserver.disconnect();
      if (transformControlsRef.current && transformHelperRef.current) {
        scene.remove(transformHelperRef.current);
        transformControlsRef.current.dispose();
      }
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  // Sync Gizmo Mode, Space, and Snapping to TransformControls
  useEffect(() => {
    const tc = transformControlsRef.current;
    const helper = transformHelperRef.current;
    if (!tc || !helper) return;

    const target = isMovingHead ? movingHeadRef.current : modelMeshRef.current;

    if (target && (gizmoMode === 'translate' || gizmoMode === 'rotate' || gizmoMode === 'scale')) {
      tc.attach(target);
      tc.setMode(gizmoMode);
      tc.setSpace(gizmoSpace);
      tc.setTranslationSnap(snapEnabled ? 0.25 : null);
      tc.setRotationSnap(snapEnabled ? THREE.MathUtils.degToRad(15) : null);
      tc.setScaleSnap(snapEnabled ? 0.25 : null);
      helper.visible = true;
    } else {
      tc.detach();
      helper.visible = false;
    }
  }, [gizmoMode, gizmoSpace, snapEnabled, isMovingHead]);

  // Update background color based on preset
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    switch (viewportSettings.backgroundPreset) {
      case 'blender_dark':
        scene.background = new THREE.Color('#282828');
        break;
      case 'deep_charcoal':
        scene.background = new THREE.Color('#161719');
        break;
      case 'studio_gradient':
        scene.background = new THREE.Color('#1f232b');
        break;
      case 'pure_black':
        scene.background = new THREE.Color('#09090b');
        break;
      case 'neutral_gray':
        scene.background = new THREE.Color('#4a4d52');
        break;
      case 'transparent_checker':
        scene.background = null;
        break;
      default:
        scene.background = new THREE.Color('#222428');
    }
  }, [viewportSettings.backgroundPreset]);

  // Update Lighting setup based on preset
  useEffect(() => {
    if (!lightsGroupRef.current) return;
    const lg = lightsGroupRef.current;
    while (lg.children.length > 0) {
      lg.remove(lg.children[0]);
    }

    switch (viewportSettings.lightingPreset) {
      case 'outdoor_sun': {
        const sun = new THREE.DirectionalLight(0xfff8eb, 2.5);
        sun.position.set(6, 12, 6);
        sun.castShadow = true;
        sun.shadow.mapSize.width = 2048;
        sun.shadow.mapSize.height = 2048;
        sun.shadow.bias = -0.0001;
        lg.add(sun);

        const sky = new THREE.HemisphereLight(0x87ceeb, 0x3d3522, 0.7);
        lg.add(sky);
        break;
      }

      case 'stage_spotlight': {
        const spot1 = new THREE.SpotLight(0x00f0ff, 4.0, 15, Math.PI / 6, 0.4);
        spot1.position.set(4, 7, 3);
        spot1.castShadow = true;
        lg.add(spot1);

        const spot2 = new THREE.SpotLight(0xff0077, 3.5, 15, Math.PI / 5, 0.5);
        spot2.position.set(-4, 6, -3);
        lg.add(spot2);

        const ambient = new THREE.AmbientLight(0x111625, 1.2);
        lg.add(ambient);
        break;
      }

      case 'ambient_soft': {
        const amb = new THREE.AmbientLight(0xffffff, 2.0);
        lg.add(amb);
        const dir = new THREE.DirectionalLight(0xffffff, 0.8);
        dir.position.set(2, 5, 2);
        lg.add(dir);
        break;
      }

      case 'studio_three_point':
      default: {
        const key = new THREE.DirectionalLight(0xfff7e6, 2.2);
        key.position.set(4, 5, 4);
        key.castShadow = true;
        key.shadow.mapSize.width = 2048;
        key.shadow.mapSize.height = 2048;
        key.shadow.bias = -0.0001;
        lg.add(key);

        const fill = new THREE.DirectionalLight(0xdbeafe, 1.2);
        fill.position.set(-4, 3, 2);
        lg.add(fill);

        const rim = new THREE.DirectionalLight(0xffffff, 1.8);
        rim.position.set(0, 4, -4);
        lg.add(rim);

        const ambient = new THREE.AmbientLight(0x404040, 1.0);
        lg.add(ambient);
        break;
      }
    }
  }, [viewportSettings.lightingPreset]);

  // Helpers visibility (Grid, Axes)
  useEffect(() => {
    if (gridHelperRef.current) gridHelperRef.current.visible = viewportSettings.showGrid;
    if (axesHelperRef.current) axesHelperRef.current.visible = viewportSettings.showAxes;
    if (bboxHelperRef.current) bboxHelperRef.current.visible = viewportSettings.showBoundingBox;
  }, [viewportSettings.showGrid, viewportSettings.showAxes, viewportSettings.showBoundingBox]);

  // Load Texture Map
  useEffect(() => {
    if (!textureUrl) {
      textureMapRef.current = null;
      updateMaterial();
      return;
    }

    const loader = new THREE.TextureLoader();
    loader.load(
      textureUrl,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        textureMapRef.current = tex;
        updateMaterial();
      },
      undefined,
      (err) => {
        console.warn('Failed to load texture for 3D model:', err);
      }
    );
  }, [textureUrl]);

  // Create Material Helper
  const createMaterialForMode = useCallback((): THREE.Material => {
    switch (viewportSettings.shadingMode) {
      case 'wireframe':
        return new THREE.MeshBasicMaterial({
          color: materialSettings.wireframeColor || '#f97316',
          wireframe: true,
        });

      case 'solid':
        return new THREE.MeshStandardMaterial({
          color: materialSettings.color || '#94a3b8',
          roughness: 0.45,
          metalness: 0.1,
          flatShading: materialSettings.flatShading,
        });

      case 'normals':
        return new THREE.MeshNormalMaterial({
          flatShading: materialSettings.flatShading,
        });

      case 'depth':
        return new THREE.MeshDepthMaterial();

      case 'matcap': {
        return new THREE.MeshStandardMaterial({
          color: '#e2e8f0',
          roughness: 0.2,
          metalness: 0.05,
        });
      }

      case 'textured':
      default: {
        const hasTexture = Boolean(materialSettings.showTexture && textureMapRef.current);
        const mat = new THREE.MeshStandardMaterial({
          color: hasTexture ? 0xffffff : (materialSettings.color || '#ffffff'),
          roughness: materialSettings.roughness,
          metalness: materialSettings.metalness,
          transparent: materialSettings.opacity < 1.0,
          opacity: materialSettings.opacity,
          flatShading: materialSettings.flatShading,
          wireframe: materialSettings.wireframe,
        });

        if (hasTexture && textureMapRef.current) {
          mat.map = textureMapRef.current;
          mat.needsUpdate = true;
        }
        return mat;
      }
    }
  }, [viewportSettings.shadingMode, materialSettings]);

  // Update existing mesh material
  const updateMaterial = useCallback(() => {
    if (!modelMeshRef.current) return;
    const newMat = createMaterialForMode();
    if (modelMeshRef.current.material) {
      if (Array.isArray(modelMeshRef.current.material)) {
        modelMeshRef.current.material.forEach((m) => m.dispose());
      } else {
        modelMeshRef.current.material.dispose();
      }
    }
    modelMeshRef.current.material = newMat;
  }, [createMaterialForMode]);

  useEffect(() => {
    updateMaterial();
  }, [viewportSettings.shadingMode, materialSettings, updateMaterial]);

  // Mount/Update Geometry or Articulated Moving Head in Scene
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    // Detach gizmo before swapping mesh
    if (transformControlsRef.current) {
      transformControlsRef.current.detach();
    }

    // Remove previous mesh completely
    if (modelMeshRef.current) {
      scene.remove(modelMeshRef.current);
      modelMeshRef.current.geometry.dispose();
      if (Array.isArray(modelMeshRef.current.material)) {
        modelMeshRef.current.material.forEach((m) => m.dispose());
      } else {
        modelMeshRef.current.material.dispose();
      }
      modelMeshRef.current = null;
    }
    if (wireframeMeshRef.current) {
      scene.remove(wireframeMeshRef.current);
      wireframeMeshRef.current = null;
    }
    if (bboxHelperRef.current) {
      scene.remove(bboxHelperRef.current);
      bboxHelperRef.current = null;
    }
    if (movingHeadRef.current) {
      scene.remove(movingHeadRef.current);
      movingHeadRef.current.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const m = child as THREE.Mesh;
          m.geometry?.dispose();
          if (Array.isArray(m.material)) {
            m.material.forEach((mat) => mat.dispose());
          } else {
            m.material?.dispose();
          }
        }
      });
      movingHeadRef.current = null;
    }

    if (!geometry && !isMovingHead) return;

    setIsLoading(true);

    if (isMovingHead) {
      const articulated = createArticulatedMovingHead(lightState.fixtureType);
      articulated.position.set(...transformState.position);
      articulated.setPanAngle(lightState.panAngle);
      articulated.setTiltAngle(lightState.tiltAngle);
      articulated.setBeamColor(lightState.beamColor);
      articulated.setBeamIntensity(lightState.beamIntensity);
      articulated.setBeamEnabled(lightState.beamEnabled);
      scene.add(articulated);
      movingHeadRef.current = articulated;

      const bbox = new THREE.BoxHelper(articulated, 0x38bdf8);
      bbox.visible = viewportSettings.showBoundingBox;
      scene.add(bbox);
      bboxHelperRef.current = bbox;

      // Attach gizmo if in transform mode
      if (transformControlsRef.current && (gizmoMode === 'translate' || gizmoMode === 'rotate' || gizmoMode === 'scale')) {
        transformControlsRef.current.attach(articulated);
        if (transformHelperRef.current) transformHelperRef.current.visible = true;
      }
    } else if (geometry) {
      const material = createMaterialForMode();
      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
      modelMeshRef.current = mesh;

      const wireGeo = new THREE.WireframeGeometry(geometry);
      const wireMat = new THREE.LineBasicMaterial({
        color: 0x000000,
        opacity: 0.15,
        transparent: true,
        linewidth: 1,
      });
      const wireframe = new THREE.LineSegments(wireGeo, wireMat);
      wireframe.visible = materialSettings.wireframe && viewportSettings.shadingMode !== 'wireframe';
      mesh.add(wireframe);
      wireframeMeshRef.current = wireframe;

      const bbox = new THREE.BoxHelper(mesh, 0x38bdf8);
      bbox.visible = viewportSettings.showBoundingBox;
      scene.add(bbox);
      bboxHelperRef.current = bbox;

      // Frame camera bounding box on the model
      geometry.computeBoundingBox();
      geometry.computeBoundingSphere();
      if (geometry.boundingBox && controlsRef.current && cameraRef.current) {
        const center = new THREE.Vector3();
        geometry.boundingBox.getCenter(center);
        const size = new THREE.Vector3();
        geometry.boundingBox.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z, 0.5);

        controlsRef.current.target.copy(center);
        const fov = (cameraRef.current.fov * Math.PI) / 180;
        const camDist = Math.abs(maxDim / 2 / Math.tan(fov / 2)) * 1.8;
        cameraRef.current.position.set(center.x, center.y + maxDim * 0.35, center.z + Math.max(camDist, 2.2));
        controlsRef.current.update();
      }

      // Attach gizmo if in transform mode
      if (transformControlsRef.current && (gizmoMode === 'translate' || gizmoMode === 'rotate' || gizmoMode === 'scale')) {
        transformControlsRef.current.attach(mesh);
        if (transformHelperRef.current) transformHelperRef.current.visible = true;
      }
    }

    setIsLoading(false);
  }, [geometry, isMovingHead, isUploadedModel, lightState.fixtureType, createMaterialForMode, materialSettings.wireframe, viewportSettings.showBoundingBox]);

  // Apply Transform to Mesh or Articulated Model (skips if user is currently dragging gizmo)
  useEffect(() => {
    if (isDraggingGizmoRef.current) return;
    const target = isMovingHead ? movingHeadRef.current : modelMeshRef.current;
    if (!target) return;

    target.position.set(...transformState.position);
    target.rotation.set(
      THREE.MathUtils.degToRad(transformState.rotation[0]),
      THREE.MathUtils.degToRad(transformState.rotation[1]),
      THREE.MathUtils.degToRad(transformState.rotation[2])
    );
    target.scale.set(...transformState.scale);

    if (bboxHelperRef.current) {
      bboxHelperRef.current.update();
    }
  }, [transformState, isMovingHead]);

  // Interactive 3D Sculpt / Push-Pull Brush deformation logic
  const applySculptAtPoint = (worldHitPoint: THREE.Vector3, direction: number) => {
    if (!modelMeshRef.current) return;
    const mesh = modelMeshRef.current;
    const geom = mesh.geometry;
    const posAttr = geom.getAttribute('position');
    const normAttr = geom.getAttribute('normal');
    if (!posAttr) return;

    // Convert world point to mesh local coordinates
    const localHit = mesh.worldToLocal(worldHitPoint.clone());
    const brushRadius = 0.35;
    const brushStrength = 0.03 * direction;

    const v = new THREE.Vector3();
    let modified = false;

    for (let i = 0; i < posAttr.count; i++) {
      v.set(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
      const dist = v.distanceTo(localHit);
      if (dist < brushRadius) {
        // Cosine falloff
        const falloff = 0.5 * (1 + Math.cos((Math.PI * dist) / brushRadius));
        const delta = brushStrength * falloff;
        if (normAttr) {
          posAttr.setXYZ(
            i,
            v.x + normAttr.getX(i) * delta,
            v.y + normAttr.getY(i) * delta,
            v.z + normAttr.getZ(i) * delta
          );
        } else {
          const dir = v.clone().sub(localHit).normalize();
          posAttr.setXYZ(i, v.x + dir.x * delta, v.y + dir.y * delta, v.z + dir.z * delta);
        }
        modified = true;
      }
    }

    if (modified) {
      posAttr.needsUpdate = true;
      geom.computeVertexNormals();
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (gizmoMode !== 'sculpt' || !canvasRef.current || !cameraRef.current || !modelMeshRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycasterRef.current.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);
    const intersects = raycasterRef.current.intersectObject(modelMeshRef.current, false);
    if (intersects.length > 0) {
      isSculptingRef.current = true;
      if (controlsRef.current) controlsRef.current.enabled = false;
      applySculptAtPoint(intersects[0].point, sculptMode === 'pull' || e.shiftKey ? -1 : 1);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isSculptingRef.current || !canvasRef.current || !cameraRef.current || !modelMeshRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycasterRef.current.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);
    const intersects = raycasterRef.current.intersectObject(modelMeshRef.current, false);
    if (intersects.length > 0) {
      applySculptAtPoint(intersects[0].point, sculptMode === 'pull' || e.shiftKey ? -1 : 1);
    }
  };

  const handlePointerUp = () => {
    if (isSculptingRef.current) {
      isSculptingRef.current = false;
      if (controlsRef.current) controlsRef.current.enabled = true;
      if (modelMeshRef.current && onUpdateGeometry) {
        const geo = modelMeshRef.current.geometry.clone();
        geo.computeVertexNormals();
        geo.computeBoundingBox();
        geo.computeBoundingSphere();
        onUpdateGeometry(geo, 'In-Workspace 3D Sculpt');
      }
    }
  };

  // Camera preset controller
  useEffect(() => {
    if (!cameraRef.current || !controlsRef.current) return;
    const cam = cameraRef.current;
    const ctrl = controlsRef.current;
    const dist = 3.2;

    switch (viewportSettings.cameraPreset) {
      case 'front':
        cam.position.set(0, 0, dist);
        ctrl.target.set(0, 0.4, 0);
        break;
      case 'back':
        cam.position.set(0, 0, -dist);
        ctrl.target.set(0, 0.4, 0);
        break;
      case 'left':
        cam.position.set(-dist, 0.4, 0);
        ctrl.target.set(0, 0.4, 0);
        break;
      case 'right':
        cam.position.set(dist, 0.4, 0);
        ctrl.target.set(0, 0.4, 0);
        break;
      case 'top':
        cam.position.set(0, dist, 0.001);
        ctrl.target.set(0, 0.4, 0);
        break;
      case 'bottom':
        cam.position.set(0, -dist, 0.001);
        ctrl.target.set(0, 0.4, 0);
        break;
      case 'isometric':
        cam.position.set(dist * 0.8, dist * 0.8, dist * 0.8);
        ctrl.target.set(0, 0.4, 0);
        break;
      case 'perspective':
      default:
        cam.position.set(2.4, 1.8, 2.8);
        ctrl.target.set(0, 0.35, 0);
        break;
    }
    cam.lookAt(0, 0.35, 0);
    ctrl.update();
  }, [viewportSettings.cameraPreset]);

  // Auto-rotate controls
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = viewportSettings.autoRotate;
      controlsRef.current.autoRotateSpeed = 2.0;
    }
  }, [viewportSettings.autoRotate]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0] && onDropImageFile) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onDropImageFile(file);
      }
    }
  };

  return (
    <div 
      ref={containerRef} 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative w-full h-full overflow-hidden select-none bg-[#1c1d20] ${className}`}
    >
      <canvas 
        ref={canvasRef} 
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={`w-full h-full block outline-none ${
          gizmoMode === 'sculpt' 
            ? 'cursor-crosshair' 
            : gizmoMode === 'select'
            ? 'cursor-grab active:cursor-grabbing'
            : 'cursor-default'
        }`} 
      />

      {/* Drag & Drop Overlay */}
      {isDragOver && (
        <div className="absolute inset-0 bg-amber-500/15 border-2 border-dashed border-amber-400 backdrop-blur-xs flex flex-col items-center justify-center text-amber-300 z-30 pointer-events-none animate-pulse">
          <div className="p-3 bg-zinc-950/80 rounded-xl border border-amber-500/40 flex flex-col items-center gap-2 shadow-2xl">
            <div className="w-10 h-10 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center font-bold text-lg">
              ↓
            </div>
            <span className="font-bold text-sm text-zinc-100">Drop Picture Here</span>
            <span className="text-xs text-zinc-400">Reconstructs into 3D and displays as the sole model in this workspace</span>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center text-zinc-300 text-sm font-medium z-20">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            Loading 3D mesh...
          </div>
        </div>
      )}

      {/* Active Model Indicator Badge for Uploaded Models */}
      {isUploadedModel && (
        <div className="absolute top-14 left-3 z-20 flex items-center gap-2 bg-zinc-900/85 backdrop-blur-md border border-emerald-500/40 px-3 py-1.5 rounded-lg shadow-lg">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-semibold text-emerald-300">Active Uploaded Model</span>
          <span className="text-[11px] text-zinc-400 font-mono">· Solo Focus</span>
        </div>
      )}

      {/* In-Workspace Floating Editing Toolbar */}
      <WorkspaceEditToolbar
        gizmoMode={gizmoMode}
        onChangeGizmoMode={setGizmoMode}
        gizmoSpace={gizmoSpace}
        onToggleGizmoSpace={() => setGizmoSpace((s) => (s === 'world' ? 'local' : 'world'))}
        snapEnabled={snapEnabled}
        onToggleSnap={() => setSnapEnabled((prev) => !prev)}
        onUndo={onUndo}
        onRedo={onRedo}
        canUndo={canUndo}
        canRedo={canRedo}
        versionStep={versionStep}
        totalVersions={totalVersions}
        onQuickEdit={(action) => onQuickEdit && onQuickEdit(action)}
        currentColor={materialSettings.color}
        onChangeColor={onChangeMaterialColor}
        sculptMode={sculptMode}
        onChangeSculptMode={setSculptMode}
        isModelLoaded={Boolean(geometry || isMovingHead)}
      />

      {/* Live Stage Lighting & Beam Controller Dock (only active for preset stage lights, never for uploaded models) */}
      {isMovingHead && !isUploadedModel && (
        <StageLightController
          lightState={lightState}
          onChangeLightState={(partial) => {
            setLightState((prev) => {
              const updated = { ...prev, ...partial };
              if (movingHeadRef.current) {
                if (partial.panAngle !== undefined) movingHeadRef.current.setPanAngle(updated.panAngle);
                if (partial.tiltAngle !== undefined) movingHeadRef.current.setTiltAngle(updated.tiltAngle);
                if (partial.beamColor !== undefined) movingHeadRef.current.setBeamColor(updated.beamColor);
                if (partial.beamIntensity !== undefined) movingHeadRef.current.setBeamIntensity(updated.beamIntensity);
                if (partial.beamEnabled !== undefined) movingHeadRef.current.setBeamEnabled(updated.beamEnabled);
              }
              return updated;
            });
          }}
          onSwitchFixture={(type) => {
            if (onSwitchFixturePreset) {
              onSwitchFixturePreset(type);
            }
          }}
          isLightFixture={isMovingHead}
        />
      )}

      {/* Viewport Corner Brand / Coordinates indicator */}
      <div className="absolute bottom-3 left-3 text-[11px] text-zinc-500 font-mono pointer-events-none flex items-center gap-3">
        <span>X (Right) · Y (Up) · Z (Depth)</span>
        <span>·</span>
        <span>Three.js Physical Engine</span>
      </div>
    </div>
  );
};
