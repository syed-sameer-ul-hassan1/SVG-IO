/**
 * Cloudflare Pages Function: /api/submit-icon
 *
 * Flow:
 * 1. Validate the POST payload
 * 2. Upload each SVG variant to Supabase Storage bucket `svg-icons`
 * 3. Insert a row into `icon_submissions` table (status: pending)
 * 4. Trigger GitHub Actions `repository_dispatch` → workflow processes & commits to repo
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const {
    slug,
    title,
    aliases = [],
    hex = 'FF5F02',
    hexes = [],
    categories = ['Software'],
    variants = {},
    license = 'Apache-2.0',
    url = `https://${slug}.com`,
  } = payload;

  if (!slug || !title) {
    return json({ error: 'slug and title are required' }, 400);
  }

  const variantKeys = Object.keys(variants);
  if (variantKeys.length === 0) {
    return json({ error: 'At least one SVG variant is required' }, 400);
  }

  const SUPABASE_URL = env.SUPABASE_URL || env.VITE_DATABASE_URL;
  const SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY || env.VITE_DATABASE_KEY;
  const GH_PAT = env.GH_PAT;
  const GH_OWNER = env.GH_OWNER || 'syed-sameer-ul-hassan1';
  const GH_REPO = env.GH_REPO || 'SVG-IO';

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return json({ error: 'Supabase env vars not configured' }, 500);
  }

  if (!GH_PAT) {
    return json({ error: 'GH_PAT not configured in Cloudflare env vars' }, 500);
  }

  // 1. Upload SVG variants to Supabase Storage
  const storagePaths = {};
  const storagePublicUrls = {};

  for (const [variantKey, svgContent] of Object.entries(variants)) {
    const filePath = `${slug}/${variantKey}.svg`;
    const svgBytes = new TextEncoder().encode(svgContent);

    const uploadRes = await fetch(
      `${SUPABASE_URL}/storage/v1/object/svg-icons/${filePath}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'image/svg+xml',
          'x-upsert': 'true',
        },
        body: svgBytes,
      }
    );

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      return json({ error: `Storage upload failed for variant "${variantKey}": ${errText}` }, 500);
    }

    storagePaths[variantKey] = filePath;
    storagePublicUrls[variantKey] = `${SUPABASE_URL}/storage/v1/object/public/svg-icons/${filePath}`;
  }

  // 2. Insert row into icon_submissions table
  const dbRes = await fetch(`${SUPABASE_URL}/rest/v1/icon_submissions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'apikey': SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
    body: JSON.stringify({
      slug,
      title,
      hex: hex.replace(/^#/, ''),
      hexes: Array.isArray(hexes) && hexes.length > 0 ? hexes.map((h) => h.replace(/^#/, '')) : [hex.replace(/^#/, '')],
      categories: Array.isArray(categories) ? categories : [categories],
      license,
      url,
      variants: variantKeys.reduce((acc, k) => {
        acc[k] = `/icons/${slug}/${k}.svg`;
        return acc;
      }, {}),
      status: 'pending',
      storage_paths: storagePaths,
    }),
  });

  let submission = null;
  if (dbRes.ok) {
    const rows = await dbRes.json();
    submission = Array.isArray(rows) ? rows[0] : rows;
  } else {
    console.error('DB insert failed:', await dbRes.text());
  }

  // 3. Trigger GitHub Actions workflow via repository_dispatch
  const dispatchPayload = {
    event_type: 'process-icon-submission',
    client_payload: {
      submission_id: submission?.id || null,
      slug,
      title,
      hex: hex.replace(/^#/, ''),
      hexes: Array.isArray(hexes) && hexes.length > 0 ? hexes.map((h) => h.replace(/^#/, '')) : [hex.replace(/^#/, '')],
      categories: Array.isArray(categories) ? categories : [categories],
      license,
      url,
      aliases,
      variants: variantKeys.reduce((acc, k) => {
        acc[k] = storagePublicUrls[k];
        return acc;
      }, {}),
    },
  };

  const ghRes = await fetch(
    `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/dispatches`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GH_PAT}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'SVG-IO/1.0',
      },
      body: JSON.stringify(dispatchPayload),
    }
  );

  if (!ghRes.ok) {
    const errText = await ghRes.text();
    console.error('GitHub dispatch failed:', errText);
    return json({
      success: true,
      warning: 'SVGs uploaded but GitHub Action trigger failed. Check GH_PAT secret.',
      storage_urls: storagePublicUrls,
      submission_id: submission?.id,
    }, 207);
  }

  return json({
    success: true,
    message: `Icon "${title}" submitted! It will appear in the library after processing (usually 1-2 minutes).`,
    submission_id: submission?.id,
    storage_urls: storagePublicUrls,
    slug,
    variants: variantKeys,
  });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}
