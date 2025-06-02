
import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import PixelEditorCanvas from './PixelEditorCanvas';
import PixelEditorControls from './PixelEditorControls';

interface PixelEditorProps {
  isOpen: boolean;
  onClose: () => void;
  data: number[][];
  onSave: (newData: number[][]) => void;
  arrayName: string;
}

const PixelEditor = ({ isOpen, onClose, data, onSave, arrayName }: PixelEditorProps) => {
  const [editableData, setEditableData] = useState<number[][]>([]);
  const [zoom, setZoom] = useState(8);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);

  // Fixed viewport size for editor
  const VIEWPORT_WIDTH = 1050;
  const VIEWPORT_HEIGHT = 600;

  useEffect(() => {
    if (isOpen && data) {
      setEditableData(data.map(row => [...row]));
      setPan({ x: 0, y: 0 });
    }
  }, [isOpen, data]);

  const handleZoomChange = useCallback((newZoom: number, newPan: { x: number; y: number }) => {
    setZoom(newZoom);
    setPan(newPan);
  }, []);

  const handlePixelClick = useCallback((row: number, col: number) => {
    const newData = editableData.map(r => [...r]);
    newData[row][col] = newData[row][col] === 0 ? 1 : 0;
    setEditableData(newData);
  }, [editableData]);

  const handleSave = () => {
    onSave(editableData);
    onClose();
  };

  const handleRevertColor = () => {
    if (!editableData || editableData.length === 0) return;
    
    const revertedData = editableData.map(row => 
      row.map(pixel => pixel === 0 ? 1 : 0)
    );
    setEditableData(revertedData);
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
          <PixelEditorControls
            zoom={zoom}
            showGrid={showGrid}
            onGridToggle={setShowGrid}
            onRevertColor={handleRevertColor}
            onSave={handleSave}
            onCancel={onClose}
          />

          <div className="flex justify-center">
            <div className="bg-slate-800 p-4 rounded-lg" style={{ width: '100%' }}>
              <div className="mb-2 text-sm text-slate-400 text-center">
                Scroll to zoom, drag to pan, click pixels to flip color
              </div>
              <div className="flex justify-center">
                <PixelEditorCanvas
                  data={editableData}
                  zoom={zoom}
                  pan={pan}
                  showGrid={showGrid}
                  onZoomChange={handleZoomChange}
                  onPanChange={setPan}
                  onPixelClick={handlePixelClick}
                  width={VIEWPORT_WIDTH}
                  height={VIEWPORT_HEIGHT}
                />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PixelEditor;
