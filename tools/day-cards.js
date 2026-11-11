#!/usr/bin/env node
// tools/day-cards.js — THE CITY ITINERARY DAY CARDS, OPTION A (founder, HQ #964 on mock #207, 10 Nov 2026: "serif day title, timeline,
// day 1 open, later days fold until tapped. Folded days must stay in the HTML (not loaded by script) so Google still reads them").
// Rewrites each itinerary page's full days (written by brimm-ai tools/seo-pages/build.js as <section class="day"><p class="dayhead">DAY n ·
// TITLE</p><ul>…</ul></section>) into <details class="day">: the day number and its title as the summary, the stops under it. Every stop
// stays in the page's HTML whether the day is open or folded; <details> needs no script to open, and is read in full by search engines.
// THE TITLE'S CAPITALS come from the page's own structured data ("Day 1: Arrival and Old Town stroll"), the same title the page already
// publishes — never re-cased here; the tool refuses a page whose two copies disagree. Day 1 is open and the rest fold at EVERY
// width: on a computer the days are one column too (a first build opened them all side by side; a fresh review found an empty cell, a
// stretched card and orphaned words, so the approved phone layout is used everywhere). Idempotent: a page already in this shape is rebuilt the same way.
// The look lives in assets/seo.css ("DAY CARDS, OPTION A").
//   node tools/day-cards.js && node tools/stamp-assets.js        (rewrite + stamp)
//   node tools/day-cards.js --check                              (exit 1 if any page is not in this shape)
'use strict';
const fs = require('fs'), path = require('path');
const SITE = path.join(__dirname, '..');
const CHECK = process.argv.includes('--check');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const unesc = (s) => String(s).replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const dirs = fs.readdirSync(path.join(SITE, 'itinerary')).filter(d => fs.existsSync(path.join(SITE, 'itinerary', d, 'index.html')));
const bad = []; let changed = 0, days = 0;
for (const d of dirs) {
  const rel = `itinerary/${d}/index.html`, p = path.join(SITE, rel);
  const h0 = fs.readFileSync(p, 'utf8');
  const ld = [...h0.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(m => { try { return JSON.parse(m[1]); } catch { return null; } });
  const items = ld.flat().flatMap(j => (j && j.itinerary && j.itinerary.itemListElement) || []);   // the block is an array of two objects
  const titleOf = {}; for (const it of items) { const m = /^Day (\d+)(?:: (.*))?$/.exec(it.name || ''); if (m) titleOf[m[1]] = m[2] || ''; }
  let h = h0, n = 0;
  // the old shape (from the builder) and this tool's own shape are both read, so a rerun gives the same page
  const OLD = /<section class="day"><p class="dayhead">DAY (\d+)(?: · ([^<]*))?<\/p>\s*(<ul>[\s\S]*?<\/ul>)<\/section>/g;
  const NEW = /<details class="day"(?: open)?><summary><span class="dn">Day (\d+)<\/span><span class="dt">([^<]*)<\/span><\/summary>\s*(<ul>[\s\S]*?<\/ul>)<\/details>/g;
  const card = (num, shown, ul) => {
    n++;
    const t = titleOf[num];
    if (t === undefined) { bad.push(`${rel}: day ${num} has no title in the structured data`); return null; }
    if (shown && unesc(shown).toUpperCase() !== t.toUpperCase() && unesc(shown) !== t) { bad.push(`${rel}: day ${num} title "${unesc(shown)}" disagrees with the structured data "${t}"`); return null; }
    return `<details class="day"${num === '1' ? ' open' : ''}><summary><span class="dn">Day ${num}</span><span class="dt">${esc(t)}</span></summary>\n        ${ul}</details>`;
  };
  h = h.replace(OLD, (m, num, shown, ul) => card(num, shown, ul) || m).replace(NEW, (m, num, shown, ul) => card(num, shown, ul) || m);
  if (!n) { bad.push(`${rel}: no day cards found`); continue; }
  // a first build's computer-width opener is removed wherever a page still has it
  h = h.replace(/\n?[ \t]*<script>if\(matchMedia\('\(min-width:900px\)'\)\.matches\)document\.querySelectorAll\('details\.day'\)[^<]*<\/script>/g, '');
  days += (h.match(/<details class="day"/g) || []).length;
  if ((h.match(/<details class="day" open>/g) || []).length !== 1) bad.push(`${rel}: day 1 is not the one open day`);
  if (/<section class="day">/.test(h)) bad.push(`${rel}: an old day card is left`);
  if (h !== h0) { changed++; if (!CHECK) fs.writeFileSync(p, h); }
}
if (bad.length) { console.error(`day-cards: ${bad.length} fault(s):\n  ${bad.join('\n  ')}`); process.exit(1); }
if (CHECK && changed) { console.error(`day-cards --check: ${changed} page(s) are not in the option-A shape; run node tools/day-cards.js`); process.exit(1); }
console.log(`day-cards: ${dirs.length} itinerary pages, ${days} full days as option-A cards (day 1 open, the rest fold), ${CHECK ? 'all in shape' : changed + ' page(s) rewritten'}`);
