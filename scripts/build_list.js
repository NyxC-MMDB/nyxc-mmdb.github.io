// scripts/build_list.js
// Genera public/sonolus/levels/list a partir de carpetas en /maps/<ID>.
// Ejecutar: node scripts/build_list.js
const fs = require('fs');
const path = require('path');

const MAPS_DIR = path.join(__dirname, '..', 'maps');
const OUT_DIR = path.join(__dirname, '..', 'public', 'sonolus', 'levels');
const SITE_BASE = process.env.SITE_BASE || 'https://TU_USUARIO.github.io/TU_REPO'; // <- reemplaza aquí
fs.mkdirSync(OUT_DIR, { recursive: true });

function readJsonSafe(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); }
  catch (e) { return null; }
}

const ids = fs.existsSync(MAPS_DIR) ? fs.readdirSync(MAPS_DIR) : [];
const items = [];

for (const id of ids) {
  const folder = path.join(MAPS_DIR, id);
  if (!fs.existsSync(folder) || !fs.statSync(folder).isDirectory()) continue;
  const cfg = readJsonSafe(path.join(folder, 'config.json')) || {};
  const vis = (cfg.visibility || 'public');
  if (vis !== 'public') continue; // omitimos privados

  // detecta thumbnail ext
  let thumb = null;
  for (const ext of ['png','jpg','jpeg']) {
    const p = `/maps/${id}/map.${ext}`;
    if (fs.existsSync(path.join(folder, `map.${ext}`))) { thumb = p; break; }
  }
  // comprueba archivos
  const dataPath = fs.existsSync(path.join(folder, 'map.usc')) ? `/maps/${id}/map.usc` : null;
  const bgmPath = fs.existsSync(path.join(folder, 'map.wav')) ? `/maps/${id}/map.wav` : null;
  if (!dataPath || !bgmPath) continue; // level inválido

  // mapea a LevelItem (sólo campos mínimos necesarios)
  const item = {
    name: id, // nombre único
    version: cfg.version || 1,
    rating: cfg.rating || 0,
    title: cfg.title || cfg.name || 'Untitled',
    artists: cfg.artists || cfg.author || 'unknown',
    author: cfg.author || cfg.artists || 'unknown',
    tags: cfg.tags || [],
    engine: cfg.engine || { name: cfg.engineName || 'pjsk', version: cfg.engineVersion || 1 },
    useSkin: { useDefault: true },
    cover: { uri: SITE_BASE + (thumb || `/maps/${id}/map.png`) },
    bgm: { uri: SITE_BASE + bgmPath },
    data: { uri: SITE_BASE + dataPath },
    source: SITE_BASE // indica el server origen (útil para Sonolus)
  };
  items.push(item);
}

const out = {
  pageCount: 1,
  items
};

fs.writeFileSync(path.join(OUT_DIR, 'list'), JSON.stringify(out, null, 2), 'utf8'); // sin extensión, Sonolus acepta
fs.writeFileSync(path.join(OUT_DIR, 'list.json'), JSON.stringify(out, null, 2), 'utf8'); // también crear .json por si acaso

console.log('Generado public/sonolus/levels/list con', items.length, 'items');