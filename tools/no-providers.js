#!/usr/bin/env node
// tools/no-providers.js — NO PROVIDER NAME A VISITOR CAN REACH (founder, 28 Oct 2026 23:27: "a visitor can't reach any key or provider
// name"). Reads EVERY tracked text file as it is served — page source, scripts, data, comments included, since a visitor can open any of
// them — and fails on the name or address of a company that works for brimm: the visa data vendor, the AI service, crash reporting, the
// booking partners and their network. Run by .githooks/pre-commit; exit 1 names each file and match.
// Found the night it was written: assets/check-engine.js (the app's engine, bundled by brimm-ai tools/website-check/build-engine.js)
// carried the app's source comments, which named the vendor, a partner and internal files; it is now published with comments removed,
// and this keeps a rebuild from bringing them back.
// ALLOWED, each for a stated reason:
//   · "on Unsplash" in a photo credit — the photo library's own attribution rule, ruled by the founder (2 Oct 2026); nothing else may
//     name it;
//   · the database host in the check's server address and the engine's module names — the page must call that address, so the host is
//     visible in any browser's network tab whatever this file says;
//   · OPEN, FOUNDER QUESTION (28 Oct 2026): the vendor's own link addresses used as KEYS of the engine's apply-link table (each maps the
//     vendor's redirect to the government site the page shows). They exist because the server door hands the page the vendor's raw answer;
//     removing them means the server resolves the link before answering — an app-repo change. Allowed in assets/check-engine.js only,
//     and only in that exact key shape, so a new appearance anywhere else still fails.
//   node tools/no-providers.js               check the working tree
//   node tools/no-providers.js --self-test   prove it fails on planted names and passes the allowed shapes (the control)
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const root = path.join(__dirname, '..');

const NAMES = /travel[\s_-]?buddy|rapidapi|visa-requirement\.p|anthropic|\bclaude\b|openai|\bsentry\b|getyourguide|airalo|aviasales|discover\s?cars|tiqets|kkday|getrentacar|travelpayouts|viator|klook|expedia|hotels\.com|yesim|trip\.com|revenuecat|healthchecks\.io|unsplash|supabase/gi;
const ALLOWED = [
  { why: 'photo credit', re: /\bon Unsplash\b/g },
  { why: 'the database host the check calls', re: /https:\/\/oejnnujlcmtzlkyifzag\.supabase\.co\/functions\/v1\/api-proxy/g },
  // the anonymous tap counter's door (PD #2866): the beacon must call that address, visible in any network tab; only in the store file
  { why: 'the database host the tap counter calls', re: /https:\/\/oejnnujlcmtzlkyifzag\.supabase\.co\/functions\/v1\/download-count/g, only: 'assets/stores.js' },
  { why: 'the database host, inside the bundled engine (its module and setting names)', re: /supabase/gi, only: 'assets/check-engine.js' },
  { why: 'open founder question: apply-link table keys', re: /"https:\/\/link\.travel-buddy\.ai\/\?link=[0-9A-Za-z]+"(?=:)/g, only: 'assets/check-engine.js' },
  // THE LINK-IN-BIO PAGE IS THE ONE PAGE ALLOWED TO NAME PARTNERS (founder, #670 via PD #2323, 23 Nov 2026): every partner whose link
  // pays us, as a tile. Allowed ONLY as a whole tile link — this exact element shape, a partner's own host (or the network's tracked
  // redirect host), a partner's name as its words — on go/index.html. A partner named in a comment, a label, any other element or any
  // other page still fails, and so does every name that is not a booking partner (the vendor, the AI service, crash reporting).
  { why: 'link-in-bio partner tiles (#670, PD #2323)', only: 'go/index.html',
    re: /<a class="tile" href="https:\/\/(?:www\.)?(?:agoda\.com|expedia\.com|hotels\.com|getyourguide\.com|affiliate\.klook\.com|tp\.media|discovercars\.com)\/[^"\s<>]*" target="_blank" rel="noopener sponsored">(?:Agoda|Expedia|Hotels\.com|GetYourGuide|Klook|Tiqets|DiscoverCars|GetRentacar|Aviasales|Airalo)<\/a>/g },
];
const TEXT = /\.(html?|js|json|xml|txt|css|svg|md)$/i;

function scanText(f, raw) {
  let t = raw;
  for (const a of ALLOWED) if (!a.only || a.only === f) t = t.replace(a.re, ' ');
  const bad = [];
  for (const m of t.matchAll(NAMES)) bad.push(`${f}: "${t.slice(Math.max(0, m.index - 30), m.index + 40).replace(/\s+/g, ' ')}"`);
  return bad;
}
function scan(files) {
  return files.flatMap(f => scanText(f, fs.readFileSync(path.join(root, f), 'utf8')));
}

if (process.argv.includes('--self-test')) {
  const planted = [
    ['index.html', '<!-- the vendor is Travel Buddy -->'], ['assets/x.js', '// see docs/visa/travel-buddy-v2.md'],
    ['assets/check-engine.js', 'const u = "https://link.travel-buddy.ai/?link=1E2T1";'],   // the vendor address NOT as a table key
    ['check.html', 'Photos from Unsplash'], ['assets/x.js', 'Sentry.init()'], ['index.html', 'Book with GetYourGuide'],
    ['privacy.html', 'built with Claude'],
    ['go/index.html', '<!-- tours by GetYourGuide -->'], ['go/index.html', '<!-- the network is Travelpayouts -->'],
    ['index.html', '<a class="tile" href="https://www.discovercars.com/?a_aid=brimmai" target="_blank" rel="noopener sponsored">DiscoverCars</a>'],
    ['go/index.html', '<a class="tile" href="https://openai.com/" target="_blank" rel="noopener sponsored">Airalo</a>'],
    ['go/index.html', '<span class="gl">Klook</span>'], ['go/index.html', '<a class="tile" href="https://www.agoda.com/" target="_blank" rel="noopener sponsored">built with Claude</a>'],
  ];
  const clean = [
    ['index.html', 'Petra, Jordan · Photo: Emile Guillemot on Unsplash'], ['check.html', "url: 'https://oejnnujlcmtzlkyifzag.supabase.co/functions/v1/api-proxy'"],
    ['assets/check-engine.js', '{"https://link.travel-buddy.ai/?link=2E12T1":"https://icp.gov.ae/en"}'], ['assets/check-engine.js', 'const supabase_1=require("./supabase");'],
    ['go/index.html', '<a class="tile" href="https://www.discovercars.com/?a_aid=brimmai" target="_blank" rel="noopener sponsored">DiscoverCars</a>'],
    ['go/index.html', '<a class="tile" href="https://tp.media/r?marker=748081&amp;p=8310&amp;u=https%3A%2F%2Fwww.airalo.com%2F&amp;campaign_id=541" target="_blank" rel="noopener sponsored">Airalo</a>'],
    ['go/index.html', '<a class="tile" href="https://www.hotels.com/affiliate?landingPage=https%3A%2F%2Fwww.hotels.com%2F&amp;camref=1101l6uQQL" target="_blank" rel="noopener sponsored">Hotels.com</a>'],
  ];
  const missed = planted.filter(([f, s]) => !scanText(f, s).length), wrong = clean.filter(([f, s]) => scanText(f, s).length);
  if (missed.length || wrong.length) { console.error('no-providers self-test FAILED', { missed, wrong }); process.exit(1); }
  console.log(`no-providers self-test: all ${planted.length} planted names refused, ${clean.length} allowed shapes pass`);
  process.exit(0);
}
// What GitHub Pages serves: every tracked file except what _config.yml excludes (the tooling) — read from that file, never retyped.
const cfg = fs.readFileSync(path.join(root, '_config.yml'), 'utf8');
const EXCLUDED = [...cfg.matchAll(/^\s+-\s+(\S+)/gm)].map(m => m[1]);
if (!EXCLUDED.includes('tools')) { console.error('no-providers: _config.yml no longer excludes tools/ — the guards themselves would be served'); process.exit(1); }
const served = (f) => f !== '_config.yml' && !EXCLUDED.some(x => f === x || f.startsWith(x + '/'));
const files = execSync('git ls-files', { cwd: root, encoding: 'utf8' }).split('\n').filter(f => TEXT.test(f) && served(f));
const bad = scan(files);
if (bad.length) { console.error(`no-providers: ${bad.length} provider name(s) a visitor can reach:\n  ` + bad.slice(0, 40).join('\n  ')); process.exit(1); }
console.log(`no-providers: ${files.length} files read, no provider name a visitor can reach`);
