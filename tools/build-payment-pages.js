#!/usr/bin/env node
// tools/build-payment-pages.js — DRAFT pages for the payment-provider applications (founder, 11 Nov 2026: "before tomorrow's payment
// applications (Paddle and Razorpay, so Indian users can pay by UPI Autopay, RuPay and cards) ... draft what is missing ... nothing goes live
// without my OK"). Writes /pricing.html, /refunds.html, /about.html and /contact.html from terms.html's own shell (its head, styles, header
// and footer), so the four look like the site's other legal pages; tools/site-chrome.js then stamps the shared header and footer.
// THE FOUNDER'S DECISIONS ARE PLACEHOLDERS, NEVER GUESSES: every web price, refund window, timeline, the payment partner's name, an address
// and a phone number are written as <span class="ph">[FOUNDER: ...]</span> — gold, dashed, impossible to miss — and nothing ships while one
// is left (see the check at the end). Store purchases are described as the stores actually work; no price is typed (tools/no-prices.js).
//   node tools/build-payment-pages.js && node tools/site-chrome.js && node tools/stamp-assets.js
//   node tools/build-payment-pages.js --placeholders     list every placeholder still open, exit 1 if any
'use strict';
const fs = require('fs'), path = require('path');
const SITE = path.join(__dirname, '..');
const PAGES = ['pricing.html', 'refunds.html', 'about.html', 'contact.html', 'terms.html', 'privacy.html'];
if (process.argv.includes('--placeholders')) {
  const open = PAGES.flatMap(f => { const p = path.join(SITE, f); if (!fs.existsSync(p)) return [];
    return [...fs.readFileSync(p, 'utf8').matchAll(/<span class="ph">\[FOUNDER: ([^\]]*)\]<\/span>/g)].map(m => `${f}: ${m[1]}`); });
  if (open.length) { console.error(`${open.length} founder placeholder(s) still open:\n  ${open.join('\n  ')}`); process.exit(1); }
  console.log('no founder placeholders left'); process.exit(0);
}
const T = fs.readFileSync(path.join(SITE, 'terms.html'), 'utf8').replace(/\r\n/g, '\n');
const ph = (s) => `<span class="ph">[FOUNDER: ${s}]</span>`;
const PH_CSS = `  /* a decision the founder has not made yet (draft only: tools/build-payment-pages.js --placeholders refuses a page that still has one) */
  .ph{color:#FAC775;background:rgba(250,199,117,.08);border:1px dashed rgba(250,199,117,.55);border-radius:6px;padding:1px 6px;font-weight:600}
  .plans{display:grid;gap:14px;margin:6px 0 26px;align-items:start}
  .plan{border:1px solid var(--line);border-radius:18px;padding:18px 20px;background:linear-gradient(180deg,rgba(255,255,255,.05),rgba(255,255,255,.02))}
  .plan h2{margin:0 0 4px!important}
  .plan .sub{color:var(--mute);font-size:14px;margin-bottom:10px}
  .plan.pro{border-color:rgba(126,200,200,.35)}
  @media(min-width:700px){.plans{grid-template-columns:1fr 1fr}}
</style>`;
function page(file, title, desc, h1, updated, body) {
  let h = T;
  const once = (a, b) => { if (h.split(a).length !== 2) throw new Error(`${file}: expected one ${a.slice(0, 40)}`); h = h.replace(a, () => b); };
  once(/<title>[^<]*<\/title>/.exec(h)[0], `<title>${title} — brimm</title>`);
  once(/<meta name="description" content="[^"]*">/.exec(h)[0], `<meta name="description" content="${desc}">`);
  once('<link rel="canonical" href="https://brimm.ai/terms.html">', `<link rel="canonical" href="https://brimm.ai/${file}">`);
  once('</style>', PH_CSS);
  const a = h.indexOf('<div class="doc-head">'), z = h.indexOf('    </div>\n  </div>\n  <!-- SITE-FOOT:START');
  if (a < 0 || z < 0) throw new Error(`${file}: terms.html shell changed`);
  h = h.slice(0, a) + `<div class="doc-head"><h1>${h1}</h1><div class="updated">${updated}</div></div>\n\n${body.trim()}\n` + h.slice(z);
  fs.writeFileSync(path.join(SITE, file), h);
}
const DRAFT = `Draft, not published · ${ph('date it goes live')}`;

page('pricing.html', 'Pricing', 'brimm plans: Free to start, and brimm Pro monthly or yearly. In the app the price shows in your local currency, set by Google Play or the App Store.', 'Pricing', DRAFT, `
<p>brimm is an AI trip planner app. It checks the visa for your passport, where you live and the visas you hold, then plans each day of your trip with rough costs in your currency. It has two plans: you start on Free, with no card; brimm Pro is for when you plan more.</p>
<div class="plans">
<div class="plan"><h2>Free</h2><p class="sub">Free to start. No card.</p><ul>
<li>1 trip plan, visa-checked, and 1 rebuild</li>
<li>10 AI messages on that trip</li>
<li>10 messages to brimm AI</li>
<li>Always free: visa checks, booking links, the share card, editing your trip</li></ul></div>
<div class="plan pro"><h2>brimm Pro</h2><p class="sub">Monthly or yearly</p><ul>
<li>No counters in your way — fair use applies</li>
<li>Start a new chat whenever you like</li>
<li>A plain purchase — no free trial that turns into a charge, easy to cancel</li></ul></div>
</div>
<h2>What Pro costs</h2>
<h3>In the app</h3>
<p>Your price shows in your local currency in the app, set by Google Play or the App Store, before you pay. You see the monthly and the yearly price side by side and choose one.</p>
<h3>On brimm.ai</h3>
<p>${ph('web prices: monthly and yearly, the currency (for example INR for India), and whether taxes are included')}</p>
<p>${ph('is Pro on sale now, or "coming soon" on the day this page goes live')}</p>
<h2>How you get Pro</h2>
<p>brimm Pro is a digital subscription. It switches on in your brimm account as soon as the payment goes through. Nothing is shipped.</p>
<h2>Renewal and cancelling</h2>
<p>Pro renews automatically at the end of each month or year until you cancel. You can cancel at any time; you keep Pro until the end of the period you have paid for. How to cancel, and how refunds work, is on our <a href="/refunds.html">Refunds &amp; cancellation</a> page.</p>
<p>No ads, no sponsored places.</p>
<p>Questions about pricing: <a href="mailto:support@brimm.ai">support@brimm.ai</a></p>
`);

page('refunds.html', 'Refunds & cancellation', 'How to cancel brimm Pro and how refunds work, for purchases in the app (Google Play, App Store) and on brimm.ai.', 'Refunds &amp; cancellation', DRAFT, `
<p>This page explains how to cancel brimm Pro and how to ask for a refund. Who refunds you depends on where you paid.</p>
<h2>1. The Free plan</h2>
<p>The Free plan never charges you. There is nothing to cancel.</p>
<h2>2. Pro bought in the app (Google Play or the App Store)</h2>
<p>Google Play or the App Store takes the payment, and refunds for these purchases follow the store's own rules. To ask for one:</p>
<ul>
<li><strong>Google Play:</strong> ask for a refund from your Google Play order history, or follow Google Play's help page <a href="https://support.google.com/googleplay/answer/2479637" rel="noopener">Request a refund on Google Play</a>.</li>
<li><strong>App Store:</strong> ask for a refund at <a href="https://reportaproblem.apple.com" rel="noopener">reportaproblem.apple.com</a>.</li>
</ul>
<h3>Cancelling a store subscription</h3>
<ul>
<li><strong>Android:</strong> open the Google Play app, tap your profile, then Payments &amp; subscriptions, then Subscriptions, and cancel brimm Pro.</li>
<li><strong>iPhone:</strong> open Settings, tap your name, then Subscriptions, and cancel brimm Pro.</li>
</ul>
<p>When you cancel, Pro stays on until the end of the period you have already paid for, and it does not renew.</p>
<p><strong>Deleting your brimm account does not cancel a subscription.</strong> Cancel it in Google Play or the App Store first, or you may continue to be charged.</p>
<h2>3. Pro bought on brimm.ai</h2>
<p>Payments on brimm.ai are taken by ${ph('our payment partner\'s name')}. ${ph('who is the seller on your receipt: the payment partner, if it resells Pro to you as merchant of record, or Brimm Limited, if the partner only takes the payment')}</p>
<p>brimm Pro is a digital subscription: it switches on in your brimm account as soon as the payment goes through, and nothing is shipped.</p>
<ul>
<li><strong>Refunds:</strong> ${ph('the refund rule — for example: a full refund if you ask within N days of your first payment')}</li>
<li><strong>Renewals:</strong> ${ph('the rule for a renewal you did not mean to keep')}</li>
<li><strong>How to ask:</strong> email <a href="mailto:support@brimm.ai">support@brimm.ai</a> from the email address on your receipt, with your order number.</li>
<li><strong>How long it takes:</strong> we reply within ${ph('N')} working days. An approved refund goes back to the card, UPI account or bank you paid with, within ${ph('N')} working days.</li>
<li><strong>Cancelling:</strong> ${ph('how a web subscription is cancelled — for example the link in the receipt email')}. Pro stays on until the end of the period you have paid for, and it does not renew.</li>
<li><strong>UPI Autopay:</strong> you can also stop a UPI Autopay mandate in your UPI app. ${ph('keep this line only if the payment partner offers UPI Autopay')}</li>
</ul>
<p>brimm is run by Brimm Limited, United Arab Emirates.</p>
`);

page('about.html', 'About brimm', 'brimm is an AI trip planner with visa checks for your passport, made by Brimm Limited, United Arab Emirates.', 'About brimm', DRAFT, `
<p>brimm is an AI trip planner. Tell it where you want to go: it checks the visa for your passport, where you live and the visas you already hold, then plans each day with rough costs in your own currency.</p>
<h2>What brimm does</h2>
<ul>
<li>Visa checks for your passport, where you live and the visas you hold, with a link to the official site.</li>
<li>Day-by-day trip plans that you can edit, with rough costs in your currency.</li>
<li>A share card and a PDF of your trip.</li>
</ul>
<p>Rules change, so we always ask you to check the official site before you book.</p>
<h2>Who we are</h2>
<p>brimm is made by <strong>Brimm Limited</strong>, a company in the United Arab Emirates.</p>
<p>${ph('company registration or trade licence number, if you want it shown')}</p>
<p>${ph('where the app is on the day this goes live — for example "coming soon to Google Play and the App Store" or "on Google Play"')} Contact us at <a href="mailto:support@brimm.ai">support@brimm.ai</a>.</p>
`);

page('contact.html', 'Contact us', 'How to contact brimm and Brimm Limited: email support for the app, your account, payments and refunds.', 'Contact us', DRAFT, `
<p>We are glad to help with the app, your account, a payment, a refund or a privacy request.</p>
<h2>Email</h2>
<p><a href="mailto:support@brimm.ai">support@brimm.ai</a> — we reply within ${ph('N')} working days.</p>
<h2>Company</h2>
<p><strong>Brimm Limited</strong>, United Arab Emirates</p>
<p>${ph('registered business address')}</p>
<p>${ph('business phone number, if you want one shown')}</p>
<h2>Also useful</h2>
<ul>
<li><a href="/refunds.html">Refunds &amp; cancellation</a></li>
<li><a href="/delete-account.html">Delete your account</a></li>
<li><a href="/privacy.html">Privacy Policy</a> and <a href="/terms.html">Terms of Service</a></li>
</ul>
`);
console.log('written: pricing.html, refunds.html, about.html, contact.html (drafts; founder placeholders marked)');
