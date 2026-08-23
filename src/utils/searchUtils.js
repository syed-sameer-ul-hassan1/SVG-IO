/**
 * Fast, typo-tolerant, space-agnostic fuzzy search engine for SVG.IO
 */

// Common developer aliases dictionary
const EXTRA_ALIASES = {
  'fb': ['facebook', 'meta'],
  'ig': ['instagram'],
  'yt': ['youtube'],
  'gh': ['github'],
  'gl': ['gitlab'],
  'ms': ['microsoft'],
  'gcp': ['google cloud', 'google'],
  'aws': ['amazon web services', 'amazon'],
  'vsc': ['visual studio code', 'vscode'],
  'vscode': ['visual studio code'],
  'vs': ['visual studio', 'vscode'],
  'js': ['javascript'],
  'ts': ['typescript'],
  'py': ['python'],
  'rb': ['ruby'],
  'go': ['golang'],
  'cpp': ['c++', 'cplusplus'],
  'cs': ['c#', 'csharp'],
  'next': ['nextjs', 'next.js'],
  'vue': ['vuejs', 'vue.js'],
  'nuxt': ['nuxtjs', 'nuxt.js'],
  'react': ['reactjs', 'react native'],
  'tw': ['tailwind', 'tailwindcss', 'twitter', 'x'],
  'tailwind': ['tailwindcss'],
  'k8s': ['kubernetes'],
  'pg': ['postgres', 'postgresql'],
  'mongo': ['mongodb'],
  'gql': ['graphql'],
  'ai': ['openai', 'claude', 'chatgpt', 'gemini', 'anthropic', 'midjourney', 'deepmind'],
  'chatgpt': ['openai', 'gpt'],
  'ps': ['photoshop', 'adobe'],
  'ai-adobe': ['illustrator', 'adobe'],
  'pr': ['premiere', 'premiere pro', 'adobe'],
  'ae': ['after effects', 'adobe'],
  'xd': ['adobe xd', 'adobe'],
  'lr': ['lightroom', 'adobe']
};

/**
 * Clean and normalize a string (lower case, trim, remove non-alphanumerics)
 */
export function normalizeStr(str = '') {
  if (typeof str !== 'string') return '';
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Fast Levenshtein distance calculation for typo tolerance
 */
export function levenshteinDistance(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  // Swap to reduce space usage
  if (a.length > b.length) {
    const tmp = a;
    a = b;
    b = tmp;
  }

  const row = new Array(a.length + 1);
  for (let i = 0; i <= a.length; i++) {
    row[i] = i;
  }

  for (let i = 1; i <= b.length; i++) {
    let prev = i;
    for (let j = 1; j <= a.length; j++) {
      let val;
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        val = row[j - 1];
      } else {
        val = Math.min(row[j - 1] + 1, prev + 1, row[j] + 1);
      }
      row[j - 1] = prev;
      prev = val;
    }
    row[a.length] = prev;
  }

  return row[a.length];
}

/**
 * Check if word B is a fuzzy match of word A (allowing 1-2 typos based on length)
 */
export function isFuzzyWordMatch(queryWord, targetWord) {
  if (!queryWord || !targetWord) return false;
  if (targetWord.includes(queryWord)) return true;

  const len = queryWord.length;
  const maxDistance = len <= 3 ? 1 : len <= 6 ? 2 : 3;

  // Direct distance check
  const dist = levenshteinDistance(queryWord, targetWord);
  if (dist <= maxDistance) return true;

  // Prefix substring typo check (e.g. target="visualstudiocode", query="visul")
  if (targetWord.length >= queryWord.length) {
    const targetSub = targetWord.substring(0, queryWord.length);
    if (levenshteinDistance(queryWord, targetSub) <= 1) return true;
  }

  return false;
}

/**
 * Score an icon against a search query
 * Higher score = more relevant
 */
export function scoreIcon(icon, rawQuery) {
  if (!icon || !rawQuery) return 0;

  const query = rawQuery.toLowerCase().trim();
  if (!query) return 0;

  const cleanQuery = normalizeStr(query);
  const queryTokens = query.split(/[\s\-_,./+]+/).filter((t) => t.length > 0);

  const id = (icon.slug || icon.id || '').toLowerCase();
  const name = (icon.title || icon.name || '').toLowerCase();
  const category = (icon.category || (Array.isArray(icon.categories) && icon.categories[0]) || '').toLowerCase();
  const categoriesList = (Array.isArray(icon.categories) ? icon.categories : [category]).map((c) => c.toLowerCase());
  const aliases = (Array.isArray(icon.aliases) ? icon.aliases : []).map((a) => a.toLowerCase());

  const cleanId = normalizeStr(id);
  const cleanName = normalizeStr(name);
  const cleanAliases = aliases.map(normalizeStr);

  // 1. Exact Matches (Highest Priority)
  if (id === query || cleanId === cleanQuery) return 1000;
  if (name === query || cleanName === cleanQuery) return 950;

  // 2. Starts With Query
  if (id.startsWith(query) || cleanId.startsWith(cleanQuery)) return 850;
  if (name.startsWith(query) || cleanName.startsWith(cleanQuery)) return 800;

  // 3. Alias Exact or Start Match
  for (const alias of aliases) {
    if (alias === query || normalizeStr(alias) === cleanQuery) return 750;
    if (alias.startsWith(query)) return 700;
  }

  // 4. Extra Built-in Alias Dictionary Match
  const extraMatches = EXTRA_ALIASES[cleanQuery];
  if (extraMatches) {
    for (const em of extraMatches) {
      if (id.includes(em) || cleanId.includes(em) || name.includes(em)) {
        return 720;
      }
    }
  }

  // 5. Space & Punctuation Agnostic Match (e.g. "vs code" -> "vscode" or "c++" -> "cpp")
  if (cleanName.includes(cleanQuery) || cleanId.includes(cleanQuery)) {
    return 650;
  }
  for (const ca of cleanAliases) {
    if (ca.includes(cleanQuery)) return 600;
  }

  // 6. Substring Match in Name or ID
  if (name.includes(query)) return 550;
  if (id.includes(query)) return 500;

  // 7. Multi-word Token Matching (e.g. "google cloud platform" -> matches all tokens)
  if (queryTokens.length > 1) {
    const combinedTarget = `${id} ${name} ${aliases.join(' ')} ${categoriesList.join(' ')}`;
    const allTokensMatch = queryTokens.every((token) => combinedTarget.includes(token));
    if (allTokensMatch) return 480;

    const someTokensMatch = queryTokens.some((token) => name.includes(token) || id.includes(token));
    if (someTokensMatch) return 320;
  }

  // 8. Category Match
  for (const cat of categoriesList) {
    if (cat === query || normalizeStr(cat) === cleanQuery) return 350;
    if (cat.includes(query)) return 300;
  }

  // 9. Fuzzy / Typo Tolerance Match (Levenshtein Distance)
  // Check against name, id, and aliases
  let minDistance = 999;

  // Check ID
  const idDist = levenshteinDistance(cleanQuery, cleanId);
  if (idDist < minDistance) minDistance = idDist;

  // Check Name
  const nameDist = levenshteinDistance(cleanQuery, cleanName);
  if (nameDist < minDistance) minDistance = nameDist;

  // Check individual target words
  const targetWords = [...name.split(/[\s\-_,./+]+/), ...id.split(/[\s\-_,./+]+/)].filter((w) => w.length >= 2);
  for (const tw of targetWords) {
    const cleanTw = normalizeStr(tw);
    for (const qw of queryTokens) {
      if (isFuzzyWordMatch(qw, cleanTw)) {
        return 280;
      }
      const d = levenshteinDistance(qw, cleanTw);
      if (d < minDistance) minDistance = d;
    }
  }

  const queryLen = cleanQuery.length;
  const maxAllowedTypo = queryLen <= 4 ? 1 : queryLen <= 8 ? 2 : 3;

  if (minDistance <= maxAllowedTypo) {
    return Math.max(100, 260 - minDistance * 40);
  }

  return 0;
}

/**
 * Filter and sort an icons array using fuzzy scoring
 */
export function fuzzyFilterIcons(icons = [], searchQuery = '') {
  if (!Array.isArray(icons) || icons.length === 0) return [];
  if (!searchQuery || !searchQuery.trim()) return icons;

  const scored = [];

  for (let i = 0; i < icons.length; i++) {
    const icon = icons[i];
    const score = scoreIcon(icon, searchQuery);
    if (score > 0) {
      scored.push({ icon, score });
    }
  }

  // Sort by highest relevance score descending
  scored.sort((a, b) => b.score - a.score);

  return scored.map((item) => item.icon);
}
