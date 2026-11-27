#!/usr/bin/env node
// tools/no-verdicts.js — NO VISA VERDICT WRITTEN ON A VISA GUIDE PAGE (founder, 25 Oct 2026 08:50: "no visa verdict is ever written as
// text on the page; the answer only comes from the live check. Add a builder check that refuses a page containing verdict words
// (visa-free / on arrival / e-visa / required) outside the live-check result").
// Reads every /visa/**/index.html as a VISITOR or a search engine sees it — the text, the meta tags, alt/title text and structured
// data — and fails on a verdict word, a processing time or a fee word, a data provider's name, a Kashmir-region place (the guides are promoted content — founder #304), or a capital "Brimm" other
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
  ['a visa verdict', /\bvisa[- ]?free\b|\bvisa[- ]?waiver\b|\bon[- ]arrival\b|\be-?visa\b(?!\.[a-z])|\brequired\b|\bno visa\b|\bvisa not needed\b|\beTA\b(?!\.[a-z])/i],   // (?!\.[a-z]): the word followed by ".gov" is a web address (evisa.gov.az, eta.gov.lk — the official site under its link, HQ #2486); a sentence that ENDS on the word ("…an e-Visa.") is still a verdict — the old (?!\.) let that through
  ['a processing time or a fee', /\bprocessing\b|\bworking days\b|\bbusiness days\b|\bfees?\b|\bcosts? \d/i],
  ["a data provider's name", /travel ?buddy|rapid ?api|sherpa|visadb|\biata\b|timatic|anthropic|\bclaude\b|openai|unsplash|supabase|sentry|getyourguide|tiqets|kkday|klook|viator|airalo|discovercars|aviasales|booking\.com|expedia/i],
  // THE KASHMIR RULE (founder #304, 25 Oct 2026): selectable everywhere a traveller searches or picks (the check's own list), NEVER promoted
  // — and a visa guide is promoted content. A copy of brimm-ai data/neverPromoted's names (this repo cannot import it); brimm-ai's
  // tools/visa-pages/build.js proves on every build that this copy refuses each of them.
  ['a Kashmir-region place (promoted content)', /\b(kashmir|srinagar|jammu|katra|vaishno devi|ladakh|pahalgam|gulmarg|sonamarg|leh|nubra valley|pangong tso)\b/i],
  ['a capital Brimm', /\bBrimm\b(?! Limited)/],
];
// THE ANSWER BOX ON A VISA ROUTE PAGE (founder, 27 Nov 2026 12:1x, HQ #692 = B — "dated visa answers ARE allowed on the visa route pages,
// only there"): on a page at visa/<country>-for-<nationality>-passport-holders-in-the-uae/ ONE box marked data-route-answer may carry the
// app's answer, and only while it says "Last confirmed <date>" and "check the official page before you book" (#366's words). The box is
// still read by every OTHER rule (a fee, a provider, Kashmir, a capital Brimm); only the verdict rule is lifted, inside the box. Anywhere
// else on that page — the title, the description, the tiles, the structured data — a verdict word is refused as on every guide.
const ROUTE_PAGE = /^visa\/[a-z0-9-]+-passport-holders-in-the-uae\/index\.html$/;
const ANSWER_BOX = /<section class="panel answer" data-route-answer>([\s\S]*?)<\/section>/g;
const ANSWER_DATED = /Last confirmed \d{1,2} [A-Z][a-z]{2} \d{4}/;
const ANSWER_ADVICE = 'check the official page before you book';
const EXEMPT_SLUG = 'visa-free-countries-for-uae-residents', EXEMPT_PAGE = `visa/${EXEMPT_SLUG}/index.html`, EXEMPT_TITLE = 'Visa-free countries for UAE residents';

const RULED = [
  'Travel insurance is required for all tourists',   // founder, 25 Oct 2026 09:20 (#2) and 10:30 (#306: the law's word): Georgia, no amount
  // founder, HQ #133, 2 Nov 2026 07:06 — the insurance line (Qatar for Indian passports, Saudi Arabia for any passport) and the profession
  // line (UAE, Qatar, Oman for any passport), each only where the rules data carries that condition, followed by the official link.
  // The insurance line's first sentence is also a tile title on its own (without its full stop), so that sentence is listed by itself.
  'Travel health insurance is required for this visit',
  'Easier entry depends on your profession. Check the official list to see if yours qualifies.',
];
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&#39;|&rsquo;/g, "'").replace(/&quot;/g, '"');
/** What a visitor or a crawler reads: text, meta content, alt/title/aria-label, ld+json — not CSS, not other scripts. */
function visible(html, exemptTitles) {
  let h = RULED.reduce((x, r) => x.split(r).join(''), html);
  // THE PHOTO CREDIT (founder, 29 Oct 2026 07:01: one style everywhere, "Name on Unsplash", as the app): the photo library's own
  // attribution, allowed ONLY as the hero's credit line — "<b>Place</b> · Name on Unsplash" in <p class="credit"> — and nowhere else on a
  // guide; the place and the name in it are still read by every rule.
  h = h.replace(/(<p class="credit"><b>[^<]*<\/b> · [^<]+?) on Unsplash<\/p>/g, '$1</p>');
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
  const r = rel.replace(/\\/g, '/'), bad = [];
  const boxes = [...html.matchAll(ANSWER_BOX)];
  if (boxes.length) {
    if (!ROUTE_PAGE.test(r)) bad.push(`${rel}: an answer box on a page that is not a visa route page`);
    else if (boxes.length > 1) bad.push(`${rel}: more than one answer box`);
    else {
      const inner = boxes[0][1];
      if (!ANSWER_DATED.test(inner)) bad.push(`${rel}: the answer box carries no "Last confirmed <date>"`);
      if (!inner.includes(ANSWER_ADVICE)) bad.push(`${rel}: the answer box does not say "${ANSWER_ADVICE}"`);
      // the box's own text, read by every rule but the verdict one
      const t = visible(inner, false);
      for (const line of t.split('\n')) for (const [what, re] of RULES.slice(1)) { const m = line.match(re); if (m) bad.push(`${rel}: ${what} (answer box) — "${line.trim().slice(0, 70)}"`); }
      html = html.replace(ANSWER_BOX, ' ');
    }
  }
  const v = visible(html, r === EXEMPT_PAGE);
  for (const line of v.split('\n')) for (const [what, re] of RULES) {
    const m = line.match(re); if (m) bad.push(`${rel}: ${what} — "${line.trim().slice(Math.max(0, m.index - 30), m.index + 40)}"`);
  }
  return bad;
}
module.exports = { check, RULED, RULES, EXEMPT_PAGE, EXEMPT_TITLE, EXEMPT_SLUG, ROUTE_PAGE };

if (require.main === module) {
  if (process.argv.includes('--self-test')) {
    const planted = ['<p>Georgia is visa-free for you</p>', '<p>Get a visa on arrival</p>', '<p>Apply for an e-Visa</p>', '<p>Apply for an e-Visa.</p>', '<p>You need an eTA.</p>', '<p>A visa is required</p>',
      '<meta name="description" content="No visa for UAE residents">', '<p>Processing takes 3 working days</p>', '<p>The fee is small</p>',
      '<p>Data from Travel Buddy</p>', '<p>Kashmir</p>', '<p>Brimm checks it</p>', '<img alt="eVisa portal">',
      '<script type="application/ld+json">{"name":"Thailand visa-free"}</script>', '<p>A visa is required for all visitors</p>', '<p>Travel insurance is required for all tourists. A visa is required too.</p>',
      '<p>Travel insurance is required for all visitors</p>',   // the 09:20 wording, replaced at 10:30 (#306) — no longer a ruled sentence
      '<p>Travel health insurance is required for this visit. A visa is required too.</p>', '<p>Travel health insurance is required for all visitors</p>',   // #133: only the ruled sentence passes
      '<p>Plan a week in Srinagar</p>', '<img alt="Pangong Tso at dawn">', '<p>Leh is the base</p>',   // promoted content: the Kashmir rule
      '<p>Photos from Unsplash</p>', '<p class="lead">Rules on Unsplash</p>', '<p class="credit"><b>Srinagar, India</b> · A Name on Unsplash</p>'];   // the credit allowance is the credit line only, and its place is still read
    const clean = ['<p>What decides your answer</p>', '<p class="credit"><b>Tbilisi, Georgia</b> · Anna Bannahyan on Unsplash</p>','<a href="https://www.evisa.gov.ge/GeoVisa/">Georgia’s official visa site ↗</a><span>evisa.gov.ge</span>', '<a href="https://eta.gov.lk/">Sri Lanka’s official visa site ↗</a><span>eta.gov.lk</span>',
      '<p>© 2026 Brimm Limited, UAE</p>', '<p class="ti">🩺 Travel insurance is required for all tourists</p>',
      '<p>Travel health insurance is required for this visit. Have proof ready — you may be asked for it.</p>', '<p class="ti">🩺 Travel health insurance is required for this visit</p>',
      '<li>Easier entry depends on your profession. Check the official list to see if yours qualifies.</li>', '<p>Lehigh Valley and Ashleigh Park</p>', '<style>.a{color:red}</style><p>Rules change. Always confirm with the official source before you book.</p>'];
    const missed = planted.filter(h => !check(h, 'visa/x/index.html').length);
    const flagged = clean.filter(h => check(h, 'visa/x/index.html').length);
    // the exemption: the founder's search title passes on its own page and nowhere else, and the rest of that page is still checked
    const title = '<title>Visa-free countries for UAE residents | brimm</title><h1>Visa-free countries for UAE residents</h1><meta property="og:url" content="https://brimm.ai/visa/visa-free-countries-for-uae-residents/">';
    const exemptOk = !check(title, EXEMPT_PAGE).length && check(title, 'visa/georgia-for-uae-residents/index.html').length > 0
      && check(title + '<p>Thailand is visa-free</p>', EXEMPT_PAGE).length > 0;
    // the route answer box (#692 = B): passes dated + advised on a route page; refused undated, unadvised, twice, on another page, with a
    // verdict outside it, or with another rule's fault inside it
    const RP = 'visa/thailand-for-pakistani-passport-holders-in-the-uae/index.html';
    const box = (inner) => `<section class="panel answer" data-route-answer>${inner}</section>`;
    const good = box('<span class="vpill">e-Visa</span><p class="vline">Apply online before you travel</p><p class="dated"><b>Last confirmed 23 Nov 2026</b> · <a href="https://www.thaievisa.go.th/">check the official page before you book</a></p>');
    const routeOk = !check(good, RP).length
      && check(box('<span>e-Visa</span><p>check the official page before you book</p>'), RP).length > 0
      && check(box('<span>e-Visa</span><p>Last confirmed 23 Nov 2026</p>'), RP).length > 0
      && check(good + good, RP).length > 0
      && check(good, 'visa/thailand-for-uae-residents/index.html').length > 0
      && check(good + '<p>Thailand is visa-free</p>', RP).length > 0
      && check('<meta name="description" content="Thailand visa-free for Pakistanis">' + good, RP).length > 0
      && check(box('<span>e-Visa</span><p>The fee is small. Last confirmed 23 Nov 2026 · check the official page before you book</p>'), RP).length > 0;
    if (missed.length || flagged.length || !exemptOk || !routeOk) { console.error('no-verdicts self-test FAILED — missed:', missed, 'flagged clean:', flagged, 'exemption ok:', exemptOk, 'route box ok:', routeOk); process.exit(1); }
    console.log(`no-verdicts self-test: all ${planted.length} planted cases refused, ${clean.length} clean texts pass, the one title exemption holds only on its page, the route answer box passes only dated and advised on a route page`);
    process.exit(0);
  }
  const dir = path.join(root, 'visa');
  const pages = fs.existsSync(dir) ? fs.readdirSync(dir).filter(d => fs.existsSync(path.join(dir, d, 'index.html'))).map(d => `visa/${d}/index.html`) : [];
  // the event pages carry the same rule (UAE National Day 2026, HQ #878, 9 Nov 2026: each place opens the live check, no verdict written)
  const events = ['uae-national-day-2026/index.html']
    .filter(p => fs.existsSync(path.join(root, p)));
  const bad = pages.concat(events).flatMap(p => check(fs.readFileSync(path.join(root, p), 'utf8'), p));
  if (bad.length) { console.error(`no-verdicts: ${bad.length} fault(s) on the visa guide and event pages — the answer only ever comes from the live check:\n  ${bad.join('\n  ')}`); process.exit(1); }
  console.log(`no-verdicts: ${pages.length} visa guide page(s) and ${events.length} event page(s) read, no verdict written`);
}
