/**
 * A simple pure-frontend inpainting fallback.
 * It uses a basic "nearest neighbor" search to fill masked areas with surrounding pixels.
 */
export async function fallbackInpaint(
  sourceImageBase64: string,
  maskImageBase64: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return reject("Could not get canvas context");

      canvas.width = img.width;
      canvas.height = img.height;

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Create a temporary canvas to extract the mask
      const maskImg = new Image();
      maskImg.onload = () => {
        const maskCanvas = document.createElement("canvas");
        const maskCtx = maskCanvas.getContext("2d", { willReadFrequently: true });
        if (!maskCtx) return reject("Could not get mask context");

        maskCanvas.width = canvas.width;
        maskCanvas.height = canvas.height;
        maskCtx.drawImage(maskImg, 0, 0, canvas.width, canvas.height);

        const maskData = maskCtx.getImageData(0, 0, canvas.width, canvas.height).data;
        
        // Identify masked pixels (where red channel is high and alpha is not zero)
        // In our ImageEditor, we draw with 'rgba(255, 0, 0, 0.5)'
        const isMasked = new Uint8Array(canvas.width * canvas.height);
        for (let i = 0; i < maskData.length; i += 4) {
          const r = maskData[i];
          const a = maskData[i + 3];
          if (r > 100 && a > 20) {
            isMasked[i / 4] = 1;
          }
        }

        // Simple Inpainting: For each masked pixel, find the nearest non-masked pixel
        // This is a basic implementation. For better results, we'd use a more advanced algorithm.
        const resultData = new Uint8ClampedArray(data);
        const width = canvas.width;
        const height = canvas.height;

        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const idx = y * width + x;
            if (isMasked[idx]) {
              // Search in expanding squares for the nearest valid pixel
              let found = false;
              for (let radius = 1; radius < 50 && !found; radius++) {
                for (let dy = -radius; dy <= radius && !found; dy++) {
                  for (let dx = -radius; dx <= radius && !found; dx++) {
                    const nx = x + dx;
                    const ny = y + dy;
                    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                      const nIdx = ny * width + nx;
                      if (!isMasked[nIdx]) {
                        const targetPos = idx * 4;
                        const sourcePos = nIdx * 4;
                        resultData[targetPos] = data[sourcePos];
                        resultData[targetPos + 1] = data[sourcePos + 1];
                        resultData[targetPos + 2] = data[sourcePos + 2];
                        resultData[targetPos + 3] = data[sourcePos + 3];
                        found = true;
                      }
                    }
                  }
                }
              }
            }
          }
        }

        ctx.putImageData(new ImageData(resultData, width, height), 0, 0);
        
        // Apply a slight blur to the result to hide artifacts
        ctx.filter = 'blur(1px)';
        ctx.drawImage(canvas, 0, 0);
        ctx.filter = 'none';

        resolve(canvas.toDataURL("image/png"));
      };
      maskImg.src = maskImageBase64;
    };
    img.onerror = () => reject("Failed to load image");
    img.src = sourceImageBase64;
  });
}
