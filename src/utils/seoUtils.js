/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║  SVG.IO — Enterprise SEO Engine (svg.io.orildo.tech)         ║
 * ║  Dynamically updates title, description, keywords,           ║
 * ║  OpenGraph, Twitter Card, canonical, hreflang,               ║
 * ║  and Schema.org JSON-LD rich results per page/view.          ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */

const BASE_URL = 'https://svg.io.orildo.tech';

const BRAND_KEYWORDS_BASE =
  'svg io, svg.io, svgio, svg.io.orildo.tech, free svg icons, free svg logos, brand icon download, svg icon library, open source icons, vector assets, download svg, tech logos, developer icons, icon finder alternative, flaticon alternative, iconscout alternative';

const TECH_ICON_KEYWORDS =
  'react svg, nextjs svg, vue svg, angular svg, svelte svg, nodejs svg, python svg, typescript svg, javascript svg, docker svg, kubernetes svg, aws svg, gcp svg, azure svg, github svg, gitlab svg, figma svg, vercel svg, netlify svg, cloudflare svg, tailwind svg, postgresql svg, mongodb svg, redis svg, stripe svg, supabase svg, openai svg, tensorflow svg, linux svg, ubuntu svg';

/**
 * Generates a rich, prioritized keyword string for a given icon.
 */
function buildIconKeywords(icon) {
  const name = icon.name || icon.title || icon.slug || '';
  const slug = icon.slug || icon.id || '';
  const cats = Array.isArray(icon.categories) && icon.categories.length > 0
    ? icon.categories : (icon.category ? [icon.category] : []);
  const catKeywords = cats.map(c => `${name} ${c} icon`).join(', ');

  return [
    `${name} svg`,
    `${name} svg icon`,
    `${name} logo svg`,
    `${name} logo download`,
    `${name} icon free`,
    `${name} vector`,
    `${name} vector icon`,
    `${name} brand logo`,
    `${name} transparent png`,
    `${name} svg xml`,
    `${name} react icon`,
    `${name} react jsx`,
    `${name} vue icon`,
    `${name} vue 3 component`,
    `${name} angular icon`,
    `${name} svelte icon`,
    `${name} html icon`,
    `${name} icon download free`,
    `download ${name} svg`,
    `${slug} icon`,
    `${slug} svg`,
    catKeywords,
    BRAND_KEYWORDS_BASE
  ].filter(Boolean).join(', ');
}

/**
 * Generates comprehensive Schema.org JSON-LD for an icon.
 */
function buildIconSchema(icon, iconUrl, finalDesc) {
  const name = icon.name || icon.title || icon.slug || '';
  const slug = icon.slug || icon.id;
  const cats = Array.isArray(icon.categories) && icon.categories.length > 0
    ? icon.categories : (icon.category ? [icon.category] : []);
  const today = new Date().toISOString().split('T')[0];

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['ImageObject', 'DigitalDocument'],
        '@id': `${BASE_URL}/?icon=${slug}#imageobject`,
        name: `${name} SVG Vector Icon & Logo`,
        alternateName: [
          `${name} icon`,
          `${name} logo`,
          `${name} svg`,
          `${name} vector`,
          `free ${name} svg`,
          `${name} brand icon`
        ],
        description: finalDesc,
        contentUrl: iconUrl,
        thumbnailUrl: iconUrl,
        url: `${BASE_URL}/?icon=${slug}`,
        encodingFormat: 'image/svg+xml',
        fileFormat: 'image/svg+xml',
        dateModified: icon.dateAdded || today,
        license: 'https://www.apache.org/licenses/LICENSE-2.0',
        acquireLicensePage: `${BASE_URL}/?view=terms`,
        creditText: 'SVG.IO via Orildo-Tech',
        copyrightNotice: 'Apache 2.0 — Free to use commercially',
        keywords: [...cats, name, 'svg', 'vector', 'icon'].join(', '),
        creator: {
          '@type': 'Organization',
          name: 'Orildo-Tech',
          url: BASE_URL
        }
      },
      {
        '@type': 'WebPage',
        '@id': `${BASE_URL}/?icon=${slug}#webpage`,
        url: `${BASE_URL}/?icon=${slug}`,
        name: `${name} SVG Icon & Logo Vector Free Download — SVG.IO`,
        description: finalDesc,
        inLanguage: 'en-US',
        dateModified: icon.dateAdded || today,
        isPartOf: { '@id': `${BASE_URL}/#website` },
        primaryImageOfPage: { '@id': `${BASE_URL}/?icon=${slug}#imageobject` },
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
            { '@type': 'ListItem', position: 2, name: 'Icons', item: `${BASE_URL}/` },
            ...cats.slice(0, 1).map((c, i) => ({
              '@type': 'ListItem',
              position: 3 + i,
              name: c,
              item: `${BASE_URL}/?category=${encodeURIComponent(c)}`
            })),
            { '@type': 'ListItem', position: cats.length > 0 ? 4 : 3, name: `${name} Icon`, item: `${BASE_URL}/?icon=${slug}` }
          ]
        }
      },
      {
        '@type': 'SoftwareSourceCode',
        '@id': `${BASE_URL}/?icon=${slug}#sourcecode`,
        name: `${name} React JSX Component`,
        description: `Ready-to-use React JSX, Vue 3, Svelte, and Angular component code for the ${name} SVG icon.`,
        programmingLanguage: ['React JSX', 'Vue 3', 'Svelte', 'Angular', 'HTML SVG'],
        codeRepository: 'https://github.com/Orildo-Tech/SVG-IO',
        license: 'https://www.apache.org/licenses/LICENSE-2.0'
      }
    ]
  };
}

/**
 * Generates comprehensive Schema.org JSON-LD for a category page.
 */
function buildCategorySchema(category, finalDesc) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${BASE_URL}/?category=${encodeURIComponent(category)}#collectionpage`,
        url: `${BASE_URL}/?category=${encodeURIComponent(category)}`,
        name: `${category} SVG Icons & Vector Logos — SVG.IO`,
        description: finalDesc,
        inLanguage: 'en-US',
        isPartOf: { '@id': `${BASE_URL}/#website` },
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
            { '@type': 'ListItem', position: 2, name: 'Categories', item: `${BASE_URL}/?view=categories` },
            { '@type': 'ListItem', position: 3, name: category, item: `${BASE_URL}/?category=${encodeURIComponent(category)}` }
          ]
        }
      }
    ]
  };
}

/**
 * Main SEO update function — call on every view or icon change.
 */
export function updatePageSeo({
  title,
  description,
  icon = null,
  category = null,
  view = 'icons'
}) {
  if (typeof document === 'undefined') return;

  // ── Default (Homepage) ─────────────────────────────────────────
  let finalTitle = 'SVG.IO — 6,517+ Free Brand Icons, SVG Logos & Developer Vector Assets | Download Free';
  let finalDesc =
    'SVG.IO is the world\'s best free SVG icon library with 6,517+ brand logos, developer tech icons, and Liquid Glass vectors. Search, preview, and instantly copy React JSX, Vue 3, Angular, Svelte, HTML, and raw SVG XML code — zero tracking, offline-ready, Apache 2.0 licensed.';
  let finalKeywords = `${BRAND_KEYWORDS_BASE}, ${TECH_ICON_KEYWORDS}, react jsx icons, vue component icons, svelte icons, angular icons, liquid glass icons, brand logos svg`;
  let canonicalUrl = BASE_URL + '/';
  let schema = null;

  // ── Icon Detail Page ───────────────────────────────────────────
  if (icon) {
    const iconName = icon.name || icon.title || icon.slug || 'Brand';
    const slug = icon.slug || icon.id;
    const cats = Array.isArray(icon.categories) && icon.categories.length > 0
      ? icon.categories : (icon.category ? [icon.category] : ['Developer Assets']);
    const catsStr = cats.join(', ');
    const iconUrl = `${BASE_URL}/icons/${slug}/${slug}.svg`;

    finalTitle = `${iconName} SVG Icon & Logo — Free Download React JSX, Vue 3, PNG | SVG.IO`;
    finalDesc = `Download the free ${iconName} SVG vector icon and brand logo on SVG.IO. Instantly copy ready-to-use React JSX, Vue 3, Angular, Svelte, or raw SVG XML code. Category: ${catsStr}. License: ${icon.license || 'Apache-2.0'}. No signup required.`;
    finalKeywords = buildIconKeywords(icon);
    canonicalUrl = `${BASE_URL}/?icon=${slug}`;
    schema = buildIconSchema(icon, iconUrl, finalDesc);
  }

  // ── Category Page ──────────────────────────────────────────────
  else if (category && category !== 'all') {
    finalTitle = `${category} SVG Icons & Logos — Free Download | SVG.IO`;
    finalDesc = `Browse and download free ${category} SVG icons and brand logos on SVG.IO. Instant React JSX, Vue 3, Angular, Svelte, and PNG high-res export. Apache 2.0 licensed.`;
    finalKeywords = [
      `${category} svg icons`,
      `${category} svg logo`,
      `${category} vector icons`,
      `${category} logos download`,
      `${category} icons free`,
      `${category} brand svg`,
      `${category} developer icons`,
      BRAND_KEYWORDS_BASE
    ].join(', ');
    canonicalUrl = `${BASE_URL}/?category=${encodeURIComponent(category)}`;
    schema = buildCategorySchema(category, finalDesc);
  }

  // ── About / Info Page ──────────────────────────────────────────
  else if (view === 'about' || view === 'info') {
    finalTitle = 'About SVG.IO — theSVG Foundation, Apache 2.0 & Platform Specifications';
    finalDesc = 'Learn about SVG.IO — powered by theSVG open-source foundation, hosting 6,517+ Apache 2.0 licensed vectors with Liquid Glass packs, sub-10ms IndexedDB caching, and zero telemetry.';
    finalKeywords = 'about svg.io, thesvg foundation, apache 2.0 svg, orildo tech, open source icon library, svg platform specs, vector library about, liquid glass icons info';
    canonicalUrl = `${BASE_URL}/?view=about`;
  }

  // ── Categories Page ────────────────────────────────────────────
  else if (view === 'categories') {
    finalTitle = 'All SVG Icon Categories & Collections — 6,517+ Vectors | SVG.IO';
    finalDesc = 'Browse all 6,517+ vector brand icons organized across Software, AI, Cloud, Frameworks, Liquid Glass, DevOps, and 50+ developer tool categories on SVG.IO.';
    finalKeywords = 'svg icon categories, brand logo categories, software icons, ai icons, cloud icons, framework icons, devops icons, liquid glass icons, developer tool icons, svg io categories, browse svg icons';
    canonicalUrl = `${BASE_URL}/?view=categories`;
  }

  // ── Submit / Contribute Page ───────────────────────────────────
  else if (view === 'submit') {
    finalTitle = 'Submit a Free SVG Icon — Contribute to the Open Vector Library | SVG.IO';
    finalDesc = 'Contribute your brand or tech SVG icon to SVG.IO\'s open-source vector library under the Apache 2.0 license. Help the developer community access more free, high-quality SVG assets.';
    finalKeywords = 'submit svg icon, contribute svg, upload brand logo, open source icon contribution, add icon to library, svg ingestion, svg io contribute, developer icon submission';
    canonicalUrl = `${BASE_URL}/?view=submit`;
  }

  // ── Blog Page ──────────────────────────────────────────────────
  else if (view === 'blog') {
    finalTitle = 'SVG Engineering Blog — Design Systems, Vector Optimization & Dev Guides | SVG.IO';
    finalDesc = 'Read in-depth engineering guides, SVG vector optimization best practices, React component tutorials, and design system articles from the SVG.IO team.';
    finalKeywords = 'svg blog, svg engineering, vector optimization, react svg tutorial, design systems guide, svg component, svg io blog, developer design guide, frontend engineering';
    canonicalUrl = `${BASE_URL}/?view=blog`;
  }

  // ── Favorites Page ─────────────────────────────────────────────
  else if (view === 'favorites') {
    finalTitle = 'Your Saved SVG Icons Collection — SVG.IO';
    finalDesc = 'View and manage your personal saved SVG icon collection on SVG.IO. Download favorites in React JSX, Vue, PNG, or SVG format anytime.';
    finalKeywords = 'saved svg icons, svg favorites, personal icon collection, svg io bookmarks';
    canonicalUrl = `${BASE_URL}/?view=favorites`;
  }

  // ── Privacy Page ───────────────────────────────────────────────
  else if (view === 'privacy') {
    finalTitle = 'Privacy Policy — Zero Tracking, Local-First Storage | SVG.IO';
    finalDesc = 'SVG.IO collects no user data, has zero telemetry, and stores all preferences locally in your browser. Read our full privacy policy.';
    finalKeywords = 'svg io privacy policy, zero tracking, local first, no telemetry, browser storage, svg.io privacy';
    canonicalUrl = `${BASE_URL}/?view=privacy`;
  }

  // ── Terms Page ─────────────────────────────────────────────────
  else if (view === 'terms') {
    finalTitle = 'Terms of Use & Apache 2.0 Vector Licensing — SVG.IO';
    finalDesc = 'All SVG.IO icons are published under the Apache 2.0 open-source license. Read our terms of use and vector licensing guidelines.';
    finalKeywords = 'svg io terms, apache 2.0 license, svg licensing, vector license, free to use svg, commercial use svg, svg io legal';
    canonicalUrl = `${BASE_URL}/?view=terms`;
  }

  // ── Override with manual props ─────────────────────────────────
  if (title) finalTitle = title;
  if (description) finalDesc = description;

  // ── Apply Title ────────────────────────────────────────────────
  document.title = finalTitle;

  // ── Meta tag helper ────────────────────────────────────────────
  const setMeta = (attr, key, content) => {
    if (!content) return;
    let el = document.querySelector(`meta[${attr}="${key}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, key);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  // ── Icon-specific image & article signals ──────────────────────
  const ogImage = icon
    ? `${BASE_URL}/icons/${icon.slug || icon.id}/${icon.slug || icon.id}.svg`
    : `${BASE_URL}/assets/og-image.png`;
  const todayISO = new Date().toISOString();

  // ── Standard Meta ──────────────────────────────────────────────
  setMeta('name', 'description', finalDesc);
  setMeta('name', 'keywords', finalKeywords);
  setMeta('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
  setMeta('name', 'googlebot', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');

  // ── Open Graph ─────────────────────────────────────────────────
  setMeta('property', 'og:title', finalTitle);
  setMeta('property', 'og:description', finalDesc);
  setMeta('property', 'og:url', canonicalUrl);
  setMeta('property', 'og:type', icon ? 'article' : 'website');
  setMeta('property', 'og:site_name', 'SVG.IO');
  setMeta('property', 'og:locale', 'en_US');
  setMeta('property', 'og:image', ogImage);
  setMeta('property', 'og:image:secure_url', ogImage);
  setMeta('property', 'og:image:alt', icon
    ? `${icon.name || icon.title} SVG icon and vector logo — free download on SVG.IO`
    : 'SVG.IO — Free SVG Icon & Brand Logo Library with 6,517+ vectors'
  );
  setMeta('property', 'og:image:width', icon ? '512' : '1200');
  setMeta('property', 'og:image:height', icon ? '512' : '630');
  setMeta('property', 'og:image:type', icon ? 'image/svg+xml' : 'image/png');

  // ── Article tags (for icon pages, helps Google News & Discover) ─
  if (icon) {
    setMeta('property', 'article:published_time', icon.dateAdded ? `${icon.dateAdded}T00:00:00Z` : todayISO);
    setMeta('property', 'article:modified_time', todayISO);
    setMeta('property', 'article:author', 'https://github.com/Orildo-Tech');
    setMeta('property', 'article:section', (Array.isArray(icon.categories) && icon.categories[0]) || icon.category || 'Developer Icons');
    setMeta('property', 'article:tag', icon.name || icon.title || '');
  }

  // ── Twitter / X Card ──────────────────────────────────────────
  setMeta('name', 'twitter:title', finalTitle);
  setMeta('name', 'twitter:description', finalDesc);
  setMeta('name', 'twitter:url', canonicalUrl);
  setMeta('name', 'twitter:card', 'summary_large_image');
  setMeta('name', 'twitter:image', ogImage);
  setMeta('name', 'twitter:image:alt', icon
    ? `${icon.name || icon.title} SVG Vector Icon — SVG.IO`
    : 'SVG.IO Free SVG Icon Library'
  );
  if (icon) {
    setMeta('name', 'twitter:label1', 'License');
    setMeta('name', 'twitter:data1', icon.license || 'Apache-2.0 — Free');
    setMeta('name', 'twitter:label2', 'Download');
    setMeta('name', 'twitter:data2', 'React JSX • Vue 3 • SVG • PNG');
  } else {
    setMeta('name', 'twitter:label1', 'Icons Available');
    setMeta('name', 'twitter:data1', '6,517+');
    setMeta('name', 'twitter:label2', 'License');
    setMeta('name', 'twitter:data2', 'Apache 2.0 — Free to Use');
  }

  // ── Canonical ─────────────────────────────────────────────────
  let canonicalEl = document.querySelector('link[rel="canonical"]');
  if (!canonicalEl) {
    canonicalEl = document.createElement('link');
    canonicalEl.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalEl);
  }
  canonicalEl.setAttribute('href', canonicalUrl);

  // ── Dynamic JSON-LD Structured Data ──────────────────────────
  let jsonLdEl = document.getElementById('sv-dynamic-jsonld');
  if (schema) {
    if (!jsonLdEl) {
      jsonLdEl = document.createElement('script');
      jsonLdEl.id = 'sv-dynamic-jsonld';
      jsonLdEl.type = 'application/ld+json';
      document.head.appendChild(jsonLdEl);
    }
    jsonLdEl.textContent = JSON.stringify(schema);
  } else if (jsonLdEl) {
    jsonLdEl.remove();
  }
}
