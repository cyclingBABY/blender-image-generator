import React, { useState } from 'react';
import * as THREE from 'three';
import { 
  Download, 
  FileCode, 
  Package, 
  FileText, 
  Layers, 
  Printer, 
  Check, 
  Sparkles, 
  X, 
  Terminal,
  ExternalLink,
  Flame,
  FileCheck
} from 'lucide-react';
import { MaterialSettings, MeshStats } from '../../types';
import { 
  createBlenderExportZip, 
  exportToNativeBlend,
  exportToOBJ, 
  exportToSTL, 
  exportToPLY, 
  generateBlenderPythonScript 
} from '../../services/blenderExport';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  geometry: THREE.BufferGeometry | null;
  materialSettings: MaterialSettings;
  stats: MeshStats | null;
  referenceImage?: string;
  textureImage?: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  projectName,
  geometry,
  materialSettings,
  stats,
  referenceImage,
  textureImage,
}) => {
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [isExportingBlend, setIsExportingBlend] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  if (!isOpen || !geometry || !stats) return null;

  const triggerDownload = (blob: Blob, filename: string) => {
    // Ensure correct binary mime type for Blender
    const mimeType = filename.endsWith('.blend') 
      ? 'application/x-blender' 
      : filename.endsWith('.zip') 
      ? 'application/zip' 
      : blob.type || 'application/octet-stream';
    const binaryBlob = new Blob([blob], { type: mimeType });
    const url = URL.createObjectURL(binaryBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    // Delay revocation by 60 seconds to prevent premature download abortion in browser iframes
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 60000);

    setDownloadSuccess(filename);
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  // 1. Direct Native .BLEND File Export
  const handleExportBlend = async () => {
    setIsExportingBlend(true);
    setExportError(null);
    try {
      const blendBlob = await exportToNativeBlend(
        geometry,
        materialSettings,
        stats,
        projectName,
        referenceImage,
        textureImage
      );
      const safeName = (projectName || 'Model').replace(/[^a-zA-Z0-9_-]/g, '_');
      triggerDownload(blendBlob, `${safeName}.blend`);
    } catch (e: any) {
      console.error('Failed to export native .blend:', e);
      setExportError(e?.message || 'Failed to export .blend file. Try the Blender ZIP pack as fallback.');
    } finally {
      setIsExportingBlend(false);
    }
  };

  // 2. Comprehensive Blender Automation ZIP Pack
  const handleExportZip = async () => {
    setIsExportingZip(true);
    setExportError(null);
    try {
      const zipBlob = await createBlenderExportZip(
        projectName,
        geometry,
        materialSettings,
        stats,
        referenceImage,
        textureImage
      );
      const safeName = (projectName || 'Model').replace(/[^a-zA-Z0-9_-]/g, '_');
      triggerDownload(zipBlob, `${safeName}_blender_pack.zip`);
    } catch (e: any) {
      console.error(e);
      setExportError('Export failed: ' + e?.message);
    } finally {
      setIsExportingZip(false);
    }
  };

  const handleExportOBJ = () => {
    const { objContent } = exportToOBJ(geometry, materialSettings, projectName);
    const blob = new Blob([objContent], { type: 'text/plain;charset=utf-8' });
    triggerDownload(blob, `${projectName}.obj`);
  };

  const handleExportSTL = () => {
    const stlContent = exportToSTL(geometry, projectName);
    const blob = new Blob([stlContent], { type: 'text/plain;charset=utf-8' });
    triggerDownload(blob, `${projectName}.stl`);
  };

  const handleExportPLY = () => {
    const plyContent = exportToPLY(geometry);
    const blob = new Blob([plyContent], { type: 'text/plain;charset=utf-8' });
    triggerDownload(blob, `${projectName}.ply`);
  };

  const handleExportPythonScript = () => {
    const script = generateBlenderPythonScript(projectName, stats, materialSettings);
    const blob = new Blob([script], { type: 'text/plain;charset=utf-8' });
    triggerDownload(blob, `import_to_blender.py`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#202227] border border-zinc-700/80 rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-600 text-zinc-950 font-bold rounded-xl shadow-md">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                <span>Export 3D Model & Blender Suite</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  .BLEND Supported
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Generate native Blender project files, automation scripts, and standard 3D formats.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Download Success Banner */}
        {downloadSuccess && (
          <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-mono flex items-center gap-2 animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Downloaded successfully: <strong className="text-emerald-200">{downloadSuccess}</strong></span>
          </div>
        )}

        {/* Error Banner */}
        {exportError && (
          <div className="p-3 bg-rose-500/15 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <X className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{exportError}</span>
          </div>
        )}

        {/* 1. PREMIER HERO OPTION: NATIVE .BLEND FILE */}
        <div className="p-5 bg-gradient-to-br from-amber-500/20 via-orange-600/15 to-transparent border-2 border-amber-500/60 rounded-2xl shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-amber-500 text-zinc-950 uppercase tracking-wide">
                  .BLEND
                </span>
                <h3 className="text-base font-bold text-zinc-100">
                  Native Blender Scene File (.blend)
                </h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono font-semibold">
                  1-Click Direct Open
                </span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed pt-1">
                Generates a genuine, authentic <strong>.blend</strong> project binary using headless Blender. Double-click to open immediately in Blender (v3.0–v4.x+) with:
              </p>
              <ul className="text-[11px] text-zinc-400 grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1 font-mono">
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Full 3D Mesh & Smooth Normals
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Principled BSDF Shader & Textures
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  3-Point Studio Lighting Rig
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  50mm Product Camera with Target
                </li>
              </ul>
            </div>

            <button
              onClick={handleExportBlend}
              disabled={isExportingBlend}
              className="sm:self-center px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-extrabold text-sm rounded-xl shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer shrink-0"
            >
              {isExportingBlend ? (
                <>
                  <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                  <span>Compiling .blend...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Export .blend File</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 2. OPTION B: COMPLETE BLENDER AUTOMATION PACK (.ZIP) */}
        <div className="p-4 bg-zinc-900/90 border border-zinc-800 rounded-xl space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-200">Blender Complete Project Bundle (.ZIP)</span>
                <span className="text-[10px] bg-zinc-800 text-zinc-400 border border-zinc-700 px-1.5 py-0.5 rounded font-mono">
                  Full Assets
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Contains the OBJ, MTL, textures, reference photos, manifest, and an automated Python runner (<code className="text-amber-400 font-mono">import_to_blender.py</code>).
              </p>
            </div>
            <button
              onClick={handleExportZip}
              disabled={isExportingZip}
              className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shrink-0"
            >
              {isExportingZip ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-zinc-200 border-t-transparent rounded-full animate-spin" />
                  <span>Zipping...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>Download ZIP</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 3. INDIVIDUAL FILE FORMATS */}
        <div className="space-y-3">
          <div className="text-xs font-mono uppercase text-zinc-400">Standard 3D File Formats</div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* OBJ & MTL */}
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-between">
              <div>
                <div className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-sky-400" />
                  Wavefront (.OBJ)
                </div>
                <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                  Includes MTL material & UV coordinates
                </div>
              </div>
              <button
                onClick={handleExportOBJ}
                className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white rounded text-xs transition-colors cursor-pointer"
                title="Download OBJ"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>

            {/* STL for 3D Printing */}
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-between">
              <div>
                <div className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
                  <Printer className="w-4 h-4 text-emerald-400" />
                  3D Print Mesh (.STL)
                </div>
                <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                  Solid triangulated geometry for slicers
                </div>
              </div>
              <button
                onClick={handleExportSTL}
                className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white rounded text-xs transition-colors cursor-pointer"
                title="Download STL"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>

            {/* PLY Polygon */}
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-between">
              <div>
                <div className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-purple-400" />
                  Stanford Triangle (.PLY)
                </div>
                <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                  Point cloud / polygon mesh interchange
                </div>
              </div>
              <button
                onClick={handleExportPLY}
                className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white rounded text-xs transition-colors cursor-pointer"
                title="Download PLY"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>

            {/* Standalone Blender Python Script */}
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-between">
              <div>
                <div className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
                  <FileCode className="w-4 h-4 text-amber-400" />
                  Blender Script (.PY)
                </div>
                <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                  Automated scene builder script
                </div>
              </div>
              <button
                onClick={handleExportPythonScript}
                className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white rounded text-xs transition-colors cursor-pointer"
                title="Download import_to_blender.py"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Blender Compatibility Info */}
        <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1.5 text-xs text-zinc-400">
          <div className="font-semibold text-zinc-200 flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-amber-400" />
            <span>Blender Compatibility & Features</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            The exported <code className="text-amber-300 font-mono">.blend</code> file is compiled using Blender's native Python engine and is compatible with <strong>Blender 3.0, 3.4, 3.6 LTS, 4.0, 4.1, and 4.2+</strong>. It automatically arranges collections, applies smooth normals, connects Principled BSDF nodes, and places 3-point lighting.
          </p>
        </div>
      </div>
    </div>
  );
};
