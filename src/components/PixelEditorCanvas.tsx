
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
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const hasDraggedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data || data.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rows = data.length;
    const cols = data[0].length;
    
    canvas.width = width;
    canvas.height = height;

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
      ctx.globalAlpha = 0.3;
      
      // Vertical lines
      for (let col = 0; col <= cols; col++) {
        const x = Math.round(col * pixelSize) + 0.5;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, rows * pixelSize);
        ctx.stroke();
      }
      
      // Horizontal lines
      for (let row = 0; row <= rows; row++) {
        const y = Math.round(row * pixelSize) + 0.5;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(cols * pixelSize, y);
        ctx.stroke();
      }
      
      ctx.globalAlpha = 1;
    }
    
    ctx.restore();
  }, [data, zoom, pan, showGrid, width, height]);

  const handleWheel = useCallback((event: React.WheelEvent) => {
    event.preventDefault();
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    const oldZoom = zoom;
    // Make zooming more responsive by increasing the zoom factor
    const zoomFactor = event.deltaY > 0 ? 0.85 : 1.18;
    const newZoom = Math.max(1, Math.min(50, oldZoom * zoomFactor));
    
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
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleCanvasClick}
      className="border border-slate-600 rounded cursor-crosshair"
      style={{ imageRendering: 'pixelated' }}
    />
  );
};

export default PixelEditorCanvas;
