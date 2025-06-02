
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Save, X, Palette } from 'lucide-react';

interface PixelEditorControlsProps {
  zoom: number;
  showGrid: boolean;
  onGridToggle: (show: boolean) => void;
  onRevertColor: () => void;
  onSave: () => void;
  onCancel: () => void;
}

const PixelEditorControls = ({
  zoom,
  showGrid,
  onGridToggle,
  onRevertColor,
  onSave,
  onCancel
}: PixelEditorControlsProps) => {
  return (
    <div className="flex items-center gap-6 p-4 bg-slate-800 rounded-lg">
      <div className="flex items-center gap-2">
        <Label className="text-white">Zoom: {zoom.toFixed(1)}x</Label>
      </div>
      
      <div className="flex items-center gap-2">
        <Label className="text-white">Grid</Label>
        <Switch
          checked={showGrid}
          onCheckedChange={onGridToggle}
          className="data-[state=checked]:bg-blue-600"
        />
      </div>
      
      <Button
        onClick={onRevertColor}
        variant="outline"
        className="border-slate-500 bg-slate-700 text-white hover:bg-slate-600"
      >
        <Palette className="w-4 h-4 mr-2" />
        Invert Color
      </Button>
      
      <div className="ml-auto flex gap-2">
        <Button
          onClick={onCancel}
          variant="outline"
          className="border-slate-500 bg-slate-700 text-white hover:bg-slate-600"
        >
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
        <Button
          onClick={onSave}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default PixelEditorControls;
