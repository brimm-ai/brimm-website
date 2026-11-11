#!/usr/bin/env node
// tools/build-pro.js — /pro, the web checkout for brimm Pro (founder ruling via PD #1072 + #1073, 11 Nov 2026: "allow WEBSITE PAYMENTS
// (Paddle checkout on brimm.ai) ... the SAME prices as the stores everywhere ... Default payment link = https://brimm.ai/pro"). DRAFT on a
// branch: written noindex and outside the sitemap until the founder approves the mock and the live keys exist.
// THE FLOW: (1) the email of the visitor's brimm account → (2) Monthly or Yearly, each price FROM PADDLE (Paddle.PricePreview, the visitor's
// own currency; nothing typed here - tools/no-prices.js) → (3) Paddle's overlay checkout → (4) "Pro is on" with the same email.
// ⚠️ OPEN, NOT DECIDED HERE: how a payment is tied to the right brimm account (App build proposes; #1072). Until then the email rides as
// customData.brimm_email and Paddle's own customer email - an assumption, named.
// KEYS: only Paddle's CLIENT-SIDE token belongs on a web page (public by design, test_ for sandbox, live_ for production). Empty = the page
// says plainly that payments are not open yet; it never pretends. The SECRET API key never comes near this repo.
//   node tools/build-pro.js && node tools/site-chrome.js && node tools/stamp-assets.js
'use strict';
const fs = require('fs'), path = require('path');
const SITE = path.join(__dirname, '..');
const CONFIG = {
  env: 'sandbox',                                      // 'sandbox' until the live account is verified (PD #1073), then 'production'
  token: '',                                           // the founder's client-side token (test_… / live_…) - not given yet
  monthly: 'pri_01m75zns308e2x2y6qw4dedcqv',           // brimm Pro Monthly (sandbox; PD #1073)
  yearly: 'pri_01m75zq119a0v22x32qybnpw61',            // brimm Pro Yearly (sandbox; PD #1073)
  launchDiscount: '',                                  // "Launch offer: 90% off the first month" - its dsc_… id (monthly only); not given yet
};
let h = fs.readFileSync(path.join(SITE, 'terms.html'), 'utf8').replace(/\r\n/g, '\n');
const once = (a, b) => { if (h.split(a).length !== 2) throw new Error('expected one: ' + String(a).slice(0, 50)); h = h.replace(a, () => b); };
once(/<title>[^<]*<\/title>/.exec(h)[0], '<title>Get brimm Pro — brimm</title>');
once(/<meta name="description" content="[^"]*">/.exec(h)[0], '<meta name="description" content="Get brimm Pro, monthly or yearly, in your own currency. Payments are taken by Paddle, our reseller and merchant of record.">');
once('<link rel="canonical" href="https://brimm.ai/terms.html">', '<meta name="robots" content="noindex">');   // DRAFT: no canonical, not in the sitemap
once('</style>', `  /* /pro, the web checkout (tools/build-pro.js) */
  .step{border:1px solid var(--line);border-radius:18px;padding:18px 20px;margin:0 0 14px;background:linear-gradient(180deg,rgba(255,255,255,.05),rgba(255,255,255,.02))}
  .step h2{margin:0 0 6px!important;font-size:19px!important}
  .step .num{display:inline-block;width:24px;height:24px;border-radius:50%;background:rgba(126,200,200,.18);color:var(--teal);font-size:13px;font-weight:800;text-align:center;line-height:24px;margin-right:8px}
  .field{width:100%;height:50px;border-radius:14px;background:#0E1424;border:1px solid rgba(255,255,255,.14);color:var(--ink);font:inherit;font-size:16px;padding:0 14px;margin-top:6px}
  .field:focus{outline:none;border-color:var(--teal)}
  .opts{display:grid;gap:10px;margin-top:8px}
  .opt{display:flex;flex-direction:column;align-items:flex-start;gap:6px;border:1px solid rgba(255,255,255,.14);border-radius:14px;padding:14px 16px;cursor:pointer;background:rgba(255,255,255,.03);color:var(--ink);font:inherit;text-align:left;width:100%}
  .opt[aria-pressed=true]{border-color:var(--teal);background:rgba(126,200,200,.10)}
  .opt b{font-size:16px}.opt small{display:block;color:var(--mute);font-size:13px;margin-top:2px}
  .opt .price{font-weight:800;font-size:16px;white-space:nowrap}
  .offer{color:#FAC775;font-weight:700}
  .pay{display:block;width:100%;height:54px;border:0;border-radius:999px;margin-top:6px;background:linear-gradient(100deg,#357D7D,#7C52F8);color:#fff;font:inherit;font-size:16.5px;font-weight:800;cursor:pointer}
  .pay[disabled]{opacity:.45;cursor:not-allowed}
  .note{font-size:13px;color:var(--mute);margin-top:10px}
  .msg{border-radius:14px;padding:12px 14px;background:rgba(250,199,117,.08);border:1px solid rgba(250,199,117,.35);color:#F3DDA4;font-size:14px;margin:0 0 14px}
  .done{text-align:center;padding:26px 20px}
  .done .big{font-size:40px;line-height:1}
@media(min-width:700px){.opts{grid-template-columns:1fr 1fr}}
</style>
<script src="https://cdn.paddle.com/paddle/v2/paddle.js"></script>`);
const a = h.indexOf('<div class="doc-head">'), z = h.indexOf('    </div>\n  </div>\n  <!-- SITE-FOOT:START');
if (a < 0 || z < 0) throw new Error('terms.html shell changed');
const body = `<div class="doc-head"><h1>Get brimm Pro</h1><div class="updated">Monthly or yearly, in your own currency</div></div>

<div id="buy">
<p class="msg" id="closed" hidden>Payments on brimm.ai are not open yet. You can get Pro in the brimm app.</p>
<div class="step"><h2><span class="num">1</span>Your brimm account</h2>
<p>Enter the email you use in the brimm app. Pro switches on for that account.</p>
<input class="field" id="email" type="email" autocomplete="email" placeholder="you@example.com" aria-label="Email of your brimm account"></div>
<div class="step"><h2><span class="num">2</span>Monthly or yearly</h2>
<div class="opts">
<button type="button" class="opt" data-plan="monthly" aria-pressed="true"><span><b>Monthly</b><small id="mSub">Billed every month</small></span><span class="price" id="mPrice">…</span></button>
<button type="button" class="opt" data-plan="yearly" aria-pressed="false"><span><b>Yearly</b><small>Billed once a year</small></span><span class="price" id="yPrice">…</span></button>
</div>
<p class="note" id="priceNote">Loading your price…</p></div>
<button type="button" class="pay" id="pay" disabled>Continue to payment</button>
<p class="note">Payments are taken by Paddle, our reseller and merchant of record. Prices include tax where it applies. Pro renews until you cancel, and you can cancel at any time: see <a href="/refunds.html">Refunds</a>.</p>
</div>

<div class="done" id="done" hidden>
<div class="big" aria-hidden="true">✓</div>
<h2>Pro is on</h2>
<p>Open the brimm app and sign in with <strong id="doneEmail">the same email</strong>.</p>
<p class="note">A receipt from Paddle is on its way to your inbox.</p>
</div>

<script>
(function(){
  var C = ${JSON.stringify(CONFIG)};
  var $ = function(id){ return document.getElementById(id); };
  var plan = 'monthly', ready = false;
  var okEmail = function(){ return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test($('email').value.trim()); };
  var refresh = function(){ $('pay').disabled = !(ready && okEmail()); };
  [].forEach.call(document.querySelectorAll('.opt'), function(b){ b.addEventListener('click', function(){
    plan = b.dataset.plan; [].forEach.call(document.querySelectorAll('.opt'), function(x){ x.setAttribute('aria-pressed', x === b); });
  }); });
  $('email').addEventListener('input', refresh);
  var q = new URLSearchParams(location.search);
  if (q.get('done') === '1') { $('buy').hidden = true; $('done').hidden = false; if (q.get('email')) $('doneEmail').textContent = q.get('email'); return; }
  // no client token = no checkout: said plainly, nothing pretends to work
  if (!C.token || !window.Paddle) { $('closed').hidden = false; $('priceNote').textContent = 'Prices show here once payments open.'; $('mPrice').textContent = ''; $('yPrice').textContent = ''; return; }
  if (C.env === 'sandbox') Paddle.Environment.set('sandbox');
  Paddle.Initialize({ token: C.token, eventCallback: function(e){
    if (e && e.name === 'checkout.completed') location.href = '/pro?done=1&email=' + encodeURIComponent($('email').value.trim());
  } });
  // the visitor's own prices, from Paddle (location from the visitor's connection); the launch offer only where it applies
  var items = [{ priceId: C.monthly, quantity: 1 }, { priceId: C.yearly, quantity: 1 }];
  var req = { items: items }; if (C.launchDiscount) req.discountId = C.launchDiscount;
  Paddle.PricePreview(req).then(function(r){
    var li = r.data.details.lineItems, m = li.find(function(x){ return x.price.id === C.monthly; }), y = li.find(function(x){ return x.price.id === C.yearly; });
    $('mPrice').textContent = m.formattedUnitTotals.subtotal + ' a month';
    $('yPrice').textContent = y.formattedUnitTotals.subtotal + ' a year';
    if (C.launchDiscount && m.formattedTotals.total !== m.formattedUnitTotals.subtotal) $('mSub').innerHTML = '<span class="offer">First month ' + m.formattedTotals.total + '</span>, then billed every month';
    $('priceNote').textContent = 'Your price, in ' + r.data.currencyCode + ', before you pay.';
    ready = true; refresh();
  }).catch(function(){ $('priceNote').textContent = 'Prices couldn’t load. Refresh the page to try again.'; });
  $('pay').addEventListener('click', function(){
    var email = $('email').value.trim(); if (!okEmail()) return;
    var o = { items: [{ priceId: plan === 'yearly' ? C.yearly : C.monthly, quantity: 1 }], customer: { email: email },
      customData: { brimm_email: email }, settings: { displayMode: 'overlay', theme: 'dark', allowLogout: false } };
    if (plan === 'monthly' && C.launchDiscount) o.discountId = C.launchDiscount;
    Paddle.Checkout.open(o);
  });
})();
</script>
`;
h = h.slice(0, a) + body + h.slice(z);
fs.writeFileSync(path.join(SITE, 'pro.html'), h);
console.log(`written pro.html (DRAFT, noindex; ${CONFIG.env}; token ${CONFIG.token ? 'set' : 'NOT set - the page says payments are not open yet'})`);
