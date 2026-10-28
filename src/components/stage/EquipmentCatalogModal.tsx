import React, { useState } from 'react';
import * as THREE from 'three';
import { 
  Lightbulb, 
  Maximize, 
  Tv, 
  Volume2, 
  Layers, 
  Heart, 
  Cpu, 
  Search, 
  Plus, 
  X, 
  Zap, 
  Scale, 
  Radio, 
  Check, 
  Sparkles,
  Info
} from 'lucide-react';
import { EquipmentCategory, EquipmentTemplate } from '../../types';
import { EVENT_EQUIPMENT_TEMPLATES, queryEquipmentCatalog } from '../../services/equipmentLibrary';

interface EquipmentCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: EquipmentTemplate) => void;
  onLoadPresetRig?: (presetType: 'concert_festival' | 'wedding_reception') => void;
}

export const EquipmentCatalogModal: React.FC<EquipmentCatalogModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  onLoadPresetRig,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<EquipmentCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<EquipmentTemplate | null>(EVENT_EQUIPMENT_TEMPLATES[0]);
  const [addedSuccess, setAddedSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories: { id: EquipmentCategory | 'all'; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'All Equipment', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'lighting', label: 'Stage Lighting', icon: <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> },
    { id: 'trussing', label: 'Trussing & Rigging', icon: <Maximize className="w-3.5 h-3.5 text-sky-400" /> },
    { id: 'video', label: 'LED Screens & Video', icon: <Tv className="w-3.5 h-3.5 text-emerald-400" /> },
    { id: 'audio', label: 'Sound & Audio', icon: <Volume2 className="w-3.5 h-3.5 text-rose-400" /> },
    { id: 'staging', label: 'Stages & Risers', icon: <Layers className="w-3.5 h-3.5 text-purple-400" /> },
    { id: 'decor', label: 'Décor & Wedding', icon: <Heart className="w-3.5 h-3.5 text-pink-400" /> },
    { id: 'power_control', label: 'Control & Power', icon: <Cpu className="w-3.5 h-3.5 text-cyan-400" /> },
  ];

  const filteredItems = queryEquipmentCatalog(selectedCategory, searchQuery);

  const handleAdd = (template: EquipmentTemplate) => {
    onSelectTemplate(template);
    setAddedSuccess(template.name);
    setTimeout(() => setAddedSuccess(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 md:p-6">
      <div className="bg-[#1c1d22] border border-zinc-700/80 rounded-2xl w-full max-w-5xl h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Header Bar */}
        <div className="p-4 md:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-amber-600 to-amber-400 text-zinc-950 rounded-xl shadow-md">
              <Lightbulb className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base md:text-lg font-bold text-zinc-100">
                  3D Event Equipment Template Library
                </h2>
                <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded">
                  50+ Verified 3D Templates
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Instantly assemble concert stages, wedding setups, lighting rigs, audio line arrays, and LED video walls.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="p-3 border-b border-zinc-800 bg-zinc-950/40 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Horizontal category scroll */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium shrink-0 transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm'
                    : 'bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-800'
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search fixtures, DMX, truss..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-9 pr-4 py-2 text-xs text-zinc-200 outline-none focus:border-amber-500 font-mono"
            />
          </div>
        </div>

        {/* Quick Stage Preset Builders Banner */}
        {onLoadPresetRig && (
          <div className="px-4 py-2.5 bg-gradient-to-r from-amber-500/10 via-sky-500/10 to-transparent border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-semibold text-zinc-200 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              1-Click Ready Complete Setups:
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onLoadPresetRig('concert_festival');
                  onClose();
                }}
                className="px-3 py-1 bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 border border-zinc-700 rounded text-zinc-300 transition-colors font-medium flex items-center gap-1.5"
              >
                <span>🎸 Concert Arena Rig</span>
              </button>
              <button
                onClick={() => {
                  onLoadPresetRig('wedding_reception');
                  onClose();
                }}
                className="px-3 py-1 bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 border border-zinc-700 rounded text-zinc-300 transition-colors font-medium flex items-center gap-1.5"
              >
                <span>💍 Wedding Reception Stage</span>
              </button>
            </div>
          </div>
        )}

        {/* Added Notification Banner */}
        {addedSuccess && (
          <div className="p-2.5 bg-emerald-500/15 border-b border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center justify-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Added "{addedSuccess}" to 3D scene!</span>
          </div>
        )}

        {/* Main Split Grid: Catalog Grid (Left 7 cols) & Inspector / Specs (Right 5 cols) */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* Catalog Grid */}
          <div className="md:col-span-7 p-4 overflow-y-auto border-r border-zinc-800 space-y-3">
            <div className="text-[11px] font-mono text-zinc-400 flex items-center justify-between">
              <span>{filteredItems.length} Models Available</span>
              <span className="text-zinc-500">Click item to view specifications</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredItems.map((item) => {
                const isSelected = selectedTemplate?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedTemplate(item)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 shadow-md shadow-amber-500/10'
                        : 'bg-zinc-900/80 hover:bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      {/* SVG Thumbnail Render */}
                      <div
                        className="w-full h-24 rounded-lg bg-zinc-950 flex items-center justify-center p-2 mb-2 border border-zinc-800/80 group-hover:border-zinc-700 overflow-hidden"
                        dangerouslySetInnerHTML={{ __html: item.thumbnailSvg }}
                      />

                      <div className="font-semibold text-xs text-zinc-200 group-hover:text-amber-400 transition-colors line-clamp-1">
                        {item.name}
                      </div>

                      <div className="text-[10px] font-mono text-zinc-500 mt-0.5 flex items-center justify-between">
                        <span>{item.subcategory}</span>
                        {item.powerWatts > 0 && <span>{item.powerWatts}W</span>}
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-zinc-800 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-zinc-400">
                        {item.dimensions.width}×{item.dimensions.height}m
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAdd(item);
                        }}
                        className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-zinc-950 font-bold rounded text-[11px] transition-colors flex items-center gap-1"
                        title="Add to Scene"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Inspector & Fixture Details */}
          <div className="md:col-span-5 p-5 overflow-y-auto bg-zinc-900/40 space-y-4 text-xs">
            {selectedTemplate ? (
              <>
                <div className="space-y-1.5 border-b border-zinc-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-800 text-amber-400 border border-zinc-700">
                      {selectedTemplate.category}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-500">
                      {selectedTemplate.subcategory}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-zinc-100">{selectedTemplate.name}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {selectedTemplate.description}
                  </p>
                </div>

                {/* Big Preview Thumbnail */}
                <div
                  className="w-full h-36 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-center p-3"
                  dangerouslySetInnerHTML={{ __html: selectedTemplate.thumbnailSvg }}
                />

                {/* Physical Specifications */}
                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl space-y-2 font-mono text-[11px]">
                  <div className="text-zinc-400 text-[10px] uppercase font-bold flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-sky-400" />
                    Physical Dimensions & Mounting
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-zinc-300">
                    <div>
                      <span className="text-zinc-500 block text-[10px]">Dimensions:</span>
                      <span>{selectedTemplate.dimensions.width}m × {selectedTemplate.dimensions.height}m × {selectedTemplate.dimensions.depth}m</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[10px]">Weight:</span>
                      <span>{selectedTemplate.weightKg} kg</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[10px]">Mounting Type:</span>
                      <span className="capitalize">{selectedTemplate.mountingType.replace('_', ' ')}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[10px]">Default Color:</span>
                      <div className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full border border-zinc-700" style={{ backgroundColor: selectedTemplate.color }} />
                        <span className="uppercase">{selectedTemplate.color}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Electrical & DMX Specifications */}
                {(selectedTemplate.powerWatts > 0 || selectedTemplate.dmxChannels) && (
                  <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl space-y-2 font-mono text-[11px]">
                    <div className="text-zinc-400 text-[10px] uppercase font-bold flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      Electrical & Control Specs
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-zinc-300">
                      <div>
                        <span className="text-zinc-500 block text-[10px]">Power Consumption:</span>
                        <span className="text-amber-400 font-bold">{selectedTemplate.powerWatts} Watts</span>
                      </div>
                      {selectedTemplate.dmxChannels && (
                        <div>
                          <span className="text-zinc-500 block text-[10px]">DMX Footprint:</span>
                          <span className="text-sky-400 font-bold">{selectedTemplate.dmxChannels} Channels</span>
                        </div>
                      )}
                      {selectedTemplate.beamAngleDeg && (
                        <div>
                          <span className="text-zinc-500 block text-[10px]">Beam Angle:</span>
                          <span>{selectedTemplate.beamAngleDeg}°</span>
                        </div>
                      )}
                      {selectedTemplate.photometrics?.luxAt5m && (
                        <div>
                          <span className="text-zinc-500 block text-[10px]">Output @ 5m:</span>
                          <span>{selectedTemplate.photometrics.luxAt5m.toLocaleString()} Lux</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {selectedTemplate.tags.map((tag) => (
                    <span key={tag} className="text-[10px] font-mono px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Add to Scene Primary Action */}
                <div className="pt-2">
                  <button
                    onClick={() => handleAdd(selectedTemplate)}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold rounded-lg shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer text-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add {selectedTemplate.name} to 3D Scene</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-zinc-500 font-mono">
                Select an equipment model from the catalog on the left.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
