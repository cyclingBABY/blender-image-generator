import React, { useState } from 'react';
import { 
  Wrench, 
  Sparkles, 
  Minimize2, 
  ShieldCheck, 
  RotateCw, 
  Layers, 
  History, 
  Undo, 
  Redo,
  AlertTriangle
} from 'lucide-react';
import { MeshStats } from '../../types';

interface MeshToolsPanelProps {
  stats: MeshStats | null;
  onWeldDuplicates: () => void;
  onRecalculateNormals: (mode: 'smooth' | 'flat' | 'invert') => void;
  onSimplifyMesh: (reductionFactor: number) => void;
  onSmoothMesh: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  currentVersionIndex: number;
  totalVersions: number;
}

export const MeshToolsPanel: React.FC<MeshToolsPanelProps> = ({
  stats,
  onWeldDuplicates,
  onRecalculateNormals,
  onSimplifyMesh,
  onSmoothMesh,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  currentVersionIndex,
  totalVersions,
}) => {
  const [simplificationLevel, setSimplificationLevel] = useState<number>(0.5); // 50%
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  const handleAction = async (name: string, fn: () => void) => {
    setIsProcessing(true);
    setStatusFeedback(`Applying ${name}...`);
    try {
      // Small tick so UI reflects progress
      await new Promise((r) => setTimeout(r, 60));
      fn();
      setStatusFeedback(`Success: ${name} applied`);
      setTimeout(() => setStatusFeedback(null), 2500);
    } catch (err: any) {
      setStatusFeedback(`Error: ${err?.message || 'Operation failed'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Undo / Redo & Version Bar */}
      <div className="flex items-center justify-between p-2 bg-zinc-900/90 border border-zinc-800 rounded">
        <div className="flex items-center gap-1.5 text-zinc-400">
          <History className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-mono text-[11px]">
            Version {currentVersionIndex + 1} of {totalVersions}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1 rounded text-zinc-300 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Undo"
          >
            <Undo className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1 rounded text-zinc-300 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Redo"
          >
            <Redo className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Status Feedback */}
      {statusFeedback && (
        <div className="p-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded text-[11px] font-mono flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
          <span>{statusFeedback}</span>
        </div>
      )}

      {/* Polygon Reduction (Decimation) */}
      <div className="p-2.5 bg-zinc-900/60 border border-zinc-800 rounded space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-medium text-zinc-200 flex items-center gap-1.5">
            <Minimize2 className="w-3.5 h-3.5 text-sky-400" />
            Polygon Decimation
          </span>
          <span className="text-[11px] font-mono text-sky-400">
            {Math.round(simplificationLevel * 100)}% Reduction
          </span>
        </div>
        <p className="text-[11px] text-zinc-400 leading-relaxed">
          Reduces triangle density while preserving silhouettes, ideal for game engines and Blender performance.
        </p>

        <div className="space-y-1">
          <input
            type="range"
            min="0.1"
            max="0.8"
            step="0.05"
            value={simplificationLevel}
            onChange={(e) => setSimplificationLevel(parseFloat(e.target.value))}
            className="w-full accent-sky-400 h-1 bg-zinc-700 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
            <span>Light (10%)</span>
            <span>Balanced (50%)</span>
            <span>Aggressive (80%)</span>
          </div>
        </div>

        <button
          onClick={() => handleAction('Polygon Decimation', () => onSimplifyMesh(simplificationLevel))}
          disabled={isProcessing}
          className="w-full py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-medium rounded transition-colors disabled:opacity-50"
        >
          Apply Decimation
        </button>
      </div>

      {/* Normals Tools */}
      <div className="p-2.5 bg-zinc-900/60 border border-zinc-800 rounded space-y-2">
        <div className="font-medium text-zinc-200 flex items-center gap-1.5">
          <RotateCw className="w-3.5 h-3.5 text-emerald-400" />
          Vertex Normals & Shading
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            onClick={() => handleAction('Smooth Shading', () => onRecalculateNormals('smooth'))}
            className="py-1 px-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded border border-zinc-700/60 transition-colors"
          >
            Smooth
          </button>
          <button
            onClick={() => handleAction('Flat Shading', () => onRecalculateNormals('flat'))}
            className="py-1 px-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded border border-zinc-700/60 transition-colors"
          >
            Flat
          </button>
          <button
            onClick={() => handleAction('Invert Normals', () => onRecalculateNormals('invert'))}
            className="py-1 px-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded border border-zinc-700/60 transition-colors"
          >
            Invert
          </button>
        </div>
      </div>

      {/* Mesh Cleanup & Healing */}
      <div className="p-2.5 bg-zinc-900/60 border border-zinc-800 rounded space-y-2">
        <div className="font-medium text-zinc-200 flex items-center gap-1.5">
          <Wrench className="w-3.5 h-3.5 text-amber-400" />
          Cleanup & Smoothing
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleAction('Weld Vertices', onWeldDuplicates)}
            className="py-1.5 px-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded border border-zinc-700/60 transition-colors text-left"
          >
            <div className="font-medium text-zinc-200">Weld Vertices</div>
            <div className="text-[10px] text-zinc-500">Merge coincident points</div>
          </button>

          <button
            onClick={() => handleAction('Laplacian Smooth', onSmoothMesh)}
            className="py-1.5 px-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded border border-zinc-700/60 transition-colors text-left"
          >
            <div className="font-medium text-zinc-200">Laplacian Smooth</div>
            <div className="text-[10px] text-zinc-500">Relax sharp spikes</div>
          </button>
        </div>
      </div>

      {/* Mesh Manifold Diagnostics */}
      <div className="p-2 bg-zinc-900/40 border border-zinc-800/80 rounded flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1.5 text-zinc-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Geometry Integrity</span>
        </div>
        <span className="font-mono text-emerald-400 font-medium">
          {stats?.isManifold ? 'Watertight Manifold' : 'Open Surface Mesh'}
        </span>
      </div>
    </div>
  );
};
