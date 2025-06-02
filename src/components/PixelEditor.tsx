
import { useRef, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
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
  const [zoom, setZoom] = useState([8]);
  const [showGrid, setShowGrid] = useState(true);

  // Initialize editable data when dialog opens
  useEffect(() => {
    if (isOpen && data) {
      setEditableData(data.map(row => [...row]));
    }
  }, [isOpen, data]);

  // Render the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !editableData || editableData.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rows = editableData.length;
    const cols = editableData[0].length;
    const pixelSize = zoom[0];
    
    // Set canvas size
    canvas.width = cols * pixelSize;
    canvas.height = rows * pixelSize;

    // Clear canvas
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw pixels
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const bit = editableData[row][col];
        ctx.fillStyle = bit === 0 ? '#000000' : '#ffffff';
        ctx.fillRect(col * pixelSize, row * pixelSize, pixelSize, pixelSize);
      }
    }

    // Draw grid if enabled
    if (showGrid && pixelSize > 2) {
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      
      // Vertical lines
      for (let col = 0; col <= cols; col++) {
        ctx.beginPath();
        ctx.moveTo(col * pixelSize, 0);
        ctx.lineTo(col * pixelSize, canvas.height);
        ctx.stroke();
      }
      
      // Horizontal lines
      for (let row = 0; row <= rows; row++) {
        ctx.beginPath();
        ctx.moveTo(0, row * pixelSize);
        ctx.lineTo(canvas.width, row * pixelSize);
        ctx.stroke();
      }
    }
  }, [editableData, zoom, showGrid]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !editableData || editableData.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const pixelSize = zoom[0];
    const col = Math.floor(x / pixelSize);
    const row = Math.floor(y / pixelSize);
    
    if (row >= 0 && row < editableData.length && col >= 0 && col < editableData[0].length) {
      const newData = editableData.map(r => [...r]);
      newData[row][col] = newData[row][col] === 0 ? 1 : 0;
      setEditableData(newData);
    }
  };

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
      <DialogContent className="max-w-6xl max-h-[90vh] bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">
            Edit Bitmap - {arrayName} ({rows}×{cols})
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Controls */}
          <div className="flex items-center gap-6 p-4 bg-slate-800 rounded-lg">
            <div className="flex items-center gap-2">
              <Label className="text-white">Zoom: {zoom[0]}x</Label>
              <div className="w-32">
                <Slider
                  value={zoom}
                  onValueChange={setZoom}
                  max={20}
                  min={2}
                  step={1}
                  className="[&_[role=slider]]:bg-blue-600"
                />
              </div>
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

          {/* Canvas Container */}
          <div className="flex justify-center">
            <div className="max-h-[60vh] overflow-auto bg-slate-800 p-4 rounded-lg">
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                className="border border-slate-600 rounded cursor-pointer"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
          </div>
          
          <p className="text-sm text-slate-400 text-center">
            Click on any pixel to flip its color (black ↔ white)
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PixelEditor;
