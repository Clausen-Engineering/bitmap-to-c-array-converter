import { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';

interface BitmapViewerProps {
  data: number[][];
  showGrid: boolean;
  onEdit?: () => void;
}

const BitmapViewer = ({ data, showGrid, onEdit }: BitmapViewerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [baseCanvas, setBaseCanvas] = useState<HTMLCanvasElement | null>(null);

  // Create base canvas once when data changes
  useEffect(() => {
    if (!data || data.length === 0) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rows = data.length;
    const cols = data[0].length;
    
    canvas.width = cols;
    canvas.height = rows;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const bit = data[row][col];
        ctx.fillStyle = bit === 0 ? '#000000' : '#ffffff';
        ctx.fillRect(col, row, 1, 1);
      }
    }

    setBaseCanvas(canvas);
  }, [data]);

  // Update display canvas when data or grid changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !baseCanvas || !data || data.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rows = data.length;
    const cols = data[0].length;
    
    // Calculate display size - scale to fit available space while maintaining aspect ratio
    const maxWidth = 1280;
    const maxHeight = 1100;
    const aspectRatio = cols / rows;
    
    let displayWidth = Math.min(maxWidth, cols * 8);
    let displayHeight = displayWidth / aspectRatio;
    
    if (displayHeight > maxHeight) {
      displayHeight = maxHeight;
      displayWidth = displayHeight * aspectRatio;
    }
    
    canvas.width = displayWidth;
    canvas.height = displayHeight;

    ctx.imageSmoothingEnabled = false;
    
    ctx.drawImage(baseCanvas, 0, 0, cols, rows, 0, 0, displayWidth, displayHeight);

    // Draw grid if enabled and pixels are large enough
    const pixelSize = displayWidth / cols;
    if (showGrid && pixelSize > 4) {
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      
      for (let col = 0; col <= cols; col++) {
        const x = (col / cols) * displayWidth;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, displayHeight);
        ctx.stroke();
      }
      
      for (let row = 0; row <= rows; row++) {
        const y = (row / rows) * displayHeight;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(displayWidth, y);
        ctx.stroke();
      }
    }
  }, [baseCanvas, showGrid, data]);

  const handleDoubleClick = () => {
    if (onEdit) {
      onEdit();
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 bg-slate-800/30 rounded-lg border-2 border-dashed border-slate-600">
        No bitmap data to display
      </div>
    );
  }

  const rows = data.length;
  const cols = data[0].length;

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <div className="inline-block bg-slate-800 p-4 rounded-lg shadow-2xl">
          <div className="mb-2 text-sm text-slate-400 text-center">
            Size: {cols}×{rows} | Double-click to edit
          </div>
          <canvas
            ref={canvasRef}
            className="border border-slate-600 rounded shadow-lg cursor-pointer"
            style={{ imageRendering: 'pixelated' }}
            onDoubleClick={handleDoubleClick}
            title="Double-click to edit"
          />
        </div>
      </div>
    </div>
  );
};

export default BitmapViewer;
