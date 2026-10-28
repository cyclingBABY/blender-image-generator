import React, { useState } from 'react';
import { Folder, Search, Trash2, Copy, Play, X, Calendar, Layers, Clock } from 'lucide-react';
import { Project } from '../../types';

interface ProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  activeProjectId: string | null;
  onSelectProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onDuplicateProject: (project: Project) => void;
}

export const ProjectsModal: React.FC<ProjectsModalProps> = ({
  isOpen,
  onClose,
  projects,
  activeProjectId,
  onSelectProject,
  onDeleteProject,
  onDuplicateProject,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.settings.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#202227] border border-zinc-700/80 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
              <Folder className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100">Project Library & Versions</h2>
              <p className="text-xs text-zinc-400">Reopen, duplicate, or inspect saved 3D reconstruction projects</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-zinc-800/80 bg-zinc-900/50">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by project name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg pl-9 pr-4 py-2 text-xs text-zinc-200 outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Project List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 text-xs font-mono">
              No projects found. Create a new model in the Upload Studio.
            </div>
          ) : (
            filtered.map((proj) => {
              const isActive = proj.id === activeProjectId;
              const currentVer = proj.versions[proj.currentVersionIndex] || proj.versions[0];
              const stats = currentVer?.stats;

              return (
                <div
                  key={proj.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    isActive
                      ? 'bg-amber-500/10 border-amber-500/40 shadow-sm'
                      : 'bg-zinc-900/80 hover:bg-zinc-900 border-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    {/* Thumbnail preview */}
                    <div className="w-16 h-14 bg-zinc-950 rounded-lg border border-zinc-800 overflow-hidden flex items-center justify-center shrink-0">
                      {proj.thumbnailUrl || proj.inputImageUrl ? (
                        <img
                          src={proj.thumbnailUrl || proj.inputImageUrl}
                          alt={proj.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Layers className="w-6 h-6 text-zinc-600" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-100 text-sm">{proj.name}</span>
                        {isActive && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono px-1.5 py-0.5 rounded">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-zinc-400 font-mono flex items-center gap-3">
                        <span className="capitalize">{proj.settings.category.replace('_', ' ')}</span>
                        <span>·</span>
                        <span>{proj.settings.provider}</span>
                        {stats && (
                          <>
                            <span>·</span>
                            <span>{stats.triangleCount.toLocaleString()} Tris</span>
                          </>
                        )}
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        <span>Updated {new Date(proj.updatedAt).toLocaleDateString()}</span>
                        <span>·</span>
                        <span>{proj.versions.length} version{proj.versions.length > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => onDuplicateProject(proj)}
                      className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg text-xs transition-colors"
                      title="Duplicate Project"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteProject(proj.id)}
                      className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg text-xs transition-colors"
                      title="Delete Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        onSelectProject(proj);
                        onClose();
                      }}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Open</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
