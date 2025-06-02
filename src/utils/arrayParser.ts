
export interface ParsedArray {
  name: string;
  data: number[][];
}

export interface CustomDimensions {
  width: number;
  height: number;
}

export const parseArrayData = (input: string, customDimensions?: CustomDimensions): ParsedArray[] => {
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
  const arrayPattern = /(\w+)\s*\[\s*\d*\s*\]\s*\[\s*\d*\s*\]\s*=\s*{([^}]+)}/g;
  let match;
  let arrayIndex = 0;

  while ((match = arrayPattern.exec(cleaned)) !== null) {
    const arrayName = match[1];
    const arrayContent = match[2];
    
    console.log(`Found array: ${arrayName}`);
    
    // Parse individual sub-arrays
    const subArrayPattern = /{([^}]+)}/g;
    let subMatch;
    let subArrayIndex = 0;
    
    while ((subMatch = subArrayPattern.exec(arrayContent)) !== null) {
      const hexValues = subMatch[1];
      console.log(`Processing sub-array ${subArrayIndex}:`, hexValues.substring(0, 100) + '...');
      
      const bitmap = parseHexArrayToBitmap(hexValues, customDimensions);
      
      results.push({
        name: `${arrayName}[${subArrayIndex}]`,
        data: bitmap
      });
      
      subArrayIndex++;
    }
    
    arrayIndex++;
  }

  // If no multi-dimensional arrays found, try to parse as single array
  if (results.length === 0) {
    const singleArrayPattern = /{([^}]+)}/;
    const singleMatch = singleArrayPattern.exec(cleaned);
    
    if (singleMatch) {
      console.log('Parsing as single array');
      const hexValues = singleMatch[1];
      const bitmap = parseHexArrayToBitmap(hexValues, customDimensions);
      
      results.push({
        name: 'Array[0]',
        data: bitmap
      });
    }
  }

  if (results.length === 0) {
    throw new Error('No valid array data found');
  }

  console.log(`Successfully parsed ${results.length} arrays`);
  return results;
};

const parseHexArrayToBitmap = (hexString: string, customDimensions?: CustomDimensions): number[][] => {
  // Extract hex values
  const hexValues = hexString
    .split(',')
    .map(val => val.trim().replace(/^0[xX]/, ''))
    .filter(val => val.length > 0);

  console.log(`Found ${hexValues.length} hex values`);

  if (hexValues.length === 0) {
    throw new Error('No hex values found');
  }

  // Convert hex to binary and create bitmap
  const bitmap: number[][] = [];
  let currentRow: number[] = [];
  let bitCount = 0;

  // Use custom dimensions if provided, otherwise calculate automatically
  let width: number;
  let expectedRows: number;

  if (customDimensions) {
    width = customDimensions.width;
    expectedRows = customDimensions.height;
    console.log(`Using custom dimensions: ${width}x${expectedRows}`);
  } else {
    // Default auto-calculation (assuming each hex value represents 8 bits and 32-bit width)
    const totalBits = hexValues.length * 8;
    width = 32; // bits per row
    expectedRows = totalBits / width;
    console.log(`Auto-calculated dimensions: ${width}x${expectedRows}`);
  }

  for (const hexVal of hexValues) {
    const num = parseInt(hexVal, 16);
    
    if (isNaN(num)) {
      console.warn(`Invalid hex value: ${hexVal}`);
      continue;
    }
    
    // Convert to bit array (8 bits)
    for (let bit = 7; bit >= 0; bit--) {
      const bitValue = (num & (1 << bit)) ? 0 : 1; // If bit is set, show as black (0), otherwise white (1)
      currentRow.push(bitValue);
      bitCount++;
      
      // When we reach the width, start a new row
      if (bitCount % width === 0) {
        bitmap.push([...currentRow]);
        currentRow = [];
        
        // Stop if we've reached the expected number of rows (for custom dimensions)
        if (customDimensions && bitmap.length >= expectedRows) {
          break;
        }
      }
    }
    
    // Break out of hex value loop if we've reached expected rows
    if (customDimensions && bitmap.length >= expectedRows) {
      break;
    }
  }
  
  // Add any remaining bits to the last row (only if not using custom dimensions or if we haven't reached expected rows)
  if (currentRow.length > 0 && (!customDimensions || bitmap.length < expectedRows)) {
    // Pad the last row to reach the expected width if using custom dimensions
    if (customDimensions) {
      while (currentRow.length < width) {
        currentRow.push(1); // Pad with white pixels
      }
    }
    bitmap.push(currentRow);
  }

  console.log(`Generated bitmap: ${bitmap.length}x${bitmap[0]?.length || 0}`);
  
  // Validate dimensions match custom requirements
  if (customDimensions) {
    if (bitmap.length !== expectedRows) {
      console.warn(`Warning: Generated ${bitmap.length} rows, expected ${expectedRows}`);
    }
    if (bitmap[0] && bitmap[0].length !== width) {
      console.warn(`Warning: Generated ${bitmap[0].length} width, expected ${width}`);
    }
  }
  
  return bitmap;
};
