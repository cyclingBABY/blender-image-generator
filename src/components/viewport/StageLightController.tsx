import React, { useState } from 'react';
import { 
  Lightbulb, 
  RotateCw, 
  Zap, 
  Sliders, 
  Eye, 
  EyeOff, 
  Play, 
  Pause, 
  ChevronUp, 
  ChevronDown, 
  Sparkles,
  Maximize2
} from 'lucide-react';

export interface StageLightState {
  beamEnabled: boolean;
  beamColor: string;
  beamIntensity: number;
  beamAngle: number;
  panAngle: number;
  tiltAngle: number;
  autoSweep: boolean;
  strobeMode: 'off' | 'slow' | 'fast';
  fixtureType: 'beam' | 'spot' | 'wash' | 'hybrid';
}

interface StageLightControllerProps {
  lightState: StageLightState;
  onChangeLightState: (newState: Partial<StageLightState>) => void;
  onSwitchFixture?: (type: 'beam' | 'spot' | 'wash' | 'hybrid') => void;
  isLightFixture?: boolean;
}

const COLOR_PRESETS = [
  { name: 'Laser Cyan', hex: '#00f0ff' },
  { name: 'Concert Amber', hex: '#ff8800' },
  { name: 'Cyber Magenta', hex: '#ff00aa' },
  { name: 'Acid Green', hex: '#00ff44' },
  { name: 'UV Violet', hex: '#7700ff' },
  { name: 'Pure White', hex: '#ffffff' },
  { name: 'Tungsten 3200K', hex: '#ffb366' },
  { name: 'Laser Red', hex: '#ff2200' },
];

export const StageLightController: React.FC<StageLightControllerProps> = ({
  lightState,
  onChangeLightState,
  onSwitchFixture,
  isLightFixture = true,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  return (
    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 w-[94%] max-w-3xl select-none transition-all duration-300">
      {/* Sleek Floating Dock Header with Toggle */}
      <div className="flex items-center justify-between mb-1 px-3">
        <div className="flex items-center gap-2 bg-zinc-950/85 backdrop-blur-md px-3 py-1 rounded-full border border-zinc-700/80 shadow-lg text-[11px] font-mono text-zinc-300">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
          <span className="font-bold text-zinc-100">Live 3D Moving Head & Beam Visualizer</span>
          <span className="text-zinc-500">·</span>
          <span className="text-amber-400 capitalize">{lightState.fixtureType} Fixture</span>
          {lightState.autoSweep && (
            <span className="text-[10px] text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-1.5 py-0.2 rounded font-mono">
              Auto Sweep Active
            </span>
          )}
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="bg-zinc-950/85 hover:bg-zinc-800 text-zinc-300 hover:text-white px-2.5 py-1 rounded-full border border-zinc-700/80 text-xs font-mono flex items-center gap-1 shadow-lg transition-colors cursor-pointer"
        >
          {isExpanded ? (
            <>
              <span>Hide Controls</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              <span>Light Controls</span>
              <ChevronUp className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>

      {/* Main Glassmorphic Dock Body */}
      {isExpanded && (
        <div className="bg-zinc-950/90 backdrop-blur-md border border-zinc-700/80 rounded-2xl p-3.5 shadow-2xl space-y-3 text-xs">
          {/* Top Row: Fixture Switcher + Beam Toggle + Auto Sweep + Strobe */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-2.5">
            {/* Quick Fixture Presets */}
            <div className="flex items-center gap-1 bg-zinc-900/90 p-1 rounded-lg border border-zinc-800 text-[11px] font-mono">
              <span className="text-zinc-400 px-1.5 font-semibold">Fixture:</span>
              {(['beam', 'spot', 'wash', 'hybrid'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    onChangeLightState({ fixtureType: type });
                    if (onSwitchFixture) onSwitchFixture(type);
                  }}
                  className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer capitalize ${
                    lightState.fixtureType === type
                      ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Beam Power & Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onChangeLightState({ beamEnabled: !lightState.beamEnabled })}
                className={`px-3 py-1.5 rounded-lg font-mono text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  lightState.beamEnabled
                    ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                }`}
              >
                {lightState.beamEnabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>Beam {lightState.beamEnabled ? 'ON' : 'OFF'}</span>
              </button>

              <button
                onClick={() => onChangeLightState({ autoSweep: !lightState.autoSweep })}
                className={`px-3 py-1.5 rounded-lg font-mono text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  lightState.autoSweep
                    ? 'bg-sky-500 text-zinc-950 shadow-md shadow-sky-500/20'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                }`}
              >
                {lightState.autoSweep ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>Auto Sweep</span>
              </button>

              <button
                onClick={() => {
                  const nextStrobe = lightState.strobeMode === 'off' ? 'slow' : lightState.strobeMode === 'slow' ? 'fast' : 'off';
                  onChangeLightState({ strobeMode: nextStrobe });
                }}
                className={`px-2.5 py-1.5 rounded-lg font-mono text-[11px] font-medium flex items-center gap-1 transition-all cursor-pointer ${
                  lightState.strobeMode !== 'off'
                    ? 'bg-rose-500 text-white font-bold animate-pulse'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Strobe: {lightState.strobeMode.toUpperCase()}</span>
              </button>
            </div>
          </div>

          {/* Middle Row: DMX Color Presets & Intensity */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Color Swatches */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono text-zinc-400 mr-1">Beam Color:</span>
              {COLOR_PRESETS.map((color) => (
                <button
                  key={color.hex}
                  onClick={() => onChangeLightState({ beamColor: color.hex })}
                  title={color.name}
                  className={`w-6 h-6 rounded-full border transition-transform cursor-pointer flex items-center justify-center ${
                    lightState.beamColor.toLowerCase() === color.hex.toLowerCase()
                      ? 'scale-125 border-white ring-2 ring-amber-500/60 shadow-md'
                      : 'border-zinc-700 hover:scale-110 opacity-75 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: color.hex }}
                />
              ))}
            </div>

            {/* Beam Intensity Slider */}
            <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-400 min-w-[170px]">
              <span>Intensity:</span>
              <input
                type="range"
                min="0.1"
                max="2.0"
                step="0.05"
                value={lightState.beamIntensity}
                onChange={(e) => onChangeLightState({ beamIntensity: parseFloat(e.target.value) })}
                className="w-24 accent-amber-500 h-1 bg-zinc-700 rounded cursor-pointer"
              />
              <span className="text-zinc-200 font-bold w-9">{Math.round(lightState.beamIntensity * 100)}%</span>
            </div>
          </div>

          {/* Bottom Row: Pan & Tilt Motorized Rotation Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-zinc-800/80 font-mono text-[11px]">
            {/* Pan Slider (0° - 540°) */}
            <div className="flex items-center justify-between gap-2 bg-zinc-900/60 px-3 py-1.5 rounded-lg border border-zinc-800">
              <span className="text-zinc-400 flex items-center gap-1">
                <RotateCw className="w-3.5 h-3.5 text-sky-400" />
                <span>Pan (Y-Axis):</span>
              </span>
              <input
                type="range"
                min="-270"
                max="270"
                step="1"
                value={lightState.panAngle}
                onChange={(e) => onChangeLightState({ panAngle: parseInt(e.target.value) })}
                className="flex-1 accent-sky-400 h-1 bg-zinc-700 rounded cursor-pointer mx-2"
              />
              <span className="text-sky-300 font-bold w-12 text-right">{lightState.panAngle}°</span>
              <button
                onClick={() => onChangeLightState({ panAngle: 0 })}
                className="text-[10px] text-zinc-500 hover:text-white ml-1 px-1 py-0.5 rounded hover:bg-zinc-800"
                title="Center Pan"
              >
                0°
              </button>
            </div>

            {/* Tilt Slider (-135° to +135°) */}
            <div className="flex items-center justify-between gap-2 bg-zinc-900/60 px-3 py-1.5 rounded-lg border border-zinc-800">
              <span className="text-zinc-400 flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span>Tilt (X-Axis):</span>
              </span>
              <input
                type="range"
                min="-135"
                max="135"
                step="1"
                value={lightState.tiltAngle}
                onChange={(e) => onChangeLightState({ tiltAngle: parseInt(e.target.value) })}
                className="flex-1 accent-amber-500 h-1 bg-zinc-700 rounded cursor-pointer mx-2"
              />
              <span className="text-amber-300 font-bold w-12 text-right">{lightState.tiltAngle}°</span>
              <button
                onClick={() => onChangeLightState({ tiltAngle: 0 })}
                className="text-[10px] text-zinc-500 hover:text-white ml-1 px-1 py-0.5 rounded hover:bg-zinc-800"
                title="Center Tilt"
              >
                0°
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
