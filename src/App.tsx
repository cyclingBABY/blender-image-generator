import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as THREE from 'three';
import { 
  Box, 
  Move, 
  Wrench, 
  Palette, 
  Info, 
  Layers, 
  Image as ImageIcon, 
  Sparkles, 
  Maximize2,
  ChevronRight,
  ChevronLeft,
  Upload
} from 'lucide-react';
import { 
  GenerationJob, 
  GenerationSettings, 
  MaterialSettings, 
  MeshStats, 
  ModelVersion, 
  Project, 
  TransformState, 
  ViewportSettings 
} from './types';
import { Header, AppView } from './components/navigation/Header';
import { ThreeViewport } from './components/viewport/ThreeViewport';
import { ViewportControls } from './components/viewport/ViewportControls';
import { TransformPanel } from './components/editor/TransformPanel';
import { MeshToolsPanel } from './components/editor/MeshToolsPanel';
import { MaterialPanel } from './components/editor/MaterialPanel';
import { ModelInfoPanel } from './components/editor/ModelInfoPanel';
import { ImageUploader } from './components/upload/ImageUploader';
import { GenerationProgressModal } from './components/upload/GenerationProgressModal';
import { ExportModal } from './components/export/ExportModal';
import { SceneReconstructor } from './components/stage/SceneReconstructor';
import { ProjectsModal } from './components/projects/ProjectsModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { TestSuiteModal } from './components/tests/TestSuiteModal';
import { UvLayoutPreview } from './components/viewport/UvLayoutPreview';
import { EquipmentCatalogModal } from './components/stage/EquipmentCatalogModal';
import { EquipmentTemplate } from './types';
import { EVENT_EQUIPMENT_TEMPLATES } from './services/equipmentLibrary';

import { 
  calculateMeshStats, 
  createSampleModelGeometry, 
  generateMeshFromImageDepth 
} from './services/meshGenerators';
import { 
  applyLaplacianSmoothing, 
  processNormals, 
  simplifyMesh, 
  weldVertices,
  mirrorGeometry,
  inflateGeometry,
  scaleGeometryAxis 
} from './services/meshOptimization';
import { getAIProviderAdapter } from './services/aiEngine';
import { 
  getAppSettings, 
  getSavedProjects, 
  saveAppSettings, 
  saveProject, 
  deleteProject as deleteDbProject, 
  AppSettings 
} from './services/database';

export function App() {
  // Navigation View
  const [currentView, setCurrentView] = useState<AppView>('workspace');

  // Modals
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isProjectsModalOpen, setIsProjectsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isTestsModalOpen, setIsTestsModalOpen] = useState(false);
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);

  // App Settings
  const [appSettings, setAppSettings] = useState<AppSettings>(getAppSettings());

  // Active Project & Model Data
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [activeGeometry, setActiveGeometry] = useState<THREE.BufferGeometry | null>(null);
  const [activeStats, setActiveStats] = useState<MeshStats | null>(null);
  const [textureUrl, setTextureUrl] = useState<string | undefined>(undefined);
  const [referenceImageUrl, setReferenceImageUrl] = useState<string | undefined>(undefined);

  // Version History Stack for undo/redo
  const [versionHistory, setVersionHistory] = useState<THREE.BufferGeometry[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Transform State
  const [transformState, setTransformState] = useState<TransformState>({
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    uniformScale: true,
  });

  // Material & Appearance Settings
  const [materialSettings, setMaterialSettings] = useState<MaterialSettings>({
    color: '#e2e8f0',
    roughness: 0.35,
    metalness: 0.2,
    wireframe: false,
    wireframeColor: '#e87a24',
    showTexture: true,
    opacity: 1.0,
    flatShading: false,
    showUvLayout: false,
  });

  // Viewport Settings
  const [viewportSettings, setViewportSettings] = useState<ViewportSettings>({
    shadingMode: 'textured',
    cameraPreset: 'perspective',
    lightingPreset: 'studio_three_point',
    backgroundPreset: 'blender_dark',
    showGrid: true,
    showAxes: true,
    showBoundingBox: false,
    autoRotate: false,
    fieldOfView: 45,
  });

  // Generation Job State
  const [currentJob, setCurrentJob] = useState<GenerationJob | null>(null);

  // Hidden file input ref for instant photo upload directly to 3D
  const quickUploadInputRef = useRef<HTMLInputElement>(null);

  // Right Panel Tab
  const [rightPanelTab, setRightPanelTab] = useState<'transform' | 'tools' | 'material' | 'info'>('transform');
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

  // Load Initial Demonstration Model on Mount
  useEffect(() => {
    const savedProjects = getSavedProjects();
    if (savedProjects.length > 0) {
      loadProject(savedProjects[0]);
    } else {
      // Start directly with authentic 3D Moving Head Light model!
      loadSampleModel('moving_head');
    }
  }, []);

  // Helper to load sample model
  const loadSampleModel = (sampleId: 'stage_rig' | 'moving_head' | 'lounge_chair' | 'drone' | 'cyber_helmet') => {
    const sample = createSampleModelGeometry(sampleId);
    const stats = calculateMeshStats(sample.geometry);

    const names: Record<string, string> = {
      moving_head: '300W Beam Moving Head Light',
      stage_rig: 'Concert Stage & 290mm Box Truss Rig',
      lounge_chair: 'Sculpted Accent Lounge Chair',
      drone: 'Quadcopter Inspection Drone',
      cyber_helmet: 'Cyberpunk Helmet Visor Prop',
    };

    const newProject: Project = {
      id: `proj_${Date.now()}`,
      name: names[sampleId] || 'Sample Model',
      description: 'Default calibrated 3D asset ready for inspection, editing, and Blender export.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      inputImageUrl: '',
      settings: {
        category: sampleId === 'stage_rig' ? 'stage_equipment' : sampleId === 'lounge_chair' ? 'furniture' : 'prop',
        quality: 'high',
        detail: 'high',
        provider: 'local_procedural',
        generateTextures: true,
        removeBackground: true,
        symmetryAssistance: true,
        targetPolyCount: stats.triangleCount,
        outputScaleMeters: 1.0,
        normalizeOrigin: true,
        groundPlacement: true,
      },
      currentVersionIndex: 0,
      versions: [
        {
          id: `ver_1`,
          projectId: `proj_${Date.now()}`,
          versionNumber: 1,
          label: 'Original Generated Asset',
          createdAt: new Date().toISOString(),
          stats,
          geometryData: {
            positions: [],
            normals: [],
          },
          materialSettings: {
            color: sample.defaultColor,
            roughness: sample.roughness,
            metalness: sample.metalness,
            wireframe: false,
            wireframeColor: '#e87a24',
            showTexture: true,
            opacity: 1.0,
            flatShading: false,
            showUvLayout: false,
          },
        },
      ],
    };

    setActiveProject(newProject);
    setActiveGeometry(sample.geometry);
    setActiveStats(stats);
    setTextureUrl(undefined);
    setMaterialSettings({
      ...materialSettings,
      color: sample.defaultColor,
      roughness: sample.roughness,
      metalness: sample.metalness,
    });

    setVersionHistory([sample.geometry.clone()]);
    setHistoryIndex(0);
    setTransformState({
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      uniformScale: true,
    });

    saveProject(newProject);
    setCurrentView('workspace');
  };

  // Helper to load existing saved project
  const loadProject = (project: Project) => {
    setActiveProject(project);
    setReferenceImageUrl(project.inputImageUrl);

    // If project has versions, reconstruct geometry or default sample
    const sample = createSampleModelGeometry(
      project.settings.category === 'stage_equipment' ? 'stage_rig' : 'lounge_chair'
    );
    const stats = calculateMeshStats(sample.geometry);

    setActiveGeometry(sample.geometry);
    setActiveStats(stats);
    setVersionHistory([sample.geometry.clone()]);
    setHistoryIndex(0);
    setCurrentView('workspace');
  };

  // Push new geometry state into version history stack
  const pushNewGeometryVersion = useCallback((newGeom: THREE.BufferGeometry, label: string) => {
    const stats = calculateMeshStats(newGeom);
    setActiveGeometry(newGeom);
    setActiveStats(stats);

    // Slice history at current index
    const nextHistory = versionHistory.slice(0, historyIndex + 1);
    nextHistory.push(newGeom.clone());
    setVersionHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);

    // Update active project versions
    if (activeProject) {
      const newVersion: ModelVersion = {
        id: `ver_${Date.now()}`,
        projectId: activeProject.id,
        versionNumber: activeProject.versions.length + 1,
        label,
        createdAt: new Date().toISOString(),
        stats,
        geometryData: { positions: [], normals: [] },
        materialSettings: { ...materialSettings },
      };

      const updatedProj: Project = {
        ...activeProject,
        versions: [...activeProject.versions, newVersion],
        currentVersionIndex: activeProject.versions.length,
        updatedAt: new Date().toISOString(),
      };
      setActiveProject(updatedProj);
      saveProject(updatedProj);
    }
  }, [historyIndex, versionHistory, activeProject, materialSettings]);

  // Undo / Redo
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = versionHistory[historyIndex - 1];
      setActiveGeometry(prev);
      setActiveStats(calculateMeshStats(prev));
      setHistoryIndex(historyIndex - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < versionHistory.length - 1) {
      const next = versionHistory[historyIndex + 1];
      setActiveGeometry(next);
      setActiveStats(calculateMeshStats(next));
      setHistoryIndex(historyIndex + 1);
    }
  };

  // Transform helpers: Center at Origin & Snap to Ground
  const handleCenterOrigin = () => {
    setTransformState((t) => ({ ...t, position: [0, 0, 0] }));
  };

  const handlePlaceOnGround = () => {
    if (!activeStats) return;
    const halfY = activeStats.boundingBox.y / 2;
    setTransformState((t) => ({
      ...t,
      position: [t.position[0], halfY, t.position[2]],
    }));
  };

  const handleResetTransforms = () => {
    setTransformState({
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      uniformScale: true,
    });
  };

  // Mesh tools handlers
  const handleWeldDuplicates = () => {
    if (!activeGeometry) return;
    const welded = weldVertices(activeGeometry, 0.001);
    pushNewGeometryVersion(welded, 'Weld Duplicate Vertices');
  };

  const handleRecalculateNormals = (mode: 'smooth' | 'flat' | 'invert') => {
    if (!activeGeometry) return;
    const updated = processNormals(activeGeometry, mode);
    pushNewGeometryVersion(updated, `Normals: ${mode}`);
  };

  const handleSimplifyMesh = (factor: number) => {
    if (!activeGeometry) return;
    const simplified = simplifyMesh(activeGeometry, factor);
    pushNewGeometryVersion(simplified, `Polygon Decimation (-${Math.round(factor * 100)}%)`);
  };

  const handleSmoothMesh = () => {
    if (!activeGeometry) return;
    const smoothed = applyLaplacianSmoothing(activeGeometry, 0.35, 2);
    pushNewGeometryVersion(smoothed, 'Laplacian Smoothing');
  };

  // In-Workspace Quick Edit Dispatcher
  const handleQuickWorkspaceEdit = (action: 'ground' | 'center' | 'mirror_x' | 'smooth' | 'decimate' | 'flip_normals' | 'inflate' | 'deflate') => {
    switch (action) {
      case 'ground':
        handlePlaceOnGround();
        break;
      case 'center':
        handleCenterOrigin();
        break;
      case 'mirror_x':
        if (activeGeometry) {
          const mirrored = mirrorGeometry(activeGeometry, 'x');
          pushNewGeometryVersion(mirrored, 'Mirror Symmetry (X)');
        }
        break;
      case 'smooth':
        handleSmoothMesh();
        break;
      case 'decimate':
        handleSimplifyMesh(0.25);
        break;
      case 'flip_normals':
        handleRecalculateNormals('invert');
        break;
      case 'inflate':
        if (activeGeometry) {
          const inflated = inflateGeometry(activeGeometry, 0.05);
          pushNewGeometryVersion(inflated, 'Inflate / Thicken (+5%)');
        }
        break;
      case 'deflate':
        if (activeGeometry) {
          const deflated = inflateGeometry(activeGeometry, -0.05);
          pushNewGeometryVersion(deflated, 'Deflate / Thin (-5%)');
        }
        break;
    }
  };

  // Start Generation Workflow
  const handleStartGeneration = async (
    primaryImage: string,
    imageName: string,
    multiView: { front?: string; side?: string; top?: string },
    settings: GenerationSettings
  ) => {
    const jobId = `job_${Date.now()}`;
    const newJob: GenerationJob = {
      id: jobId,
      projectId: `proj_${Date.now()}`,
      provider: settings.provider,
      modelName: settings.provider,
      status: 'uploading',
      progress: 5,
      statusMessage: 'Initializing AI 3D Pipeline...',
      createdAt: new Date().toISOString(),
      inputImageUrl: primaryImage,
      inputImageName: imageName,
      settings,
    };

    setCurrentJob(newJob);
    setReferenceImageUrl(primaryImage);

    try {
      const adapter = getAIProviderAdapter(settings.provider);
      const result = await adapter.generateModel(
        primaryImage,
        imageName,
        settings,
        (progress, status, message) => {
          setCurrentJob((prev) =>
            prev ? { ...prev, progress, status, statusMessage: message } : null
          );
        }
      );

      // Create new project for completed asset
      const stats = calculateMeshStats(result.geometry);
      const newProject: Project = {
        id: `proj_${Date.now()}`,
        name: imageName.replace(/\.[^/.]+$/, ''),
        description: `Generated from ${imageName} using ${settings.provider}.`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        inputImageUrl: primaryImage,
        thumbnailUrl: primaryImage,
        multiViewImages: multiView,
        settings,
        currentVersionIndex: 0,
        versions: [
          {
            id: `ver_1`,
            projectId: `proj_${Date.now()}`,
            versionNumber: 1,
            label: 'Original AI Reconstruction',
            createdAt: new Date().toISOString(),
            stats,
            geometryData: { positions: [], normals: [] },
            materialSettings: { ...materialSettings, showTexture: true },
          },
        ],
      };

      setActiveProject(newProject);
      setActiveGeometry(result.geometry);
      setActiveStats(stats);
      setTextureUrl(result.textureCanvasUrl || primaryImage);
      setVersionHistory([result.geometry.clone()]);
      setHistoryIndex(0);

      // Reset transforms
      setTransformState({
        position: [0, settings.groundPlacement ? stats.boundingBox.y / 2 : 0, 0],
        rotation: [0, 0, 0],
        scale: [settings.outputScaleMeters, settings.outputScaleMeters, settings.outputScaleMeters],
        uniformScale: true,
      });

      saveProject(newProject);
      // Immediately switch view to workspace to display uploaded 3D model as the sole model
      setCurrentView('workspace');
    } catch (err: any) {
      setCurrentJob((prev) =>
        prev
          ? {
              ...prev,
              status: 'failed',
              statusMessage: err?.message || 'Generation failed',
              error: err?.message,
            }
          : null
      );
    }
  };

  // Quick photo upload: converts dragged or selected picture into 3D and renders as sole workspace model
  const handleQuickImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) return;
      handleStartGeneration(
        dataUrl,
        file.name,
        { front: dataUrl },
        {
          category: 'automatic',
          quality: 'standard',
          detail: 'medium',
          provider: 'local_procedural',
          generateTextures: true,
          removeBackground: true,
          symmetryAssistance: true,
          targetPolyCount: 16000,
          outputScaleMeters: 1.0,
          normalizeOrigin: true,
          groundPlacement: true,
          promptDescription: '',
        }
      );
    };
    reader.readAsDataURL(file);
  };

  // Assemble Multi-Object Scene into 3D Workspace
  const handleAssembleStageScene = (sceneGeom: THREE.BufferGeometry, sceneName: string) => {
    const stats = calculateMeshStats(sceneGeom);
    const newProject: Project = {
      id: `proj_${Date.now()}`,
      name: sceneName,
      description: 'Assembled multi-component concert stage with trusses, LED wall, and fixtures.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      inputImageUrl: '',
      settings: {
        category: 'stage_equipment',
        quality: 'high',
        detail: 'high',
        provider: 'local_procedural',
        generateTextures: false,
        removeBackground: false,
        symmetryAssistance: true,
        targetPolyCount: stats.triangleCount,
        outputScaleMeters: 1.0,
        normalizeOrigin: true,
        groundPlacement: true,
      },
      currentVersionIndex: 0,
      versions: [
        {
          id: `ver_1`,
          projectId: `proj_${Date.now()}`,
          versionNumber: 1,
          label: 'Assembled Compound Scene',
          createdAt: new Date().toISOString(),
          stats,
          geometryData: { positions: [], normals: [] },
          materialSettings: { ...materialSettings },
        },
      ],
    };

    setActiveProject(newProject);
    setActiveGeometry(sceneGeom);
    setActiveStats(stats);
    setTextureUrl(undefined);
    setVersionHistory([sceneGeom.clone()]);
    setHistoryIndex(0);
    setTransformState({
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      uniformScale: true,
    });

    saveProject(newProject);
    setCurrentView('workspace');
  };

  // Add individual fixture/equipment directly from 3D Catalog into Active Scene
  const handleSelectCatalogTemplate = (template: EquipmentTemplate) => {
    const geom = template.createGeometry();
    const stats = calculateMeshStats(geom);

    const newProject: Project = {
      id: `proj_${Date.now()}`,
      name: template.name,
      description: template.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      inputImageUrl: '',
      settings: {
        category: template.category === 'lighting' ? 'stage_equipment' :
                  template.category === 'trussing' ? 'stage_equipment' :
                  template.category === 'video' ? 'stage_equipment' :
                  template.category === 'audio' ? 'stage_equipment' :
                  template.category === 'decor' ? 'furniture' : 'stage_equipment',
        quality: 'high',
        detail: 'high',
        provider: 'local_procedural',
        generateTextures: false,
        removeBackground: false,
        symmetryAssistance: true,
        targetPolyCount: stats.triangleCount,
        outputScaleMeters: 1.0,
        normalizeOrigin: true,
        groundPlacement: template.mountingType !== 'truss_clamp' && template.mountingType !== 'flown',
      },
      currentVersionIndex: 0,
      versions: [
        {
          id: `ver_1`,
          projectId: `proj_${Date.now()}`,
          versionNumber: 1,
          label: `Template: ${template.name}`,
          createdAt: new Date().toISOString(),
          stats,
          geometryData: { positions: [], normals: [] },
          materialSettings: {
            color: template.color || '#e2e8f0',
            roughness: 0.35,
            metalness: 0.4,
            wireframe: false,
            wireframeColor: '#e87a24',
            showTexture: false,
            opacity: 1.0,
            flatShading: false,
            showUvLayout: false,
          },
        },
      ],
    };

    setActiveProject(newProject);
    setActiveGeometry(geom);
    setActiveStats(stats);
    setTextureUrl(undefined);
    setVersionHistory([geom.clone()]);
    setHistoryIndex(0);
    setTransformState({
      position: [0, template.mountingType === 'truss_clamp' || template.mountingType === 'flown' ? 2.5 : stats.boundingBox.y / 2, 0],
      rotation: template.mountingType === 'truss_clamp' ? [180, 0, 0] : [0, 0, 0],
      scale: [1, 1, 1],
      uniformScale: true,
    });
    saveProject(newProject);
    setIsCatalogModalOpen(false);
    setCurrentView('workspace');
  };

  // Switch between moving head fixture types from the viewport visualizer dock
  const handleSwitchFixturePreset = (type: 'beam' | 'spot' | 'wash' | 'hybrid') => {
    const idMap: Record<string, string> = {
      beam: 'light_beam_moving_head',
      spot: 'light_spot_moving_head',
      wash: 'light_wash_moving_head',
      hybrid: 'light_hybrid_moving_head',
    };
    const template = EVENT_EQUIPMENT_TEMPLATES.find((t) => t.id === idMap[type]);
    if (template) {
      handleSelectCatalogTemplate(template);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#161719] text-zinc-100 select-none">
      {/* Hidden file input for instant photo upload */}
      <input
        type="file"
        ref={quickUploadInputRef}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleQuickImageUpload(e.target.files[0]);
            e.target.value = '';
          }
        }}
        accept="image/*"
        className="hidden"
      />

      {/* Top Navigation Header */}
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        onOpenProjects={() => setIsProjectsModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenExport={() => setIsExportModalOpen(true)}
        onOpenTests={() => setIsTestsModalOpen(true)}
        onOpenCatalog={() => setIsCatalogModalOpen(true)}
        onQuickUpload={() => quickUploadInputRef.current?.click()}
        hasActiveModel={!!activeGeometry}
        projectName={activeProject?.name || 'Untitled Project'}
      />

      {/* Main Viewport Workspace or Alternate Modes */}
      <main className="flex-1 relative overflow-hidden flex">
        {currentView === 'upload' ? (
          <div className="flex-1 overflow-y-auto bg-[#18191c]">
            <ImageUploader
              onStartGeneration={handleStartGeneration}
              onLoadSample={loadSampleModel}
              isGenerating={currentJob?.status !== 'idle' && currentJob?.status !== 'completed' && currentJob?.status !== 'failed'}
            />
          </div>
        ) : currentView === 'stage' ? (
          <div className="flex-1 overflow-y-auto bg-[#18191c]">
            <SceneReconstructor
              onAssembleScene={handleAssembleStageScene}
              activeModelGeometry={activeGeometry}
            />
          </div>
        ) : (
          /* Main 3D Workspace */
          <div className="flex-1 flex overflow-hidden relative">
            {/* Left Outliner / Reference Image Panel */}
            <div
              className={`transition-all duration-200 border-r border-zinc-800 bg-[#1e2025] flex flex-col z-10 ${
                isLeftPanelOpen ? 'w-64' : 'w-0 overflow-hidden border-r-0'
              }`}
            >
              <div className="p-3 border-b border-zinc-800 flex items-center justify-between text-xs font-semibold text-zinc-200">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-500" />
                  <span>Scene Outliner</span>
                </span>
                <button
                  onClick={() => setIsLeftPanelOpen(false)}
                  className="text-zinc-500 hover:text-zinc-300 p-0.5 rounded"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
                {/* Active Object Node */}
                <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Box className="w-4 h-4 text-sky-400 shrink-0" />
                    <span className="font-bold text-zinc-100 truncate">
                      {activeProject?.name || 'Generated Model'}
                    </span>
                  </div>
                  {activeProject?.inputImageUrl && (
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      <span>Uploaded Photo 3D Model</span>
                    </div>
                  )}
                  <div className="text-[11px] font-mono text-zinc-400 pl-1">
                    <div>{activeStats?.triangleCount.toLocaleString()} Triangles</div>
                    <div>{activeStats?.vertexCount.toLocaleString()} Vertices</div>
                  </div>
                </div>

                {/* Quick Upload Button in Outliner */}
                <div className="p-2.5 bg-zinc-900/40 border border-dashed border-zinc-700/80 rounded-lg text-center space-y-1">
                  <button
                    onClick={() => quickUploadInputRef.current?.click()}
                    className="w-full py-1.5 px-2 bg-zinc-800 hover:bg-zinc-700 hover:text-amber-400 text-zinc-200 rounded text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer font-medium"
                  >
                    <Upload className="w-3.5 h-3.5 text-amber-500" />
                    <span>Upload New Photo</span>
                  </button>
                  <p className="text-[10px] text-zinc-500">Reconstructs into 3D as the only model</p>
                </div>

                {/* Reference Image Preview */}
                {referenceImageUrl && (
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-1.5">
                      <ImageIcon className="w-3 h-3 text-zinc-500" />
                      <span>Reference Photo</span>
                    </div>
                    <div className="w-full h-36 bg-zinc-950 rounded-lg border border-zinc-800 overflow-hidden flex items-center justify-center p-1">
                      <img
                        src={referenceImageUrl}
                        alt="Reference Image"
                        className="max-h-full max-w-full object-contain rounded"
                      />
                    </div>
                  </div>
                )}

                {/* Version History Tree */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-mono text-zinc-400">Version History</div>
                  <div className="space-y-1">
                    {activeProject?.versions.map((ver, idx) => (
                      <div
                        key={ver.id}
                        className={`p-2 rounded text-[11px] font-mono flex items-center justify-between ${
                          idx === activeProject.currentVersionIndex
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : 'bg-zinc-900 text-zinc-400'
                        }`}
                      >
                        <span className="truncate">{ver.label}</span>
                        <span className="text-[10px] text-zinc-500">v{ver.versionNumber}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Toggle Left Panel Button when closed */}
            {!isLeftPanelOpen && (
              <button
                onClick={() => setIsLeftPanelOpen(true)}
                className="absolute top-16 left-3 z-20 p-1.5 bg-[#22242a] border border-zinc-700 text-zinc-300 hover:text-white rounded-md shadow-lg"
                title="Open Scene Outliner"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {/* Center 3D Viewport or 2D UV Layout Inspector */}
            <div className="flex-1 relative flex flex-col h-full bg-[#1c1d20]">
              {materialSettings.showUvLayout ? (
                <UvLayoutPreview
                  geometry={activeGeometry}
                  textureUrl={textureUrl}
                  onClose={() => setMaterialSettings((m) => ({ ...m, showUvLayout: false }))}
                />
              ) : (
                <>
                  <ThreeViewport
                    geometry={activeGeometry}
                    materialSettings={materialSettings}
                    transformState={transformState}
                    viewportSettings={viewportSettings}
                    textureUrl={textureUrl}
                    projectName={activeProject?.name}
                    isUploadedModel={Boolean(activeProject?.inputImageUrl)}
                    onSwitchFixturePreset={handleSwitchFixturePreset}
                    onDropImageFile={handleQuickImageUpload}
                    onTransformChange={(newT) => setTransformState(newT)}
                    onUpdateGeometry={(newG, label) => pushNewGeometryVersion(newG, label)}
                    onQuickEdit={handleQuickWorkspaceEdit}
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                    canUndo={historyIndex > 0}
                    canRedo={historyIndex < versionHistory.length - 1}
                    versionStep={historyIndex + 1}
                    totalVersions={Math.max(1, versionHistory.length)}
                    onChangeMaterialColor={(color) => setMaterialSettings((m) => ({ ...m, color }))}
                    className="flex-1"
                  />

                  {/* Floating Top Controls Overlay */}
                  <ViewportControls
                    settings={viewportSettings}
                    onChange={(partial) => setViewportSettings((s) => ({ ...s, ...partial }))}
                    onResetCamera={() => setViewportSettings((s) => ({ ...s, cameraPreset: 'perspective' }))}
                    onCenterModel={handleCenterOrigin}
                  />
                </>
              )}
            </div>

            {/* Right Tools & Inspector Panel */}
            <div
              className={`transition-all duration-200 border-l border-zinc-800 bg-[#1e2025] flex flex-col z-10 ${
                isRightPanelOpen ? 'w-80' : 'w-0 overflow-hidden border-l-0'
              }`}
            >
              {/* Tab Header */}
              <div className="h-10 border-b border-zinc-800 bg-zinc-900/60 px-2 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setRightPanelTab('transform')}
                    className={`p-1.5 rounded transition-colors ${
                      rightPanelTab === 'transform' ? 'bg-zinc-800 text-amber-400 font-medium' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                    title="Transform Tools"
                  >
                    <Move className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setRightPanelTab('tools')}
                    className={`p-1.5 rounded transition-colors ${
                      rightPanelTab === 'tools' ? 'bg-zinc-800 text-amber-400 font-medium' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                    title="Geometry & Decimation"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setRightPanelTab('material')}
                    className={`p-1.5 rounded transition-colors ${
                      rightPanelTab === 'material' ? 'bg-zinc-800 text-amber-400 font-medium' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                    title="Material & Appearance"
                  >
                    <Palette className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setRightPanelTab('info')}
                    className={`p-1.5 rounded transition-colors ${
                      rightPanelTab === 'info' ? 'bg-zinc-800 text-amber-400 font-medium' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                    title="Model Statistics"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-mono text-zinc-400 uppercase">
                    {rightPanelTab}
                  </span>
                  <button
                    onClick={() => setIsRightPanelOpen(false)}
                    className="text-zinc-500 hover:text-zinc-300 p-0.5 rounded"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Panel Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {rightPanelTab === 'transform' && (
                  <TransformPanel
                    transform={transformState}
                    onChange={setTransformState}
                    onReset={handleResetTransforms}
                    onCenterOrigin={handleCenterOrigin}
                    onPlaceOnGround={handlePlaceOnGround}
                  />
                )}

                {rightPanelTab === 'tools' && (
                  <MeshToolsPanel
                    stats={activeStats}
                    onWeldDuplicates={handleWeldDuplicates}
                    onRecalculateNormals={handleRecalculateNormals}
                    onSimplifyMesh={handleSimplifyMesh}
                    onSmoothMesh={handleSmoothMesh}
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                    canUndo={historyIndex > 0}
                    canRedo={historyIndex < versionHistory.length - 1}
                    currentVersionIndex={historyIndex}
                    totalVersions={versionHistory.length}
                  />
                )}

                {rightPanelTab === 'material' && (
                  <MaterialPanel
                    material={materialSettings}
                    onChange={setMaterialSettings}
                    hasTextureMap={!!textureUrl}
                  />
                )}

                {rightPanelTab === 'info' && (
                  <ModelInfoPanel
                    stats={activeStats}
                    project={activeProject}
                    hasTexture={!!textureUrl}
                  />
                )}
              </div>
            </div>

            {/* Toggle Right Panel Button when closed */}
            {!isRightPanelOpen && (
              <button
                onClick={() => setIsRightPanelOpen(true)}
                className="absolute top-16 right-3 z-20 p-1.5 bg-[#22242a] border border-zinc-700 text-zinc-300 hover:text-white rounded-md shadow-lg"
                title="Open Tools Panel"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </main>

      {/* Generation Progress Modal */}
      <GenerationProgressModal
        job={currentJob}
        onCancel={() => {
          if (currentJob) {
            getAIProviderAdapter(currentJob.provider).cancelJob(currentJob.id);
            setCurrentJob({ ...currentJob, status: 'cancelled', statusMessage: 'Cancelled by user' });
          }
        }}
        onClose={() => {
          setCurrentJob(null);
          setCurrentView('workspace');
        }}
      />

      {/* Export to Blender Suite Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        projectName={activeProject?.name || 'Image3D_Model'}
        geometry={activeGeometry}
        materialSettings={materialSettings}
        stats={activeStats}
        referenceImage={referenceImageUrl}
        textureImage={textureUrl}
      />

      {/* Project Library Modal */}
      <ProjectsModal
        isOpen={isProjectsModalOpen}
        onClose={() => setIsProjectsModalOpen(false)}
        projects={getSavedProjects()}
        activeProjectId={activeProject?.id || null}
        onSelectProject={loadProject}
        onDeleteProject={(id) => {
          deleteDbProject(id);
          if (activeProject?.id === id) {
            loadSampleModel('stage_rig');
          }
        }}
        onDuplicateProject={(p) => {
          const dup: Project = {
            ...p,
            id: `proj_${Date.now()}`,
            name: `${p.name} (Copy)`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          saveProject(dup);
          loadProject(dup);
        }}
      />

      {/* Studio Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={appSettings}
        onSaveSettings={(partial) => {
          saveAppSettings(partial);
          setAppSettings((s) => ({ ...s, ...partial }));
        }}
      />

      {/* Automated Pipeline Test Suite Modal */}
      <TestSuiteModal
        isOpen={isTestsModalOpen}
        onClose={() => setIsTestsModalOpen(false)}
      />

      {/* 3D Event Equipment Template Library Catalog Modal */}
      <EquipmentCatalogModal
        isOpen={isCatalogModalOpen}
        onClose={() => setIsCatalogModalOpen(false)}
        onSelectTemplate={handleSelectCatalogTemplate}
        onLoadPresetRig={(presetType) => {
          if (presetType === 'concert_festival') {
            loadSampleModel('stage_rig');
          } else {
            setCurrentView('stage');
          }
        }}
      />
    </div>
  );
}
export default App;
