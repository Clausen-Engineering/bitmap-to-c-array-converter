import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { Download, Upload, Zap } from 'lucide-react';
import BitmapViewer from '@/components/BitmapViewer';
import { parseArrayData } from '@/utils/arrayParser';

const Index = () => {
  const [arrayData, setArrayData] = useState('');
  const [parsedArrays, setParsedArrays] = useState<Array<{ name: string; data: number[][] }>>([]);
  const [selectedArray, setSelectedArray] = useState(0);
  const [zoom, setZoom] = useState([4]);
  const [showGrid, setShowGrid] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [width, setWidth] = useState('264');
  const [height, setHeight] = useState('176');

  const handleArrayParse = () => {
    if (!arrayData.trim()) {
      toast({
        title: "No data provided",
        description: "Please paste your C array data first.",
        variant: "destructive"
      });
      return;
    }

    const widthValue = parseInt(width);
    const heightValue = parseInt(height);
    
    if (!widthValue || !heightValue || widthValue <= 0 || heightValue <= 0) {
      toast({
        title: "Invalid dimensions",
        description: "Please enter valid width and height values.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const parsed = parseArrayData(arrayData, {
        width: widthValue,
        height: heightValue
      });
      setParsedArrays(parsed);
      setSelectedArray(0);
      toast({
        title: "Success!",
        description: `Parsed ${parsed.length} array(s) successfully.`
      });
    } catch (error) {
      console.error('Parse error:', error);
      toast({
        title: "Parse Error",
        description: "Could not parse the array data. Please check the format.",
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  const loadSampleData = () => {
    const sampleData = `const unsigned char Num[10][256] = {
//0
{
0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,
0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,
0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,
0XFF,0XFE,0XFF,0XFF,0XFF,0XFF,0XF3,0XFF,0XFF,0XFE,0XFF,0XFF,0XFF,0XFF,0XF3,0XFF,
0XFF,0XFE,0XFF,0XFF,0XFF,0XFF,0XF3,0XFF,0XFF,0XFE,0XFF,0XFF,0XFF,0XFF,0XF3,0XFF,
0XFF,0XFE,0XFF,0XFF,0XFF,0XFF,0XF3,0XFF,0XFF,0XFE,0XFF,0XFF,0XFF,0XFF,0XF3,0XFF,
0XFF,0XF8,0XFF,0XFF,0XFF,0XFF,0XE3,0XFF,0XFF,0XF8,0X00,0X00,0X00,0X00,0X03,0XFF,
0XFF,0XF0,0X00,0X00,0X00,0X00,0X03,0XFF,0XFF,0XF0,0X00,0X00,0X00,0X00,0X03,0XFF,
0XFF,0XC0,0X00,0X00,0X00,0X00,0X03,0XFF,0XFF,0XC0,0X00,0X00,0X00,0X00,0X03,0XFF,
0XFF,0XC0,0X00,0X00,0X00,0X00,0X03,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XC3,0XFF,
0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XE3,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XF3,0XFF,
0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XF3,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XF3,0XFF,
0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XF3,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XF3,0XFF,
0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,
0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,
0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,  
},
//1
{
0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,
0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,
0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,
0XFF,0XFC,0XFF,0XFF,0XFF,0XFF,0XF3,0XFF,0XFF,0XFC,0XFF,0XFF,0XFF,0XFF,0XF3,0XFF,
0XFF,0XFC,0XFF,0XFF,0XFF,0XFF,0XF3,0XFF,0XFF,0XFC,0XFF,0XFF,0XFF,0XFF,0XF3,0XFF,
0XFF,0XFC,0XFF,0XFF,0XFF,0XFF,0XF3,0XFF,0XFF,0XFC,0XFF,0XFF,0XFF,0XFF,0XF3,0XFF,
0XFF,0XF8,0XFF,0XFF,0XFF,0XFF,0XE3,0XFF,0XFF,0XF8,0X00,0X00,0X00,0X00,0X03,0XFF,
0XFF,0XF0,0X00,0X00,0X00,0X00,0X03,0XFF,0XFF,0XF0,0X00,0X00,0X00,0X00,0X03,0XFF,
0XFF,0XC0,0X00,0X00,0X00,0X00,0X03,0XFF,0XFF,0XC0,0X00,0X00,0X00,0X00,0X03,0XFF,
0XFF,0XC0,0X00,0X00,0X00,0X00,0X03,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XC3,0XFF,
0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XE3,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XF3,0XFF,
0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XF3,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XF3,0XFF,
0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XF3,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XF3,0XFF,
0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,
0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,
0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,0XFF,  
}
};`;
    setArrayData(sampleData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            C Array to Bitmap Converter
          </h1>
          <p className="text-slate-400 text-lg">
            Transform your embedded C arrays into beautiful black and white bitmap visualizations
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Upload className="w-5 h-5 text-blue-400" />
                Array Data Input
              </CardTitle>
              <CardDescription className="text-slate-400">
                Paste your C array data here (supports multi-dimensional arrays)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Paste your C array data here..."
                value={arrayData}
                onChange={(e) => setArrayData(e.target.value)}
                className="min-h-[200px] bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 font-mono text-sm"
              />
              
              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={handleArrayParse}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  {isLoading ? 'Parsing...' : 'Parse Arrays'}
                </Button>
                
                <Button
                  onClick={loadSampleData}
                  variant="outline"
                  className="border-slate-500 text-slate-800 hover:bg-slate-700 hover:text-white"
                >
                  Load Sample Data
                </Button>
              </div>

              {parsedArrays.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-slate-300">Select Array:</Label>
                  <select
                    value={selectedArray}
                    onChange={(e) => setSelectedArray(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white"
                  >
                    {parsedArrays.map((arr, index) => (
                      <option key={index} value={index}>
                        {arr.name} ({arr.data.length}×{arr.data[0]?.length || 0})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Controls Section */}
          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Display Controls</CardTitle>
              <CardDescription className="text-slate-400">
                Customize the bitmap visualization and dimensions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Dimensions Section */}
              <div className="space-y-4 p-4 bg-slate-800/50 rounded-lg">
                <h3 className="text-white font-medium">Bitmap Dimensions</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300 text-sm">Width (pixels)</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 264"
                      value={width}
                      onChange={(e) => setWidth(e.target.value)}
                      className="bg-slate-800 border-slate-600 text-white"
                      min="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300 text-sm">Height (pixels)</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 176"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="bg-slate-800 border-slate-600 text-white"
                      min="1"
                    />
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  Specify the exact bitmap dimensions for proper rendering
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-200">Zoom Level: {zoom[0]}x</Label>
                <div className="bg-slate-800/50 p-3 rounded-lg">
                  <Slider
                    value={zoom}
                    onValueChange={setZoom}
                    max={20}
                    min={1}
                    step={1}
                    className="w-full [&_[role=slider]]:bg-blue-600 [&_[role=slider]]:border-blue-500 [&_.bg-primary]:bg-white [&_.bg-secondary]:bg-blue-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg">
                <Label htmlFor="grid-toggle" className="text-slate-200">
                  Show Grid Lines
                </Label>
                <Switch
                  id="grid-toggle"
                  checked={showGrid}
                  onCheckedChange={setShowGrid}
                  className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-slate-600"
                />
              </div>

              {parsedArrays.length > 0 && parsedArrays[selectedArray] && (
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <h3 className="font-medium text-white mb-2">Array Info</h3>
                  <div className="text-sm text-slate-400 space-y-1">
                    <p>Name: {parsedArrays[selectedArray].name}</p>
                    <p>Dimensions: {parsedArrays[selectedArray].data.length} × {parsedArrays[selectedArray].data[0]?.length || 0}</p>
                    <p>Total pixels: {parsedArrays[selectedArray].data.length * (parsedArrays[selectedArray].data[0]?.length || 0)}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bitmap Viewer */}
        {parsedArrays.length > 0 && parsedArrays[selectedArray] && (
          <Card className="mt-8 bg-slate-900/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-white">
                <span>Bitmap Preview - {parsedArrays[selectedArray].name}</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-500 text-slate-800 hover:bg-slate-700 hover:text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PNG
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BitmapViewer
                data={parsedArrays[selectedArray].data}
                zoom={zoom[0]}
                showGrid={showGrid}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;
