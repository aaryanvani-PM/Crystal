/**
 * Export helpers for saving high-resolution PNG, vector SVG, and JSON
 */

export async function exportCardAsPng(elementId: string, filename: string = 'infographic.png', scale: number = 2) {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id ${elementId} not found`);
  }

  // Clone node and prepare computed inline styles for crisp canvas rendering
  const rect = element.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;

  // Create an SVG with foreignObject containing the HTML markup
  const clone = element.cloneNode(true) as HTMLElement;
  
  // Create XML serializer
  const serializer = new XMLSerializer();
  const serializedHtml = serializer.serializeToString(clone);

  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml" style="width: 100%; height: 100%;">
          ${serializedHtml}
        </div>
      </foreignObject>
    </svg>
  `;

  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const img = new Image();
  img.crossOrigin = 'anonymous';

  return new Promise<void>((resolve, reject) => {
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = width * scale;
        canvas.height = height * scale;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Canvas context unavailable');
        }

        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0);

        canvas.toBlob((pngBlob) => {
          if (!pngBlob) {
            reject(new Error('Failed to create PNG blob'));
            return;
          }
          const downloadUrl = URL.createObjectURL(pngBlob);
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(downloadUrl);
          URL.revokeObjectURL(url);
          resolve();
        }, 'image/png');
      } catch (e) {
        reject(e);
      }
    };

    img.onerror = (e) => {
      // Fallback: If foreignObject security restriction occurs in some browsers, download SVG directly
      console.warn('ForeignObject canvas draw failed, initiating vector download fallback', e);
      downloadBlob(blob, filename.replace('.png', '.svg'));
      resolve();
    };

    img.src = url;
  });
}

export function exportCardAsSvg(elementId: string, filename: string = 'infographic.svg') {
  const element = document.getElementById(elementId);
  if (!element) return;

  const rect = element.getBoundingClientRect();
  const serializer = new XMLSerializer();
  const cloned = element.cloneNode(true) as HTMLElement;
  const content = serializer.serializeToString(cloned);

  const fullSvg = `<?xml version="1.0" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg width="${rect.width}" height="${rect.height}" viewBox="0 0 ${rect.width} ${rect.height}" xmlns="http://www.w3.org/2000/svg">
  <foreignObject width="100%" height="100%">
    <div xmlns="http://www.w3.org/1999/xhtml">
      ${content}
    </div>
  </foreignObject>
</svg>`;

  const blob = new Blob([fullSvg], { type: 'image/svg+xml;charset=utf-8' });
  downloadBlob(blob, filename);
}

export function exportDataAsJson(data: any, filename: string = 'infographic-data.json') {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  downloadBlob(blob, filename);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
