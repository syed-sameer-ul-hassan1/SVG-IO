/**
 * Dynamic SEO & Structured Data Manager for SVG.IO (https://svg.io.orildo.tech)
 */

const BASE_URL = 'https://svg.io.orildo.tech';

export function updatePageSeo({
  title,
  description,
  path = '',
  icon = null,
  category = null,
  view = 'icons'
}) {
  if (typeof document === 'undefined') return;

  // 1. Dynamic Title
  let finalTitle = 'SVG.IO — 6,500+ Free Vector Brand Icons, Logos & Developer Assets';
  let finalDesc =
    'Explore, search, customize, and copy 6,517+ open-source brand logos, developer icons, and Liquid Glass vector assets on SVG.IO. Instant React JSX, Vue, Svelte, PNG, and SVG XML code export.';
  let finalKeywords =
    'svg io, svg.io, svg.io.orildo.tech, svg icons, free svg logos, brand icons, developer icons, react svg icons, vue svg icons, svelte svg icons, liquid glass icons, vector assets, tech logos, open source icons, download svg';
  let canonicalUrl = `${BASE_URL}/${path}`;

  if (icon) {
    const iconName = icon.name || icon.title || icon.slug || 'Brand';
    const categoriesStr = Array.isArray(icon.categories) && icon.categories.length > 0
      ? icon.categories.join(', ')
      : icon.category || 'Developer Assets';

    finalTitle = `${iconName} SVG Icon & Logo Vector Free Download — SVG.IO`;
    finalDesc = `Download free ${iconName} SVG vector icon and brand logo on SVG.IO. Copy React JSX, Vue 3, Svelte, and SVG XML code. Categories: ${categoriesStr}. License: ${icon.license || 'Apache-2.0'}.`;
    finalKeywords = `${iconName} svg, ${iconName} logo, ${iconName} icon download, ${iconName} vector, ${iconName} react icon, ${iconName} vue icon, ${iconName} transparent png, ${iconName} svg xml, ${icon.slug} icon, brand svg, svg io, svg.io, svg.io.orildo.tech, free vector icons`;
    canonicalUrl = `${BASE_URL}/?icon=${icon.slug || icon.id}`;
  } else if (category && category !== 'all') {
    finalTitle = `${category} SVG Icons & Vector Logos — SVG.IO`;
    finalDesc = `Explore and download free vector icons and brand logos in the ${category} category on SVG.IO. Instant React JSX, Vue, and high-res export.`;
    finalKeywords = `${category} svg icons, ${category} vectors, ${category} logos, ${category} icons download, svg io, svg.io, svg.io.orildo.tech, developer assets`;
    canonicalUrl = `${BASE_URL}/?category=${encodeURIComponent(category)}`;
  } else if (view === 'about' || view === 'info') {
    finalTitle = 'About Platform, theSVG Foundation & Specifications — SVG.IO';
    finalDesc = 'Learn about SVG.IO platform architecture, theSVG core vector foundation, Apache 2.0 licensing, and zero-tracking privacy engineering.';
    finalKeywords = 'about svg.io, thesvg core, apache 2.0 svg icons, vector library specs, orildo tech, open source icons';
    canonicalUrl = `${BASE_URL}/?view=about`;
  } else if (view === 'categories') {
    finalTitle = 'All Icon Categories & Collections — SVG.IO';
    finalDesc = 'Browse 6,517+ vector brand icons organized across Software, AI, Cloud, Frameworks, Liquid Glass, and Developer Tools.';
    finalKeywords = 'svg categories, brand logos collections, software icons, ai vectors, cloud logos, liquid glass icons, svg io';
    canonicalUrl = `${BASE_URL}/?view=categories`;
  } else if (view === 'submit') {
    finalTitle = 'Submit an SVG Icon — Community Ingestion Pipeline — SVG.IO';
    finalDesc = 'Submit your brand or developer vector SVG icon to the SVG.IO global directory under the Apache 2.0 open-source license.';
    finalKeywords = 'submit svg icon, upload brand vector, open source icon contribution, svg ingestion pipeline, svg io';
    canonicalUrl = `${BASE_URL}/?view=submit`;
  } else if (view === 'blog') {
    finalTitle = 'SVG Guides, Design Systems & Developer Engineering — SVG.IO';
    finalDesc = 'Read engineering guides, vector optimization best practices, and frontend component tutorials on SVG.IO.';
    finalKeywords = 'svg engineering blog, vector optimization tutorials, react svg components, design systems guides, svg io';
    canonicalUrl = `${BASE_URL}/?view=blog`;
  }

  if (title) finalTitle = title;
  if (description) finalDesc = description;

  // Apply Document Title
  document.title = finalTitle;

  // Helper to set or update meta tag
  const setMeta = (attr, key, content) => {
    let el = document.querySelector(`meta[${attr}="${key}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, key);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  // 2. Standard Meta Tags
  setMeta('name', 'description', finalDesc);
  setMeta('name', 'keywords', finalKeywords);
  setMeta('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');

  // 3. OpenGraph Tags
  setMeta('property', 'og:title', finalTitle);
  setMeta('property', 'og:description', finalDesc);
  setMeta('property', 'og:url', canonicalUrl);
  setMeta('property', 'og:type', icon ? 'article' : 'website');
  setMeta('property', 'og:site_name', 'SVG.IO');

  // 4. Twitter Tags
  setMeta('name', 'twitter:title', finalTitle);
  setMeta('name', 'twitter:description', finalDesc);
  setMeta('name', 'twitter:url', canonicalUrl);

  // 5. Canonical Link
  let canonicalEl = document.querySelector('link[rel="canonical"]');
  if (!canonicalEl) {
    canonicalEl = document.createElement('link');
    canonicalEl.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalEl);
  }
  canonicalEl.setAttribute('href', canonicalUrl);

  // 6. Structured Data (JSON-LD) for Icon
  let jsonLdEl = document.getElementById('sv-dynamic-jsonld');
  if (icon) {
    const iconSlug = icon.slug || icon.id;
    const iconUrl = `${BASE_URL}/icons/${iconSlug}/${iconSlug}.svg`;
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'ImageObject',
      name: `${icon.name || icon.title} SVG Vector Icon`,
      description: finalDesc,
      contentUrl: iconUrl,
      thumbnailUrl: iconUrl,
      encodingFormat: 'image/svg+xml',
      license: 'https://www.apache.org/licenses/LICENSE-2.0',
      acquireLicensePage: `${BASE_URL}/?view=terms`,
      creator: {
        '@type': 'Organization',
        name: 'Orildo-Tech',
        url: BASE_URL
      }
    };

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
