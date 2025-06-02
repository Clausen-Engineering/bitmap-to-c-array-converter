import { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';

interface BitmapViewerProps {
  data: number[][];
  showGrid: boolean;
  onEdit?: () => void;
}

const BitmapViewer = ({ data, showGrid, onEdit }: BitmapViewerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [baseCanvas, setBaseCanvas] = useState<HTMLCanvasElement | null>(null);
  const [zoom, setZoom] = useState(4);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  // Fixed viewport size
  const VIEWPORT_WIDTH = 600;
  const VIEWPORT_HEIGHT = 400;

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
    
    // Reset pan when new data is loaded
    setPan({ x: 0, y: 0 });
  }, [data]);

  // Update display canvas when zoom, pan, or grid changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !baseCanvas || !data || data.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rows = data.length;
    const cols = data[0].length;
    
    canvas.width = VIEWPORT_WIDTH;
    canvas.height = VIEWPORT_HEIGHT;

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.imageSmoothingEnabled = false;
    
    // Calculate the source and destination areas for panning
    const scaledWidth = cols * zoom;
    const scaledHeight = rows * zoom;
    
    // Apply panning offset
    ctx.save();
    ctx.translate(pan.x, pan.y);
    
    ctx.drawImage(baseCanvas, 0, 0, cols, rows, 0, 0, scaledWidth, scaledHeight);

    // Draw grid if enabled
    if (showGrid && zoom > 2) {
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      
      for (let col = 0; col <= cols; col++) {
        ctx.beginPath();
        ctx.moveTo(col * zoom, 0);
        ctx.lineTo(col * zoom, scaledHeight);
        ctx.stroke();
      }
      
      for (let row = 0; row <= rows; row++) {
        ctx.beginPath();
        ctx.moveTo(0, row * zoom);
        ctx.lineTo(scaledWidth, row * zoom);
        ctx.stroke();
      }
    }
    
    ctx.restore();
  }, [baseCanvas, zoom, pan, showGrid, data]);

  const handleWheel = useCallback((event: React.WheelEvent) => {
    event.preventDefault();
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    const oldZoom = zoom;
    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.5, Math.min(20, oldZoom * zoomFactor));
    
    // Calculate new pan to keep mouse position centered
    const zoomRatio = newZoom / oldZoom;
    const newPanX = mouseX - (mouseX - pan.x) * zoomRatio;
    const newPanY = mouseY - (mouseY - pan.y) * zoomRatio;
    
    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  }, [zoom, pan]);

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (event.button === 0) { // Left mouse button
      setIsDragging(true);
      setLastMousePos({ x: event.clientX, y: event.clientY });
    }
  }, []);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = event.clientX - lastMousePos.x;
    const deltaY = event.clientY - lastMousePos.y;
    
    setPan(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));
    
    setLastMousePos({ x: event.clientX, y: event.clientY });
  }, [isDragging, lastMousePos]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

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
      {onEdit && (
        <div className="flex justify-end">
          <Button
            onClick={onEdit}
            variant="outline"
            size="sm"
            className="border-slate-500 bg-slate-700 text-white hover:bg-slate-600"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Pixels
          </Button>
        </div>
      )}
      
      <div className="flex justify-center" ref={containerRef}>
        <div className="inline-block bg-slate-800 p-4 rounded-lg shadow-2xl">
          <div className="mb-2 text-sm text-slate-400 text-center">
            Zoom: {zoom.toFixed(1)}x | Size: {cols}×{rows} | Scroll to zoom, drag to pan
          </div>
          <canvas
            ref={canvasRef}
            width={VIEWPORT_WIDTH}
            height={VIEWPORT_HEIGHT}
            className="border border-slate-600 rounded shadow-lg cursor-grab active:cursor-grabbing"
            style={{ imageRendering: 'pixelated' }}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onDoubleClick={handleDoubleClick}
            title="Scroll to zoom, drag to pan, double-click to edit"
          />
        </div>
      </div>
    </div>
  );
};

export default BitmapViewer;
