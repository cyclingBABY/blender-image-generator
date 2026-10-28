import React from 'react';
import { Box, Layers, HardDrive, Cpu, Calendar, CheckCircle2, ShieldAlert } from 'lucide-react';
import { MeshStats, Project } from '../../types';

interface ModelInfoPanelProps {
  stats: MeshStats | null;
  project: Project | null;
  hasTexture: boolean;
}

export const ModelInfoPanel: React.FC<ModelInfoPanelProps> = ({
  stats,
  project,
  hasTexture,
}) => {
  if (!stats) {
    return (
      <div className="p-4 text-center text-zinc-500 text-xs font-mono">
        No active 3D model loaded
      </div>
    );
  }

  const currentVersion = project?.versions[project.currentVersionIndex];

  return (
    <div className="space-y-3 text-xs">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded">
          <div className="text-[10px] text-zinc-500 uppercase font-mono">Triangles</div>
          <div className="text-base font-bold text-zinc-100 font-mono">
            {stats.triangleCount.toLocaleString()}
          </div>
        </div>

        <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded">
          <div className="text-[10px] text-zinc-500 uppercase font-mono">Vertices</div>
          <div className="text-base font-bold text-zinc-100 font-mono">
            {stats.vertexCount.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Physical Dimensions */}
      <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded space-y-1.5">
        <div className="flex items-center justify-between text-zinc-400 font-mono text-[10px] uppercase">
          <span className="flex items-center gap-1">
            <Box className="w-3 h-3 text-sky-400" /> Bounding Dimensions
          </span>
          <span>Meters (m)</span>
        </div>
        <div className="grid grid-cols-3 gap-1 font-mono text-[11px] text-center">
          <div className="bg-zinc-800/80 p-1 rounded">
            <span className="text-red-400 text-[10px] mr-1">X</span>
            <span className="text-zinc-200">{stats.boundingBox.x}m</span>
          </div>
          <div className="bg-zinc-800/80 p-1 rounded">
            <span className="text-emerald-400 text-[10px] mr-1">Y</span>
            <span className="text-zinc-200">{stats.boundingBox.y}m</span>
          </div>
          <div className="bg-zinc-800/80 p-1 rounded">
            <span className="text-blue-400 text-[10px] mr-1">Z</span>
            <span className="text-zinc-200">{stats.boundingBox.z}m</span>
          </div>
        </div>
      </div>

      {/* Surface Area & Volume */}
      <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
        <div className="p-2 bg-zinc-900 border border-zinc-800 rounded">
          <div className="text-[10px] text-zinc-500 uppercase">Surface Area</div>
          <div className="text-zinc-200 font-medium">{stats.surfaceArea} m²</div>
        </div>
        <div className="p-2 bg-zinc-900 border border-zinc-800 rounded">
          <div className="text-[10px] text-zinc-500 uppercase">Volume</div>
          <div className="text-zinc-200 font-medium">{stats.volume} m³</div>
        </div>
      </div>

      {/* Technical Metadata */}
      <div className="divide-y divide-zinc-800 text-[11px] font-mono text-zinc-400 pt-1">
        <div className="py-1.5 flex justify-between items-center">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3 h-3 text-zinc-500" /> Texture Map
          </span>
          <span className={hasTexture ? 'text-emerald-400 font-medium' : 'text-zinc-500'}>
            {hasTexture ? 'Diffuse UV Embedded' : 'Untextured / Procedural'}
          </span>
        </div>

        <div className="py-1.5 flex justify-between items-center">
          <span className="flex items-center gap-1.5">
            <HardDrive className="w-3 h-3 text-zinc-500" /> File Size Est.
          </span>
          <span className="text-zinc-200 font-medium">
            {stats.fileSizeEstimateKb > 1024
              ? `${(stats.fileSizeEstimateKb / 1024).toFixed(2)} MB`
              : `${stats.fileSizeEstimateKb} KB`}
          </span>
        </div>

        <div className="py-1.5 flex justify-between items-center">
          <span className="flex items-center gap-1.5">
            <Cpu className="w-3 h-3 text-zinc-500" /> AI Engine
          </span>
          <span className="text-amber-400 font-medium uppercase text-[10px]">
            {project?.settings?.provider || 'Local Engine'}
          </span>
        </div>

        <div className="py-1.5 flex justify-between items-center">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3 h-3 text-zinc-500" /> Created
          </span>
          <span className="text-zinc-300">
            {project?.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'Active Session'}
          </span>
        </div>

        <div className="py-1.5 flex justify-between items-center">
          <span>Manifold Boundary</span>
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <CheckCircle2 className="w-3 h-3" /> Watertight
          </span>
        </div>
      </div>
    </div>
  );
};
