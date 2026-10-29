#!/usr/bin/env node
// tools/build-home.js — writes the home's HERO photos and the WHERE WILL YOU BRIMM NEXT? wall into index.html (between its START/END
// markers), every fact read from where it lives, never typed here (29 Oct 2026, the home redesign):
//   · best months — the city's dataset row `bestTime` (brimm-ai data/allDestinations.json), the field the itinerary pages print and the
//     one the seasons source writes (brimm-ai tools/best-months; CLAUDE.md "one source for a city's best months");
//   · photo credits — the itinerary builder's PHOTO_CREDIT (brimm-ai tools/seo-pages/build.js) for the photos it chose, and the app's
//     founder-approved pins (brimm-ai data/marqueePhotos.ts) for the rest — the photographer, always shown as "Name on Unsplash";
//   · a tile links to an itinerary page only when that page exists in this site (itinerary/<slug>-<n>-days/); the others do not pretend.
// Kashmir: none of these places is in the never-promoted list, and the build refuses one that is (brimm-ai data/neverPromoted.ts).
//   node tools/build-home.js            rewrite index.html
const fs = require('fs'), path = require('path');
const SITE = path.join(__dirname, '..'), REPO = 'D:/brimm-ai';
const { loadTs } = require(path.join(REPO, 'tools/money-golden/load'));
const DEST = JSON.parse(fs.readFileSync(path.join(REPO, 'data/allDestinations.json'), 'utf8'));
const { MARQUEE_PHOTOS } = loadTs('data/marqueePhotos.ts');
const { NEVER_PROMOTED_NAMES } = loadTs('data/neverPromoted.ts');
const seoSrc = fs.readFileSync(path.join(REPO, 'tools/seo-pages/build.js'), 'utf8');
const SEO_CREDIT = {};
for (const m of seoSrc.slice(seoSrc.indexOf('const PHOTO_CREDIT'), seoSrc.indexOf('};', seoSrc.indexOf('const PHOTO_CREDIT')))
  .matchAll(/'?([a-z-]+)'?:\s*\['([^']*)',\s*'([^']*)'\]/g)) SEO_CREDIT[m[1]] = { label: m[2], by: m[3] };

const rowOf = (c) => DEST.find(r => r.city === c && (r.kind === 'destination' || !r.kind)) || DEST.find(r => r.city === c);
const pinBy = (c, i = 0) => { const m = MARQUEE_PHOTOS.find(x => x.city === c); if (!m || !m.pins[i]) throw new Error(`no approved pin ${i} for ${c}`); return m.pins[i].by; };
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
// [slug, city, credit source] — the founder's seven (29 Oct 2026 11:10), in his order. All tiles are the same kind; the grid (index.html)
// lays them 3 + 4 on wide screens and Paris across the top then pairs on a phone, so there is no gap at any width.
// 'pin1' = the place's second approved pin, where its first is the hero's or another section's (no photo twice on the page).
const PLACES = [
  ['paris', 'Paris', 'pin'], ['rome', 'Rome', 'pin'], ['barcelona', 'Barcelona', 'pin'], ['london', 'London', 'seo'],
  ['istanbul', 'Istanbul', 'pin1'], ['tbilisi', 'Tbilisi', 'seo'], ['bali', 'Bali', 'pin1'],
];
// a tile's own file where the shared one would not do (a different approved pin, or a sharper size), and a focus point where the
// landmark is not in the middle of the frame
const WALL_SRC = { paris: 'paris-wall.jpg', rome: 'rome-960.jpg', barcelona: 'barcelona-960.jpg', london: 'london-960.jpg',
  istanbul: 'istanbul-wall.jpg', tbilisi: 'tbilisi-960.jpg', bali: 'bali-wall.jpg' };
const FOCUS = { barcelona: '50% 28%' };
// THE HERO (founder, 29 Oct 2026 11:10): three scenes that change together — the city's approved photo behind, and on the phone the real
// Home of the test account with that city's trip as its hero trip (assets/app/home-<slug>.webp, captured on the Pixel).
const HERO = ['paris', 'dubai', 'singapore'];
const PHONE_ALT = {
  paris: 'The brimm Home screen with a Paris trip as the next trip',
  dubai: 'The brimm Home screen with a Dubai trip as the next trip',
  singapore: 'The brimm Home screen with a Singapore trip as the trip under way',
};
const info = (slug, city, src) => {
  const row = rowOf(city); if (!row) throw new Error(`no dataset row for ${city}`);
  if (NEVER_PROMOTED_NAMES.some(n => n.toLowerCase() === city.toLowerCase())) throw new Error(`${city} is never promoted (Kashmir rule)`);
  if (!WALL_SRC[slug] && !fs.existsSync(path.join(SITE, 'assets/hero', slug + '-600.jpg')) && !fs.existsSync(path.join(SITE, 'assets/hero', slug + '-960.jpg'))) throw new Error(`no photo for ${slug}`);
  const by = src === 'seo' ? (SEO_CREDIT[slug] || {}).by : pinBy(city, src === 'pin1' ? 1 : 0);
  if (!by) throw new Error(`no credit for ${slug}`);
  return { row, by, label: src === 'seo' && SEO_CREDIT[slug] ? SEO_CREDIT[slug].label : `${city}, ${row.country === 'The Netherlands' ? 'Netherlands' : row.country}` };
};
const itins = fs.readdirSync(path.join(SITE, 'itinerary'));
const tiles = PLACES.map(([slug, city, src]) => {
  const { row, by } = info(slug, city, src);
  const best = row.bestTime ? `Best ${row.bestTime.replace(/-/g, '–')}` : null;
  const page = itins.filter(d => d.startsWith(slug + '-')).sort((a, b) => parseInt(b.split('-').slice(-2)[0]) - parseInt(a.split('-').slice(-2)[0]))[0];
  const country = row.country === 'The Netherlands' ? 'Netherlands' : row.country;
  const file = WALL_SRC[slug] || `${slug}-600.jpg`; if (!fs.existsSync(path.join(SITE, 'assets/hero', file))) throw new Error(`no photo ${file}`);
  const inner = `<img src="/assets/hero/${file}" alt="${esc(city)}, ${esc(country)}"${FOCUS[slug] ? ` style="object-position:${FOCUS[slug]}"` : ''} loading="lazy" decoding="async">`
    + `<span class="t"><b>${esc(city)}</b><span class="cty">${esc(country)}</span>${best ? `<span class="mo">${esc(best)}</span>` : ''}`
    + `${page ? `<span class="go">${page.split('-').slice(-2)[0]}-day plan →</span>` : '<span class="go" aria-hidden="true"></span>'}</span>`
    + `<span class="pc">${esc(by)} on Unsplash</span>`;
  return page ? `      <a class="tile" href="/itinerary/${page}/">${inner}</a>` : `      <div class="tile">${inner}</div>`;
});
const heroInfo = HERO.map(slug => {
  const city = { paris: 'Paris', dubai: 'Dubai', singapore: 'Singapore' }[slug];
  if (!fs.existsSync(path.join(SITE, 'assets/app', `home-${slug}.webp`))) throw new Error(`no phone capture for ${slug} (assets/app/home-${slug}.webp)`);
  const src = SEO_CREDIT[slug] ? 'seo' : 'pin'; const i = info(slug, city, src); return [slug, i.label, i.by, `home-${slug}.webp`, PHONE_ALT[slug]];
});
const heroBy = new Set(heroInfo.map(h => h[2]));
for (const [slug, city, src] of PLACES) { const { by } = info(slug, city, src); if (heroBy.has(by)) throw new Error(`${city}'s wall photo (${by}) is also in the hero — the page would show it twice`); }
const first = heroInfo[0];
let html = fs.readFileSync(path.join(SITE, 'index.html'), 'utf8');
const put = (name, body, open = `<!-- ${name}:START (written by tools/build-home.js) -->`, close = `<!-- ${name}:END -->`) => {
  const a = html.indexOf(open), b = html.indexOf(close); if (a < 0 || b < 0) throw new Error(`index.html has no ${name} markers`);
  html = html.slice(0, a + open.length) + '\n' + body + '\n' + html.slice(b);
};
put('HERO', `    <img class="on" src="/assets/hero/${first[0]}-960.jpg" srcset="/assets/hero/${first[0]}-960.jpg 960w, /assets/hero/${first[0]}.jpg 1920w" sizes="100vw" alt="" fetchpriority="high">`);
put('PHONE', `        <img class="on" src="/assets/app/${first[3]}" alt="${esc(first[4])}" width="540" height="1176" fetchpriority="high">`);
put('CREDIT', `  <p class="credit" id="credit"><b>${esc(first[1])}</b> · ${esc(first[2])} on Unsplash</p>`);
put('WALL', `    <div class="wall rv">\n${tiles.join('\n')}\n    </div>`);
put('PHOTOS', `  var PHOTOS = ${JSON.stringify(heroInfo)};`, '/* PHOTOS:START (written by tools/build-home.js) */', '/* PHOTOS:END */');
fs.writeFileSync(path.join(SITE, 'index.html'), html);
const eu = ['FR', 'IT', 'ES', 'GB'];   // Türkiye not counted
console.log(`hero: ${heroInfo.map(h => h[1] + ' (' + h[2] + ')').join(' · ')}`);
console.log(`wall: ${tiles.length} tiles, ${PLACES.filter(p => eu.includes(rowOf(p[1]).countryCode)).length} in Europe, ${tiles.filter(t => t.includes('<a class')).length} link to an itinerary page`);
