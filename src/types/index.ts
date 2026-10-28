import * as THREE from 'three';

export type AIProviderId = 
  | 'triposr'
  | 'trellis'
  | 'hunyuan3d'
  | 'sf3d'
  | 'instantmesh'
  | 'gemini_multimodal'
  | 'local_procedural';

export type ObjectCategory = 
  | 'stage_equipment'
  | 'furniture'
  | 'vehicle'
  | 'architecture'
  | 'character'
  | 'electronics'
  | 'prop'
  | 'automatic';

export type GenerationQuality = 'draft' | 'standard' | 'high';

export type GeometryDetail = 'low' | 'medium' | 'high';

export interface GenerationSettings {
  category: ObjectCategory;
  quality: GenerationQuality;
  detail: GeometryDetail;
  provider: AIProviderId;
  generateTextures: boolean;
  removeBackground: boolean;
  symmetryAssistance: boolean;
  targetPolyCount: number; // e.g. 5000, 15000, 50000
  promptDescription?: string;
  outputScaleMeters: number; // e.g. 1.0 (1 meter)
  normalizeOrigin: boolean;
  groundPlacement: boolean;
}

export type JobStatus = 
  | 'idle'
  | 'uploading'
  | 'preparing_image'
  | 'waiting_for_gpu'
  | 'generating_geometry'
  | 'generating_textures'
  | 'optimizing_mesh'
  | 'preparing_preview'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface GenerationJob {
  id: string;
  projectId: string;
  provider: AIProviderId;
  modelName: string;
  status: JobStatus;
  progress: number; // 0 - 100
  statusMessage: string;
  error?: string;
  createdAt: string;
  completedAt?: string;
  estimatedSecondsRemaining?: number;
  inputImageUrl: string;
  inputImageName: string;
  settings: GenerationSettings;
}

export interface ModelVersion {
  id: string;
  projectId: string;
  versionNumber: number;
  label: string;
  createdAt: string;
  stats: MeshStats;
  thumbnailUrl?: string;
  geometryData: {
    positions: Float32Array | number[];
    normals: Float32Array | number[];
    uvs?: Float32Array | number[];
    indices?: Uint32Array | Uint16Array | number[];
  };
  materialSettings: MaterialSettings;
}

export interface MaterialSettings {
  color: string;
  roughness: number;
  metalness: number;
  wireframe: boolean;
  wireframeColor: string;
  showTexture: boolean;
  textureUrl?: string;
  opacity: number;
  flatShading: boolean;
  showUvLayout: boolean;
}

export interface MeshStats {
  triangleCount: number;
  vertexCount: number;
  boundingBox: {
    x: number;
    y: number;
    z: number;
  };
  surfaceArea: number; // m^2
  volume: number; // m^3
  isManifold: boolean;
  fileSizeEstimateKb: number;
}

export interface TransformState {
  position: [number, number, number];
  rotation: [number, number, number]; // in degrees
  scale: [number, number, number];
  uniformScale: boolean;
}

export type ShadingMode = 
  | 'textured' 
  | 'solid' 
  | 'wireframe' 
  | 'normals' 
  | 'depth' 
  | 'matcap'
  | 'uv_layout';

export type EquipmentCategory = 
  | 'lighting' 
  | 'trussing' 
  | 'video' 
  | 'audio' 
  | 'staging' 
  | 'decor' 
  | 'power_control';

export interface EquipmentTemplate {
  id: string;
  name: string;
  category: EquipmentCategory;
  subcategory: string;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  weightKg: number;
  powerWatts: number;
  dmxChannels?: number;
  beamAngleDeg?: number;
  color: string;
  tags: string[];
  description: string;
  mountingType: 'truss_clamp' | 'floor_standing' | 'flown' | 'tabletop' | 'modular';
  thumbnailSvg: string;
  photometrics?: {
    luxAt5m?: number;
    colorTempK?: number;
    cri?: number;
  };
  createGeometry: () => import('three').BufferGeometry;
}

export type CameraPreset = 
  | 'front' 
  | 'back' 
  | 'left' 
  | 'right' 
  | 'top' 
  | 'bottom' 
  | 'perspective' 
  | 'isometric';

export type LightingPreset = 
  | 'studio_three_point' 
  | 'outdoor_sun' 
  | 'stage_spotlight' 
  | 'ambient_soft';

export type BackgroundPreset = 
  | 'blender_dark' 
  | 'deep_charcoal' 
  | 'studio_gradient' 
  | 'pure_black' 
  | 'neutral_gray' 
  | 'transparent_checker';

export interface ViewportSettings {
  shadingMode: ShadingMode;
  cameraPreset: CameraPreset;
  lightingPreset: LightingPreset;
  backgroundPreset: BackgroundPreset;
  showGrid: boolean;
  showAxes: boolean;
  showBoundingBox: boolean;
  autoRotate: boolean;
  fieldOfView: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  thumbnailUrl?: string;
  inputImageUrl: string;
  multiViewImages?: {
    front?: string;
    side?: string;
    top?: string;
    back?: string;
  };
  settings: GenerationSettings;
  currentVersionIndex: number;
  versions: ModelVersion[];
}

export interface AIProviderInfo {
  id: AIProviderId;
  name: string;
  developer: string;
  description: string;
  license: string;
  licenseUrl?: string;
  githubUrl?: string;
  docsUrl?: string;
  commercialUse: 'Allowed' | 'Non-Commercial Only' | 'Check Terms';
  minVRAM: string;
  minVramGb?: number;
  recommendedHardware: string;
  supportsMultiView: boolean;
  supportsPBRTextures: boolean;
  avgGenerationTime: string;
  mode: 'hosted' | 'self_hosted' | 'local_fallback' | 'cloud_api';
  status: 'available' | 'requires_api_key' | 'requires_local_worker' | 'ready';
  isPrimaryRecommended?: boolean;
}

export interface StageComponent {
  id: string;
  type: 'led_wall' | 'truss_box' | 'stage_deck' | 'moving_head' | 'speaker_array' | 'imported_mesh';
  name: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  color: string;
  visible: boolean;
  locked: boolean;
  meshData?: {
    positions: Float32Array | number[];
    normals: Float32Array | number[];
    uvs?: Float32Array | number[];
    indices?: Uint32Array | Uint16Array | number[];
  };
}
