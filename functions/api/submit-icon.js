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

  const SUPABASE_URL = env?.SUPABASE_URL || env?.VITE_DATABASE_URL || 'https://wexavetbwvlazhusuouu.supabase.co';
  const SUPABASE_ANON_KEY = env?.SUPABASE_ANON_KEY || env?.VITE_DATABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndleGF2ZXRid3ZsYXpodXN1b3V1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1MDA2NzgsImV4cCI6MjEwMzA3NjY3OH0.dWhB2MYM-yNdmvGIkHRf53tTSsgVD6sFcfY_xIAnEms';
  const GH_PAT = env?.GH_PAT || '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';
  const GH_OWNER = env?.GH_OWNER || 'syed-sameer-ul-hassan1';
  const GH_REPO = env?.GH_REPO || 'SVG-IO';

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
      return json({ error: `Upload validation failed for variant "${variantKey}". Please check your SVG file.` }, 500);
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
  }

  // 3. Trigger processing pipeline
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
    return json({
      success: true,
      message: 'Vector package queued for processing.',
      submission_id: submission?.id,
    }, 200);
  }

  return json({
    success: true,
    message: `Icon "${title}" submitted! It will appear in the library after processing (usually within 7 minutes).`,
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
