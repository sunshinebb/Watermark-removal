import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Line } from 'react-konva';
import useImage from 'use-image';

interface ImageEditorProps {
  imageUrl: string;
  onProcess: (maskBase64: string) => void;
  isProcessing: boolean;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({ imageUrl, onProcess, isProcessing }) => {
  const [image] = useImage(imageUrl);
  const [lines, setLines] = useState<any[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(30);
  const stageRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (image) {
      const maxWidth = window.innerWidth * 0.8;
      const maxHeight = window.innerHeight * 0.6;
      let { width, height } = image;

      const ratio = Math.min(maxWidth / width, maxHeight / height);
      setDimensions({
        width: width * ratio,
        height: height * ratio,
      });
    }
  }, [image]);

  const handleMouseDown = (e: any) => {
    if (isProcessing) return;
    setIsDrawing(true);
    const pos = e.target.getStage().getPointerPosition();
    setLines([...lines, { points: [pos.x, pos.y], stroke: 'rgba(255, 0, 0, 0.5)' }]);
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing || isProcessing) return;
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    let lastLine = lines[lines.length - 1];
    lastLine.points = lastLine.points.concat([point.x, point.y]);
    lines.splice(lines.length - 1, 1, lastLine);
    setLines(lines.concat());
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleUndo = () => {
    setLines(lines.slice(0, -1));
  };

  const handleClear = () => {
    setLines([]);
  };

  const handleProcess = () => {
    if (!stageRef.current) return;
    // We send the original image with the mask drawn on it to Gemini
    // Gemini can then see where we want to remove things
    const dataUrl = stageRef.current.toDataURL();
    onProcess(dataUrl);
  };

  if (!image) return <div className="flex items-center justify-center h-64">Loading image...</div>;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="bg-[#151619] p-4 rounded-xl shadow-2xl border border-white/10">
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-gray-500 font-mono">Brush Size</span>
              <input 
                type="range" 
                min="5" 
                max="100" 
                value={brushSize} 
                onChange={(e) => setBrushSize(parseInt(e.target.value))}
                className="w-32 accent-emerald-500"
              />
            </div>
            <div className="h-8 w-[1px] bg-white/10 mx-2" />
            <button 
              onClick={handleUndo}
              className="px-3 py-1 text-xs font-mono uppercase tracking-tighter text-gray-400 hover:text-white transition-colors"
            >
              Undo
            </button>
            <button 
              onClick={handleClear}
              className="px-3 py-1 text-xs font-mono uppercase tracking-tighter text-gray-400 hover:text-white transition-colors"
            >
              Clear
            </button>
          </div>
          
          <button 
            onClick={handleProcess}
            disabled={isProcessing || lines.length === 0}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:text-gray-500 text-white px-6 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-emerald-900/20"
          >
            {isProcessing ? 'Processing...' : 'Remove Watermark'}
          </button>
        </div>

        <div className="relative overflow-hidden rounded-lg border border-white/5 cursor-crosshair">
          <Stage
            width={dimensions.width}
            height={dimensions.height}
            onMouseDown={handleMouseDown}
            onMousemove={handleMouseMove}
            onMouseup={handleMouseUp}
            ref={stageRef}
          >
            <Layer>
              <KonvaImage 
                image={image} 
                width={dimensions.width} 
                height={dimensions.height} 
              />
              {lines.map((line, i) => (
                <Line
                  key={i}
                  points={line.points}
                  stroke={line.stroke}
                  strokeWidth={brushSize}
                  tension={0.5}
                  lineCap="round"
                  lineJoin="round"
                  globalCompositeOperation="source-over"
                />
              ))}
            </Layer>
          </Stage>
        </div>
        
        <p className="mt-4 text-[10px] text-center text-gray-500 font-mono uppercase tracking-widest">
          Brush over the watermark area to remove it
        </p>
      </div>
    </div>
  );
};
