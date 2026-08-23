/**
 * GitHub Actions Script: process-submission.js
 *
 * Reads the icon payload from environment variables (set by the workflow),
 * downloads SVG files from Supabase Storage, saves them to public/icons/{slug}/,
 * and updates public/icons.json.
 *
 * Run by: node scripts/process-submission.js
 */

import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import https from 'node:https';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// ── Read env vars set by GitHub Actions ──────────────────────────────────────
const slug        = process.env.ICON_SLUG;
const title       = process.env.ICON_TITLE;
const hex         = (process.env.ICON_HEX || 'FF5F02').replace(/^#/, '');
const hexes       = JSON.parse(process.env.ICON_HEXES || '[]');
const license     = process.env.ICON_LICENSE || 'Apache-2.0';
const url         = process.env.ICON_URL || `https://${slug}.com`;
const categories  = JSON.parse(process.env.ICON_CATEGORIES || '["Software"]');
const aliases     = JSON.parse(process.env.ICON_ALIASES    || '[]');
const supabaseUrl = (process.env.SUPABASE_URL || 'https://wexavetbwvlazhusuouu.supabase.co').replace(/\/+$/, '');
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndleGF2ZXRid3ZsYXpodXN1b3V1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1MDA2NzgsImV4cCI6MjEwMzA3NjY3OH0.dWhB2MYM-yNdmvGIkHRf53tTSsgVD6sFcfY_xIAnEms';

// variants: { variantKey: "https://supabase.../svg-icons/slug/variant.svg" }
const variantsUrls = JSON.parse(process.env.ICON_VARIANTS || '{}');

if (!slug || !title) {
  console.error('[ERROR] ICON_SLUG and ICON_TITLE are required');
  process.exit(1);
}

if (Object.keys(variantsUrls).length === 0) {
  console.error('[ERROR] ICON_VARIANTS is empty — nothing to download');
  process.exit(1);
}

console.log(`\n[INFO] Processing icon: ${title} (${slug})`);
console.log(`   Variants: ${Object.keys(variantsUrls).join(', ')}`);

// ── Helper: download a URL to a file ─────────────────────────────────────────
function downloadFile(urlStr, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    let parsedUrl;
    try {
      parsedUrl = new URL(urlStr);
    } catch (e) {
      file.close();
      if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
      return reject(new Error(`Invalid URL: ${urlStr}`));
    }

    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Node/SVG-IO)',
        ...(process.env.SUPABASE_ANON_KEY ? {
          'apikey': process.env.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`
        } : {})
      }
    };

    const req = (parsedUrl.protocol === 'http:' ? http : https).get(options, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close();
        if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
        downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        file.close();
        if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
        reject(new Error(`HTTP ${res.statusCode} for ${urlStr}`));
        return;
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
      file.on('error', (err) => {
        if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
        reject(err);
      });
    });

    req.on('error', (err) => {
      if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
      reject(err);
    });
  });
}

// ── 1. Create icon directory ──────────────────────────────────────────────────
const iconDir = path.join(rootDir, 'public', 'icons', slug);
fs.mkdirSync(iconDir, { recursive: true });
console.log(`[DIR] Created directory: public/icons/${slug}/`);

// ── 2. Download each SVG variant ──────────────────────────────────────────────
const savedVariantPaths = {};

for (const [variantKey, variantUrl] of Object.entries(variantsUrls)) {
  const destFile = path.join(iconDir, `${variantKey}.svg`);
  console.log(`[DOWNLOAD] Fetching ${variantKey}.svg from Supabase...`);
  try {
    await downloadFile(variantUrl, destFile);
    savedVariantPaths[variantKey] = `/icons/${slug}/${variantKey}.svg`;
    console.log(`   [SUCCESS] Saved: public/icons/${slug}/${variantKey}.svg`);
  } catch (err) {
    console.error(`   [ERROR] Failed to download ${variantKey}: ${err.message}`);
    process.exit(1);
  }
}

// ── 3. Update public/icons.json ───────────────────────────────────────────────
const iconsJsonPath = path.join(rootDir, 'public', 'icons.json');
let iconsList = [];

if (fs.existsSync(iconsJsonPath)) {
  try {
    iconsList = JSON.parse(fs.readFileSync(iconsJsonPath, 'utf8'));
    console.log(`[INFO] Loaded existing icons.json (${iconsList.length} icons)`);
  } catch (e) {
    console.warn('[WARN] Could not parse icons.json, starting fresh:', e.message);
    iconsList = [];
  }
}

const primaryHex = Array.isArray(hexes) && hexes.length > 0 ? hexes[0].replace(/^#/, '') : hex;
const cleanHexes = Array.isArray(hexes) && hexes.length > 0 ? hexes.map((h) => h.replace(/^#/, '')) : (primaryHex ? [primaryHex] : ['FF5F02']);

const newEntry = {
  slug,
  title,
  aliases: Array.isArray(aliases) ? aliases : [],
  hex: primaryHex,
  hexes: cleanHexes,
  categories: Array.isArray(categories) && categories.length > 0 ? categories : ['Software'],
  variants: savedVariantPaths,
  license,
  url,
  dateAdded: new Date().toISOString().split('T')[0],
  collection: 'community',
};

// Replace existing entry or prepend new one
const existingIdx = iconsList.findIndex(
  (i) => (i.slug || i.id) === slug
);

if (existingIdx >= 0) {
  iconsList[existingIdx] = newEntry;
  console.log(`[UPDATE] Updated existing entry for: ${slug}`);
} else {
  iconsList.unshift(newEntry);
  console.log(`[ADD] Added new entry for: ${slug}`);
}

fs.writeFileSync(iconsJsonPath, JSON.stringify(iconsList, null, 2), 'utf8');
console.log(`\n[SUCCESS] icons.json updated (${iconsList.length} total icons)`);
console.log(`[SUCCESS] Icon "${title}" (${slug}) processed successfully in public/icons.json!`);

// ── 4. Delete uploaded temporary SVGs from Supabase Storage ───────────────────
if (supabaseUrl && supabaseKey) {
  console.log(`\n[CLEANUP] Deleting temporary SVG files for "${slug}" from Supabase Storage...`);
  try {
    const filePathsToDelete = Object.keys(variantsUrls).map((variantKey) => `${slug}/${variantKey}.svg`);
    const deleteRes = await fetch(`${supabaseUrl}/storage/v1/object/svg-icons`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prefixes: filePathsToDelete })
    });
    if (deleteRes.ok) {
      console.log(`[SUCCESS] Deleted temporary files from Supabase: ${filePathsToDelete.join(', ')}\n`);
    } else {
      const errText = await deleteRes.text();
      console.warn(`[WARN] Supabase storage deletion response (${deleteRes.status}): ${errText}\n`);
    }
  } catch (err) {
    console.warn(`[WARN] Could not clean up Supabase storage: ${err.message}\n`);
  }
}
