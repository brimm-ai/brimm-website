#!/usr/bin/env node
// tools/no-prices.js — NO PRICE OR CURRENCY AMOUNT ON THE WEBSITE (founder, 24 Oct 2026 16:45: "NO amounts or currency anywhere on the
// website … Prices differ by country (our 3 regional tiers) and the stores set local prices, so the site shows none").
// Reads every tracked .html / .xml / .json / .txt file as a VISITOR or a search engine sees it — the text, the meta tags, image alt text
// and structured data (application/ld+json) — and fails on any money amount: a currency code or symbol next to a number ("AED 18",
// "$5", "18 AED", "€9.99"), a percentage off ("40% off"), or a currency word next to a number ("18 dirhams"). Styles and other scripts are
// not read (a CSS rgba(…) or a JS "$" is not a price). Run by .githooks/pre-commit; exit 1 names each file, line and match.
//   node tools/no-prices.js            check the working tree
//   node tools/no-prices.js --self-test   prove it fails on planted prices and passes clean text (the control)
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const root = path.join(__dirname, '..');

const CODES = 'AED|USD|EUR|GBP|INR|SAR|QAR|OMR|KWD|BHD|JPY|CNY|AUD|CAD|CHF|SGD|THB|IDR|MYR|TRY|EGP|GEL|AZN|MVR|Rs\\.?|Dhs?';
const SYMBOLS = '\\$|€|£|₹|¥|₺|₩|฿';
const MONEY = new RegExp([
  `(?:\\b(?:${CODES})(?![A-Za-z])|${SYMBOLS})\\s?\\d`,  // AED 18 · $5 · €9.99 · Rs. 499 (no \b after a code: "Rs." ends in a dot)
  `\\d[\\d,.]*\\s?(?:\\b(?:${CODES})\\b)`,                 // 18 AED · 1,499 INR
  `\\d[\\d,.]*\\s?(?:dirhams?|rupees?|dollars?|euros?|pounds?)\\b`,
  `\\d+\\s?%\\s?off\\b`,                                    // 40% off
].join('|'), 'i');

/** What a visitor or a crawler reads: text, meta content, alt/title/aria-label attributes, ld+json — not CSS, not other scripts. */
function visible(html) {
  const ld = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
  const attrs = [...html.matchAll(/\b(?:content|alt|title|aria-label)="([^"]*)"/gi)].map(m => m[1]);
  const text = html.replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<[^>]+>/g, ' ');
  return [text, ...attrs, ...ld].join('\n').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ');
}
function scan(files) {
  const bad = [];
  for (const f of files) {
    const raw = fs.readFileSync(path.join(root, f), 'utf8');
    const lines = (/\.html?$/i.test(f) ? visible(raw) : raw).split('\n');
    lines.forEach((l, i) => { const m = l.match(MONEY); if (m) bad.push(`${f}: "${l.trim().slice(Math.max(0, m.index - 30), m.index + 40)}"`); });
  }
  return bad;
}

if (process.argv.includes('--self-test')) {
  const planted = ['<p>AED 18 a month</p>', '<p>or 149 AED a year</p>', '<li>Welcome gift: 40% off your first month</li>', '<meta name="description" content="From $5">',
    '<img alt="€9.99 a year">', '<script type="application/ld+json">{"price":"Rs. 499"}</script>', '<p>18 dirhams</p>'];
  const clean = ['<style>.a{color:rgba(0,0,0,.5)}</style><p>Free to start. No card.</p>', '<script>const $x=$("a");</script><p>Busy &amp; pricey: Jul–Aug</p>',
    '<p>Prices differ by country.</p>', '<p>3 nights, 2 travellers, 10 messages</p>'];
  const miss = planted.filter(h => !MONEY.test(visible(h)));
  const wrong = clean.filter(h => MONEY.test(visible(h)));
  if (miss.length || wrong.length) { console.error('no-prices self-test FAILED — missed:', miss, 'flagged clean:', wrong); process.exit(1); }
  console.log(`no-prices self-test: all ${planted.length} planted prices refused, ${clean.length} clean texts pass`);
  process.exit(0);
}
const files = execSync('git ls-files', { cwd: root, encoding: 'utf8' }).split('\n').filter(f => /\.(html?|xml|json|txt|webmanifest)$/i.test(f) && fs.existsSync(path.join(root, f)));
const bad = scan(files);
if (bad.length) { console.error(`no-prices: ${bad.length} money amount(s) in website text — the site shows no prices (founder, 24 Oct 2026):\n  ${bad.join('\n  ')}`); process.exit(1); }
console.log(`no-prices: ${files.length} files read, no price or currency amount`);
