import React, { useState } from 'react';
import { 
  Camera, 
  Grid, 
  Layers, 
  Maximize2, 
  Minimize2, 
  RotateCw, 
  Sun, 
  Eye, 
  Crosshair, 
  Palette, 
  Box, 
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { 
  BackgroundPreset, 
  CameraPreset, 
  LightingPreset, 
  ShadingMode, 
  ViewportSettings 
} from '../../types';

interface ViewportControlsProps {
  settings: ViewportSettings;
  onChange: (settings: Partial<ViewportSettings>) => void;
  onResetCamera: () => void;
  onCenterModel: () => void;
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
}

export const ViewportControls: React.FC<ViewportControlsProps> = ({
  settings,
  onChange,
  onResetCamera,
  onCenterModel,
  onToggleFullscreen,
  isFullscreen,
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const shadingModes: { id: ShadingMode; label: string; icon: string }[] = [
    { id: 'textured', label: 'Textured (PBR)', icon: '🎨' },
    { id: 'solid', label: 'Solid Clay', icon: '🗿' },
    { id: 'wireframe', label: 'Wireframe', icon: '🕸️' },
    { id: 'normals', label: 'Normals RGB', icon: '🌈' },
    { id: 'depth', label: 'Depth Buffer', icon: '⬛' },
    { id: 'matcap', label: 'Studio MatCap', icon: '✨' },
  ];

  const cameraPresets: { id: CameraPreset; label: string }[] = [
    { id: 'perspective', label: 'Perspective (3/4)' },
    { id: 'front', label: 'Front View (Z+)' },
    { id: 'right', label: 'Right Side (X+)' },
    { id: 'left', label: 'Left Side (X-)' },
    { id: 'top', label: 'Top View (Y+)' },
    { id: 'isometric', label: 'Isometric Ortho' },
  ];

  const lightingPresets: { id: LightingPreset; label: string }[] = [
    { id: 'studio_three_point', label: 'Blender 3-Point Studio' },
    { id: 'outdoor_sun', label: 'High Sunlight' },
    { id: 'stage_spotlight', label: 'Stage Rig Spotlight' },
    { id: 'ambient_soft', label: 'Soft Diffuse Ambient' },
  ];

  const backgroundPresets: { id: BackgroundPreset; label: string; color: string }[] = [
    { id: 'blender_dark', label: 'Blender Dark (#282828)', color: '#282828' },
    { id: 'deep_charcoal', label: 'Deep Charcoal (#161719)', color: '#161719' },
    { id: 'studio_gradient', label: 'Studio Dark (#1f232b)', color: '#1f232b' },
    { id: 'pure_black', label: 'OLED Black (#09090b)', color: '#09090b' },
    { id: 'neutral_gray', label: 'Neutral Gray (#4a4d52)', color: '#4a4d52' },
  ];

  const toggleMenu = (menu: string) => {
    setActiveMenu((prev) => (prev === menu ? null : menu));
  };

  return (
    <>
      {/* Top Floating Control Bar */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
        {/* Left: Shading & Camera Modes */}
        <div className="flex items-center gap-1.5 p-1 bg-[#22242a]/90 backdrop-blur-md border border-zinc-700/60 rounded-lg pointer-events-auto shadow-xl">
          {/* Shading mode selector */}
          <div className="relative">
            <button
              onClick={() => toggleMenu('shading')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-200 hover:text-white rounded-md bg-zinc-800/80 hover:bg-zinc-700/80 transition-colors"
              title="Shading Mode"
            >
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span className="capitalize hidden sm:inline">{settings.shadingMode}</span>
            </button>

            {activeMenu === 'shading' && (
              <div className="absolute top-full left-0 mt-1.5 w-44 bg-[#22242a] border border-zinc-700 rounded-lg shadow-2xl p-1 z-20">
                <div className="text-[10px] uppercase font-mono px-2 py-1 text-zinc-400">Shading Mode</div>
                {shadingModes.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => {
                      onChange({ shadingMode: mode.id });
                      setActiveMenu(null);
                    }}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-md text-left transition-colors ${
                      settings.shadingMode === mode.id
                        ? 'bg-amber-500/20 text-amber-300 font-medium'
                        : 'text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    <span>{mode.icon}</span>
                    <span>{mode.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Camera View Presets */}
          <div className="relative">
            <button
              onClick={() => toggleMenu('camera')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-200 hover:text-white rounded-md hover:bg-zinc-800 transition-colors"
              title="Camera View Angle"
            >
              <Camera className="w-3.5 h-3.5 text-sky-400" />
              <span className="capitalize hidden sm:inline">{settings.cameraPreset}</span>
            </button>

            {activeMenu === 'camera' && (
              <div className="absolute top-full left-0 mt-1.5 w-44 bg-[#22242a] border border-zinc-700 rounded-lg shadow-2xl p-1 z-20">
                <div className="text-[10px] uppercase font-mono px-2 py-1 text-zinc-400">Camera View</div>
                {cameraPresets.map((cam) => (
                  <button
                    key={cam.id}
                    onClick={() => {
                      onChange({ cameraPreset: cam.id });
                      setActiveMenu(null);
                    }}
                    className={`w-full flex items-center justify-between px-2 py-1.5 text-xs rounded-md text-left transition-colors ${
                      settings.cameraPreset === cam.id
                        ? 'bg-sky-500/20 text-sky-300 font-medium'
                        : 'text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    <span>{cam.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="h-4 w-px bg-zinc-700 mx-0.5" />

          {/* Center Model */}
          <button
            onClick={onCenterModel}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
            title="Center Model & Place on Ground"
          >
            <Crosshair className="w-3.5 h-3.5" />
          </button>

          {/* Reset Camera */}
          <button
            onClick={onResetCamera}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
            title="Reset Camera View"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Environment, Lighting, Helpers & Fullscreen */}
        <div className="flex items-center gap-1.5 p-1 bg-[#22242a]/90 backdrop-blur-md border border-zinc-700/60 rounded-lg pointer-events-auto shadow-xl">
          {/* Lighting Menu */}
          <div className="relative">
            <button
              onClick={() => toggleMenu('lighting')}
              className={`p-1.5 rounded-md transition-colors ${
                activeMenu === 'lighting' ? 'bg-zinc-700 text-amber-300' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
              title="Studio Lighting Setup"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>

            {activeMenu === 'lighting' && (
              <div className="absolute top-full right-0 mt-1.5 w-48 bg-[#22242a] border border-zinc-700 rounded-lg shadow-2xl p-1 z-20">
                <div className="text-[10px] uppercase font-mono px-2 py-1 text-zinc-400">Lighting Setup</div>
                {lightingPresets.map((light) => (
                  <button
                    key={light.id}
                    onClick={() => {
                      onChange({ lightingPreset: light.id });
                      setActiveMenu(null);
                    }}
                    className={`w-full flex items-center justify-between px-2 py-1.5 text-xs rounded-md text-left transition-colors ${
                      settings.lightingPreset === light.id
                        ? 'bg-amber-500/20 text-amber-300 font-medium'
                        : 'text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    <span>{light.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Background Menu */}
          <div className="relative">
            <button
              onClick={() => toggleMenu('background')}
              className={`p-1.5 rounded-md transition-colors ${
                activeMenu === 'background' ? 'bg-zinc-700 text-purple-300' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
              title="Viewport Background Color"
            >
              <Palette className="w-3.5 h-3.5" />
            </button>

            {activeMenu === 'background' && (
              <div className="absolute top-full right-0 mt-1.5 w-52 bg-[#22242a] border border-zinc-700 rounded-lg shadow-2xl p-1 z-20">
                <div className="text-[10px] uppercase font-mono px-2 py-1 text-zinc-400">Background Color</div>
                {backgroundPresets.map((bg) => (
                  <button
                    key={bg.id}
                    onClick={() => {
                      onChange({ backgroundPreset: bg.id });
                      setActiveMenu(null);
                    }}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-md text-left transition-colors ${
                      settings.backgroundPreset === bg.id
                        ? 'bg-purple-500/20 text-purple-300 font-medium'
                        : 'text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full border border-zinc-600" style={{ backgroundColor: bg.color }} />
                    <span>{bg.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="h-4 w-px bg-zinc-700 mx-0.5" />

          {/* Toggle Grid */}
          <button
            onClick={() => onChange({ showGrid: !settings.showGrid })}
            className={`p-1.5 rounded-md transition-colors ${
              settings.showGrid ? 'bg-zinc-700 text-emerald-400' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
            }`}
            title="Toggle Floor Grid"
          >
            <Grid className="w-3.5 h-3.5" />
          </button>

          {/* Toggle Bounding Box */}
          <button
            onClick={() => onChange({ showBoundingBox: !settings.showBoundingBox })}
            className={`p-1.5 rounded-md transition-colors ${
              settings.showBoundingBox ? 'bg-zinc-700 text-sky-400' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
            }`}
            title="Toggle Bounding Box Dimensions"
          >
            <Box className="w-3.5 h-3.5" />
          </button>

          {/* Auto Rotate */}
          <button
            onClick={() => onChange({ autoRotate: !settings.autoRotate })}
            className={`p-1.5 rounded-md transition-colors ${
              settings.autoRotate ? 'bg-zinc-700 text-amber-400' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
            }`}
            title="Turntable 360 Auto-Rotate"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen */}
          {onToggleFullscreen && (
            <button
              onClick={onToggleFullscreen}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Viewport'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>
    </>
  );
};
