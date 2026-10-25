#!/usr/bin/env node
// tools/no-verdicts.js — NO VISA VERDICT WRITTEN ON A VISA GUIDE PAGE (founder, 25 Oct 2026 08:50: "no visa verdict is ever written as
// text on the page; the answer only comes from the live check. Add a builder check that refuses a page containing verdict words
// (visa-free / on arrival / e-visa / required) outside the live-check result").
// Reads every /visa/**/index.html as a VISITOR or a search engine sees it — the text, the meta tags, alt/title text and structured
// data — and fails on a verdict word, a processing time or a fee word, a data provider's name, Kashmir, or a capital "Brimm" other
// than "Brimm Limited". The live check's result is drawn by /check.html at run time, so it is never in these files.
// ONE EXEMPTION, BY NAME: the founder titled one page "Visa-free countries for UAE residents" — the words people search. On THAT page
// its own title phrase, verbatim, is removed before the check wherever it names the page (the <title>, the h1, the og/twitter titles,
// the description, the structured data), and so is its own address's slug (og:url, the structured data's url); any other "visa-free" on it is refused like anywhere else. A domain shown under an official link ("evisa.gov.ge") is an address, not a
// verdict — "evisa" directly followed by a dot is not matched.
// RULED SENTENCES, EXACT: a sentence the founder ruled onto a page that carries a refused word for a reason that is not a verdict — a
// destination's own condition — listed with its ruling and removed, verbatim, before the check. Any other use of the word is refused.
// Used two ways: brimm-ai tools/visa-pages/build.js calls check() before it writes (a page that fails is never written), and
// .githooks/pre-commit runs this file (a hand edit cannot slip one in).
//   node tools/no-verdicts.js              check the working tree
//   node tools/no-verdicts.js --self-test  prove it refuses planted cases and passes clean text
'use strict';
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

const RULES = [
  ['a visa verdict', /\bvisa[- ]?free\b|\bvisa[- ]?waiver\b|\bon[- ]arrival\b|\be-?visa\b(?!\.)|\brequired\b|\bno visa\b|\bvisa not needed\b|\beTA\b/i],
  ['a processing time or a fee', /\bprocessing\b|\bworking days\b|\bbusiness days\b|\bfees?\b|\bcosts? \d/i],
  ["a data provider's name", /travel ?buddy|rapid ?api|sherpa|visadb|\biata\b|timatic|anthropic|\bclaude\b|openai|unsplash|supabase|sentry|getyourguide|tiqets|kkday|klook|viator|airalo|discovercars|aviasales|booking\.com|expedia/i],
  ['Kashmir', /kashmir/i],
  ['a capital Brimm', /\bBrimm\b(?! Limited)/],
];
const EXEMPT_SLUG = 'visa-free-countries-for-uae-residents', EXEMPT_PAGE = `visa/${EXEMPT_SLUG}/index.html`, EXEMPT_TITLE = 'Visa-free countries for UAE residents';

const RULED = [
  'Travel insurance is required for all visitors',   // founder, 25 Oct 2026 09:20 (#2): Georgia's insurance, from our own rules, no amount
];
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&#39;|&rsquo;/g, "'").replace(/&quot;/g, '"');
/** What a visitor or a crawler reads: text, meta content, alt/title/aria-label, ld+json — not CSS, not other scripts. */
function visible(html, exemptTitles) {
  let h = RULED.reduce((x, r) => x.split(r).join(''), html);
  if (exemptTitles) {
    h = h.split(EXEMPT_TITLE).join('').split(EXEMPT_SLUG).join('');   // the founder's search title and its address — on its own page, nowhere else
  }
  const ld = [...h.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
  const attrs = [...h.matchAll(/\b(?:content|alt|title|aria-label)="([^"]*)"/gi)].map(m => m[1]);
  const text = h.replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<[^>]+>/g, ' ');
  return decode([text, ...attrs, ...ld].join('\n'));
}
/** The faults on one page — [] when clean. `rel` is the page's path from the site root. */
function check(html, rel) {
  const v = visible(html, rel.replace(/\\/g, '/') === EXEMPT_PAGE);
  const bad = [];
  for (const line of v.split('\n')) for (const [what, re] of RULES) {
    const m = line.match(re); if (m) bad.push(`${rel}: ${what} — "${line.trim().slice(Math.max(0, m.index - 30), m.index + 40)}"`);
  }
  return bad;
}
module.exports = { check, RULED, RULES, EXEMPT_PAGE, EXEMPT_TITLE, EXEMPT_SLUG };

if (require.main === module) {
  if (process.argv.includes('--self-test')) {
    const planted = ['<p>Georgia is visa-free for you</p>', '<p>Get a visa on arrival</p>', '<p>Apply for an e-Visa</p>', '<p>A visa is required</p>',
      '<meta name="description" content="No visa for UAE residents">', '<p>Processing takes 3 working days</p>', '<p>The fee is small</p>',
      '<p>Data from Travel Buddy</p>', '<p>Kashmir</p>', '<p>Brimm checks it</p>', '<img alt="eVisa portal">',
      '<script type="application/ld+json">{"name":"Thailand visa-free"}</script>', '<p>A visa is required for all visitors</p>', '<p>Travel insurance is required for all visitors. A visa is required too.</p>'];
    const clean = ['<p>What decides your answer</p>', '<a href="https://www.evisa.gov.ge/GeoVisa/">Georgia’s official visa site ↗</a><span>evisa.gov.ge</span>',
      '<p>© 2026 Brimm Limited, UAE</p>', '<p class="ti">🩺 Travel insurance is required for all visitors</p>', '<style>.a{color:red}</style><p>Rules change. Always confirm with the official source before you book.</p>'];
    const missed = planted.filter(h => !check(h, 'visa/x/index.html').length);
    const flagged = clean.filter(h => check(h, 'visa/x/index.html').length);
    // the exemption: the founder's search title passes on its own page and nowhere else, and the rest of that page is still checked
    const title = '<title>Visa-free countries for UAE residents | brimm</title><h1>Visa-free countries for UAE residents</h1><meta property="og:url" content="https://brimm.ai/visa/visa-free-countries-for-uae-residents/">';
    const exemptOk = !check(title, EXEMPT_PAGE).length && check(title, 'visa/georgia-for-uae-residents/index.html').length > 0
      && check(title + '<p>Thailand is visa-free</p>', EXEMPT_PAGE).length > 0;
    if (missed.length || flagged.length || !exemptOk) { console.error('no-verdicts self-test FAILED — missed:', missed, 'flagged clean:', flagged, 'exemption ok:', exemptOk); process.exit(1); }
    console.log(`no-verdicts self-test: all ${planted.length} planted cases refused, ${clean.length} clean texts pass, the one title exemption holds only on its page`);
    process.exit(0);
  }
  const dir = path.join(root, 'visa');
  const pages = fs.existsSync(dir) ? fs.readdirSync(dir).filter(d => fs.existsSync(path.join(dir, d, 'index.html'))).map(d => `visa/${d}/index.html`) : [];
  const bad = pages.flatMap(p => check(fs.readFileSync(path.join(root, p), 'utf8'), p));
  if (bad.length) { console.error(`no-verdicts: ${bad.length} fault(s) on the visa guide pages — the answer only ever comes from the live check:\n  ${bad.join('\n  ')}`); process.exit(1); }
  console.log(`no-verdicts: ${pages.length} visa guide page(s) read, no verdict written`);
}
