
/**
 * Creates a downloadable PNG from a canvas element
 * @param canvas The canvas element to download
 * @param filename The name for the downloaded file
 */
export const downloadCanvasAsPNG = (canvas: HTMLCanvasElement, filename: string): void => {
  // Convert canvas to data URL
  const dataURL = canvas.toDataURL('image/png');
  
  // Create download link
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataURL;
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
