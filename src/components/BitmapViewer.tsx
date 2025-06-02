
import { useRef, useEffect, useState, useCallback } from 'react';

interface BitmapViewerProps {
  data: number[][];
  showGrid: boolean;
  onEdit?: () => void;
  onRevertColor?: () => void;
}

const BitmapViewer = ({ data, showGrid, onEdit, onRevertColor }: BitmapViewerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [baseCanvas, setBaseCanvas] = useState<HTMLCanvasElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [hasDragged, setHasDragged] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // Calculate and set canvas size once when data changes
  useEffect(() => {
    if (!data || data.length === 0 || !containerRef.current) return;

    const container = containerRef.current;
    const rows = data.length;
    const cols = data[0].length;
    
    // Get container width (subtract padding)
    const containerWidth = container.clientWidth - 32; // 16px padding on each side
    const aspectRatio = cols / rows;
    
    // Calculate base display size - ensure width never exceeds container
    let baseDisplayWidth = Math.min(containerWidth, cols * 8);
    let baseDisplayHeight = baseDisplayWidth / aspectRatio;
    
    // If height would be too large, constrain by height instead
    const maxHeight = 600;
    if (baseDisplayHeight > maxHeight) {
      baseDisplayHeight = maxHeight;
      baseDisplayWidth = baseDisplayHeight * aspectRatio;
    }

    setCanvasSize({ width: baseDisplayWidth, height: baseDisplayHeight });
  }, [data]);

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
    // Reset zoom and pan when data changes
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [data]);

  // Update display canvas when data, grid, zoom, or pan changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !baseCanvas || !data || data.length === 0 || !canvasSize.width || !canvasSize.height) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rows = data.length;
    const cols = data[0].length;
    
    // Set fixed canvas size
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    ctx.imageSmoothingEnabled = false;
    
    // Clear canvas
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Apply zoom to display size
    const displayWidth = canvasSize.width * zoom;
    const displayHeight = canvasSize.height * zoom;
    
    // Apply pan and draw image
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.drawImage(baseCanvas, 0, 0, cols, rows, 0, 0, displayWidth, displayHeight);

    // Draw grid if enabled and pixels are large enough
    const pixelSize = (displayWidth / cols);
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
    
    ctx.restore();
  }, [baseCanvas, showGrid, data, zoom, pan, canvasSize]);

  const handleWheel = useCallback((event: React.WheelEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    const oldZoom = zoom;
    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(10, oldZoom * zoomFactor));
    
    const zoomRatio = newZoom / oldZoom;
    const newPanX = mouseX - (mouseX - pan.x) * zoomRatio;
    const newPanY = mouseY - (mouseY - pan.y) * zoomRatio;
    
    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  }, [zoom, pan]);

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (event.button === 0) {
      setIsDragging(true);
      setHasDragged(false);
      setLastMousePos({ x: event.clientX, y: event.clientY });
    }
  }, []);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = event.clientX - lastMousePos.x;
    const deltaY = event.clientY - lastMousePos.y;
    
    // If mouse moved at all, consider it a drag
    if (Math.abs(deltaX) > 0 || Math.abs(deltaY) > 0) {
      setHasDragged(true);
    }
    
    setPan(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));
    
    setLastMousePos({ x: event.clientX, y: event.clientY });
  }, [isDragging, lastMousePos]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDoubleClick = useCallback(() => {
    // Only trigger edit if we haven't dragged
    if (!hasDragged && onEdit) {
      onEdit();
    }
  }, [hasDragged, onEdit]);

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
        <div ref={containerRef} className="w-full bg-slate-800 p-4 rounded-lg shadow-2xl">
          <div className="mb-2 text-sm text-slate-400 text-center">
            Size: {cols}×{rows} | Zoom: {zoom.toFixed(1)}x | Scroll to zoom, drag to pan, double-click to edit
          </div>
          <div className="flex justify-center">
            <canvas
              ref={canvasRef}
              className="border border-slate-600 rounded shadow-lg cursor-grab active:cursor-grabbing"
              style={{ 
                imageRendering: 'pixelated',
                width: `${canvasSize.width}px`,
                height: `${canvasSize.height}px`
              }}
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
    </div>
  );
};

export default BitmapViewer;
