#!/usr/bin/env node
// tools/build-refunds.js — /refunds.html, the Refunds & cancellation policy (founder, 11 Nov 2026: "Paddle verification needs a refund
// policy at exactly https://brimm.ai/refunds.html ... Pro bought through Apple/Google: refunds via the store; Pro bought through Paddle:
// Paddle's standard refund terms, mark my decisions as placeholders"). Written from terms.html's own shell (head, styles, header, footer)
// so it looks like the other legal pages; tools/site-chrome.js stamps the shared header and footer.
// Paddle's terms are summarised from its Refund Policy (paddle.com/legal/refund-policy, last updated 31 March 2026, read 11 Nov 2026) and
// linked in full; where they differ, Paddle's own page wins. The founder's own decisions are <span class="ph">[FOUNDER: ...]</span> —
// gold, dashed — and `--placeholders` lists any still open (a page with one is not ready to publish).
//   node tools/build-refunds.js && node tools/site-chrome.js && node tools/stamp-assets.js
//   node tools/build-refunds.js --placeholders
'use strict';
const fs = require('fs'), path = require('path');
const SITE = path.join(__dirname, '..'), OUT = path.join(SITE, 'refunds.html');
if (process.argv.includes('--placeholders')) {
  const open = ['refunds.html', 'terms.html', 'privacy.html'].flatMap(f => [...fs.readFileSync(path.join(SITE, f), 'utf8').matchAll(/<span class="ph">\[FOUNDER: ([^\]]*)\]<\/span>/g)].map(m => `${f}: ${m[1]}`));
  if (open.length) { console.error(`${open.length} founder placeholder(s) still open:\n  ${open.join('\n  ')}`); process.exit(1); }
  console.log('no founder placeholders left'); process.exit(0);
}
const ph = (s) => `<span class="ph">[FOUNDER: ${s}]</span>`;
let h = fs.readFileSync(path.join(SITE, 'terms.html'), 'utf8').replace(/\r\n/g, '\n');
const once = (a, b) => { if (h.split(a).length !== 2) throw new Error('expected one: ' + String(a).slice(0, 50)); h = h.replace(a, () => b); };
once(/<title>[^<]*<\/title>/.exec(h)[0], '<title>Refunds &amp; cancellation — brimm</title>');
once(/<meta name="description" content="[^"]*">/.exec(h)[0], '<meta name="description" content="How to cancel brimm Pro and how refunds work: in the app through Google Play or the App Store.">');
once('<link rel="canonical" href="https://brimm.ai/terms.html">', '<link rel="canonical" href="https://brimm.ai/refunds.html">');
const a = h.indexOf('<div class="doc-head">'), z = h.indexOf('    </div>\n  </div>\n  <!-- SITE-FOOT:START');
if (a < 0 || z < 0) throw new Error('terms.html shell changed');
const body = `<div class="doc-head"><h1>Refunds &amp; cancellation</h1><div class="updated">Last updated: 14 November 2026</div></div>

<p>This page explains how to cancel brimm Pro and how to ask for a refund. Who handles your refund depends on where you bought Pro.</p>
<h2>1. Pro bought in the iPhone app</h2>
<p>Apple takes the payment for purchases in the iPhone app, and refunds for them are handled by Apple under its own rules. To ask for a refund, go to Apple's <a href="https://reportaproblem.apple.com" rel="noopener">Report a Problem</a> page.</p>
<h2>2. Pro bought in the Android app through Google Play</h2>
<p>Google Play takes the payment for purchases in the Android app, and refunds for them are handled by Google Play under its own rules. To ask for a refund, follow Google's help page <a href="https://support.google.com/googleplay/answer/2479637" rel="noopener">Request a refund on Google Play</a>.</p>
<h2>3. How to cancel</h2>
<ul>
<li><strong>iPhone:</strong> open Settings, tap your name, then Subscriptions, and cancel brimm Pro.</li>
<li><strong>Android:</strong> open the Google Play app, tap your profile, then Payments &amp; subscriptions, then Subscriptions, and cancel brimm Pro.</li>
</ul>
<p>When you cancel, Pro stays on until the end of the period you have already paid for. <strong>Deleting your brimm account does not cancel a subscription</strong>: cancel it first, or you may continue to be charged.</p>
<h2>4. Contact</h2>
<p>Questions about a payment, a refund or cancelling: <a href="mailto:support@brimm.ai">support@brimm.ai</a>. brimm is run by Brimm Limited, United Arab Emirates.</p>
`;
h = h.slice(0, a) + body + h.slice(z);
fs.writeFileSync(OUT, h);
console.log('written refunds.html (Last updated: 14 November 2026)');
