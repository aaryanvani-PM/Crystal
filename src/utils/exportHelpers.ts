import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Export helpers for saving high-resolution PNG, PDF, vector SVG, and JSON
 */

export async function exportCardAsPng(
  elementId: string,
  filename: string = 'infographic.png',
  scale: number = 2
) {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id ${elementId} not found`);
  }

  try {
    const canvas = await html2canvas(element, {
      scale: scale,
      useCORS: true,
      backgroundColor: '#111113',
      logging: false,
      ignoreElements: (el) => el.getAttribute('data-html2canvas-ignore') === 'true',
    });

    canvas.toBlob((blob) => {
      if (!blob) {
        throw new Error('Failed to create PNG blob');
      }
      downloadBlob(blob, filename.endsWith('.png') ? filename : `${filename}.png`);
    }, 'image/png');
  } catch (err) {
    console.warn('html2canvas rendering failed, attempting SVG foreignObject fallback', err);
    await fallbackForeignObjectPng(element, filename, scale);
  }
}

export async function exportCardAsPdf(
  elementId: string,
  filename: string = 'infographic.pdf'
) {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id ${elementId} not found`);
  }

  // Render element at 2x retina scale for sharp text and vectors
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#111113',
    logging: false,
    ignoreElements: (el) => el.getAttribute('data-html2canvas-ignore') === 'true',
  });

  const imgData = canvas.toDataURL('image/png');
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;

  // Compute PDF aspect ratio
  const isLandscape = imgWidth >= imgHeight;
  const orientation = isLandscape ? 'landscape' : 'portrait';

  // Standard dimensions in mm: 297mm for A4 landscape or 210mm for portrait
  const baseWidth = isLandscape ? 297 : 210;
  const calculatedHeight = (imgHeight * baseWidth) / imgWidth;

  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format: [baseWidth, calculatedHeight],
  });

  pdf.addImage(imgData, 'PNG', 0, 0, baseWidth, calculatedHeight);
  pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
}

export function exportCardAsSvg(elementId: string, filename: string = 'infographic.svg') {
  const element = document.getElementById(elementId);
  if (!element) return;

  const rect = element.getBoundingClientRect();
  const serializer = new XMLSerializer();
  const cloned = element.cloneNode(true) as HTMLElement;

  // Remove elements with data-html2canvas-ignore
  const ignoreElements = cloned.querySelectorAll('[data-html2canvas-ignore="true"]');
  ignoreElements.forEach((el) => el.remove());

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
  downloadBlob(blob, filename.endsWith('.svg') ? filename : `${filename}.svg`);
}

export function exportDataAsJson(data: any, filename: string = 'infographic-data.json') {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  downloadBlob(blob, filename.endsWith('.json') ? filename : `${filename}.json`);
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

async function fallbackForeignObjectPng(element: HTMLElement, filename: string, scale: number) {
  const rect = element.getBoundingClientRect();
  const serializer = new XMLSerializer();
  const serializedHtml = serializer.serializeToString(element);

  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${rect.width}" height="${rect.height}">
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
        canvas.width = rect.width * scale;
        canvas.height = rect.height * scale;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas context unavailable');
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0);

        canvas.toBlob((pngBlob) => {
          if (!pngBlob) return reject(new Error('PNG blob creation failed'));
          downloadBlob(pngBlob, filename);
          URL.revokeObjectURL(url);
          resolve();
        }, 'image/png');
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = reject;
    img.src = url;
  });
}
