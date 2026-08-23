import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// Cache fetched raw SVGs in memory to prevent refetching
const svgCache = new Map();

/**
 * Fetch raw SVG text from public static endpoint with fallback cascading
 */
export async function getSvgContent(iconId, variant = 'default') {
  const key = `${iconId}/${variant}`;
  if (svgCache.has(key)) {
    return svgCache.get(key);
  }

  const candidateUrls = [
    `/icons/${iconId}/${variant}.svg`,
    `/icons/${iconId}/default.svg`,
    `/icons/${iconId}/dark.svg`,
    `/icons/${iconId}/light.svg`,
    `/icons/${iconId}/mono.svg`,
    `/icons/${iconId}/wordmark.svg`,
  ];

  // Try requested variant first, then fallbacks
  for (const url of candidateUrls) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const text = await res.text();
        if (text && text.includes('<svg')) {
          svgCache.set(key, text);
          return text;
        }
      }
    } catch (e) {}
  }

  console.warn(`No SVG found for ${iconId} (${variant})`);
  return null;
}

/**
 * Formats a valid React PascalCase component name
 */
export function toPascalCase(str) {
  return str
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
    .replace(/^[0-9]/, n => `Icon${n}`)
    .replace(/^([a-z])/, chr => chr.toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, '');
}

/**
 * Convert raw SVG XML to a clean React / JSX component string
 */
export function convertSvgToReact(svgString, iconName = 'Icon') {
  if (!svgString) return '';
  const componentName = toPascalCase(iconName) + 'Icon';

  // Replace SVG attributes with JSX camelCase equivalents
  let jsxSvg = svgString
    .replace(/class=/g, 'className=')
    .replace(/fill-rule=/g, 'fillRule=')
    .replace(/clip-rule=/g, 'clipRule=')
    .replace(/stroke-width=/g, 'strokeWidth=')
    .replace(/stroke-linecap=/g, 'strokeLinecap=')
    .replace(/stroke-linejoin=/g, 'strokeLinejoin=')
    .replace(/stroke-miterlimit=/g, 'strokeMiterlimit=')
    .replace(/stroke-dasharray=/g, 'strokeDasharray=')
    .replace(/stroke-dashoffset=/g, 'strokeDashoffset=')
    .replace(/stroke-opacity=/g, 'strokeOpacity=')
    .replace(/fill-opacity=/g, 'fillOpacity=')
    .replace(/stop-color=/g, 'stopColor=')
    .replace(/stop-opacity=/g, 'stopOpacity=')
    .replace(/xmlns:xlink=/g, 'xmlnsXlink=')
    .replace(/xlink:href=/g, 'xlinkHref=')
    .replace(/<!--[\s\S]*?-->/g, ''); // strip XML comments

  // Inject props spread into opening <svg> tag
  jsxSvg = jsxSvg.replace(
    /<svg\b([^>]*)>/i,
    `<svg\n  width={size}\n  height={size}\n  className={className}\n  $1\n  {...props}\n>`
  );

  return `import React from 'react';

export function ${componentName}({ size = 24, className = '', ...props }) {
  return (
${jsxSvg
  .split('\n')
  .map(line => '    ' + line)
  .join('\n')}
  );
}

export default ${componentName};`;
}

/**
 * Convert raw SVG XML to a Vue 3 Single File Component
 */
export function convertSvgToVue(svgString) {
  if (!svgString) return '';
  return `<template>
  ${svgString.trim()}
</template>

<script setup>
defineProps({
  size: {
    type: [Number, String],
    default: 24
  }
});
</script>`;
}

/**
 * Convert raw SVG XML to a Svelte Component
 */
export function convertSvgToSvelte(svgString) {
  if (!svgString) return '';
  const svelteSvg = svgString.replace(
    /<svg\b([^>]*)>/i,
    `<svg width={size} height={size} class={className} $1 {...$$restProps}>`
  );
  return `<script>
  export let size = 24;
  export let className = '';
</script>

${svelteSvg.trim()}`;
}

/**
 * Generate Base64 and Data URI
 */
export function convertSvgToDataUri(svgString) {
  if (!svgString) return { utf8: '', base64: '' };
  const cleanSvg = svgString.replace(/[\n\r\t]/g, ' ').replace(/\s{2,}/g, ' ');
  const base64 = btoa(unescape(encodeURIComponent(cleanSvg)));
  return {
    utf8: `data:image/svg+xml;utf8,${encodeURIComponent(cleanSvg)}`,
    base64: `data:image/svg+xml;base64,${base64}`
  };
}

/**
 * Helper: Render SVG to HTML5 Canvas
 */
export function renderSvgToCanvas(svgContent, size = 512, bgColor = 'transparent') {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const img = new Image();
    const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      if (bgColor && bgColor !== 'transparent') {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, size, size);
      }
      ctx.drawImage(img, 0, 0, size, size);
      URL.revokeObjectURL(url);
      resolve(canvas);
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };

    img.src = url;
  });
}

/**
 * 1. Direct file download for SVG (.svg)
 */
export function downloadSvgFile(svgContent, filename = 'icon.svg') {
  const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
  saveAs(blob, filename);
}

/**
 * 2. High-Resolution PNG download (.png)
 */
export async function downloadPngFile(svgContent, filename = 'icon.png', size = 512, bgColor = 'transparent') {
  try {
    const canvas = await renderSvgToCanvas(svgContent, size, bgColor);
    canvas.toBlob((blob) => {
      if (blob) saveAs(blob, filename);
    }, 'image/png');
  } catch (err) {
    console.error('downloadPngFile error:', err);
  }
}

/**
 * 3. High-Quality JPEG download (.jpg / .jpeg)
 */
export async function downloadJpgFile(svgContent, filename = 'icon.jpg', size = 512, bgColor = '#FFFFFF', quality = 0.95) {
  try {
    const bg = (!bgColor || bgColor === 'transparent') ? '#FFFFFF' : bgColor;
    const canvas = await renderSvgToCanvas(svgContent, size, bg);
    canvas.toBlob((blob) => {
      if (blob) saveAs(blob, filename);
    }, 'image/jpeg', quality);
  } catch (err) {
    console.error('downloadJpgFile error:', err);
  }
}

/**
 * 4. High-Efficiency WEBP download (.webp)
 */
export async function downloadWebpFile(svgContent, filename = 'icon.webp', size = 512, bgColor = 'transparent', quality = 0.95) {
  try {
    const canvas = await renderSvgToCanvas(svgContent, size, bgColor);
    canvas.toBlob((blob) => {
      if (blob) saveAs(blob, filename);
    }, 'image/webp', quality);
  } catch (err) {
    console.error('downloadWebpFile error:', err);
  }
}

/**
 * 4b. Next-Gen AVIF download (.avif)
 */
export async function downloadAvifFile(svgContent, filename = 'icon.avif', size = 512, bgColor = 'transparent', quality = 0.95) {
  try {
    const canvas = await renderSvgToCanvas(svgContent, size, bgColor);
    canvas.toBlob((blob) => {
      if (blob) {
        saveAs(blob, filename);
      } else {
        // Fallback to webp if browser does not support canvas to avif blob
        canvas.toBlob((webpBlob) => {
          if (webpBlob) saveAs(webpBlob, filename.replace(/\.avif$/, '.webp'));
        }, 'image/webp', quality);
      }
    }, 'image/avif', quality);
  } catch (err) {
    console.error('downloadAvifFile error:', err);
  }
}

/**
 * 5. Windows Favicon & App Icon (.ico - Multi-resolution binary container)
 */
export async function downloadIcoFile(svgContent, filename = 'icon.ico', sizes = [16, 32, 48, 64, 128, 256]) {
  try {
    const pngBuffers = [];

    for (const s of sizes) {
      const canvas = await renderSvgToCanvas(svgContent, s, 'transparent');
      await new Promise((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) {
            blob.arrayBuffer().then((buf) => {
              pngBuffers.push({ size: s, buffer: new Uint8Array(buf) });
              resolve();
            });
          } else {
            resolve();
          }
        }, 'image/png');
      });
    }

    if (pngBuffers.length === 0) return;

    const count = pngBuffers.length;
    const headerLength = 6 + count * 16;
    const totalLength = headerLength + pngBuffers.reduce((sum, item) => sum + item.buffer.byteLength, 0);

    const icoData = new Uint8Array(totalLength);
    const view = new DataView(icoData.buffer);

    // ICONHEADER (6 bytes)
    view.setUint16(0, 0, true); // Reserved
    view.setUint16(2, 1, true); // 1 = Icon (.ico)
    view.setUint16(4, count, true); // Number of images

    let offset = headerLength;
    pngBuffers.forEach((item, index) => {
      const entryOffset = 6 + index * 16;
      const dimensionByte = item.size >= 256 ? 0 : item.size;
      view.setUint8(entryOffset, dimensionByte); // Width
      view.setUint8(entryOffset + 1, dimensionByte); // Height
      view.setUint8(entryOffset + 2, 0); // Palette colors
      view.setUint8(entryOffset + 3, 0); // Reserved
      view.setUint16(entryOffset + 4, 1, true); // Color planes
      view.setUint16(entryOffset + 6, 32, true); // Bits per pixel (RGBA 32-bit)
      view.setUint32(entryOffset + 8, item.buffer.byteLength, true); // Size of image data
      view.setUint32(entryOffset + 12, offset, true); // Offset in file

      icoData.set(item.buffer, offset);
      offset += item.buffer.byteLength;
    });

    const icoBlob = new Blob([icoData], { type: 'image/x-icon' });
    saveAs(icoBlob, filename);
  } catch (err) {
    console.error('downloadIcoFile error:', err);
  }
}

/**
 * 6. Download All Formats Bundle (.ZIP package)
 */
export async function downloadAllFormatsZip(svgContent, iconId, variant = 'default', iconName = 'Icon', bgColor = 'transparent') {
  const zip = new JSZip();
  const folder = zip.folder(`${iconId}-bundle`);

  // 1. SVG
  folder.file(`${iconId}-${variant}.svg`, svgContent);

  // 2. Code Components
  folder.file(`${toPascalCase(iconName)}Icon.jsx`, convertSvgToReact(svgContent, iconName));
  folder.file(`${toPascalCase(iconName)}Icon.vue`, convertSvgToVue(svgContent));
  folder.file(`${toPascalCase(iconName)}Icon.svelte`, convertSvgToSvelte(svgContent));

  // 3. Data URI
  const dataUri = convertSvgToDataUri(svgContent);
  folder.file(`${iconId}-${variant}-data-uri.txt`, dataUri.utf8);

  // 4. PNGs (512px & 1024px)
  try {
    const pngCanvas512 = await renderSvgToCanvas(svgContent, 512, bgColor);
    const pngBlob512 = await new Promise(res => pngCanvas512.toBlob(res, 'image/png'));
    if (pngBlob512) folder.file(`${iconId}-${variant}-512px.png`, pngBlob512);

    const pngCanvas1024 = await renderSvgToCanvas(svgContent, 1024, bgColor);
    const pngBlob1024 = await new Promise(res => pngCanvas1024.toBlob(res, 'image/png'));
    if (pngBlob1024) folder.file(`${iconId}-${variant}-1024px.png`, pngBlob1024);
  } catch (e) {
    console.warn('PNG bundle error:', e);
  }

  // 5. JPG (1024px)
  try {
    const jpgCanvas = await renderSvgToCanvas(svgContent, 1024, '#FFFFFF');
    const jpgBlob = await new Promise(res => jpgCanvas.toBlob(res, 'image/jpeg', 0.95));
    if (jpgBlob) folder.file(`${iconId}-${variant}-1024px.jpg`, jpgBlob);
  } catch (e) {
    console.warn('JPG bundle error:', e);
  }

  // 6. WEBP (1024px)
  try {
    const webpCanvas = await renderSvgToCanvas(svgContent, 1024, bgColor);
    const webpBlob = await new Promise(res => webpCanvas.toBlob(res, 'image/webp', 0.95));
    if (webpBlob) folder.file(`${iconId}-${variant}-1024px.webp`, webpBlob);
  } catch (e) {
    console.warn('WEBP bundle error:', e);
  }

  // 7. Windows ICO
  try {
    const icoPngBuffers = [];
    for (const s of [16, 32, 48, 64, 128, 256]) {
      const canvas = await renderSvgToCanvas(svgContent, s, 'transparent');
      await new Promise((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) {
            blob.arrayBuffer().then((buf) => {
              icoPngBuffers.push({ size: s, buffer: new Uint8Array(buf) });
              resolve();
            });
          } else {
            resolve();
          }
        }, 'image/png');
      });
    }

    if (icoPngBuffers.length > 0) {
      const count = icoPngBuffers.length;
      const headerLength = 6 + count * 16;
      const totalLength = headerLength + icoPngBuffers.reduce((sum, item) => sum + item.buffer.byteLength, 0);
      const icoData = new Uint8Array(totalLength);
      const view = new DataView(icoData.buffer);

      view.setUint16(0, 0, true);
      view.setUint16(2, 1, true);
      view.setUint16(4, count, true);

      let offset = headerLength;
      icoPngBuffers.forEach((item, index) => {
        const entryOffset = 6 + index * 16;
        const dimensionByte = item.size >= 256 ? 0 : item.size;
        view.setUint8(entryOffset, dimensionByte);
        view.setUint8(entryOffset + 1, dimensionByte);
        view.setUint8(entryOffset + 2, 0);
        view.setUint8(entryOffset + 3, 0);
        view.setUint16(entryOffset + 4, 1, true);
        view.setUint16(entryOffset + 6, 32, true);
        view.setUint32(entryOffset + 8, item.buffer.byteLength, true);
        view.setUint32(entryOffset + 12, offset, true);

        icoData.set(item.buffer, offset);
        offset += item.buffer.byteLength;
      });

      folder.file(`${iconId}-${variant}.ico`, icoData);
    }
  } catch (e) {
    console.warn('ICO bundle error:', e);
  }

  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, `${iconId}-all-formats.zip`);
}

/**
 * Bulk download a zip bundle of multiple icons
 */
export async function downloadBulkZip(iconList, zipName = 'orildo-svg-bundle.zip') {
  const zip = new JSZip();
  const folder = zip.folder('icons');

  await Promise.all(
    iconList.map(async item => {
      const variant = item.variant || 'default';
      const content = await getSvgContent(item.id, variant);
      if (content) {
        folder.file(`${item.id}-${variant}.svg`, content);
      }
    })
  );

  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, zipName);
}
