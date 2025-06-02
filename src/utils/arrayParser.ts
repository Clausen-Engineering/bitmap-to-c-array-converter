
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
    
    // More robust parsing: find all content between { and } pairs
    const subArrayMatches = [];
    let depth = 0;
    let currentStart = -1;
    let i = 0;
    
    while (i < arrayContent.length) {
      if (arrayContent[i] === '{') {
        if (depth === 0) {
          currentStart = i + 1; // Start after the opening brace
        }
        depth++;
      } else if (arrayContent[i] === '}') {
        depth--;
        if (depth === 0 && currentStart !== -1) {
          // Extract content between the braces
          const subArrayContent = arrayContent.substring(currentStart, i).trim();
          if (subArrayContent) {
            subArrayMatches.push(subArrayContent);
          }
          currentStart = -1;
        }
      }
      i++;
    }
    
    console.log(`Found ${subArrayMatches.length} sub-arrays`);
    
    subArrayMatches.forEach((subArrayContent, index) => {
      console.log(`Processing sub-array ${index}:`, subArrayContent.substring(0, 100) + '...');
      
      try {
        const bitmap = parseHexArrayToBitmap(subArrayContent, dimensions);
        
        results.push({
          name: `${arrayName}[${index}]`,
          data: bitmap
        });
      } catch (error) {
        console.error(`Error parsing sub-array ${index}:`, error);
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
  // Extract hex values more carefully
  const hexValues = hexString
    .split(',')
    .map(val => val.trim())
    .map(val => val.replace(/^0[xX]/, '')) // Remove 0x prefix
    .filter(val => val.length > 0 && val !== '' && /^[0-9A-Fa-f]+$/.test(val)); // Only valid hex

  console.log(`Found ${hexValues.length} hex values for bitmap conversion`);
  console.log(`Using dimensions: ${dimensions.width}x${dimensions.height}`);
  console.log(`First few hex values: ${hexValues.slice(0, 5).join(', ')}`);

  if (hexValues.length === 0) {
    throw new Error('No valid hex values found');
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
  console.log(`Processed ${bitIndex} bits out of ${totalBits} total`);
  
  return bitmap;
};
