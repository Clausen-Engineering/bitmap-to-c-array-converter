
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

    // Clear with background color
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(pan.x, pan.y);

    // Use integer pixel positioning to avoid anti-aliasing artifacts
    const pixelSize = Math.floor(zoom);
    
    // Draw pixels using integer coordinates
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const bit = data[row][col];
        ctx.fillStyle = bit === 0 ? '#000000' : '#ffffff';
        
        const x = Math.floor(col * pixelSize);
        const y = Math.floor(row * pixelSize);
        
        ctx.fillRect(x, y, pixelSize, pixelSize);
      }
    }

    // Draw grid if enabled and pixels are large enough
    if (showGrid && pixelSize > 2) {
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      
      // Use integer coordinates for grid lines to avoid blurriness
      for (let col = 0; col <= cols; col++) {
        const x = Math.floor(col * pixelSize) + 0.5; // Add 0.5 for crisp lines
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, Math.floor(rows * pixelSize));
        ctx.stroke();
      }
      
      for (let row = 0; row <= rows; row++) {
        const y = Math.floor(row * pixelSize) + 0.5; // Add 0.5 for crisp lines
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(Math.floor(cols * pixelSize), y);
        ctx.stroke();
      }
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
    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(1, Math.min(30, oldZoom * zoomFactor));
    
    const zoomRatio = newZoom / oldZoom;
    const newPanX = mouseX - (mouseX - pan.x) * zoomRatio;
    const newPanY = mouseY - (mouseY - pan.y) * zoomRatio;
    
    onZoomChange(newZoom, { x: newPanX, y: newPanY });
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
    
    if (Math.abs(deltaX) > 0 || Math.abs(deltaY) > 0) {
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
