
import { useRef, useEffect } from 'react';

interface BitmapViewerProps {
  data: number[][];
  zoom: number;
  showGrid: boolean;
}

const BitmapViewer = ({ data, zoom, showGrid }: BitmapViewerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data || data.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rows = data.length;
    const cols = data[0].length;
    
    // Set canvas size
    canvas.width = cols * zoom;
    canvas.height = rows * zoom;

    // Clear canvas
    ctx.fillStyle = '#1e293b'; // slate-800
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw pixels
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const bit = data[row][col];
        
        // Set color based on bit value (0 = black, 1 = white)
        ctx.fillStyle = bit === 0 ? '#000000' : '#ffffff';
        
        ctx.fillRect(
          col * zoom,
          row * zoom,
          zoom,
          zoom
        );
      }
    }

    // Draw grid if enabled
    if (showGrid && zoom > 2) {
      ctx.strokeStyle = '#475569'; // slate-600
      ctx.lineWidth = 1;
      
      // Vertical lines
      for (let col = 0; col <= cols; col++) {
        ctx.beginPath();
        ctx.moveTo(col * zoom, 0);
        ctx.lineTo(col * zoom, canvas.height);
        ctx.stroke();
      }
      
      // Horizontal lines
      for (let row = 0; row <= rows; row++) {
        ctx.beginPath();
        ctx.moveTo(0, row * zoom);
        ctx.lineTo(canvas.width, row * zoom);
        ctx.stroke();
      }
    }
  }, [data, zoom, showGrid]);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 bg-slate-800/30 rounded-lg border-2 border-dashed border-slate-600">
        No bitmap data to display
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <div className="inline-block bg-slate-800 p-4 rounded-lg shadow-2xl">
        <canvas
          ref={canvasRef}
          className="border border-slate-600 rounded shadow-lg"
          style={{ imageRendering: 'pixelated' }}
        />
      </div>
    </div>
  );
};

export default BitmapViewer;
