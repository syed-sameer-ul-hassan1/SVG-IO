/**
 * Safely recolors an SVG without destroying gradients, clip paths, masks, or multi-tone structures.
 *
 * @param {string} svgText - Raw SVG XML string
 * @param {string} targetColor - Hex / CSS color string (e.g. '#FF5F02')
 * @returns {string} - Clean, recolored SVG XML string
 */
export function recolorSvg(svgText, targetColor) {
  if (!svgText || !targetColor) return svgText;

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgText, 'image/svg+xml');

    // Check for parse error
    const parserError = doc.querySelector('parsererror');
    if (parserError) {
      console.warn('SVG parse error during recolor, returning original');
      return svgText;
    }

    const svgEl = doc.querySelector('svg');
    if (!svgEl) return svgText;

    // Set root color attribute and style for currentColor inheritance
    svgEl.setAttribute('color', targetColor);
    svgEl.style.color = targetColor;

    // Build a Set of all elements inside defs, clipPath, mask, filter, and gradients to protect them
    const protectedElements = new Set();
    const containers = doc.querySelectorAll('defs, clipPath, mask, filter, linearGradient, radialGradient, pattern');
    containers.forEach((container) => {
      protectedElements.add(container);
      container.querySelectorAll('*').forEach((child) => protectedElements.add(child));
    });

    // Check if SVG utilizes gradients
    const hasGradients = doc.querySelectorAll('linearGradient, radialGradient').length > 0;

    // Find all renderable visual elements
    const renderable = svgEl.querySelectorAll('path, rect, circle, ellipse, line, polyline, polygon, text');

    renderable.forEach((el) => {
      // Skip anything inside clipPath, mask, filter, or defs
      if (protectedElements.has(el)) return;

      const fill = el.getAttribute('fill');
      const stroke = el.getAttribute('stroke');
      const style = el.getAttribute('style');

      // 1. Fill handling
      if (fill) {
        const cleanFill = fill.trim().toLowerCase();
        // NEVER overwrite gradient URLs, none, or transparent
        if (!cleanFill.startsWith('url(') && cleanFill !== 'none' && cleanFill !== 'transparent') {
          el.setAttribute('fill', targetColor);
        }
      } else if (!hasGradients && !stroke && (!style || !style.includes('fill:none'))) {
        // Default SVG behavior: if no fill or stroke is specified, SVG defaults to solid black
        // Only set fill if it's not part of a stroked-only element
        if (!el.getAttribute('stroke-width') || stroke) {
          el.setAttribute('fill', targetColor);
        }
      }

      // 2. Stroke handling
      if (stroke) {
        const cleanStroke = stroke.trim().toLowerCase();
        if (!cleanStroke.startsWith('url(') && cleanStroke !== 'none' && cleanStroke !== 'transparent') {
          el.setAttribute('stroke', targetColor);
        }
      }

      // 3. Inline style handling
      if (style) {
        let newStyle = style;
        // Replace solid fill in style
        newStyle = newStyle.replace(/fill:\s*(?!none|transparent|url\()[^;]+/gi, `fill: ${targetColor}`);
        // Replace solid stroke in style
        newStyle = newStyle.replace(/stroke:\s*(?!none|transparent|url\()[^;]+/gi, `stroke: ${targetColor}`);
        el.setAttribute('style', newStyle);
      }
    });

    const serializer = new XMLSerializer();
    return serializer.serializeToString(doc);
  } catch (err) {
    console.warn('recolorSvg error:', err);
    return svgText;
  }
}

export default recolorSvg;
