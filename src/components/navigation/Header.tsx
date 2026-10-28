import React from 'react';
import { 
  Box, 
  Upload, 
  Layers, 
  Folder, 
  Settings, 
  Download, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export type AppView = 'workspace' | 'upload' | 'stage';

interface HeaderProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  onOpenProjects: () => void;
  onOpenSettings: () => void;
  onOpenExport: () => void;
  onOpenTests: () => void;
  onOpenCatalog: () => void;
  onQuickUpload?: () => void;
  hasActiveModel: boolean;
  projectName: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  onOpenProjects,
  onOpenSettings,
  onOpenExport,
  onOpenTests,
  onOpenCatalog,
  onQuickUpload,
  hasActiveModel,
  projectName,
}) => {
  return (
    <header className="h-14 bg-[#1e2025] border-b border-zinc-800 px-3 md:px-5 flex items-center justify-between select-none z-30">
      {/* Brand & Project Name */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-zinc-950 shadow-md shadow-amber-500/20">
            <Box className="w-4 h-4 fill-current" />
          </div>
          <div>
            <div className="text-sm font-bold text-zinc-100 tracking-tight flex items-center gap-1.5">
              <span>Image3D</span>
              <span className="text-amber-400 font-semibold text-xs px-1 py-0.2 bg-amber-400/10 rounded">STUDIO</span>
            </div>
            <div className="text-[10px] text-zinc-400 font-mono hidden sm:block truncate max-w-[180px]">
              {projectName}
            </div>
          </div>
        </div>
      </div>

      {/* Center Mode Switcher Tabs */}
      <div className="flex items-center p-1 bg-zinc-900/90 border border-zinc-800 rounded-lg text-xs">
        <button
          onClick={() => onViewChange('workspace')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
            currentView === 'workspace'
              ? 'bg-zinc-800 text-amber-400 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Box className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">3D Workspace</span>
        </button>

        <button
          onClick={() => onViewChange('upload')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
            currentView === 'upload'
              ? 'bg-zinc-800 text-amber-400 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Upload & AI</span>
        </button>

        <button
          onClick={() => onViewChange('stage')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
            currentView === 'stage'
              ? 'bg-zinc-800 text-amber-400 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Stage Rig Assembler</span>
        </button>
      </div>

      {/* Right Tools & Export Button */}
      <div className="flex items-center gap-1.5 md:gap-2">
        {onQuickUpload && (
          <button
            onClick={onQuickUpload}
            className="px-2.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold rounded-lg transition-colors flex items-center gap-1.5 text-xs shadow-xs cursor-pointer"
            title="Upload an image to convert to 3D and display as sole model in workspace"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Upload Photo</span>
          </button>
        )}

        <button
          onClick={onOpenCatalog}
          className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-amber-400 hover:text-amber-300 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold border border-zinc-700/80 shadow-xs cursor-pointer"
          title="Open 3D Event Equipment Template Library (50+ Templates)"
        >
          <Layers className="w-3.5 h-3.5" />
          <span className="hidden md:inline">3D Equipment Catalog</span>
          <span className="md:hidden">Catalog</span>
        </button>

        <button
          onClick={onOpenTests}
          className="p-2 text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800/80 rounded-lg transition-colors hidden lg:flex items-center gap-1 text-xs"
          title="Automated Test Runner"
        >
          <ShieldCheck className="w-4 h-4" />
          <span className="font-mono text-[11px]">QA</span>
        </button>

        <button
          onClick={onOpenProjects}
          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/80 rounded-lg transition-colors"
          title="Saved Projects Library"
        >
          <Folder className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenSettings}
          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/80 rounded-lg transition-colors"
          title="AI Engines & Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        <div className="h-5 w-px bg-zinc-800 mx-1 hidden sm:block" />

        <button
          onClick={onOpenExport}
          disabled={!hasActiveModel}
          className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs rounded-lg shadow-sm shadow-amber-500/20 flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
          title="Export as native .blend file, Blender project pack, or standard 3D formats"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export .blend</span>
          <span className="sm:hidden">.blend</span>
        </button>
      </div>
    </header>
  );
};
