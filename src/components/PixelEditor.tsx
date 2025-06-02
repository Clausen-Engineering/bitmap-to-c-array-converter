
import { useRef, useEffect, useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Save, X } from 'lucide-react';

interface PixelEditorProps {
  isOpen: boolean;
  onClose: () => void;
  data: number[][];
  onSave: (newData: number[][]) => void;
  arrayName: string;
}

const PixelEditor = ({ isOpen, onClose, data, onSave, arrayName }: PixelEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [editableData, setEditableData] = useState<number[][]>([]);
  const [zoom, setZoom] = useState(8);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [dragStarted, setDragStarted] = useState(false);

  // Fixed viewport size for editor
  const VIEWPORT_WIDTH = 800;
  const VIEWPORT_HEIGHT = 600;

  useEffect(() => {
    if (isOpen && data) {
      setEditableData(data.map(row => [...row]));
      setPan({ x: 0, y: 0 });
    }
  }, [isOpen, data]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !editableData || editableData.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rows = editableData.length;
    const cols = editableData[0].length;
    
    canvas.width = VIEWPORT_WIDTH;
    canvas.height = VIEWPORT_HEIGHT;

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(pan.x, pan.y);

    // Draw pixels
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const bit = editableData[row][col];
        ctx.fillStyle = bit === 0 ? '#000000' : '#ffffff';
        ctx.fillRect(col * zoom, row * zoom, zoom, zoom);
      }
    }

    // Draw grid if enabled
    if (showGrid && zoom > 2) {
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      
      for (let col = 0; col <= cols; col++) {
        ctx.beginPath();
        ctx.moveTo(col * zoom, 0);
        ctx.lineTo(col * zoom, rows * zoom);
        ctx.stroke();
      }
      
      for (let row = 0; row <= rows; row++) {
        ctx.beginPath();
        ctx.moveTo(0, row * zoom);
        ctx.lineTo(cols * zoom, row * zoom);
        ctx.stroke();
      }
    }
    
    ctx.restore();
  }, [editableData, zoom, pan, showGrid]);

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
    
    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  }, [zoom, pan]);

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (event.button === 0) {
      setIsDragging(true);
      setDragStarted(false);
      setLastMousePos({ x: event.clientX, y: event.clientY });
    }
  }, []);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = event.clientX - lastMousePos.x;
    const deltaY = event.clientY - lastMousePos.y;
    
    // If mouse moved significantly, consider it a drag
    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
      setDragStarted(true);
    }
    
    setPan(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));
    
    setLastMousePos({ x: event.clientX, y: event.clientY });
  }, [isDragging, lastMousePos]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragStarted(false);
  }, []);

  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    // Only flip pixels on click, not after dragging
    if (dragStarted) return;
    
    const canvas = canvasRef.current;
    if (!canvas || !editableData || editableData.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left - pan.x;
    const y = event.clientY - rect.top - pan.y;
    
    const col = Math.floor(x / zoom);
    const row = Math.floor(y / zoom);
    
    if (row >= 0 && row < editableData.length && col >= 0 && col < editableData[0].length) {
      const newData = editableData.map(r => [...r]);
      newData[row][col] = newData[row][col] === 0 ? 1 : 0;
      setEditableData(newData);
    }
  }, [editableData, zoom, pan, dragStarted]);

  const handleSave = () => {
    onSave(editableData);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  if (!data || data.length === 0) return null;

  const rows = data.length;
  const cols = data[0].length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">
            Edit Bitmap - {arrayName} ({rows}×{cols})
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-6 p-4 bg-slate-800 rounded-lg">
            <div className="flex items-center gap-2">
              <Label className="text-white">Zoom: {zoom.toFixed(1)}x</Label>
            </div>
            
            <div className="flex items-center gap-2">
              <Label className="text-white">Grid</Label>
              <Switch
                checked={showGrid}
                onCheckedChange={setShowGrid}
                className="data-[state=checked]:bg-blue-600"
              />
            </div>
            
            <div className="ml-auto flex gap-2">
              <Button
                onClick={handleCancel}
                variant="outline"
                className="border-slate-500 bg-slate-700 text-white hover:bg-slate-600"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="bg-slate-800 p-4 rounded-lg">
              <div className="mb-2 text-sm text-slate-400 text-center">
                Scroll to zoom, drag to pan, click pixels to flip color
              </div>
              <canvas
                ref={canvasRef}
                width={VIEWPORT_WIDTH}
                height={VIEWPORT_HEIGHT}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onClick={handleCanvasClick}
                className="border border-slate-600 rounded cursor-crosshair"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PixelEditor;
