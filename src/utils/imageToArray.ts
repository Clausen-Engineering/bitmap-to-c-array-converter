
export interface ImageToArrayOptions {
  width: number;
  height: number;
  threshold?: number; // For black/white conversion
}

export const convertImageToArray = async (
  file: File, 
  options: ImageToArrayOptions
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    img.onload = () => {
      try {
        // Set canvas dimensions
        canvas.width = options.width;
        canvas.height = options.height;
        
        // Draw and resize image to fit canvas
        ctx.drawImage(img, 0, 0, options.width, options.height);
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, options.width, options.height);
        const data = imageData.data;
        
        // Convert to bitmap array
        const bitmap: number[][] = Array(options.height).fill(null).map(() => Array(options.width).fill(0));
        
        // Convert pixels to black/white based on threshold
        const threshold = options.threshold || 128;
        
        for (let y = 0; y < options.height; y++) {
          for (let x = 0; x < options.width; x++) {
            const index = (y * options.width + x) * 4;
            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];
            
            // Calculate grayscale value
            const grayscale = (r + g + b) / 3;
            
            // Convert to 1 (white) or 0 (black)
            bitmap[y][x] = grayscale > threshold ? 1 : 0;
          }
        }
        
        // Convert bitmap to hex bytes (vertical scan)
        const hexBytes: string[] = [];
        const totalBits = options.width * options.height;
        const totalBytes = Math.ceil(totalBits / 8);
        
        for (let byteIndex = 0; byteIndex < totalBytes; byteIndex++) {
          let byte = 0;
          
          for (let bit = 0; bit < 8; bit++) {
            const bitIndex = byteIndex * 8 + bit;
            
            if (bitIndex < totalBits) {
              // Calculate position for vertical scan
              const col = Math.floor(bitIndex / options.height);
              const row = bitIndex % options.height;
              
              if (row < options.height && col < options.width) {
                // Invert bit (0 becomes 1, 1 becomes 0) to match expected format
                const pixelValue = bitmap[row][col] === 0 ? 1 : 0;
                byte |= (pixelValue << (7 - bit));
              }
            }
          }
          
          hexBytes.push(`0X${byte.toString(16).toUpperCase().padStart(2, '0')}`);
        }
        
        // Format as C array
        const arrayName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_]/g, '_');
        let cArray = `const unsigned char ${arrayName}[${hexBytes.length}] = {\n`;
        
        // Add hex values with proper formatting (16 per line)
        for (let i = 0; i < hexBytes.length; i++) {
          if (i % 16 === 0 && i > 0) {
            cArray += '\n';
          }
          cArray += hexBytes[i];
          if (i < hexBytes.length - 1) {
            cArray += ',';
          }
        }
        
        cArray += '\n};';
        
        console.log(`Generated C array with ${hexBytes.length} bytes`);
        resolve(cArray);
        
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};
