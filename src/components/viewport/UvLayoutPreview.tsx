import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { 
  Grid, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Eye, 
  Image as ImageIcon, 
  Layers, 
  Download, 
  Sparkles,
  Maximize2
} from 'lucide-react';

interface UvLayoutPreviewProps {
  geometry: THREE.BufferGeometry | null;
  textureUrl?: string;
  onClose?: () => void;
  isOverlay?: boolean;
}

export const UvLayoutPreview: React.FC<UvLayoutPreviewProps> = ({
  geometry,
  textureUrl,
  onClose,
  isOverlay = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState<number>(1.0);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Toggles
  const [showTexture, setShowTexture] = useState<boolean>(true);
  const [showCheckerboard, setShowCheckerboard] = useState<boolean>(false);
  const [showWireframe, setShowWireframe] = useState<boolean>(true);
  const [showVertices, setShowVertices] = useState<boolean>(false);
  const [wireColor, setWireColor] = useState<string>('#38bdf8');

  // Texture Image element cache
  const [textureImg, setTextureImg] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!textureUrl) {
      setTextureImg(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => setTextureImg(img);
    img.src = textureUrl;
  }, [textureUrl]);

  // Extract UV coordinates and faces from geometry
  const uvData = useMemo(() => {
    if (!geometry) return null;
    const g = geometry.index ? geometry.clone() : geometry.toNonIndexed();
    const uvAttr = g.getAttribute('uv');
    const indexAttr = g.getIndex();

    if (!uvAttr || uvAttr.count === 0) return null;

    const uvs: { u: number; v: number }[] = [];
    for (let i = 0; i < uvAttr.count; i++) {
      uvs.push({
        u: uvAttr.getX(i),
        v: uvAttr.getY(i),
      });
    }

    const triangles: [number, number, number][] = [];
    const count = indexAttr ? indexAttr.count : uvAttr.count;

    for (let i = 0; i < count; i += 3) {
      const a = indexAttr ? indexAttr.getX(i) : i;
      const b = indexAttr ? indexAttr.getX(i + 1) : i + 1;
      const c = indexAttr ? indexAttr.getX(i + 2) : i + 2;
      triangles.push([a, b, c]);
    }

    // Estimate UV area coverage in [0,1]
    let uvArea = 0;
    for (const [iA, iB, iC] of triangles) {
      if (uvs[iA] && uvs[iB] && uvs[iC]) {
        const ax = uvs[iA].u, ay = uvs[iA].v;
        const bx = uvs[iB].u, by = uvs[iB].v;
        const cx = uvs[iC].u, cy = uvs[iC].v;
        // Triangle cross product area
        uvArea += Math.abs(ax * (by - cy) + bx * (cy - ay) + cx * (ay - by)) / 2;
      }
    }

    return {
      uvs,
      triangles,
      vertexCount: uvs.length,
      triangleCount: triangles.length,
      coveragePercent: Math.min(100, Math.round(uvArea * 100 * 10) / 10),
    };
  }, [geometry]);

  // Render UV Map on 2D Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.fillStyle = '#18191c';
    ctx.fillRect(0, 0, width, height);

    // Coordinate system: center UV square [0,1] inside canvas with padding
    const padding = 40;
    const size = Math.min(width, height) - padding * 2;
    const baseOriginX = (width - size) / 2;
    const baseOriginY = (height - size) / 2;

    ctx.save();
    // Apply pan & zoom centered on viewport
    ctx.translate(width / 2 + offset.x, height / 2 + offset.y);
    ctx.scale(zoom, zoom);
    ctx.translate(-width / 2, -height / 2);

    // Draw UV Boundary Box [0,0] to [1,1]
    const uvX = baseOriginX;
    const uvY = baseOriginY;

    // Optional Checkerboard test pattern
    if (showCheckerboard) {
      const checkSize = 16;
      for (let cy = 0; cy < size; cy += checkSize) {
        for (let cx = 0; cx < size; cx += checkSize) {
          const isEven = (Math.floor(cx / checkSize) + Math.floor(cy / checkSize)) % 2 === 0;
          ctx.fillStyle = isEven ? '#2d3139' : '#1e2126';
          ctx.fillRect(uvX + cx, uvY + cy, Math.min(checkSize, size - cx), Math.min(checkSize, size - cy));
        }
      }
    } else {
      ctx.fillStyle = '#22252b';
      ctx.fillRect(uvX, uvY, size, size);
    }

    // Draw Albedo Texture Map if enabled
    if (showTexture && textureImg) {
      ctx.drawImage(textureImg, uvX, uvY, size, size);
    }

    // Draw UV Grid Lines (0.25, 0.5, 0.75, 1.0)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    for (let step = 0.25; step < 1.0; step += 0.25) {
      // Horizontal
      ctx.beginPath();
      ctx.moveTo(uvX, uvY + step * size);
      ctx.lineTo(uvX + size, uvY + step * size);
      ctx.stroke();
      // Vertical
      ctx.beginPath();
      ctx.moveTo(uvX + step * size, uvY);
      ctx.lineTo(uvX + step * size, uvY + size);
      ctx.stroke();
    }

    // Outer UV Box Border
    ctx.strokeStyle = '#e87a24';
    ctx.lineWidth = 2;
    ctx.strokeRect(uvX, uvY, size, size);

    // Axis Labels
    ctx.fillStyle = '#e87a24';
    ctx.font = '10px monospace';
    ctx.fillText('(0, 0)', uvX - 4, uvY + size + 14);
    ctx.fillText('(1, 0)', uvX + size - 14, uvY + size + 14);
    ctx.fillText('(0, 1)', uvX - 28, uvY + 10);
    ctx.fillText('(1, 1)', uvX + size + 4, uvY + 10);

    // Draw Unwrapped Mesh UV Triangles
    if (uvData && showWireframe) {
      ctx.strokeStyle = wireColor;
      ctx.lineWidth = 0.8;
      ctx.fillStyle = `${wireColor}10`; // Subtle polygon tint

      const toScreenX = (u: number) => uvX + u * size;
      const toScreenY = (v: number) => uvY + (1 - v) * size; // V is flipped in UV texture coords

      for (const [iA, iB, iC] of uvData.triangles) {
        const uA = uvData.uvs[iA];
        const uB = uvData.uvs[iB];
        const uC = uvData.uvs[iC];

        if (!uA || !uB || !uC) continue;

        ctx.beginPath();
        ctx.moveTo(toScreenX(uA.u), toScreenY(uA.v));
        ctx.lineTo(toScreenX(uB.u), toScreenY(uB.v));
        ctx.lineTo(toScreenX(uC.u), toScreenY(uC.v));
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      // Optional UV vertex points
      if (showVertices) {
        ctx.fillStyle = '#ffffff';
        for (const pt of uvData.uvs) {
          ctx.beginPath();
          ctx.arc(toScreenX(pt.u), toScreenY(pt.v), 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    ctx.restore();
  }, [
    uvData,
    zoom,
    offset,
    showTexture,
    showCheckerboard,
    showWireframe,
    showVertices,
    wireColor,
    textureImg,
  ]);

  // Handle Pan Dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.15 : 0.85;
    setZoom((z) => Math.max(0.5, Math.min(8.0, z * factor)));
  };

  const handleReset = () => {
    setZoom(1.0);
    setOffset({ x: 0, y: 0 });
  };

  const exportUvSvg = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'uv_layout_map.png';
    a.click();
  };

  return (
    <div className={`relative w-full h-full bg-[#18191c] flex flex-col select-none overflow-hidden ${isOverlay ? 'border border-zinc-700/80 rounded-xl shadow-2xl' : ''}`}>
      {/* Top Floating UV Toolbar */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
        {/* Left: UV Stats & Badge */}
        <div className="flex items-center gap-2 p-1.5 bg-[#22242a]/90 backdrop-blur-md border border-zinc-700/60 rounded-lg pointer-events-auto shadow-xl text-xs">
          <div className="flex items-center gap-1.5 font-bold text-amber-400 font-mono px-2 py-0.5 bg-amber-500/10 rounded">
            <Layers className="w-3.5 h-3.5" />
            <span>2D UV Texture Map</span>
          </div>
          {uvData && (
            <div className="text-[11px] font-mono text-zinc-400 hidden sm:flex items-center gap-2 px-1">
              <span>{uvData.triangleCount.toLocaleString()} UV Faces</span>
              <span>·</span>
              <span className="text-emerald-400">{uvData.coveragePercent}% UV Space</span>
            </div>
          )}
        </div>

        {/* Right: Controls Toolbar */}
        <div className="flex items-center gap-1 p-1 bg-[#22242a]/90 backdrop-blur-md border border-zinc-700/60 rounded-lg pointer-events-auto shadow-xl text-xs">
          {/* Toggle Texture */}
          <button
            onClick={() => setShowTexture(!showTexture)}
            className={`p-1.5 rounded transition-colors ${
              showTexture ? 'bg-amber-500/20 text-amber-300' : 'text-zinc-500 hover:text-zinc-300'
            }`}
            title="Toggle Texture Map"
          >
            <ImageIcon className="w-3.5 h-3.5" />
          </button>

          {/* Toggle Checkerboard */}
          <button
            onClick={() => setShowCheckerboard(!showCheckerboard)}
            className={`p-1.5 rounded transition-colors ${
              showCheckerboard ? 'bg-sky-500/20 text-sky-300' : 'text-zinc-500 hover:text-zinc-300'
            }`}
            title="Toggle Checkerboard Calibration Pattern"
          >
            <Grid className="w-3.5 h-3.5" />
          </button>

          {/* Toggle Wireframe Edges */}
          <button
            onClick={() => setShowWireframe(!showWireframe)}
            className={`p-1.5 rounded transition-colors ${
              showWireframe ? 'bg-emerald-500/20 text-emerald-300' : 'text-zinc-500 hover:text-zinc-300'
            }`}
            title="Toggle UV Wireframe Triangles"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          {/* Wire Color Picker */}
          <input
            type="color"
            value={wireColor}
            onChange={(e) => setWireColor(e.target.value)}
            className="w-4 h-4 rounded cursor-pointer border border-zinc-600 bg-transparent"
            title="Change UV Wireframe Color"
          />

          <div className="h-4 w-px bg-zinc-700 mx-0.5" />

          {/* Zoom In */}
          <button
            onClick={() => setZoom((z) => Math.min(8.0, z * 1.25))}
            className="p-1.5 text-zinc-400 hover:text-white rounded transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          {/* Zoom Out */}
          <button
            onClick={() => setZoom((z) => Math.max(0.5, z * 0.8))}
            className="p-1.5 text-zinc-400 hover:text-white rounded transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          {/* Reset Zoom */}
          <button
            onClick={handleReset}
            className="p-1.5 text-zinc-400 hover:text-white rounded transition-colors"
            title="Reset Zoom & Pan"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Export UV Layout */}
          <button
            onClick={exportUvSvg}
            className="p-1.5 text-zinc-400 hover:text-emerald-400 rounded transition-colors"
            title="Save UV Layout Snapshot"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded text-[11px] font-mono ml-1"
            >
              Back to 3D View
            </button>
          )}
        </div>
      </div>

      {/* Interactive 2D Canvas */}
      <canvas
        ref={canvasRef}
        width={1024}
        height={1024}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className="w-full h-full block cursor-grab active:cursor-grabbing outline-none"
      />

      {/* Bottom Telemetry Legend */}
      <div className="absolute bottom-3 left-3 text-[11px] text-zinc-500 font-mono pointer-events-none flex items-center gap-3">
        <span>UV Space [0, 0] to [1, 1]</span>
        <span>·</span>
        <span>Drag to pan · Scroll to zoom ({Math.round(zoom * 100)}%)</span>
      </div>
    </div>
  );
};
