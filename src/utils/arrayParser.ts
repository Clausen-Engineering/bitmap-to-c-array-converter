
export interface ParsedArray {
  name: string;
  data: number[][];
}

export const parseArrayData = (input: string): ParsedArray[] => {
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
      
      const bitmap = parseHexArrayToBitmap(hexValues);
      
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
      const bitmap = parseHexArrayToBitmap(hexValues);
      
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

const parseHexArrayToBitmap = (hexString: string): number[][] => {
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

  // Assuming each hex value represents 8 bits
  // and we need to determine the width based on total bits
  const totalBits = hexValues.length * 8;
  
  // For the given examples, it's 32x64 (32 bits wide, 64 rows)
  // So 256 hex values = 2048 bits = 32 * 64
  const width = 32; // bits per row
  const expectedRows = totalBits / width;

  console.log(`Expected dimensions: ${width}x${expectedRows}`);

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
      }
    }
  }
  
  // Add any remaining bits to the last row
  if (currentRow.length > 0) {
    bitmap.push(currentRow);
  }

  console.log(`Generated bitmap: ${bitmap.length}x${bitmap[0]?.length || 0}`);
  return bitmap;
};
