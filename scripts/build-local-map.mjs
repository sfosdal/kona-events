// Writes site/local-map.json — the Big Island's outline (and Maui's, as a
// faint neighbour) projected into a 1000-wide frame, plus the towns and the
// two volcanoes as labels — for the Map view (site/local-map.js), which puts
// a pin on every room in city.js that carries `geo: [lat, lon]`.
//
// Natural Earth 1:10m admin-0 countries (public domain), cached in .cache/
// (gitignored) — the same file the here.events map is drawn from. The
// output is committed: the Actions build never downloads anything.
//
// Run: node scripts/build-local-map.mjs
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..');
const cache = path.join(root, '.cache');
const NAME = 'ne_10m_admin_0_countries';
const BASE = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/';
const SISTER = path.join(process.env.HOME || '', 'Desktop/projects/here-events/repo/.cache', NAME + '.geojson'); // the here.events map's copy, when this Mac has it

async function load() {
  const f = path.join(cache, NAME + '.geojson');
  try { await access(f); return JSON.parse(await readFile(f, 'utf8')); } catch { /* not cached */ }
  await mkdir(cache, { recursive: true });
  try { await access(SISTER); const s = await readFile(SISTER, 'utf8'); await writeFile(f, s); return JSON.parse(s); } catch { /* no sister copy */ }
  const r = await fetch(BASE + NAME + '.geojson');
  if (!r.ok) throw new Error(`Natural Earth download failed: HTTP ${r.status}`);
  const s = await r.text(); await writeFile(f, s); return JSON.parse(s);
}
function inside(ring, x, y) { // ray cast
  let c = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c;
  }
  return c;
}
const g = await load();
const usa = g.features.find(f => f.properties.ADM0_A3 === 'USA');
const polys = usa.geometry.type === 'MultiPolygon' ? usa.geometry.coordinates : [usa.geometry.coordinates];
const ringAt = (lon, lat) => { const p = polys.find(p => inside(p[0], lon, lat)); if (!p) throw new Error(`no ring at ${lon},${lat}`); return p[0]; };
const island = ringAt(-155.5, 19.6); // Hawaiʻi
const maui = ringAt(-156.3, 20.8);
const kahoolawe = polys.find(p => inside(p[0], -156.6, 20.55))?.[0];

// the frame: the island with a margin, equirectangular about its centre (fine for 150 km)
const W = 1000, PAD = 0.06;
const lons = island.map(p => p[0]), lats = island.map(p => p[1]);
const cx = (Math.min(...lons) + Math.max(...lons)) / 2, cy = (Math.min(...lats) + Math.max(...lats)) / 2;
const k = Math.cos(cy * Math.PI / 180);
const spanX = (Math.max(...lons) - Math.min(...lons)) * k, spanY = Math.max(...lats) - Math.min(...lats);
const s = W * (1 - 2 * PAD) / Math.max(spanX, spanY * 1.0); // one scale, both axes
const H = Math.round(spanY * s + 2 * PAD * W);
const proj = { cx, cy, k, s, w: W, h: H }; // x = (lon - cx) * k * s + w/2 ; y = (cy - lat) * s + h/2
const px = ([lon, lat]) => [((lon - cx) * k * s + W / 2), ((cy - lat) * s + H / 2)];
const pathOf = ring => ring.map((p, i) => (i ? 'L' : 'M') + px(p).map(v => v.toFixed(1)).join(' ')).join('') + 'Z';

const towns = [ // the places a visitor steers by (lat, lon); anchor: which side of the dot the name sits
  { name: 'Kailua-Kona', lat: 19.640, lon: -155.996, anchor: 'end' },
  { name: 'Captain Cook', lat: 19.497, lon: -155.918, anchor: 'end' },
  { name: 'Hawi', lat: 20.241, lon: -155.834, anchor: 'start' },
  { name: 'Waimea', lat: 20.023, lon: -155.668, anchor: 'start', dy: 14 },
  { name: 'Honokaʻa', lat: 20.080, lon: -155.467, anchor: 'start', dy: -6 },
  { name: 'Hilo', lat: 19.724, lon: -155.087, anchor: 'start' },
  { name: 'Pāhoa', lat: 19.494, lon: -154.944, anchor: 'start' },
  { name: 'Volcano', lat: 19.440, lon: -155.233, anchor: 'start' },
  { name: 'Nāʻālehu', lat: 19.065, lon: -155.586, anchor: 'start' },
  { name: 'Kona Airport (KOA)', lat: 19.739, lon: -156.045, anchor: 'end' },
].map(t => ({ ...t, xy: px([t.lon, t.lat]).map(v => +v.toFixed(1)) }));
const peaks = [
  { name: 'Mauna Kea', lat: 19.821, lon: -155.468 },
  { name: 'Mauna Loa', lat: 19.475, lon: -155.608 },
  { name: 'Hualālai', lat: 19.689, lon: -155.864 },
].map(t => ({ ...t, xy: px([t.lon, t.lat]).map(v => +v.toFixed(1)) }));

const out = { proj, island: pathOf(island), neighbours: [maui, kahoolawe].filter(Boolean).map(pathOf), towns, peaks,
  credit: 'Map outline from Natural Earth, 1:10m, public domain.' };
await writeFile(path.join(root, 'site', 'local-map.json'), JSON.stringify(out));
console.log(`local-map.json: frame ${W}×${H}, island ${island.length} points, ${out.neighbours.length} neighbours, ${towns.length} towns`);
