import React from 'react';
import { Palette, Eye, Sliders, Image as ImageIcon, Layers } from 'lucide-react';
import { MaterialSettings } from '../../types';

interface MaterialPanelProps {
  material: MaterialSettings;
  onChange: (material: MaterialSettings) => void;
  hasTextureMap: boolean;
}

export const MaterialPanel: React.FC<MaterialPanelProps> = ({
  material,
  onChange,
  hasTextureMap,
}) => {
  const updateSetting = <K extends keyof MaterialSettings>(key: K, value: MaterialSettings[K]) => {
    onChange({ ...material, [key]: value });
  };

  const presetColors = [
    '#ffffff',
    '#e2e8f0',
    '#94a3b8',
    '#475569',
    '#e87a24',
    '#38bdf8',
    '#10b981',
    '#8b5cf6',
  ];

  return (
    <div className="space-y-4 text-xs">
      {/* 2D UV Layout Preview Toggle (Requested Feature) */}
      <div className={`p-2.5 rounded border transition-all ${
        material.showUvLayout 
          ? 'bg-amber-500/10 border-amber-500/40 text-amber-200' 
          : 'bg-zinc-900 border-zinc-800 text-zinc-300'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className={`w-4 h-4 ${material.showUvLayout ? 'text-amber-400' : 'text-zinc-400'}`} />
            <div>
              <div className="font-semibold text-zinc-100 flex items-center gap-1.5">
                <span>2D UV Layout Preview</span>
                {material.showUvLayout && (
                  <span className="text-[9px] font-mono px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded">
                    ACTIVE
                  </span>
                )}
              </div>
              <div className="text-[10px] text-zinc-500 font-mono">
                Inspect unwrapped texture mapping & seams
              </div>
            </div>
          </div>
          <button
            onClick={() => updateSetting('showUvLayout', !material.showUvLayout)}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
              material.showUvLayout
                ? 'bg-amber-500 text-zinc-950 shadow-sm'
                : 'bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700'
            }`}
          >
            {material.showUvLayout ? 'Exit UV Mode' : 'Inspect UVs'}
          </button>
        </div>
        {material.showUvLayout && (
          <p className="mt-2 text-[10px] text-amber-300/80 leading-relaxed font-mono">
            Viewport switched to 2D UV space [0,1]. Displays texture stretch, island packing, and wireframe seams.
          </p>
        )}
      </div>

      {/* Texture Toggle */}
      <div className="flex items-center justify-between p-2.5 bg-zinc-900 border border-zinc-800 rounded">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-amber-400" />
          <div>
            <div className="font-medium text-zinc-200">Albedo Texture Map</div>
            <div className="text-[10px] text-zinc-500 font-mono">
              {hasTextureMap ? 'UV Map Loaded' : 'Solid Color Mode'}
            </div>
          </div>
        </div>
        <button
          onClick={() => updateSetting('showTexture', !material.showTexture)}
          disabled={!hasTextureMap}
          className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
            material.showTexture && hasTextureMap
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
          } disabled:opacity-40`}
        >
          {material.showTexture && hasTextureMap ? 'Enabled' : 'Disabled'}
        </button>
      </div>

      {/* Base Color Palette */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-zinc-400 font-mono text-[11px]">
          <span className="flex items-center gap-1">
            <Palette className="w-3 h-3 text-zinc-500" /> Base Color Tint
          </span>
          <div className="flex items-center gap-1">
            <input
              type="color"
              value={material.color}
              onChange={(e) => updateSetting('color', e.target.value)}
              className="w-5 h-5 rounded cursor-pointer border border-zinc-700 bg-transparent"
            />
            <span className="font-mono text-zinc-300 uppercase">{material.color}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {presetColors.map((hex) => (
            <button
              key={hex}
              onClick={() => updateSetting('color', hex)}
              className={`w-5 h-5 rounded-full border transition-transform ${
                material.color.toLowerCase() === hex.toLowerCase()
                  ? 'border-white scale-110 shadow-sm'
                  : 'border-zinc-700 hover:scale-105'
              }`}
              style={{ backgroundColor: hex }}
            />
          ))}
        </div>
      </div>

      {/* Roughness Slider */}
      <div className="space-y-1">
        <div className="flex justify-between text-[11px] font-mono text-zinc-400">
          <span>Roughness</span>
          <span>{Math.round(material.roughness * 100)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.02"
          value={material.roughness}
          onChange={(e) => updateSetting('roughness', parseFloat(e.target.value))}
          className="w-full accent-amber-500 h-1 bg-zinc-700 rounded cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
          <span>Glossy (0%)</span>
          <span>Matte (100%)</span>
        </div>
      </div>

      {/* Metalness Slider */}
      <div className="space-y-1">
        <div className="flex justify-between text-[11px] font-mono text-zinc-400">
          <span>Metallic</span>
          <span>{Math.round(material.metalness * 100)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.02"
          value={material.metalness}
          onChange={(e) => updateSetting('metalness', parseFloat(e.target.value))}
          className="w-full accent-sky-400 h-1 bg-zinc-700 rounded cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
          <span>Dielectric (Plastic/Wood)</span>
          <span>Metallic (Chrome/Metal)</span>
        </div>
      </div>

      {/* Wireframe Overlay Toggle */}
      <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
        <div>
          <div className="font-medium text-zinc-200">Wireframe Overlay</div>
          <div className="text-[10px] text-zinc-500">Show polygon edge lines over surface</div>
        </div>
        <button
          onClick={() => updateSetting('wireframe', !material.wireframe)}
          className={`px-2 py-1 text-[11px] rounded transition-colors ${
            material.wireframe
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
              : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
          }`}
        >
          {material.wireframe ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Flat Shading Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium text-zinc-200">Facet / Flat Shading</div>
          <div className="text-[10px] text-zinc-500">Render individual polygon facets</div>
        </div>
        <button
          onClick={() => updateSetting('flatShading', !material.flatShading)}
          className={`px-2 py-1 text-[11px] rounded transition-colors ${
            material.flatShading
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
              : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
          }`}
        >
          {material.flatShading ? 'ON' : 'OFF'}
        </button>
      </div>
    </div>
  );
};
