




const EXTRA_ALIASES = {
  fb: ['facebook', 'meta'],
  facebook: ['facebook', 'meta'],
  ig: ['instagram'],
  instagram: ['instagram'],
  yt: ['youtube'],
  youtube: ['youtube'],
  gh: ['github'],
  github: ['github'],
  gl: ['gitlab'],
  gitlab: ['gitlab'],
  ms: ['microsoft'],
  microsoft: ['microsoft'],
  gcp: ['google-cloud', 'google', 'googlecloud'],
  google: ['google', 'google-chrome'],
  chrom: ['google-chrome', 'chrome', 'chromium'],
  chrome: ['google-chrome', 'chrome', 'chromium'],
  aws: ['amazon-web-services', 'amazon', 'aws'],
  vsc: ['visual-studio-code', 'visualstudiocode', 'vscode'],
  vscode: ['visual-studio-code', 'visualstudiocode', 'vscode'],
  vs: ['visual-studio-code', 'visualstudiocode', 'vscode'],
  visualstudio: ['visual-studio-code', 'visualstudiocode', 'vscode'],
  visualstudiocode: ['visual-studio-code', 'visualstudiocode', 'vscode'],
  js: ['javascript'],
  ts: ['typescript'],
  py: ['python'],
  python: ['python'],
  pytn: ['python'],
  pythn: ['python'],
  rb: ['ruby'],
  go: ['golang'],
  golang: ['golang', 'go'],
  cpp: ['c++', 'cplusplus'],
  cs: ['c#', 'csharp'],
  next: ['nextjs', 'next.js', 'nextdotjs'],
  nextjs: ['next.js', 'nextdotjs', 'nextjs'],
  vue: ['vuejs', 'vue.js', 'vuedotjs'],
  nuxt: ['nuxtjs', 'nuxt.js', 'nuxtdotjs'],
  react: ['reactjs', 'react native', 'react'],
  tw: ['tailwind', 'tailwindcss', 'twitter', 'x'],
  tailwind: ['tailwindcss', 'tailwind'],
  tailwindcss: ['tailwindcss', 'tailwind'],
  k8s: ['kubernetes'],
  kubernetes: ['kubernetes'],
  pg: ['postgres', 'postgresql'],
  postgres: ['postgresql', 'postgres'],
  postgresql: ['postgresql', 'postgres'],
  mongo: ['mongodb'],
  mongodb: ['mongodb'],
  gql: ['graphql'],
  graphql: ['graphql'],
  ai: ['openai', 'claude', 'chatgpt', 'gemini', 'anthropic', 'midjourney', 'deepmind'],
  chatgpt: ['openai', 'gpt', 'chatgpt'],
  gpt: ['openai', 'chatgpt'],
  ps: ['photoshop', 'adobe-photoshop', 'adobe'],
  photoshop: ['photoshop', 'adobe-photoshop'],
  illustrator: ['illustrator', 'adobe-illustrator'],
  pr: ['premiere', 'premiere pro', 'adobe'],
  ae: ['after effects', 'adobe'],
  xd: ['adobe xd', 'adobe'],
  lr: ['lightroom', 'adobe'],
  dc: ['docker'],
  docker: ['docker'],
  slk: ['slack'],
  slack: ['slack'],
  dsc: ['discord'],
  discord: ['discord'],
  notion: ['notion'],
  figma: ['figma'],
  fig: ['figma'],
  vercel: ['vercel'],
  vcl: ['vercel'],
  sb: ['supabase'],
  supa: ['supabase'],
  supabase: ['supabase']
};




export function normalizeStr(str = '') {
  if (typeof str !== 'string') return '';
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}




export function levenshteinDistance(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

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





export function scoreIcon(icon, rawQuery) {
  if (!icon || !rawQuery) return 0;

  const query = rawQuery.toLowerCase().trim();
  if (!query) return 0;

  const cleanQuery = normalizeStr(query);
  if (!cleanQuery) return 0;

  const id = (icon.slug || icon.id || '').toLowerCase();
  const name = (icon.title || icon.name || '').toLowerCase();
  const cleanId = normalizeStr(id);
  const cleanName = normalizeStr(name);
  const aliases = (Array.isArray(icon.aliases) ? icon.aliases : []).map((a) => a.toLowerCase());
  const cleanAliases = aliases.map(normalizeStr);
  const words = [...name.split(/[\s\-_,./+]+/), ...id.split(/[\s\-_,./+]+/)].filter((w) => w.length > 0);
  const cleanWords = words.map(normalizeStr);


  if (id === query || name === query || cleanId === cleanQuery || cleanName === cleanQuery) {
    return 10000;
  }


  for (const a of cleanAliases) {
    if (a === cleanQuery) return 9000;
    if (a.startsWith(cleanQuery)) return 8500;
  }


  const extra = EXTRA_ALIASES[cleanQuery];
  if (extra) {
    for (const em of extra) {
      const cleanEm = normalizeStr(em);
      if (cleanId === cleanEm || cleanName === cleanEm || id === em || name === em) return 8800;
      if (cleanId.includes(cleanEm) || cleanName.includes(cleanEm)) return 8200;
    }
  }


  if (id.startsWith(query) || name.startsWith(query) || cleanId.startsWith(cleanQuery) || cleanName.startsWith(cleanQuery)) {
    return 8000 + (100 - Math.min(100, Math.abs(cleanName.length - cleanQuery.length)));
  }


  if (cleanName.includes(cleanQuery) || cleanId.includes(cleanQuery)) {
    return 7500 + (100 - Math.min(100, Math.abs(cleanName.length - cleanQuery.length)));
  }


  const idDist = levenshteinDistance(cleanQuery, cleanId);
  if (idDist === 1) return 7200;
  if (idDist === 2 && cleanQuery.length >= 4) return 6800;

  const nameDist = levenshteinDistance(cleanQuery, cleanName);
  if (nameDist === 1) return 7100;
  if (nameDist === 2 && cleanQuery.length >= 4) return 6700;


  for (const cw of cleanWords) {
    if (cw === cleanQuery) return 6500;
    if (cw.startsWith(cleanQuery)) return 6200;
    const wDist = levenshteinDistance(cleanQuery, cw);
    if (wDist === 1) return 6000;
    if (wDist === 2 && cleanQuery.length >= 4) return 5500;
  }


  const queryTokens = query.split(/[\s\-_,./+]+/).filter((t) => t.length > 0);
  if (queryTokens.length > 1) {
    const combined = `${id} ${name} ${aliases.join(' ')}`;
    if (queryTokens.every((t) => combined.includes(t))) return 4800;
  }


  if (name.includes(query) || id.includes(query)) return 4000;


  const cat = (icon.category || Array.isArray(icon.categories) && icon.categories[0] || '').toLowerCase();
  if (cat.includes(query) || normalizeStr(cat).includes(cleanQuery)) return 2000;

  return 0;
}




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


  scored.sort((a, b) => b.score - a.score);

  return scored.map((item) => item.icon);
}