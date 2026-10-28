import React from 'react';
import { Move, Rotate3d, Maximize, RefreshCw, ArrowDownToLine, Target, Lock, Unlock } from 'lucide-react';
import { TransformState } from '../../types';

interface TransformPanelProps {
  transform: TransformState;
  onChange: (transform: TransformState) => void;
  onReset: () => void;
  onCenterOrigin: () => void;
  onPlaceOnGround: () => void;
}

export const TransformPanel: React.FC<TransformPanelProps> = ({
  transform,
  onChange,
  onReset,
  onCenterOrigin,
  onPlaceOnGround,
}) => {
  const updatePos = (axisIndex: 0 | 1 | 2, value: number) => {
    const nextPos: [number, number, number] = [...transform.position];
    nextPos[axisIndex] = Number(value.toFixed(3));
    onChange({ ...transform, position: nextPos });
  };

  const updateRot = (axisIndex: 0 | 1 | 2, value: number) => {
    const nextRot: [number, number, number] = [...transform.rotation];
    nextRot[axisIndex] = Math.round(value);
    onChange({ ...transform, rotation: nextRot });
  };

  const updateScale = (axisIndex: 0 | 1 | 2, value: number) => {
    const val = Math.max(0.01, Number(value));
    if (transform.uniformScale) {
      onChange({
        ...transform,
        scale: [val, val, val],
      });
    } else {
      const nextScale: [number, number, number] = [...transform.scale];
      nextScale[axisIndex] = val;
      onChange({ ...transform, scale: nextScale });
    }
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Quick Align Bar */}
      <div className="grid grid-cols-3 gap-1.5">
        <button
          onClick={onCenterOrigin}
          className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded border border-zinc-700/60 transition-colors"
          title="Center at (0, 0, 0)"
        >
          <Target className="w-3.5 h-3.5 text-sky-400" />
          <span>Center</span>
        </button>
        <button
          onClick={onPlaceOnGround}
          className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded border border-zinc-700/60 transition-colors"
          title="Set base onto Ground (Y = 0)"
        >
          <ArrowDownToLine className="w-3.5 h-3.5 text-emerald-400" />
          <span>Ground</span>
        </button>
        <button
          onClick={onReset}
          className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded border border-zinc-700/60 transition-colors"
          title="Reset all transforms to default"
        >
          <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
          <span>Reset</span>
        </button>
      </div>

      {/* Position XYZ */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-zinc-400 font-mono text-[11px]">
          <span className="flex items-center gap-1">
            <Move className="w-3 h-3 text-zinc-500" /> Position (meters)
          </span>
          <button 
            onClick={() => onChange({ ...transform, position: [0, 0, 0] })}
            className="text-[10px] text-zinc-500 hover:text-zinc-300 underline"
          >
            Zero
          </button>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {/* X */}
          <div className="flex items-center bg-zinc-900 border border-zinc-700/80 rounded px-1.5 py-1">
            <span className="text-red-400 font-mono text-[10px] font-bold mr-1.5">X</span>
            <input
              type="number"
              step="0.05"
              value={transform.position[0]}
              onChange={(e) => updatePos(0, parseFloat(e.target.value) || 0)}
              className="w-full bg-transparent text-right font-mono text-zinc-200 outline-none"
            />
          </div>
          {/* Y */}
          <div className="flex items-center bg-zinc-900 border border-zinc-700/80 rounded px-1.5 py-1">
            <span className="text-emerald-400 font-mono text-[10px] font-bold mr-1.5">Y</span>
            <input
              type="number"
              step="0.05"
              value={transform.position[1]}
              onChange={(e) => updatePos(1, parseFloat(e.target.value) || 0)}
              className="w-full bg-transparent text-right font-mono text-zinc-200 outline-none"
            />
          </div>
          {/* Z */}
          <div className="flex items-center bg-zinc-900 border border-zinc-700/80 rounded px-1.5 py-1">
            <span className="text-blue-400 font-mono text-[10px] font-bold mr-1.5">Z</span>
            <input
              type="number"
              step="0.05"
              value={transform.position[2]}
              onChange={(e) => updatePos(2, parseFloat(e.target.value) || 0)}
              className="w-full bg-transparent text-right font-mono text-zinc-200 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Rotation XYZ */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-zinc-400 font-mono text-[11px]">
          <span className="flex items-center gap-1">
            <Rotate3d className="w-3 h-3 text-zinc-500" /> Rotation (degrees)
          </span>
          <button 
            onClick={() => onChange({ ...transform, rotation: [0, 0, 0] })}
            className="text-[10px] text-zinc-500 hover:text-zinc-300 underline"
          >
            Zero
          </button>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {/* Rot X */}
          <div className="flex items-center bg-zinc-900 border border-zinc-700/80 rounded px-1.5 py-1">
            <span className="text-red-400 font-mono text-[10px] font-bold mr-1.5">X</span>
            <input
              type="number"
              step="15"
              value={transform.rotation[0]}
              onChange={(e) => updateRot(0, parseFloat(e.target.value) || 0)}
              className="w-full bg-transparent text-right font-mono text-zinc-200 outline-none"
            />
          </div>
          {/* Rot Y */}
          <div className="flex items-center bg-zinc-900 border border-zinc-700/80 rounded px-1.5 py-1">
            <span className="text-emerald-400 font-mono text-[10px] font-bold mr-1.5">Y</span>
            <input
              type="number"
              step="15"
              value={transform.rotation[1]}
              onChange={(e) => updateRot(1, parseFloat(e.target.value) || 0)}
              className="w-full bg-transparent text-right font-mono text-zinc-200 outline-none"
            />
          </div>
          {/* Rot Z */}
          <div className="flex items-center bg-zinc-900 border border-zinc-700/80 rounded px-1.5 py-1">
            <span className="text-blue-400 font-mono text-[10px] font-bold mr-1.5">Z</span>
            <input
              type="number"
              step="15"
              value={transform.rotation[2]}
              onChange={(e) => updateRot(2, parseFloat(e.target.value) || 0)}
              className="w-full bg-transparent text-right font-mono text-zinc-200 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Scale XYZ */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-zinc-400 font-mono text-[11px]">
          <span className="flex items-center gap-1">
            <Maximize className="w-3 h-3 text-zinc-500" /> Scale
          </span>
          <button
            onClick={() => onChange({ ...transform, uniformScale: !transform.uniformScale })}
            className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded ${
              transform.uniformScale ? 'text-amber-400 bg-amber-500/10' : 'text-zinc-500 bg-zinc-800'
            }`}
          >
            {transform.uniformScale ? <Lock className="w-2.5 h-2.5" /> : <Unlock className="w-2.5 h-2.5" />}
            {transform.uniformScale ? 'Uniform Locked' : 'Independent'}
          </button>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {/* Scale X */}
          <div className="flex items-center bg-zinc-900 border border-zinc-700/80 rounded px-1.5 py-1">
            <span className="text-red-400 font-mono text-[10px] font-bold mr-1.5">X</span>
            <input
              type="number"
              step="0.1"
              min="0.01"
              value={transform.scale[0]}
              onChange={(e) => updateScale(0, parseFloat(e.target.value) || 1)}
              className="w-full bg-transparent text-right font-mono text-zinc-200 outline-none"
            />
          </div>
          {/* Scale Y */}
          <div className="flex items-center bg-zinc-900 border border-zinc-700/80 rounded px-1.5 py-1">
            <span className="text-emerald-400 font-mono text-[10px] font-bold mr-1.5">Y</span>
            <input
              type="number"
              step="0.1"
              min="0.01"
              value={transform.scale[1]}
              onChange={(e) => updateScale(1, parseFloat(e.target.value) || 1)}
              className="w-full bg-transparent text-right font-mono text-zinc-200 outline-none"
              disabled={transform.uniformScale}
            />
          </div>
          {/* Scale Z */}
          <div className="flex items-center bg-zinc-900 border border-zinc-700/80 rounded px-1.5 py-1">
            <span className="text-blue-400 font-mono text-[10px] font-bold mr-1.5">Z</span>
            <input
              type="number"
              step="0.1"
              min="0.01"
              value={transform.scale[2]}
              onChange={(e) => updateScale(2, parseFloat(e.target.value) || 1)}
              className="w-full bg-transparent text-right font-mono text-zinc-200 outline-none"
              disabled={transform.uniformScale}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
