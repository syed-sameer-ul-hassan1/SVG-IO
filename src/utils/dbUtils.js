

const DB_NAME = 'orildo_svg_catalog_db';
const DB_VERSION = 1;
const STORE_NAME = 'catalog_cache';
const CACHE_KEY = 'icons_metadata_v2';

let dbPromise = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        resolve(null);
        return;
      }
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    });
  }
  return dbPromise;
}

export async function getCachedCatalog() {
  try {
    const db = await getDB();
    if (!db) return null;
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(CACHE_KEY);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function setCachedCatalog(data) {
  try {
    const db = await getDB();
    if (!db) return;
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(data, CACHE_KEY);
  } catch {}
}

const preloadedUrls = new Set();

/**
 * Pre-warms SVG images in browser cache so they render instantly with 0ms delay.
 */
export function preloadIconBatch(icons = [], count = 36) {
  if (typeof window === 'undefined' || !Array.isArray(icons)) return;
  
  const batch = icons.slice(0, count);
  const schedulePreload = () => {
    batch.forEach((icon) => {
      const url = icon.path || `/icons/${icon.slug || icon.id}/default.svg`;
      if (!preloadedUrls.has(url)) {
        preloadedUrls.add(url);
        const img = new Image();
        img.decoding = 'async';
        img.src = url;
      }
    });
  };

  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(schedulePreload, { timeout: 1000 });
  } else {
    setTimeout(schedulePreload, 100);
  }
}
