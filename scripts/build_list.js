// scripts/build_list.js
const fs = require('fs');
const path = require('path');

const MAPS_DIR = path.join(__dirname, '..', 'maps');
const OUT = path.join(__dirname, '..', 'public', 'levels');
fs.mkdirSync(OUT, { recursive: true });

function readJsonSafe(p) {
  try { return JSON.parse(fs.readFileSync(p,'utf8')); }
  catch (e) { return null; }
}

const ids = fs.existsSync(MAPS_DIR) ? fs.readdirSync(MAPS_DIR) : [];
const items = [];

for (const id of ids) {
  const folder = path.join(MAPS_DIR, id);
  if (!fs.statSync(folder).isDirectory()) continue;
  const cfg = readJsonSafe(path.join(folder, 'config.json'));
  if (!cfg) continue;
  // sólo públicos
  if ((cfg.visibility || 'public') !== 'public') continue;
  items.push({
    id,
    title: cfg.title || cfg.name || 'Untitled',
    author: cfg.author || 'unknown',
    description: cfg.description || '',
    thumbnailUrl: `/maps/${id}/map.png`,
    dataUrl: `/maps/${id}/map.usc`,
    audioUrl: `/maps/${id}/map.wav`,
    likes: 0,
    created_at: cfg.created_at || (new Date()).toISOString()
  });
}

fs.writeFileSync(path.join(OUT, 'list.json'), JSON.stringify({ items }, null, 2), 'utf8');
console.log('list.json generado con', items.length, 'items');
