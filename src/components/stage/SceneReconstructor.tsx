import React, { useState } from 'react';
import * as THREE from 'three';
import { 
  Tv, 
  Layers, 
  Lightbulb, 
  Volume2, 
  Plus, 
  Trash2, 
  Move, 
  Maximize, 
  Rotate3d, 
  Eye, 
  Lock, 
  Download,
  Sparkles,
  Check,
  Zap,
  Scale,
  Copy,
  BookOpen,
  FolderPlus
} from 'lucide-react';
import { StageComponent, EquipmentTemplate } from '../../types';
import { 
  EVENT_EQUIPMENT_TEMPLATES, 
  createSquareTruss, 
  createLedTile500Geometry, 
  createBeamMovingHeadGeometry, 
  createSpotMovingHeadGeometry,
  createWashMovingHeadGeometry,
  createBlinder2LightGeometry,
  createLineArrayClusterGeometry,
  createDualSubwooferGeometry,
  createDJBoothGeometry,
  createFloralArchGeometry,
  createBanquetTableGeometry,
  createSparkMachineGeometry,
  createAudioConsoleGeometry,
  createLightingConsoleGeometry
} from '../../services/equipmentLibrary';
import { 
  createLEDVideoWallGeometry, 
  createStagePlatformGeometry,
  mergeBufferGeometries 
} from '../../services/meshGenerators';
import { EquipmentCatalogModal } from './EquipmentCatalogModal';

interface SceneReconstructorProps {
  onAssembleScene: (geometry: THREE.BufferGeometry, sceneName: string) => void;
  activeModelGeometry?: THREE.BufferGeometry | null;
}

export const SceneReconstructor: React.FC<SceneReconstructorProps> = ({
  onAssembleScene,
  activeModelGeometry,
}) => {
  // Scene components list
  const [components, setComponents] = useState<StageComponent[]>([
    {
      id: 'deck_1',
      type: 'stage_deck',
      name: 'Main Stage Deck (6.0m x 4.0m)',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      dimensions: { width: 6.0, height: 0.4, depth: 4.0 },
      color: '#333742',
      visible: true,
      locked: false,
    },
    {
      id: 'led_wall_1',
      type: 'led_wall',
      name: 'Backdrop LED Video Screen (5.0m x 2.8m)',
      position: [0, 1.8, -1.8],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      dimensions: { width: 5.0, height: 2.8, depth: 0.12 },
      color: '#1a1c22',
      visible: true,
      locked: false,
    },
    {
      id: 'truss_top',
      type: 'truss_box',
      name: 'Overhead 290mm Box Truss (6.0m)',
      position: [0, 3.4, -1.8],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      dimensions: { width: 6.0, height: 0.29, depth: 0.29 },
      color: '#d1d5db',
      visible: true,
      locked: false,
    },
    {
      id: 'light_beam_1',
      type: 'moving_head',
      name: '300W Beam Moving Head Light L',
      position: [-2.0, 3.3, -1.8],
      rotation: [180, 0, 0],
      scale: [1, 1, 1],
      dimensions: { width: 0.38, height: 0.58, depth: 0.38 },
      color: '#18191c',
      visible: true,
      locked: false,
    },
    {
      id: 'light_beam_2',
      type: 'moving_head',
      name: '300W Beam Moving Head Light R',
      position: [2.0, 3.3, -1.8],
      rotation: [180, 0, 0],
      scale: [1, 1, 1],
      dimensions: { width: 0.38, height: 0.58, depth: 0.38 },
      color: '#18191c',
      visible: true,
      locked: false,
    },
    {
      id: 'speaker_l',
      type: 'speaker_array',
      name: 'Flown Line Array Speaker Left',
      position: [-3.2, 2.2, -0.5],
      rotation: [0, 20, 0],
      scale: [1, 1, 1],
      dimensions: { width: 0.85, height: 1.25, depth: 0.55 },
      color: '#1e2025',
      visible: true,
      locked: false,
    },
    {
      id: 'speaker_r',
      type: 'speaker_array',
      name: 'Flown Line Array Speaker Right',
      position: [3.2, 2.2, -0.5],
      rotation: [0, -20, 0],
      scale: [1, 1, 1],
      dimensions: { width: 0.85, height: 1.25, depth: 0.55 },
      color: '#1e2025',
      visible: true,
      locked: false,
    },
    {
      id: 'dj_booth',
      type: 'stage_deck',
      name: 'DJ Performance Center Booth',
      position: [0, 0.4, 0.2],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      dimensions: { width: 1.64, height: 1.05, depth: 0.75 },
      color: '#111827',
      visible: true,
      locked: false,
    },
  ]);

  const [selectedId, setSelectedId] = useState<string>('light_beam_1');
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);

  const selectedComp = components.find((c) => c.id === selectedId);

  // Add Item from 3D Equipment Template Catalog
  const handleAddTemplate = (template: EquipmentTemplate) => {
    const id = `item_${Date.now()}`;
    const newComp: StageComponent = {
      id,
      type: template.category === 'lighting' ? 'moving_head' : 
            template.category === 'trussing' ? 'truss_box' : 
            template.category === 'video' ? 'led_wall' : 
            template.category === 'audio' ? 'speaker_array' : 'stage_deck',
      name: template.name,
      position: template.mountingType === 'truss_clamp' || template.mountingType === 'flown'
        ? [0, 3.2, -1.8]
        : [0, 0.2, 0],
      rotation: template.mountingType === 'truss_clamp' ? [180, 0, 0] : [0, 0, 0],
      scale: [1, 1, 1],
      dimensions: { ...template.dimensions },
      color: template.color || '#334155',
      visible: true,
      locked: false,
    };

    setComponents([...components, newComp]);
    setSelectedId(id);
  };

  // 1-Click Complete Preset Setups (Concert Rig vs Wedding Stage)
  const handleLoadPresetRig = (type: 'concert_festival' | 'wedding_reception') => {
    if (type === 'concert_festival') {
      setComponents([
        {
          id: 'c_deck',
          type: 'stage_deck',
          name: 'Main Festival Stage Deck (8m x 5m)',
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          dimensions: { width: 8.0, height: 0.5, depth: 5.0 },
          color: '#24272f',
          visible: true,
          locked: false,
        },
        {
          id: 'c_led_wall',
          type: 'led_wall',
          name: 'Ultra-HD LED Video Backdrop (6m x 3.5m)',
          position: [0, 2.25, -2.2],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          dimensions: { width: 6.0, height: 3.5, depth: 0.15 },
          color: '#0f172a',
          visible: true,
          locked: false,
        },
        {
          id: 'c_truss_main',
          type: 'truss_box',
          name: 'Main Rigging Box Truss (8m)',
          position: [0, 4.2, -2.2],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          dimensions: { width: 8.0, height: 0.29, depth: 0.29 },
          color: '#e5e7eb',
          visible: true,
          locked: false,
        },
        {
          id: 'c_beam_1',
          type: 'moving_head',
          name: 'Beam Moving Head #1',
          position: [-3.0, 4.1, -2.2],
          rotation: [180, 0, 0],
          scale: [1, 1, 1],
          dimensions: { width: 0.38, height: 0.58, depth: 0.38 },
          color: '#1a1b1e',
          visible: true,
          locked: false,
        },
        {
          id: 'c_spot_1',
          type: 'moving_head',
          name: 'Spot Profile Moving Head #2',
          position: [-1.0, 4.1, -2.2],
          rotation: [180, 0, 0],
          scale: [1, 1, 1],
          dimensions: { width: 0.42, height: 0.62, depth: 0.42 },
          color: '#1a1b1e',
          visible: true,
          locked: false,
        },
        {
          id: 'c_spot_2',
          type: 'moving_head',
          name: 'Spot Profile Moving Head #3',
          position: [1.0, 4.1, -2.2],
          rotation: [180, 0, 0],
          scale: [1, 1, 1],
          dimensions: { width: 0.42, height: 0.62, depth: 0.42 },
          color: '#1a1b1e',
          visible: true,
          locked: false,
        },
        {
          id: 'c_beam_2',
          type: 'moving_head',
          name: 'Beam Moving Head #4',
          position: [3.0, 4.1, -2.2],
          rotation: [180, 0, 0],
          scale: [1, 1, 1],
          dimensions: { width: 0.38, height: 0.58, depth: 0.38 },
          color: '#1a1b1e',
          visible: true,
          locked: false,
        },
        {
          id: 'c_pa_l',
          type: 'speaker_array',
          name: 'Flown Arena Line Array L',
          position: [-4.2, 2.8, -0.5],
          rotation: [0, 25, 0],
          scale: [1, 1, 1],
          dimensions: { width: 0.85, height: 1.25, depth: 0.55 },
          color: '#18191c',
          visible: true,
          locked: false,
        },
        {
          id: 'c_pa_r',
          type: 'speaker_array',
          name: 'Flown Arena Line Array R',
          position: [4.2, 2.8, -0.5],
          rotation: [0, -25, 0],
          scale: [1, 1, 1],
          dimensions: { width: 0.85, height: 1.25, depth: 0.55 },
          color: '#18191c',
          visible: true,
          locked: false,
        },
        {
          id: 'c_sub_l',
          type: 'speaker_array',
          name: 'Dual 18" Subwoofer Ground Left',
          position: [-4.2, 0.3, -0.5],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          dimensions: { width: 1.15, height: 0.58, depth: 0.85 },
          color: '#141518',
          visible: true,
          locked: false,
        },
        {
          id: 'c_sub_r',
          type: 'speaker_array',
          name: 'Dual 18" Subwoofer Ground Right',
          position: [4.2, 0.3, -0.5],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          dimensions: { width: 1.15, height: 0.58, depth: 0.85 },
          color: '#141518',
          visible: true,
          locked: false,
        },
        {
          id: 'c_dj',
          type: 'stage_deck',
          name: 'DJ Performance Center Booth',
          position: [0, 0.5, 0.4],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          dimensions: { width: 1.64, height: 1.05, depth: 0.75 },
          color: '#18191c',
          visible: true,
          locked: false,
        },
      ]);
      setSelectedId('c_deck');
      setSuccessBanner('Loaded Concert Festival Arena Rig Preset!');
    } else {
      // Wedding Reception Stage Setup
      setComponents([
        {
          id: 'w_stage',
          type: 'stage_deck',
          name: 'Wedding Ceremony Stage Platform (6m x 3m)',
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          dimensions: { width: 6.0, height: 0.3, depth: 3.0 },
          color: '#f8fafc',
          visible: true,
          locked: false,
        },
        {
          id: 'w_arch',
          type: 'stage_deck',
          name: 'Hexagonal Gold Floral Wedding Arch',
          position: [0, 0.3, -0.8],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          dimensions: { width: 2.4, height: 2.6, depth: 0.4 },
          color: '#d4af37',
          visible: true,
          locked: false,
        },
        {
          id: 'w_table_l',
          type: 'stage_deck',
          name: 'VIP Reception Banquet Table Left',
          position: [-2.2, 0.3, 0.2],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          dimensions: { width: 1.8, height: 0.75, depth: 1.8 },
          color: '#ffffff',
          visible: true,
          locked: false,
        },
        {
          id: 'w_table_r',
          type: 'stage_deck',
          name: 'VIP Reception Banquet Table Right',
          position: [2.2, 0.3, 0.2],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          dimensions: { width: 1.8, height: 0.75, depth: 1.8 },
          color: '#ffffff',
          visible: true,
          locked: false,
        },
        {
          id: 'w_sparks_l',
          type: 'moving_head',
          name: 'Cold Spark Fountain Machine L',
          position: [-1.4, 0.3, 0.8],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          dimensions: { width: 0.22, height: 0.32, depth: 0.22 },
          color: '#facc15',
          visible: true,
          locked: false,
        },
        {
          id: 'w_sparks_r',
          type: 'moving_head',
          name: 'Cold Spark Fountain Machine R',
          position: [1.4, 0.3, 0.8],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          dimensions: { width: 0.22, height: 0.32, depth: 0.22 },
          color: '#facc15',
          visible: true,
          locked: false,
        },
      ]);
      setSelectedId('w_arch');
      setSuccessBanner('Loaded Wedding Reception Stage Preset!');
    }
    setTimeout(() => setSuccessBanner(null), 3500);
  };

  const removeComponent = (id: string) => {
    setComponents(components.filter((c) => c.id !== id));
    if (selectedId === id) {
      setSelectedId(components[0]?.id || '');
    }
  };

  const duplicateComponent = (comp: StageComponent) => {
    const copy: StageComponent = {
      ...comp,
      id: `item_${Date.now()}`,
      name: `${comp.name} (Copy)`,
      position: [comp.position[0] + 0.3, comp.position[1], comp.position[2] + 0.3],
    };
    setComponents([...components, copy]);
    setSelectedId(copy.id);
  };

  const updateSelectedComp = (partial: Partial<StageComponent>) => {
    setComponents(
      components.map((c) => (c.id === selectedId ? { ...c, ...partial } : c))
    );
  };

  // Total Power & Weight Calculations
  const totalPowerWatts = components.reduce((acc, comp) => {
    if (comp.name.includes('Beam')) return acc + 380;
    if (comp.name.includes('Spot')) return acc + 450;
    if (comp.name.includes('Wash')) return acc + 760;
    if (comp.name.includes('Blinder')) return acc + 220;
    if (comp.name.includes('LED Video')) return acc + 1800;
    if (comp.name.includes('Line Array')) return acc + 2400;
    if (comp.name.includes('Subwoofer')) return acc + 3000;
    if (comp.name.includes('Spark')) return acc + 600;
    return acc;
  }, 0);

  const handleAssembleAndSendToWorkspace = () => {
    const geoms: THREE.BufferGeometry[] = [];

    for (const comp of components) {
      if (!comp.visible) continue;
      let g: THREE.BufferGeometry;

      // Select high quality realistic geometry template based on item name or type
      if (comp.name.includes('Beam Moving Head')) {
        g = createBeamMovingHeadGeometry();
      } else if (comp.name.includes('Spot Profile Moving Head')) {
        g = createSpotMovingHeadGeometry();
      } else if (comp.name.includes('Wash Moving Head')) {
        g = createWashMovingHeadGeometry();
      } else if (comp.name.includes('Blinder')) {
        g = createBlinder2LightGeometry();
      } else if (comp.name.includes('Line Array')) {
        g = createLineArrayClusterGeometry();
      } else if (comp.name.includes('Subwoofer')) {
        g = createDualSubwooferGeometry();
      } else if (comp.name.includes('DJ Performance') || comp.name.includes('DJ Booth')) {
        g = createDJBoothGeometry();
      } else if (comp.name.includes('Floral Wedding Arch')) {
        g = createFloralArchGeometry();
      } else if (comp.name.includes('Banquet Table')) {
        g = createBanquetTableGeometry();
      } else if (comp.name.includes('Spark')) {
        g = createSparkMachineGeometry();
      } else if (comp.name.includes('grandMA')) {
        g = createLightingConsoleGeometry();
      } else if (comp.type === 'led_wall') {
        g = createLEDVideoWallGeometry(comp.dimensions.width, comp.dimensions.height, comp.dimensions.depth);
      } else if (comp.type === 'truss_box') {
        g = createSquareTruss(comp.dimensions.width);
      } else if (comp.type === 'stage_deck') {
        g = createStagePlatformGeometry(comp.dimensions.width, comp.dimensions.depth, comp.dimensions.height);
      } else {
        g = new THREE.BoxGeometry(comp.dimensions.width, comp.dimensions.height, comp.dimensions.depth);
      }

      // Apply scale
      g.scale(comp.scale[0], comp.scale[1], comp.scale[2]);

      // Apply rotation
      g.rotateX(THREE.MathUtils.degToRad(comp.rotation[0]));
      g.rotateY(THREE.MathUtils.degToRad(comp.rotation[1]));
      g.rotateZ(THREE.MathUtils.degToRad(comp.rotation[2]));

      // Apply translation
      g.translate(comp.position[0], comp.position[1], comp.position[2]);

      geoms.push(g);
    }

    const finalSceneGeometry = mergeBufferGeometries(geoms);
    onAssembleScene(finalSceneGeometry, 'Event_Equipment_Stage_Scene');

    setSuccessBanner('Complete Stage Scene Assembled! Sent to 3D Viewport.');
    setTimeout(() => setSuccessBanner(null), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-500" />
              Stage Assembler & 3D Equipment Studio
            </h2>
            <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded">
              Concert & Wedding Planning
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Pick from 50+ templates across moving heads, trusses, LED walls, audio line arrays, and wedding décor to assemble complete scenes without modeling from scratch.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          {/* Open Full 3D Catalog Browser Modal */}
          <button
            onClick={() => setIsCatalogOpen(true)}
            className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white font-semibold text-xs rounded-lg border border-zinc-700 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>Browse 3D Catalog</span>
          </button>

          {/* Assemble and Send to Workspace */}
          <button
            onClick={handleAssembleAndSendToWorkspace}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs rounded-lg shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Assemble Scene in Viewport</span>
          </button>
        </div>
      </div>

      {successBanner && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-lg text-emerald-300 text-xs font-mono flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* Preset Quick Builders Bar */}
      <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="text-zinc-400 font-mono text-[11px] uppercase">
            ⚡ Quick-Build Stage Presets:
          </span>
          <button
            onClick={() => handleLoadPresetRig('concert_festival')}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 text-zinc-200 rounded font-semibold transition-colors flex items-center gap-1.5"
          >
            <span>🎸 Concert Arena Rig (Truss + Line Array + Beams)</span>
          </button>
          <button
            onClick={() => handleLoadPresetRig('wedding_reception')}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 text-zinc-200 rounded font-semibold transition-colors flex items-center gap-1.5"
          >
            <span>💍 Wedding Reception Stage (Arch + Banquet + Sparks)</span>
          </button>
        </div>

        {/* Telemetry Badges */}
        <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-400">
          <span className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Power Est: <strong className="text-zinc-200">{totalPowerWatts.toLocaleString()} W</strong></span>
          </span>
          <span>·</span>
          <span>{components.length} Stage Objects</span>
        </div>
      </div>

      {/* Main Grid: Scene Tree & Adders (5 cols) and Inspector (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Component Tree & Quick Palette (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Quick Palette: Categorized add buttons */}
          <div className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono uppercase text-zinc-400">Quick Add Fixture / Structure</span>
              <button
                onClick={() => setIsCatalogOpen(true)}
                className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
              >
                <span>Full Catalog ({EVENT_EQUIPMENT_TEMPLATES.length})</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => handleAddTemplate(EVENT_EQUIPMENT_TEMPLATES.find((t) => t.id === 'light_beam_moving_head')!)}
                className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded flex items-center gap-2 transition-colors text-left"
              >
                <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="truncate">Beam Moving Head</span>
              </button>

              <button
                onClick={() => handleAddTemplate(EVENT_EQUIPMENT_TEMPLATES.find((t) => t.id === 'light_spot_moving_head')!)}
                className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded flex items-center gap-2 transition-colors text-left"
              >
                <Lightbulb className="w-4 h-4 text-purple-400 shrink-0" />
                <span className="truncate">Spot Profile Head</span>
              </button>

              <button
                onClick={() => handleAddTemplate(EVENT_EQUIPMENT_TEMPLATES.find((t) => t.id === 'light_blinder_2light')!)}
                className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded flex items-center gap-2 transition-colors text-left"
              >
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="truncate">Audience Blinder</span>
              </button>

              <button
                onClick={() => handleAddTemplate(EVENT_EQUIPMENT_TEMPLATES.find((t) => t.id === 'truss_square_3m')!)}
                className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded flex items-center gap-2 transition-colors text-left"
              >
                <Maximize className="w-4 h-4 text-sky-400 shrink-0" />
                <span className="truncate">290mm Box Truss (3m)</span>
              </button>

              <button
                onClick={() => handleAddTemplate(EVENT_EQUIPMENT_TEMPLATES.find((t) => t.id === 'video_led_panel_500')!)}
                className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded flex items-center gap-2 transition-colors text-left"
              >
                <Tv className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate">LED Video Screen</span>
              </button>

              <button
                onClick={() => handleAddTemplate(EVENT_EQUIPMENT_TEMPLATES.find((t) => t.id === 'audio_line_array_cluster')!)}
                className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded flex items-center gap-2 transition-colors text-left"
              >
                <Volume2 className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="truncate">Line Array Speakers</span>
              </button>
            </div>
          </div>

          {/* Outliner Scene Tree */}
          <div className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
              <span>Scene Hierarchy ({components.length} Items)</span>
            </div>
            <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
              {components.map((comp) => {
                const isSelected = comp.id === selectedId;
                return (
                  <div
                    key={comp.id}
                    onClick={() => setSelectedId(comp.id)}
                    className={`flex items-center justify-between p-2.5 rounded-lg text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-zinc-950/60 text-zinc-300 hover:bg-zinc-800 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: comp.color }} />
                      <span className="truncate font-medium">{comp.name}</span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateComponent(comp);
                        }}
                        className="p-1 text-zinc-400 hover:text-white"
                        title="Duplicate Object"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setComponents(
                            components.map((c) =>
                              c.id === comp.id ? { ...c, visible: !c.visible } : c
                            )
                          );
                        }}
                        className={`p-1 rounded ${comp.visible ? 'text-zinc-400' : 'text-zinc-600'}`}
                        title="Toggle Visibility"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeComponent(comp.id);
                        }}
                        className="p-1 text-zinc-500 hover:text-red-400"
                        title="Delete Object"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Selected Component Inspector (7 cols) */}
        <div className="lg:col-span-7 bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4 text-xs">
          {selectedComp ? (
            <>
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div>
                  <h3 className="font-bold text-zinc-100 text-sm">{selectedComp.name}</h3>
                  <p className="text-[11px] text-zinc-400 font-mono capitalize">
                    Category: {selectedComp.type.replace('_', ' ')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-zinc-400 font-mono">Color:</span>
                  <input
                    type="color"
                    value={selectedComp.color}
                    onChange={(e) => updateSelectedComp({ color: e.target.value })}
                    className="w-6 h-6 rounded cursor-pointer border border-zinc-700 bg-transparent"
                  />
                </div>
              </div>

              {/* Position XYZ */}
              <div className="space-y-1.5">
                <div className="text-zinc-400 font-mono text-[11px] flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Move className="w-3.5 h-3.5 text-sky-400" /> Position (X, Y, Z in meters)
                  </span>
                  <button
                    onClick={() => updateSelectedComp({ position: [0, selectedComp.position[1], 0] })}
                    className="text-[10px] text-zinc-500 hover:text-zinc-300 underline"
                  >
                    Center X/Z
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex items-center bg-zinc-950 border border-zinc-700 px-2.5 py-1.5 rounded">
                    <span className="text-red-400 font-mono font-bold mr-2 text-[10px]">X</span>
                    <input
                      type="number"
                      step="0.1"
                      value={selectedComp.position[0]}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        updateSelectedComp({
                          position: [val, selectedComp.position[1], selectedComp.position[2]],
                        });
                      }}
                      className="w-full bg-transparent text-right font-mono text-zinc-200 outline-none"
                    />
                  </div>
                  <div className="flex items-center bg-zinc-950 border border-zinc-700 px-2.5 py-1.5 rounded">
                    <span className="text-emerald-400 font-mono font-bold mr-2 text-[10px]">Y</span>
                    <input
                      type="number"
                      step="0.1"
                      value={selectedComp.position[1]}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        updateSelectedComp({
                          position: [selectedComp.position[0], val, selectedComp.position[2]],
                        });
                      }}
                      className="w-full bg-transparent text-right font-mono text-zinc-200 outline-none"
                    />
                  </div>
                  <div className="flex items-center bg-zinc-950 border border-zinc-700 px-2.5 py-1.5 rounded">
                    <span className="text-blue-400 font-mono font-bold mr-2 text-[10px]">Z</span>
                    <input
                      type="number"
                      step="0.1"
                      value={selectedComp.position[2]}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        updateSelectedComp({
                          position: [selectedComp.position[0], selectedComp.position[1], val],
                        });
                      }}
                      className="w-full bg-transparent text-right font-mono text-zinc-200 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Rotation XYZ */}
              <div className="space-y-1.5">
                <div className="text-zinc-400 font-mono text-[11px] flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Rotate3d className="w-3.5 h-3.5 text-amber-400" /> Rotation (Degrees)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateSelectedComp({ rotation: [180, 0, 0] })}
                      className="text-[10px] text-zinc-500 hover:text-zinc-300 underline"
                    >
                      Flip Down (180°)
                    </button>
                    <button
                      onClick={() => updateSelectedComp({ rotation: [0, 0, 0] })}
                      className="text-[10px] text-zinc-500 hover:text-zinc-300 underline"
                    >
                      Zero
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex items-center bg-zinc-950 border border-zinc-700 px-2.5 py-1.5 rounded">
                    <span className="text-red-400 font-mono font-bold mr-2 text-[10px]">RX</span>
                    <input
                      type="number"
                      step="15"
                      value={selectedComp.rotation[0]}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        updateSelectedComp({
                          rotation: [val, selectedComp.rotation[1], selectedComp.rotation[2]],
                        });
                      }}
                      className="w-full bg-transparent text-right font-mono text-zinc-200 outline-none"
                    />
                  </div>
                  <div className="flex items-center bg-zinc-950 border border-zinc-700 px-2.5 py-1.5 rounded">
                    <span className="text-emerald-400 font-mono font-bold mr-2 text-[10px]">RY</span>
                    <input
                      type="number"
                      step="15"
                      value={selectedComp.rotation[1]}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        updateSelectedComp({
                          rotation: [selectedComp.rotation[0], val, selectedComp.rotation[2]],
                        });
                      }}
                      className="w-full bg-transparent text-right font-mono text-zinc-200 outline-none"
                    />
                  </div>
                  <div className="flex items-center bg-zinc-950 border border-zinc-700 px-2.5 py-1.5 rounded">
                    <span className="text-blue-400 font-mono font-bold mr-2 text-[10px]">RZ</span>
                    <input
                      type="number"
                      step="15"
                      value={selectedComp.rotation[2]}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        updateSelectedComp({
                          rotation: [selectedComp.rotation[0], selectedComp.rotation[1], val],
                        });
                      }}
                      className="w-full bg-transparent text-right font-mono text-zinc-200 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Physical Parametric Dimensions */}
              <div className="space-y-1.5 pt-2 border-t border-zinc-800">
                <div className="text-zinc-400 font-mono text-[11px] flex items-center gap-1">
                  <Maximize className="w-3.5 h-3.5 text-zinc-500" /> Dimensions (Width, Height, Depth)
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500">Width (m)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={selectedComp.dimensions.width}
                      onChange={(e) => {
                        const val = Math.max(0.05, parseFloat(e.target.value) || 0.1);
                        updateSelectedComp({
                          dimensions: { ...selectedComp.dimensions, width: val },
                        });
                      }}
                      className="w-full bg-zinc-950 border border-zinc-700 px-2.5 py-1.5 rounded text-right font-mono text-zinc-200 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500">Height (m)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.05"
                      value={selectedComp.dimensions.height}
                      onChange={(e) => {
                        const val = Math.max(0.05, parseFloat(e.target.value) || 0.05);
                        updateSelectedComp({
                          dimensions: { ...selectedComp.dimensions, height: val },
                        });
                      }}
                      className="w-full bg-zinc-950 border border-zinc-700 px-2.5 py-1.5 rounded text-right font-mono text-zinc-200 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500">Depth (m)</label>
                    <input
                      type="number"
                      step="0.05"
                      min="0.05"
                      value={selectedComp.dimensions.depth}
                      onChange={(e) => {
                        const val = Math.max(0.05, parseFloat(e.target.value) || 0.05);
                        updateSelectedComp({
                          dimensions: { ...selectedComp.dimensions, depth: val },
                        });
                      }}
                      className="w-full bg-zinc-950 border border-zinc-700 px-2.5 py-1.5 rounded text-right font-mono text-zinc-200 outline-none"
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-zinc-500 font-mono">
              Select an equipment object from the Scene Hierarchy to inspect and edit coordinates.
            </div>
          )}
        </div>
      </div>

      {/* Equipment Catalog Modal */}
      <EquipmentCatalogModal
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
        onSelectTemplate={handleAddTemplate}
        onLoadPresetRig={handleLoadPresetRig}
      />
    </div>
  );
};
