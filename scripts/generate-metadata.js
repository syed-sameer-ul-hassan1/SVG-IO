import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');

const iconsJsonPath = path.join(publicDir, 'icons.json');
const metadataPath = path.join(publicDir, 'icons-metadata.json');
const pathsJsonPath = path.join(publicDir, 'icons-paths.json');

let rawIcons = [];

if (fs.existsSync(iconsJsonPath)) {
  try {
    rawIcons = JSON.parse(fs.readFileSync(iconsJsonPath, 'utf8'));
    console.log(`Loaded ${rawIcons.length} icons from public/icons.json`);
  } catch (e) {
    console.error('Error reading public/icons.json:', e);
  }
}

// Update all icons in icons.json to Apache-2.0 license
const updatedIconsJson = rawIcons.map((icon) => ({
  ...icon,
  license: 'Apache-2.0'
}));

fs.writeFileSync(iconsJsonPath, JSON.stringify(updatedIconsJson, null, 2));

// Normalize icons from icons.json
const normalizedIcons = updatedIconsJson.map((icon) => {
  const id = icon.slug || icon.id;
  const name = icon.title || icon.name || id;
  const category = (Array.isArray(icon.categories) && icon.categories[0]) || icon.category || 'Brands & Ecosystem';
  const hex = icon.hex ? (icon.hex.startsWith('#') ? icon.hex : `#${icon.hex}`) : '#FF5F02';
  const url = icon.url || `https://${id}.dev`;
  const license = 'Apache-2.0';

  let variants = [];
  let variantPaths = {};

  if (icon.variants && typeof icon.variants === 'object' && !Array.isArray(icon.variants)) {
    variants = Object.keys(icon.variants);
    variantPaths = icon.variants;
  } else if (Array.isArray(icon.variants)) {
    variants = icon.variants;
    variants.forEach((v) => {
      variantPaths[v] = `/icons/${id}/${v}.svg`;
    });
  } else {
    variants = ['default'];
    variantPaths = { default: `/icons/${id}/default.svg` };
  }

  const defaultPath = variantPaths.default || variantPaths[variants[0]] || `/icons/${id}/default.svg`;

  return {
    id,
    slug: id,
    name,
    title: name,
    category,
    categories: Array.isArray(icon.categories) ? icon.categories : [category],
    hex,
    url,
    license,
    path: defaultPath,
    variants,
    variantPaths,
    variantCount: variants.length,
    availableVariants: variants,
    dateAdded: icon.dateAdded || '2026-03-07',
    collection: icon.collection || 'brands'
  };
});

// Pin 'orildo' at index 0
normalizedIcons.sort((a, b) => {
  if (a.id === 'orildo') return -1;
  if (b.id === 'orildo') return 1;
  return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
});

// Calculate categories
const categoryCounts = {};
normalizedIcons.forEach((icon) => {
  if (Array.isArray(icon.categories)) {
    icon.categories.forEach((cat) => {
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
  } else if (icon.category) {
    categoryCounts[icon.category] = (categoryCounts[icon.category] || 0) + 1;
  }
});

const categories = Object.keys(categoryCounts)
  .map((name) => ({
    name,
    count: categoryCounts[name]
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

const newMetadata = {
  generatedAt: new Date().toISOString(),
  totalIcons: normalizedIcons.length,
  categoryCount: categories.length,
  categories,
  icons: normalizedIcons
};

// Generate icons-paths.json
const iconPaths = {};
normalizedIcons.forEach((icon) => {
  iconPaths[icon.id] = icon.path;
});

fs.writeFileSync(metadataPath, JSON.stringify(newMetadata, null, 2));
fs.writeFileSync(pathsJsonPath, JSON.stringify(iconPaths, null, 2));

console.log(`✓ Synchronized all ${normalizedIcons.length} assets with Apache-2.0 license across ${categories.length} categories.`);
