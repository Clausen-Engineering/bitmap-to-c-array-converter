
export interface ParsedArray {
  name: string;
  data: number[][];
}

export interface CustomDimensions {
  width: number;
  height: number;
}

export const parseArrayData = (input: string, dimensions: CustomDimensions): ParsedArray[] => {
  console.log('Parsing array data...');
  
  const results: ParsedArray[] = [];
  
  // Remove comments and clean up the input
  const cleaned = input
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
    .replace(/\/\/.*$/gm, '') // Remove line comments
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();

  console.log('Cleaned input:', cleaned.substring(0, 200) + '...');

  // Look for array declarations and their data
  const arrayPattern = /(\w+)\s*\[\s*\d*\s*\]\s*\[\s*\d*\s*\]\s*=\s*{([\s\S]*?)};/g;
  let match = arrayPattern.exec(cleaned);

  if (match) {
    const arrayName = match[1];
    const arrayContent = match[2];
    
    console.log(`Found multidimensional array: ${arrayName}`);
    
    // Split the content by closing and opening braces to find individual sub-arrays
    const subArrays = arrayContent.split(/}\s*,\s*{/);
    
    // Clean up the first and last elements
    if (subArrays.length > 0) {
      subArrays[0] = subArrays[0].replace(/^{\s*/, ''); // Remove opening brace from first
      subArrays[subArrays.length - 1] = subArrays[subArrays.length - 1].replace(/\s*}$/, ''); // Remove closing brace from last
    }
    
    console.log(`Found ${subArrays.length} sub-arrays`);
    
    subArrays.forEach((subArrayContent, index) => {
      const cleanContent = subArrayContent.trim();
      if (cleanContent) {
        console.log(`Processing sub-array ${index}:`, cleanContent.substring(0, 100) + '...');
        
        try {
          const bitmap = parseHexArrayToBitmap(cleanContent, dimensions);
          
          results.push({
            name: `${arrayName}[${index}]`,
            data: bitmap
          });
        } catch (error) {
          console.error(`Error parsing sub-array ${index}:`, error);
        }
      }
    });
  }

  // If no multi-dimensional arrays found, try to parse as single array
  if (results.length === 0) {
    const singleArrayPattern = /{([^}]+)}/;
    const singleMatch = singleArrayPattern.exec(cleaned);
    
    if (singleMatch) {
      console.log('Parsing as single array');
      const hexValues = singleMatch[1];
      const bitmap = parseHexArrayToBitmap(hexValues, dimensions);
      
      results.push({
        name: 'Array[0]',
        data: bitmap
      });
    }
  }

  if (results.length === 0) {
    throw new Error('No valid array data found. Please check the format.');
  }

  console.log(`Successfully parsed ${results.length} arrays`);
  return results;
};

const parseHexArrayToBitmap = (hexString: string, dimensions: CustomDimensions): number[][] => {
  // Extract hex values
  const hexValues = hexString
    .split(',')
    .map(val => val.trim().replace(/^0[xX]/, ''))
    .filter(val => val.length > 0 && val !== '');

  console.log(`Found ${hexValues.length} hex values for bitmap conversion`);
  console.log(`Using dimensions: ${dimensions.width}x${dimensions.height}`);

  if (hexValues.length === 0) {
    throw new Error('No hex values found');
  }

  // Initialize bitmap with correct dimensions
  const bitmap: number[][] = Array(dimensions.height).fill(null).map(() => Array(dimensions.width).fill(1));
  
  let bitIndex = 0;
  const totalBits = dimensions.width * dimensions.height;

  // Process each hex value
  for (const hexVal of hexValues) {
    const num = parseInt(hexVal, 16);
    
    if (isNaN(num)) {
      console.warn(`Invalid hex value: ${hexVal}`);
      continue;
    }
    
    // Convert to bit array (8 bits, MSB first)
    for (let bit = 7; bit >= 0; bit--) {
      if (bitIndex >= totalBits) break;
      
      // Get bit value (0 or 1)
      const bitValue = (num & (1 << bit)) ? 1 : 0;
      
      // Reverse color: 0 becomes 1 (white), 1 becomes 0 (black)
      const reversedBit = bitValue === 0 ? 1 : 0;
      
      // Calculate position for vertical scan
      // For vertical scan: we fill columns first, then move to next column
      const col = Math.floor(bitIndex / dimensions.height);
      const row = bitIndex % dimensions.height;
      
      if (row < dimensions.height && col < dimensions.width) {
        bitmap[row][col] = reversedBit;
      }
      
      bitIndex++;
    }
    
    if (bitIndex >= totalBits) break;
  }

  console.log(`Generated bitmap: ${bitmap.length}x${bitmap[0]?.length || 0}`);
  
  return bitmap;
};
