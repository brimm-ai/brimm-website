#!/usr/bin/env node
// tools/check-switch.js — THE VISA ANSWER DOES NOT GO ON WITHOUT THE HIDDEN-LINKS LIST (founder #487 → A, 1 Nov 2026: a visa link the
// weekly watch found broken is hidden "until the watch finds a working page"). The app reads that list (visaLinksDown) from the server's
// launch answer; this site never asks for that answer, so on the site the list would be empty and the hidden links would show again.
// While the answer is OFF (assets/stores.js BRIMM_CHECK) no visitor sees any link, so nothing is wrong yet; this guard makes switching it ON
// impossible until check.html hands the server's list to the engine (rememberVisaLinksDown, services/visaLinksDown in brimm-ai, exported by
// tools/website-check/engine-entry.ts) and the served engine carries it. The server half — the web-check answer carrying the same list — is
// the app tab's, at switch-on. Run by .githooks/pre-commit; exit 1 names what is missing.
//   node tools/check-switch.js              check the working tree
//   node tools/check-switch.js --self-test  prove it refuses the planted cases and passes the clean ones (the control)
// ⚠️ WHAT IT CANNOT SEE: whether the server really sends the list, or whether check.html passes the RIGHT value — it checks that the call
// exists, not what it is given. That is read and tested at switch-on (docs/launch/2026-10-29-check-answer-on-plan.md in brimm-ai).
'use strict';
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

const isOn = stores => /window\.BRIMM_CHECK\s*=\s*\{\s*on\s*:\s*true\b/.test(stores);
const pageHands = page => /\.rememberVisaLinksDown\s*\(/.test(page);
// Asked of the LOADED engine, never of its text: the bundle carries services/visaLinksDown's own `exports.rememberVisaLinksDown` as an
// inner module whether or not the page can reach it, so a text match passed on 1 Nov while window.brimmCheck had no such function.
const engineHas = engine => {
  try {
    const store = {}, win = { localStorage: { getItem: k => store[k] ?? null, setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } } };
    require('vm').runInNewContext(engine, { window: win, console: { log() {}, warn() {}, error() {} }, setTimeout, clearTimeout, URL });
    return typeof (win.brimmCheck && win.brimmCheck.rememberVisaLinksDown) === 'function';
  } catch { return false; }
};

function verdict({ stores, page, engine }) {
  if (!isOn(stores)) return [];
  const missing = [];
  if (!pageHands(page)) missing.push('check.html never hands the server\'s hidden-links list to the engine (E.rememberVisaLinksDown(...))');
  if (!engineHas(engine)) missing.push('assets/check-engine.js does not carry rememberVisaLinksDown (export it from brimm-ai tools/website-check/engine-entry.ts and rebuild)');
  return missing;
}

if (process.argv.includes('--self-test')) {
  const OFF = 'window.BRIMM_CHECK = { on: false };', ON = 'window.BRIMM_CHECK = { on: true };';
  const CALL = 'const E = await loadEngine(); E.rememberVisaLinksDown(j.visaLinksDown);', NOCALL = 'const E = await loadEngine();';
  // engines as the page sees them: window.brimmCheck with or without the setter; NOENG_INNER is the 1 Nov shape — the word is in the
  // bundle (an inner module exports it) but window.brimmCheck does not carry it
  const ENG = 'window.brimmCheck = { webAnswer() {}, rememberVisaLinksDown() {} };', NOENG = 'window.brimmCheck = { webAnswer() {} };';
  const NOENG_INNER = 'var inner = { exports: {} }; inner.exports.rememberVisaLinksDown = function () {}; window.brimmCheck = { webAnswer() {} };';
  const refused = [{ stores: ON, page: NOCALL, engine: ENG }, { stores: ON, page: CALL, engine: NOENG }, { stores: ON, page: NOCALL, engine: NOENG },
    { stores: 'window.BRIMM_CHECK={on:true}', page: NOCALL, engine: ENG }, { stores: ON, page: CALL, engine: NOENG_INNER }];
  const passed = [{ stores: OFF, page: NOCALL, engine: NOENG }, { stores: ON, page: CALL, engine: ENG }];
  const miss = refused.filter(c => verdict(c).length === 0), wrong = passed.filter(c => verdict(c).length > 0);
  if (miss.length || wrong.length) { console.error('check-switch self-test FAILED — passed a planted case:', miss, 'refused a clean one:', wrong); process.exit(1); }
  console.log(`check-switch self-test: all ${refused.length} planted cases refused, ${passed.length} clean cases pass`);
  process.exit(0);
}
const read = f => { try { return fs.readFileSync(path.join(root, f), 'utf8'); } catch { return ''; } };
const files = { stores: read('assets/stores.js'), page: read('check.html'), engine: read('assets/check-engine.js') };
if (!files.stores) { console.error('check-switch: assets/stores.js not found'); process.exit(1); }
const missing = verdict(files);
if (missing.length) { console.error(`check-switch: the visa answer is switched ON but the hidden-links list (#487) is not wired:\n  ${missing.join('\n  ')}`); process.exit(1); }
console.log(isOn(files.stores) ? 'check-switch: answer ON and the hidden-links list is wired' : 'check-switch: answer OFF — the hidden-links list is required before it goes on');
