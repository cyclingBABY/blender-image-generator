import React, { useState } from 'react';
import { 
  Move, 
  RotateCw, 
  Maximize2, 
  MousePointer, 
  Brush, 
  Undo2, 
  Redo2, 
  FlipHorizontal2, 
  Sparkles, 
  TrendingDown, 
  Layers, 
  ArrowDownToLine, 
  Crosshair, 
  RotateCcw,
  Palette,
  Globe,
  Compass,
  Magnet,
  HelpCircle,
  Plus,
  Minus
} from 'lucide-react';

export type GizmoMode = 'select' | 'translate' | 'rotate' | 'scale' | 'sculpt';
export type GizmoSpace = 'world' | 'local';

interface WorkspaceEditToolbarProps {
  gizmoMode: GizmoMode;
  onChangeGizmoMode: (mode: GizmoMode) => void;
  gizmoSpace: GizmoSpace;
  onToggleGizmoSpace: () => void;
  snapEnabled: boolean;
  onToggleSnap: () => void;
  // Undo / Redo
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  versionStep?: number;
  totalVersions?: number;
  // Quick Mesh Edits
  onQuickEdit: (action: 'ground' | 'center' | 'mirror_x' | 'smooth' | 'decimate' | 'flip_normals' | 'inflate' | 'deflate') => void;
  // Quick Color
  currentColor?: string;
  onChangeColor?: (color: string) => void;
  // Sculpt brush settings
  sculptMode?: 'push' | 'pull';
  onChangeSculptMode?: (mode: 'push' | 'pull') => void;
  isModelLoaded?: boolean;
}

export const WorkspaceEditToolbar: React.FC<WorkspaceEditToolbarProps> = ({
  gizmoMode,
  onChangeGizmoMode,
  gizmoSpace,
  onToggleGizmoSpace,
  snapEnabled,
  onToggleSnap,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  versionStep = 1,
  totalVersions = 1,
  onQuickEdit,
  currentColor = '#e2e8f0',
  onChangeColor,
  sculptMode = 'push',
  onChangeSculptMode,
  isModelLoaded = true,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showMeshMenu, setShowMeshMenu] = useState(false);

  const quickColors = [
    { name: 'Studio Gray', hex: '#e2e8f0' },
    { name: 'Stage Black', hex: '#1e2025' },
    { name: 'Neon Amber', hex: '#f59e0b' },
    { name: 'Cyan Glow', hex: '#06b6d4' },
    { name: 'Electric Violet', hex: '#8b5cf6' },
    { name: 'Rose Red', hex: '#f43f5e' },
    { name: 'Chrome Silver', hex: '#94a3b8' },
    { name: 'Emerald', hex: '#10b981' },
    { name: 'Gold Anodized', hex: '#eab308' },
  ];

  if (!isModelLoaded) return null;

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 pointer-events-auto">
      {/* Sculpt Mode Brush Options (when sculpt mode is selected) */}
      {gizmoMode === 'sculpt' && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-950/90 border border-amber-500/50 backdrop-blur-md shadow-2xl text-xs text-amber-300 animate-fadeIn">
          <Brush className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-semibold text-zinc-200">Interactive 3D Sculpt:</span>
          <span>Click & Drag on mesh to deform</span>
          <div className="h-3 w-px bg-zinc-700 mx-1" />
          <button
            onClick={() => onChangeSculptMode && onChangeSculptMode('push')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              sculptMode === 'push'
                ? 'bg-amber-500 text-zinc-950 font-bold'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            Push (Out)
          </button>
          <button
            onClick={() => onChangeSculptMode && onChangeSculptMode('pull')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              sculptMode === 'pull'
                ? 'bg-amber-500 text-zinc-950 font-bold'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            Pull (In)
          </button>
        </div>
      )}

      {/* Main Floating Workspace Editor Bar */}
      <div className="flex items-center gap-1.5 p-1.5 bg-[#1e2025]/95 border border-zinc-700/80 rounded-2xl shadow-2xl backdrop-blur-xl">
        
        {/* Transform Gizmo Selector */}
        <div className="flex items-center gap-1 bg-zinc-900/80 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => onChangeGizmoMode('select')}
            className={`p-2 rounded-lg text-xs flex items-center gap-1 transition-all ${
              gizmoMode === 'select'
                ? 'bg-amber-500 text-zinc-950 font-bold shadow-md'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
            }`}
            title="Orbit View & Select (Hotkey: Q)"
          >
            <MousePointer className="w-4 h-4" />
            <span className="text-[10px] hidden sm:inline">Orbit (Q)</span>
          </button>

          <button
            onClick={() => onChangeGizmoMode('translate')}
            className={`p-2 rounded-lg text-xs flex items-center gap-1 transition-all ${
              gizmoMode === 'translate'
                ? 'bg-amber-500 text-zinc-950 font-bold shadow-md'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
            }`}
            title="Translate / Move in 3D (Hotkey: W)"
          >
            <Move className="w-4 h-4" />
            <span className="text-[10px] hidden sm:inline">Move (W)</span>
          </button>

          <button
            onClick={() => onChangeGizmoMode('rotate')}
            className={`p-2 rounded-lg text-xs flex items-center gap-1 transition-all ${
              gizmoMode === 'rotate'
                ? 'bg-amber-500 text-zinc-950 font-bold shadow-md'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
            }`}
            title="Rotate along 3D Axes (Hotkey: E)"
          >
            <RotateCw className="w-4 h-4" />
            <span className="text-[10px] hidden sm:inline">Rotate (E)</span>
          </button>

          <button
            onClick={() => onChangeGizmoMode('scale')}
            className={`p-2 rounded-lg text-xs flex items-center gap-1 transition-all ${
              gizmoMode === 'scale'
                ? 'bg-amber-500 text-zinc-950 font-bold shadow-md'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
            }`}
            title="Scale 3D Dimensions (Hotkey: R)"
          >
            <Maximize2 className="w-4 h-4" />
            <span className="text-[10px] hidden sm:inline">Scale (R)</span>
          </button>

          <button
            onClick={() => onChangeGizmoMode('sculpt')}
            className={`p-2 rounded-lg text-xs flex items-center gap-1 transition-all ${
              gizmoMode === 'sculpt'
                ? 'bg-amber-500 text-zinc-950 font-bold shadow-md'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
            }`}
            title="Interactive 3D Surface Sculpt (Hotkey: S)"
          >
            <Brush className="w-4 h-4" />
            <span className="text-[10px] hidden sm:inline">Sculpt (S)</span>
          </button>
        </div>

        <div className="h-6 w-px bg-zinc-800 mx-1" />

        {/* Gizmo Space & Snap Toggles */}
        <div className="flex items-center gap-1">
          <button
            onClick={onToggleGizmoSpace}
            className={`p-2 rounded-lg text-xs flex items-center gap-1 transition-colors ${
              gizmoSpace === 'world'
                ? 'text-sky-400 bg-sky-950/40 border border-sky-800/60'
                : 'text-amber-400 bg-amber-950/40 border border-amber-800/60'
            }`}
            title={`Coordinate Space: ${gizmoSpace.toUpperCase()} (Click to toggle)`}
          >
            {gizmoSpace === 'world' ? <Globe className="w-3.5 h-3.5" /> : <Compass className="w-3.5 h-3.5" />}
            <span className="text-[10px] font-mono uppercase font-semibold hidden md:inline">{gizmoSpace}</span>
          </button>

          <button
            onClick={onToggleSnap}
            className={`p-2 rounded-lg text-xs flex items-center gap-1 transition-colors ${
              snapEnabled
                ? 'text-emerald-300 bg-emerald-950/50 border border-emerald-700/60'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
            title={`Grid Snap: ${snapEnabled ? 'ON (0.25m / 15°)' : 'OFF'}`}
          >
            <Magnet className="w-3.5 h-3.5" />
            <span className="text-[10px] font-mono hidden md:inline">Snap</span>
          </button>
        </div>

        <div className="h-6 w-px bg-zinc-800 mx-1" />

        {/* Quick In-Workspace Mesh Edits */}
        <div className="flex items-center gap-1 relative">
          <button
            onClick={() => onQuickEdit('ground')}
            className="p-2 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors flex items-center gap-1"
            title="Snap Model to Ground Floor (Y=0)"
          >
            <ArrowDownToLine className="w-4 h-4 text-emerald-400" />
            <span className="text-[11px] hidden lg:inline">Ground</span>
          </button>

          <button
            onClick={() => onQuickEdit('center')}
            className="p-2 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors flex items-center gap-1"
            title="Center Model at Origin (0,0,0)"
          >
            <Crosshair className="w-4 h-4 text-sky-400" />
            <span className="text-[11px] hidden lg:inline">Center</span>
          </button>

          <button
            onClick={() => onQuickEdit('mirror_x')}
            className="p-2 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors flex items-center gap-1"
            title="Mirror Geometry across X Axis (Symmetry)"
          >
            <FlipHorizontal2 className="w-4 h-4 text-violet-400" />
            <span className="text-[11px] hidden xl:inline">Mirror X</span>
          </button>

          <button
            onClick={() => onQuickEdit('smooth')}
            className="p-2 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors flex items-center gap-1"
            title="Smooth Mesh Surface (Laplacian Pass)"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-[11px] hidden xl:inline">Smooth</span>
          </button>

          {/* More Quick Edits Popover */}
          <div className="relative">
            <button
              onClick={() => setShowMeshMenu((prev) => !prev)}
              className="p-2 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-medium"
              title="More In-Workspace Edits"
            >
              <span>More Edits</span>
              <span className="text-[9px] text-zinc-400">▼</span>
            </button>

            {showMeshMenu && (
              <div className="absolute bottom-full right-0 mb-2 w-52 p-1.5 bg-[#22242a] border border-zinc-700 rounded-xl shadow-2xl z-30 space-y-1">
                <div className="text-[10px] font-mono text-zinc-400 uppercase px-2 py-1">Direct Mesh Actions</div>
                <button
                  onClick={() => {
                    onQuickEdit('inflate');
                    setShowMeshMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-zinc-200 hover:bg-zinc-800 hover:text-amber-300 rounded-lg text-left"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Inflate / Thicken (+5%)</span>
                </button>
                <button
                  onClick={() => {
                    onQuickEdit('deflate');
                    setShowMeshMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-zinc-200 hover:bg-zinc-800 hover:text-amber-300 rounded-lg text-left"
                >
                  <Minus className="w-3.5 h-3.5 text-rose-400" />
                  <span>Deflate / Thin (-5%)</span>
                </button>
                <button
                  onClick={() => {
                    onQuickEdit('decimate');
                    setShowMeshMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-zinc-200 hover:bg-zinc-800 hover:text-amber-300 rounded-lg text-left"
                >
                  <TrendingDown className="w-3.5 h-3.5 text-orange-400" />
                  <span>Decimate Mesh (-25%)</span>
                </button>
                <button
                  onClick={() => {
                    onQuickEdit('flip_normals');
                    setShowMeshMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-zinc-200 hover:bg-zinc-800 hover:text-amber-300 rounded-lg text-left"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Invert / Flip Normals</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="h-6 w-px bg-zinc-800 mx-1" />

        {/* Quick Color Tint Swatch */}
        <div className="relative">
          <button
            onClick={() => setShowColorPicker((prev) => !prev)}
            className="p-2 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors flex items-center gap-1.5"
            title="Quick Material Color Tint"
          >
            <div 
              className="w-4 h-4 rounded-full border border-zinc-500 shadow-inner"
              style={{ backgroundColor: currentColor }} 
            />
            <Palette className="w-3.5 h-3.5 text-zinc-400" />
          </button>

          {showColorPicker && (
            <div className="absolute bottom-full right-0 mb-2 w-48 p-2.5 bg-[#22242a] border border-zinc-700 rounded-xl shadow-2xl z-30">
              <div className="text-[10px] font-mono text-zinc-400 uppercase mb-2">Model Color Swatch</div>
              <div className="grid grid-cols-3 gap-1.5 mb-2">
                {quickColors.map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => {
                      onChangeColor && onChangeColor(c.hex);
                      setShowColorPicker(false);
                    }}
                    className="w-full h-7 rounded-md border border-zinc-700 hover:scale-105 transition-transform"
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
              </div>
              <input
                type="color"
                value={currentColor}
                onChange={(e) => onChangeColor && onChangeColor(e.target.value)}
                className="w-full h-8 bg-zinc-900 rounded cursor-pointer border border-zinc-700"
              />
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-zinc-800 mx-1" />

        {/* Undo / Redo in Workspace */}
        <div className="flex items-center gap-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-2 rounded-lg text-xs transition-colors ${
              canUndo
                ? 'text-zinc-200 hover:text-white hover:bg-zinc-800'
                : 'text-zinc-600 cursor-not-allowed'
            }`}
            title="Undo Edit (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>

          <span className="text-[10px] font-mono text-zinc-400 px-1 select-none">
            {versionStep}/{totalVersions}
          </span>

          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-2 rounded-lg text-xs transition-colors ${
              canRedo
                ? 'text-zinc-200 hover:text-white hover:bg-zinc-800'
                : 'text-zinc-600 cursor-not-allowed'
            }`}
            title="Redo Edit (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcuts Quick Help Modal / Popover */}
        <div className="relative">
          <button
            onClick={() => setShowShortcuts((prev) => !prev)}
            className="p-1.5 text-zinc-500 hover:text-zinc-300 rounded-lg"
            title="Workspace Hotkeys"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>

          {showShortcuts && (
            <div className="absolute bottom-full right-0 mb-2 w-60 p-3 bg-[#1e2025] border border-zinc-700 rounded-xl shadow-2xl z-30 text-xs space-y-2 text-zinc-300">
              <div className="font-semibold text-zinc-100 flex items-center justify-between">
                <span>Workspace Shortcuts</span>
                <span className="text-[10px] font-mono text-amber-400">Blender Style</span>
              </div>
              <div className="space-y-1 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Orbit View</span>
                  <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-amber-300">Q</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Translate Gizmo</span>
                  <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-amber-300">W</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Rotate Gizmo</span>
                  <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-amber-300">E</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Scale Gizmo</span>
                  <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-amber-300">R</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Sculpt Surface</span>
                  <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-amber-300">S</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Undo Edit</span>
                  <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-amber-300">Ctrl+Z</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Redo Edit</span>
                  <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-amber-300">Ctrl+Y</span>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
