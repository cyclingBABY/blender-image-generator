import React from 'react';
import { Sparkles, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { GenerationJob, JobStatus } from '../../types';

interface GenerationProgressModalProps {
  job: GenerationJob | null;
  onCancel: () => void;
  onClose: () => void;
}

export const GenerationProgressModal: React.FC<GenerationProgressModalProps> = ({
  job,
  onCancel,
  onClose,
}) => {
  if (!job || job.status === 'idle') return null;

  const isFinished = job.status === 'completed';
  const isFailed = job.status === 'failed' || job.status === 'cancelled';

  // Automatically take user to 3D workspace after brief success display
  React.useEffect(() => {
    if (isFinished) {
      const timer = setTimeout(() => {
        onClose();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isFinished, onClose]);

  const stages: { key: JobStatus; label: string }[] = [
    { key: 'preparing_image', label: 'Preparing & Normalizing Image' },
    { key: 'waiting_for_gpu', label: 'Allocating Model Worker' },
    { key: 'generating_geometry', label: 'Synthesizing 3D Geometry' },
    { key: 'generating_textures', label: 'Baking UV Textures & Materials' },
    { key: 'optimizing_mesh', label: 'Optimizing Normals & Preview' },
  ];

  const getStageIndex = (status: JobStatus) => {
    switch (status) {
      case 'preparing_image': return 0;
      case 'waiting_for_gpu': return 1;
      case 'generating_geometry': return 2;
      case 'generating_textures': return 3;
      case 'optimizing_mesh': return 4;
      case 'completed': return 5;
      default: return 0;
    }
  };

  const currentIdx = getStageIndex(job.status);

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#202227] border border-zinc-700/80 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-100 text-sm">
                {isFinished ? 'Model Generation Complete' : isFailed ? 'Generation Stopped' : 'AI 3D Synthesis in Progress'}
              </h3>
              <p className="text-[11px] text-zinc-400 font-mono">
                Engine: {job.provider} · {job.inputImageName}
              </p>
            </div>
          </div>
          {isFinished || isFailed ? (
            <button onClick={onClose} className="text-zinc-400 hover:text-white p-1 rounded">
              <X className="w-4 h-4" />
            </button>
          ) : null}
        </div>

        {/* Progress Bar & Numerical Percentage */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-zinc-300 font-medium">{job.statusMessage}</span>
            <span className="text-amber-400 font-bold">{job.progress}%</span>
          </div>
          <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden p-0.5 border border-zinc-700/50">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isFailed ? 'bg-red-500' : isFinished ? 'bg-emerald-500' : 'bg-gradient-to-r from-amber-500 to-amber-400'
              }`}
              style={{ width: `${Math.max(5, job.progress)}%` }}
            />
          </div>
        </div>

        {/* Pipeline Step List */}
        <div className="space-y-2 py-1">
          {stages.map((stg, i) => {
            const isDone = currentIdx > i || isFinished;
            const isCurrent = currentIdx === i && !isFinished && !isFailed;
            return (
              <div
                key={stg.key}
                className={`flex items-center gap-2.5 text-xs transition-colors ${
                  isDone
                    ? 'text-zinc-300'
                    : isCurrent
                    ? 'text-amber-300 font-semibold'
                    : 'text-zinc-600'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                    isDone
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : isCurrent
                      ? 'bg-amber-500 text-zinc-950 font-bold'
                      : 'bg-zinc-800 text-zinc-600'
                  }`}
                >
                  {isDone ? '✓' : i + 1}
                </div>
                <span>{stg.label}</span>
              </div>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="pt-2 border-t border-zinc-800 flex justify-end gap-2">
          {!isFinished && !isFailed && (
            <button
              onClick={onCancel}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded transition-colors"
            >
              Cancel Generation
            </button>
          )}

          {isFinished && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Open in 3D Workspace</span>
            </button>
          )}

          {isFailed && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded transition-colors"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
