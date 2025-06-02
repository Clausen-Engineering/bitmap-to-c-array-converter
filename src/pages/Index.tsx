
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { Download, Upload, Zap, Image, Palette, Edit, X } from 'lucide-react';
import BitmapViewer from '@/components/BitmapViewer';
import PixelEditor from '@/components/PixelEditor';
import { parseArrayData } from '@/utils/arrayParser';
import { convertImageToArray } from '@/utils/imageToArray';

const Index = () => {
  const [arrayData, setArrayData] = useState('');
  const [parsedArrays, setParsedArrays] = useState<Array<{ name: string; data: number[][] }>>([]);
  const [selectedArray, setSelectedArray] = useState(0);
  const [showGrid, setShowGrid] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [width, setWidth] = useState('264');
  const [height, setHeight] = useState('176');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

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

  const handleImageSelection = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = async (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      if (files.length === 0) return;

      setIsLoading(true);
      
      try {
        // Validate all images have the same dimensions
        const imageDimensions: Array<{ width: number; height: number; file: File }> = [];
        
        for (const file of files) {
          const img = document.createElement('img');
          const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
            img.onload = () => {
              resolve({ width: img.naturalWidth, height: img.naturalHeight });
            };
            img.onerror = () => reject(new Error(`Failed to load image: ${file.name}`));
            img.src = URL.createObjectURL(file);
          });
          
          imageDimensions.push({ ...dimensions, file });
        }
        
        // Check if all images have the same dimensions
        const firstDimensions = imageDimensions[0];
        const allSameDimensions = imageDimensions.every(
          img => img.width === firstDimensions.width && img.height === firstDimensions.height
        );
        
        if (!allSameDimensions) {
          toast({
            title: "Dimension Mismatch",
            description: "All images must have the same dimensions for multidimensional arrays.",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }
        
        // Set dimensions from the first image
        setWidth(firstDimensions.width.toString());
        setHeight(firstDimensions.height.toString());
        setSelectedImages(files);
        
        toast({
          title: "Images Selected",
          description: `Selected ${files.length} image(s) with dimensions ${firstDimensions.width}x${firstDimensions.height}. Click 'Convert Images' to process them.`,
        });
        
      } catch (error) {
        console.error('Error processing images:', error);
        toast({
          title: "Processing Error",
          description: "Could not process the selected images. Please try again.",
          variant: "destructive"
        });
      }
      
      setIsLoading(false);
    };
    input.click();
  };

  const handleConvertImages = async () => {
    if (selectedImages.length === 0) {
      toast({
        title: "No Images Selected",
        description: "Please select images first.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const cArrayStrings: string[] = [];
      
      for (const file of selectedImages) {
        const cArrayString = await convertImageToArray(file, {
          width: parseInt(width),
          height: parseInt(height),
          threshold: 128
        });
        cArrayStrings.push(cArrayString);
      }
      
      // Combine all arrays into a multidimensional array format
      const combinedArray = cArrayStrings.join('\n\n');
      setArrayData(combinedArray);
      
      toast({
        title: "Images Converted!",
        description: `Converted ${selectedImages.length} image(s) to C array format. Click 'Parse Arrays' to visualize them.`,
      });
      
    } catch (error) {
      console.error('Error converting images:', error);
      toast({
        title: "Conversion Error",
        description: "Could not convert the images. Please try a different set of images.",
        variant: "destructive"
      });
    }
    
    setIsLoading(false);
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(updatedImages);
    
    if (updatedImages.length === 0) {
      toast({
        title: "All Images Removed",
        description: "No images selected. You can select new images to convert.",
      });
    }
  };

  const handleLoadPicture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setIsLoading(true);
        
        try {
          const img = document.createElement('img');
          const imageLoadPromise = new Promise<{ width: number; height: number }>((resolve, reject) => {
            img.onload = () => {
              resolve({ width: img.naturalWidth, height: img.naturalHeight });
            };
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = URL.createObjectURL(file);
          });

          const { width: detectedWidth, height: detectedHeight } = await imageLoadPromise;
          
          setWidth(detectedWidth.toString());
          setHeight(detectedHeight.toString());
          
          const cArrayString = await convertImageToArray(file, {
            width: detectedWidth,
            height: detectedHeight,
            threshold: 128
          });
          
          setArrayData(cArrayString);
          
          toast({
            title: "Image converted!",
            description: `Image converted to C array with dimensions ${detectedWidth}x${detectedHeight}. Click 'Parse Arrays' to visualize it.`,
          });
        } catch (error) {
          console.error('Error converting image:', error);
          toast({
            title: "Conversion Error",
            description: "Could not convert the image. Please try a different image.",
            variant: "destructive"
          });
        }
        
        setIsLoading(false);
      }
    };
    input.click();
  };

  const handleEditPixels = () => {
    setIsEditorOpen(true);
  };

  const handleSaveEditedBitmap = (newData: number[][]) => {
    if (parsedArrays.length > 0) {
      const updatedArrays = [...parsedArrays];
      updatedArrays[selectedArray] = {
        ...updatedArrays[selectedArray],
        data: newData
      };
      setParsedArrays(updatedArrays);
      
      toast({
        title: "Bitmap Updated!",
        description: "Your pixel edits have been saved successfully."
      });
    }
  };

  const handleRevertColor = () => {
    if (parsedArrays.length > 0 && parsedArrays[selectedArray]) {
      const currentArray = parsedArrays[selectedArray];
      const revertedData = currentArray.data.map(row => 
        row.map(pixel => pixel === 0 ? 1 : 0)
      );
      
      const updatedArrays = [...parsedArrays];
      updatedArrays[selectedArray] = {
        ...updatedArrays[selectedArray],
        data: revertedData
      };
      setParsedArrays(updatedArrays);
      
      toast({
        title: "Colors Reverted!",
        description: "All pixel colors have been inverted successfully."
      });
    }
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
                  onClick={handleLoadPicture}
                  variant="outline"
                  className="border-slate-500 bg-slate-700 text-slate-100 hover:bg-slate-600 hover:text-white"
                >
                  <Image className="w-4 h-4 mr-2" />
                  Load Picture
                </Button>

                <Button
                  onClick={handleImageSelection}
                  variant="outline"
                  className="border-slate-500 bg-slate-700 text-slate-100 hover:bg-slate-600 hover:text-white"
                >
                  <Image className="w-4 h-4 mr-2" />
                  Load Multiple Pictures
                </Button>
              </div>

              {/* Selected Images Display */}
              {selectedImages.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-slate-300">Selected Images ({selectedImages.length}):</Label>
                  <div className="bg-slate-800/50 rounded-lg p-3 max-h-32 overflow-y-auto">
                    {selectedImages.map((file, index) => (
                      <div key={index} className="flex items-center justify-between py-1">
                        <span className="text-sm text-slate-300 truncate">{file.name}</span>
                        <Button
                          onClick={() => handleRemoveImage(index)}
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-slate-400 hover:text-red-400"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={handleConvertImages}
                    disabled={isLoading}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isLoading ? 'Converting...' : 'Convert Images'}
                  </Button>
                </div>
              )}

              {parsedArrays.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-slate-300">Select Array:</Label>
                  <select
                    value={selectedArray}
                    onChange={(e) => setSelectedArray(Number(e.target.value))}
                    className="w-full bg-slate-600 border border-slate-600 rounded px-3 py-2 text-white"
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

              <div className="flex items-center justify-between bg-slate-800 p-3 rounded-lg">
                <Label htmlFor="grid-toggle" className="text-white">
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
                <div className="flex gap-2">
                  <Button
                    onClick={handleRevertColor}
                    variant="outline"
                    size="sm"
                    className="border-slate-500 bg-slate-700 text-slate-100 hover:bg-slate-600 hover:text-white"
                  >
                    <Palette className="w-4 h-4 mr-2" />
                    Invert Color
                  </Button>
                  <Button
                    onClick={handleEditPixels}
                    variant="outline"
                    size="sm"
                    className="border-slate-500 bg-slate-700 text-slate-100 hover:bg-slate-600 hover:text-white"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Pixels
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-500 bg-slate-700 text-slate-100 hover:bg-slate-600 hover:text-white"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PNG
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BitmapViewer
                data={parsedArrays[selectedArray].data}
                showGrid={showGrid}
                onEdit={handleEditPixels}
                onRevertColor={handleRevertColor}
              />
            </CardContent>
          </Card>
        )}

        {/* Pixel Editor */}
        {parsedArrays.length > 0 && parsedArrays[selectedArray] && (
          <PixelEditor
            isOpen={isEditorOpen}
            onClose={() => setIsEditorOpen(false)}
            data={parsedArrays[selectedArray].data}
            onSave={handleSaveEditedBitmap}
            arrayName={parsedArrays[selectedArray].name}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
