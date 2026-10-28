import React, { useState, useRef, useCallback } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  RotateCw, 
  Sliders, 
  Scissors, 
  Sparkles, 
  Check, 
  Info, 
  Layers,
  ChevronDown,
  ArrowRight
} from 'lucide-react';
import { 
  AIProviderId, 
  GenerationSettings, 
  ObjectCategory, 
  GenerationQuality, 
  GeometryDetail 
} from '../../types';
import { AI_PROVIDERS } from '../../services/aiEngine';

interface ImageUploaderProps {
  onStartGeneration: (
    primaryImage: string,
    imageName: string,
    multiView: { front?: string; side?: string; top?: string },
    settings: GenerationSettings
  ) => void;
  onLoadSample: (sampleId: 'stage_rig' | 'moving_head' | 'lounge_chair' | 'drone' | 'cyber_helmet') => void;
  isGenerating?: boolean;
}

// Curated high quality SVGs/DataURIs for instant offline sample testing
const SAMPLE_PRESETS: {
  id: 'stage_rig' | 'moving_head' | 'lounge_chair' | 'drone' | 'cyber_helmet';
  title: string;
  category: ObjectCategory;
  description: string;
  thumbnail: string;
}[] = [
  {
    id: 'moving_head',
    title: '300W Beam Moving Head Light',
    category: 'stage_equipment',
    description: 'High-intensity razor beam moving head with octagonal base, LCD panel, U-yoke, and 160mm optic.',
    thumbnail: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"><rect width="200" height="150" fill="%231e2024"/><polygon points="100,20 60,140 140,140" fill="%2300f0ff" opacity="0.3"/><rect x="70" y="115" width="60" height="18" rx="4" fill="%2327272a"/><path d="M75 115 L75 75 L125 75 L125 115" stroke="%233f3f46" stroke-width="6" fill="none"/><ellipse cx="100" cy="55" rx="20" ry="24" fill="%2318181b" stroke="%2352525b" stroke-width="2"/><circle cx="100" cy="38" r="14" fill="%2300f0ff"/></svg>',
  },
  {
    id: 'stage_rig',
    title: 'Event Stage & Truss Rig',
    category: 'stage_equipment',
    description: 'Concert stage platform with 290mm box trusses and modular LED video wall.',
    thumbnail: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"><rect width="200" height="150" fill="%231e2024"/><rect x="25" y="40" width="150" height="60" fill="%232b2d35" stroke="%2338bdf8" stroke-width="2"/><line x1="20" y1="30" x2="180" y2="30" stroke="%23e87a24" stroke-width="4"/><line x1="30" y1="30" x2="30" y2="120" stroke="%23e87a24" stroke-width="4"/><line x1="170" y1="30" x2="170" y2="120" stroke="%23e87a24" stroke-width="4"/><rect x="20" y="110" width="160" height="20" fill="%23474b57"/></svg>',
  },
  {
    id: 'lounge_chair',
    title: 'Curved Lounge Chair',
    category: 'furniture',
    description: 'Mid-century modern sculpted accent chair with star swivel base.',
    thumbnail: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"><rect width="200" height="150" fill="%231e2024"/><path d="M50 85 Q70 120 100 115 Q130 120 150 85 Q160 50 140 40 Q100 35 60 40 Z" fill="%23e0662d"/><line x1="100" y1="115" x2="100" y2="135" stroke="%2371717a" stroke-width="5"/><line x1="70" y1="135" x2="130" y2="135" stroke="%2371717a" stroke-width="4"/></svg>',
  },
  {
    id: 'drone',
    title: 'Industrial Quadcopter',
    category: 'vehicle',
    description: 'Carbon fiber inspection drone with quad motors and 4K camera gimbal.',
    thumbnail: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"><rect width="200" height="150" fill="%231e2024"/><ellipse cx="100" cy="75" rx="30" ry="18" fill="%2338bdf8"/><line x1="45" y1="45" x2="155" y2="105" stroke="%2371717a" stroke-width="5"/><line x1="45" y1="105" x2="155" y2="45" stroke="%2371717a" stroke-width="5"/><circle cx="45" cy="45" r="14" fill="%2310b981"/><circle cx="155" cy="45" r="14" fill="%2310b981"/><circle cx="45" cy="105" r="14" fill="%2310b981"/><circle cx="155" cy="105" r="14" fill="%2310b981"/></svg>',
  },
  {
    id: 'cyber_helmet',
    title: 'Cyberpunk Helmet Prop',
    category: 'prop',
    description: 'Sci-fi protective visor helmet with dual ear filtration canisters.',
    thumbnail: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"><rect width="200" height="150" fill="%231e2024"/><circle cx="100" cy="75" r="45" fill="%2327272a" stroke="%23a855f7" stroke-width="3"/><path d="M75 70 Q100 85 125 70 L120 95 Q100 105 80 95 Z" fill="%2306b6d4"/><rect x="50" y="65" width="12" height="25" rx="3" fill="%23e87a24"/><rect x="138" y="65" width="12" height="25" rx="3" fill="%23e87a24"/></svg>',
  },
];

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onStartGeneration,
  onLoadSample,
  isGenerating = false,
}) => {
  const [primaryImage, setPrimaryImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>('uploaded_object.png');
  const [imageInfo, setImageInfo] = useState<{ width: number; height: number; sizeKb: number } | null>(null);
  const [multiViews, setMultiViews] = useState<{ side?: string; top?: string }>({});
  const [activeTab, setActiveTab] = useState<'front' | 'side' | 'top'>('front');

  // Pre-processing tools
  const [rotation, setRotation] = useState<number>(0);
  const [autoRemoveBg, setAutoRemoveBg] = useState<boolean>(true);
  const [highContrast, setHighContrast] = useState<boolean>(false);

  // Settings
  const [settings, setSettings] = useState<GenerationSettings>({
    category: 'automatic',
    quality: 'standard',
    detail: 'medium',
    provider: 'local_procedural',
    generateTextures: true,
    removeBackground: true,
    symmetryAssistance: true,
    targetPolyCount: 15000,
    outputScaleMeters: 1.0,
    normalizeOrigin: true,
    groundPlacement: true,
    promptDescription: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFile = useCallback((file: File, view: 'front' | 'side' | 'top' = 'front') => {
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        if (view === 'front') {
          setPrimaryImage(dataUrl);
          setImageName(file.name);
          setImageInfo({
            width: img.width,
            height: img.height,
            sizeKb: Math.round(file.size / 1024),
          });
        } else {
          setMultiViews((prev) => ({ ...prev, [view]: dataUrl }));
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFile(e.dataTransfer.files[0], activeTab);
      }
    },
    [handleFile, activeTab]
  );

  const handleRotate = () => {
    setRotation((r) => (r + 90) % 360);
  };

  const handleGenerate = () => {
    if (!primaryImage) return;
    onStartGeneration(
      primaryImage,
      imageName,
      { front: primaryImage, side: multiViews.side, top: multiViews.top },
      settings
    );
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header Banner */}
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="text-xl md:text-2xl font-bold text-zinc-100 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          Image-to-3D Reconstruction Studio
        </h1>
        <p className="text-xs md:text-sm text-zinc-400 mt-1">
          Upload single or multi-angle photos of stages, furniture, vehicles, props or characters. Generates an optimized 3D mesh with clean geometry, UV mapping, and native Blender project export.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Dropzone & Preprocessor (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Multi-view angle tabs */}
          <div className="flex items-center gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-lg">
            {(['front', 'side', 'top'] as const).map((view) => (
              <button
                key={view}
                onClick={() => setActiveTab(view)}
                className={`flex-1 py-1.5 text-xs font-medium rounded transition-colors ${
                  activeTab === view
                    ? 'bg-zinc-800 text-amber-400 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {view === 'front' ? 'Primary Front View' : `${view.toUpperCase()} View (Optional)`}
                {view !== 'front' && multiViews[view] && ' •'}
              </button>
            ))}
          </div>

          {/* Main Dropzone / Image Preview */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className={`relative min-h-[340px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-4 transition-all ${
              primaryImage
                ? 'border-zinc-700 bg-zinc-900/60'
                : 'border-zinc-700 hover:border-amber-500/60 bg-zinc-900/30'
            }`}
          >
            {primaryImage ? (
              <div className="relative w-full h-full flex flex-col items-center justify-center">
                {/* Image Display with Preprocessing Filters */}
                <div className="relative max-h-[300px] max-w-full flex items-center justify-center overflow-hidden rounded-lg">
                  <img
                    src={activeTab === 'front' ? primaryImage : multiViews[activeTab] || primaryImage}
                    alt="Upload Preview"
                    className="max-h-[280px] object-contain transition-transform"
                    style={{
                      transform: `rotate(${rotation}deg)`,
                      filter: `${highContrast ? 'contrast(135%) brightness(105%)' : ''}`,
                    }}
                  />
                  {autoRemoveBg && (
                    <div className="absolute top-2 left-2 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono px-2 py-0.5 rounded flex items-center gap-1">
                      <span>rembg (Local U2-Net) Active</span>
                    </div>
                  )}
                </div>

                {/* Preprocessing Toolbar */}
                <div className="mt-3 flex items-center gap-2 bg-zinc-950/80 border border-zinc-800 px-3 py-1.5 rounded-lg text-xs">
                  <button
                    onClick={handleRotate}
                    className="flex items-center gap-1 text-zinc-300 hover:text-white transition-colors"
                    title="Rotate 90 degrees"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Rotate</span>
                  </button>

                  <div className="w-px h-3.5 bg-zinc-700" />

                  <button
                    onClick={() => setAutoRemoveBg(!autoRemoveBg)}
                    className={`flex items-center gap-1 transition-colors ${
                      autoRemoveBg ? 'text-emerald-400 font-medium' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                    title="Remove background / isolate foreground object with rembg"
                  >
                    <Scissors className="w-3.5 h-3.5" />
                    <span>rembg Cutout</span>
                  </button>

                  <div className="w-px h-3.5 bg-zinc-700" />

                  <button
                    onClick={() => setHighContrast(!highContrast)}
                    className={`flex items-center gap-1 transition-colors ${
                      highContrast ? 'text-amber-400 font-medium' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                    title="Enhance geometric edges and contrast"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Edge Boost</span>
                  </button>

                  <div className="w-px h-3.5 bg-zinc-700" />

                  <button
                    onClick={() => {
                      setPrimaryImage(null);
                      setImageInfo(null);
                      setMultiViews({});
                    }}
                    className="text-red-400 hover:text-red-300"
                    title="Remove image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Image Details Bar */}
                {imageInfo && (
                  <div className="mt-2 text-[11px] text-zinc-500 font-mono flex items-center gap-3">
                    <span>{imageName}</span>
                    <span>·</span>
                    <span>{imageInfo.width} × {imageInfo.height} px</span>
                    <span>·</span>
                    <span>{imageInfo.sizeKb} KB</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center space-y-3 p-6">
                <div className="w-12 h-12 mx-auto rounded-full bg-zinc-800 flex items-center justify-center text-amber-500">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-medium text-zinc-200">
                    Drop your image here, or{' '}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-amber-400 hover:underline font-semibold cursor-pointer"
                    >
                      browse files
                    </button>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">
                    Supports JPG, PNG, WebP up to 30MB
                  </p>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/jpg"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFile(e.target.files[0], activeTab);
                }
              }}
            />
          </div>

          {/* Quick Preset Library (Stage, Drone, Chair, Prop) */}
          <div className="space-y-2">
            <div className="text-xs font-mono text-zinc-400 flex items-center justify-between">
              <span>Quick Test Models & Inspiration</span>
              <span className="text-[10px] text-zinc-500">1-Click Instant Preview</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SAMPLE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    setPrimaryImage(preset.thumbnail);
                    setImageName(`${preset.id}.png`);
                    setImageInfo({ width: 200, height: 150, sizeKb: 12 });
                    setSettings((s) => ({ ...s, category: preset.category }));
                    onLoadSample(preset.id);
                  }}
                  className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/40 rounded-lg text-left transition-all group cursor-pointer"
                >
                  <img
                    src={preset.thumbnail}
                    alt={preset.title}
                    className="w-full h-16 object-cover rounded bg-black/40 mb-1.5 border border-zinc-800"
                  />
                  <div className="text-xs font-medium text-zinc-200 group-hover:text-amber-400 truncate">
                    {preset.title}
                  </div>
                  <div className="text-[10px] text-zinc-500 capitalize">{preset.category.replace('_', ' ')}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Generation Settings Panel (5 cols) */}
        <div className="lg:col-span-5 bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 md:p-5 space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <span className="font-semibold text-zinc-100 flex items-center gap-1.5 text-sm">
              <Sliders className="w-4 h-4 text-sky-400" />
              AI Generation Settings
            </span>
            <span className="text-[11px] font-mono text-zinc-400 uppercase">
              {settings.provider}
            </span>
          </div>

          {/* Object Category */}
          <div className="space-y-1">
            <label className="text-zinc-300 font-medium">Object Category</label>
            <select
              value={settings.category}
              onChange={(e) => setSettings({ ...settings, category: e.target.value as ObjectCategory })}
              className="w-full bg-zinc-950 border border-zinc-700 rounded px-2.5 py-1.5 text-zinc-200 outline-none focus:border-amber-500"
            >
              <option value="automatic">Automatic Detection</option>
              <option value="stage_equipment">Event Stage & Lighting Rig</option>
              <option value="furniture">Furniture & Interior Design</option>
              <option value="vehicle">Vehicles & Machinery</option>
              <option value="architecture">Architecture & Building</option>
              <option value="prop">Props & Product Design</option>
              <option value="character">Characters & Organic</option>
            </select>
          </div>

          {/* AI Provider Engine Selection */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-zinc-300 font-medium flex items-center gap-1.5">
                <span>AI 3D Engine</span>
                {AI_PROVIDERS[settings.provider].isPrimaryRecommended && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.2 rounded font-mono font-semibold">
                    Recommended Primary
                  </span>
                )}
              </label>
              <span className="text-[10px] text-amber-400 font-mono">
                {AI_PROVIDERS[settings.provider].avgGenerationTime}
              </span>
            </div>
            <select
              value={settings.provider}
              onChange={(e) => setSettings({ ...settings, provider: e.target.value as AIProviderId })}
              className="w-full bg-zinc-950 border border-zinc-700 rounded px-2.5 py-1.5 text-zinc-200 outline-none focus:border-amber-500 font-mono text-[11px]"
            >
              <option value="triposr">⭐ TripoSR (Primary Recommended · MIT License · 2-6s)</option>
              <option value="local_procedural">⚡ Local Procedural Engine (Instant / Zero GPU / Free)</option>
              <option value="trellis">Microsoft TRELLIS (Latent Topologies · 16GB VRAM)</option>
              <option value="hunyuan3d">Tencent Hunyuan3D-2.0 (High-Res PBR · 16GB VRAM)</option>
              <option value="sf3d">Stable Fast 3D / SF3D (UV Unwrapped · 10GB VRAM)</option>
              <option value="instantmesh">InstantMesh (Multi-View Sparse Pipeline · 12GB VRAM)</option>
              <option value="gemini_multimodal">Gemini Multimodal 3D Vision (Cloud API)</option>
            </select>
            
            {/* Engine Description & Hardware Transparency Box */}
            <div className="p-2.5 bg-zinc-950/70 border border-zinc-800 rounded-lg space-y-1 text-[11px] text-zinc-400">
              <div className="flex items-center justify-between text-zinc-300">
                <span className="font-semibold text-zinc-200">{AI_PROVIDERS[settings.provider].name}</span>
                <span className="text-[10px] font-mono text-amber-400">{AI_PROVIDERS[settings.provider].minVRAM.split(' ')[0]}</span>
              </div>
              <p className="text-zinc-400 leading-relaxed text-[11px]">
                {AI_PROVIDERS[settings.provider].description}
              </p>
              <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-zinc-500 border-t border-zinc-800/80">
                <span>License: {AI_PROVIDERS[settings.provider].commercialUse === 'Allowed' ? 'Commercial Allowed' : 'Check License'}</span>
                <span className="text-zinc-400">PBR: {AI_PROVIDERS[settings.provider].supportsPBRTextures ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>

          {/* Quality & Detail */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-zinc-300 font-medium">Quality Profile</label>
              <select
                value={settings.quality}
                onChange={(e) => setSettings({ ...settings, quality: e.target.value as GenerationQuality })}
                className="w-full bg-zinc-950 border border-zinc-700 rounded px-2 py-1.5 text-zinc-200 outline-none"
              >
                <option value="draft">Draft (Fast)</option>
                <option value="standard">Standard (Balanced)</option>
                <option value="high">High (Maximum Detail)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-zinc-300 font-medium">Geometry Detail</label>
              <select
                value={settings.detail}
                onChange={(e) => setSettings({ ...settings, detail: e.target.value as GeometryDetail })}
                className="w-full bg-zinc-950 border border-zinc-700 rounded px-2 py-1.5 text-zinc-200 outline-none"
              >
                <option value="low">Low Poly</option>
                <option value="medium">Medium</option>
                <option value="high">Subdivided High</option>
              </select>
            </div>
          </div>

          {/* Target Polygon Count Slider */}
          <div className="space-y-1">
            <div className="flex justify-between font-mono text-[11px]">
              <span className="text-zinc-400">Target Polygon Count</span>
              <span className="text-zinc-200 font-semibold">{settings.targetPolyCount.toLocaleString()} Tris</span>
            </div>
            <input
              type="range"
              min="3000"
              max="50000"
              step="1000"
              value={settings.targetPolyCount}
              onChange={(e) => setSettings({ ...settings, targetPolyCount: parseInt(e.target.value) })}
              className="w-full accent-amber-500 h-1 bg-zinc-700 rounded cursor-pointer"
            />
          </div>

          {/* Feature Toggles */}
          <div className="space-y-2 pt-2 border-t border-zinc-800">
            <label className="flex items-center justify-between text-zinc-300 cursor-pointer">
              <span>Bake UV Textures & Normal Map</span>
              <input
                type="checkbox"
                checked={settings.generateTextures}
                onChange={(e) => setSettings({ ...settings, generateTextures: e.target.checked })}
                className="accent-amber-500 w-4 h-4 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between text-zinc-300 cursor-pointer">
              <span>Symmetry Assistance (Bilateral Mirror)</span>
              <input
                type="checkbox"
                checked={settings.symmetryAssistance}
                onChange={(e) => setSettings({ ...settings, symmetryAssistance: e.target.checked })}
                className="accent-amber-500 w-4 h-4 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between text-zinc-300 cursor-pointer">
              <span>Auto-Snap Base to Ground Plane (Z=0)</span>
              <input
                type="checkbox"
                checked={settings.groundPlacement}
                onChange={(e) => setSettings({ ...settings, groundPlacement: e.target.checked })}
                className="accent-amber-500 w-4 h-4 rounded cursor-pointer"
              />
            </label>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!primaryImage || isGenerating}
            className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold rounded-lg shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:pointer-events-none text-sm mt-4 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                <span>Processing 3D Geometry...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate & View in 3D Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
