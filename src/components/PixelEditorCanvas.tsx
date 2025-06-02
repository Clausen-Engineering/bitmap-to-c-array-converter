
import { useRef, useEffect, useCallback } from 'react';

interface PixelEditorCanvasProps {
  data: number[][];
  zoom: number;
  pan: { x: number; y: number };
  showGrid: boolean;
  onZoomChange: (newZoom: number, newPan: { x: number; y: number }) => void;
  onPanChange: (newPan: { x: number; y: number }) => void;
  onPixelClick: (row: number, col: number) => void;
  width: number;
  height: number;
}

const PixelEditorCanvas = ({
  data,
  zoom,
  pan,
  showGrid,
  onZoomChange,
  onPanChange,
  onPixelClick,
  width,
  height
}: PixelEditorCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const hasDraggedRef = useRef(false);

  // Calculate canvas size and initial zoom to show full picture
  useEffect(() => {
    if (!data || data.length === 0 || !containerRef.current) return;

    const container = containerRef.current;
    const rows = data.length;
    const cols = data[0].length;
    
    // Use full container width minus small margin
    const containerWidth = container.clientWidth - 40; // 20px margin on each side
    const maxHeight = 600;
    
    // Set canvas to use full container width
    const canvasWidth = containerWidth;
    const canvasHeight = maxHeight;

    // Calculate zoom to fit the entire picture within the canvas
    const zoomToFitWidth = canvasWidth / cols;
    const zoomToFitHeight = canvasHeight / rows;
    const fitZoom = Math.min(zoomToFitWidth, zoomToFitHeight);
    
    // Center the picture within the canvas
    const centeredPanX = (canvasWidth - cols * fitZoom) / 2;
    const centeredPanY = (canvasHeight - rows * fitZoom) / 2;
    
    // Update zoom and pan to show the full picture
    onZoomChange(fitZoom, { x: centeredPanX, y: centeredPanY });
  }, [data, onZoomChange]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data || data.length === 0 || !containerRef.current) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const container = containerRef.current;
    const rows = data.length;
    const cols = data[0].length;
    
    // Set canvas to use full container width minus small margin
    const containerWidth = container.clientWidth - 40; // 20px margin on each side
    const maxHeight = 600;

    canvas.width = containerWidth;
    canvas.height = maxHeight;

    // Disable image smoothing for pixel-perfect rendering
    ctx.imageSmoothingEnabled = false;

    // Clear with background color
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(pan.x, pan.y);

    // Calculate pixel size
    const pixelSize = zoom;
    
    // Draw pixels with no gaps or overlaps
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const bit = data[row][col];
        ctx.fillStyle = bit === 0 ? '#000000' : '#ffffff';
        
        const x = Math.floor(col * pixelSize);
        const y = Math.floor(row * pixelSize);
        
        // Use Math.ceil to ensure complete coverage without gaps
        const pixelWidth = Math.ceil((col + 1) * pixelSize) - x;
        const pixelHeight = Math.ceil((row + 1) * pixelSize) - y;
        
        ctx.fillRect(x, y, pixelWidth, pixelHeight);
      }
    }

    // Draw grid on top if enabled and pixels are large enough
    if (showGrid && pixelSize >= 4) {
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.2;
      
      // Vertical lines
      for (let col = 0; col <= cols; col++) {
        const x = Math.floor(col * pixelSize) + 0.5;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, rows * pixelSize);
        ctx.stroke();
      }
      
      // Horizontal lines
      for (let row = 0; row <= rows; row++) {
        const y = Math.floor(row * pixelSize) + 0.5;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(cols * pixelSize, y);
        ctx.stroke();
      }
      
      ctx.globalAlpha = 1;
    }
    
    ctx.restore();
  }, [data, zoom, pan, showGrid]);

  const handleWheel = useCallback((event: React.WheelEvent) => {
    event.preventDefault();
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    const oldZoom = zoom;
    // More responsive zooming
    const zoomFactor = event.deltaY > 0 ? 0.75 : 1.33;
    const newZoom = Math.max(0.5, Math.min(100, oldZoom * zoomFactor));
    
    if (newZoom !== oldZoom) {
      const zoomRatio = newZoom / oldZoom;
      const newPanX = mouseX - (mouseX - pan.x) * zoomRatio;
      const newPanY = mouseY - (mouseY - pan.y) * zoomRatio;
      
      onZoomChange(newZoom, { x: newPanX, y: newPanY });
    }
  }, [zoom, pan, onZoomChange]);

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (event.button === 0) {
      isDraggingRef.current = true;
      hasDraggedRef.current = false;
      lastMousePosRef.current = { x: event.clientX, y: event.clientY };
    }
  }, []);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    
    const deltaX = event.clientX - lastMousePosRef.current.x;
    const deltaY = event.clientY - lastMousePosRef.current.y;
    
    if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
      hasDraggedRef.current = true;
    }
    
    onPanChange({
      x: pan.x + deltaX,
      y: pan.y + deltaY
    });
    
    lastMousePosRef.current = { x: event.clientX, y: event.clientY };
  }, [pan, onPanChange]);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (hasDraggedRef.current) return;
    
    const canvas = canvasRef.current;
    if (!canvas || !data || data.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left - pan.x;
    const y = event.clientY - rect.top - pan.y;
    
    const col = Math.floor(x / zoom);
    const row = Math.floor(y / zoom);
    
    if (row >= 0 && row < data.length && col >= 0 && col < data[0].length) {
      onPixelClick(row, col);
    }
  }, [data, zoom, pan, onPixelClick]);

  return (
    <div ref={containerRef} className="w-full bg-slate-800 p-4 rounded-lg shadow-2xl">
      <canvas
        ref={canvasRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleCanvasClick}
        className="border border-slate-600 rounded cursor-crosshair mx-auto block"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
};

export default PixelEditorCanvas;
