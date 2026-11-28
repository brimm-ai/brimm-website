// ═══ THE STORE SWITCHES — ONE PLACE (founder, 23 Oct 2026; one switch for every page since #336, 26 Oct 2026) ═══════════════════════
// Each store says "Coming soon" — greyed, never a link — until ITS switch is on. The home page's and the check page's badges AND the
// badges in every city / visa guide's app panel read THIS file, so the site flips in one edit: before launch no page links to a Play listing a
// stranger cannot open. The App Store's url exists once its listing is created; an empty url keeps it "Coming soon".
// THE VISA ANSWER SWITCH (founder, 29 Oct 2026 07:01): OFF until the answer goes on. While off, every way into the check is hidden —
// each one is written `data-check-entry hidden`, so a visitor without scripts sees none either — and check.html reads this same switch
// for its answer, so the page and its doors can never disagree. On (with the server's door open, docs/launch/2026-10-29-check-answer-on-plan.md
// in brimm-ai): the doors show.
window.BRIMM_CHECK = { on: true };   // ON 1 Nov 2026 (founder, HQ #500 19:58: "GO NOW, AS IS")
window.BRIMM_STORES = {
  play: { on: true,  url: 'https://play.google.com/store/apps/details?id=ai.brimm.app', main: 'Get it on' },
  ios:  { on: true,  url: 'https://apps.apple.com/app/id6828996131', main: 'Download on the' },   // the live listing (Apple approved iOS 1.0, PD #2424); ON: publicly live (founder OK 25 Nov 15:33, HQ #2464). brimm.ai/download reads the url, not the switch (#2460)
};

// ═══ THE SOURCE TAG ON brimm.ai/download (Q#691 B, PD 26 Nov 2026; HQ #2630, #2659) ════════════════════════════════════════════════
// brimm.ai/download?s=ig (tt, x, yt, fb, li) hands the tag to the STORE, which counts it in its own console: Google Play as an install
// referrer (Play Console → acquisition), the App Store as a campaign token (App Store Connect → App Analytics → Campaigns). brimm keeps
// NOTHING — no cookie, no request of ours, no storage; the page only rewrites the store address. ONLY a tag on this list is passed: anything
// else (a typo, free text, a name) is dropped and the visitor still reaches the store, untagged — so nothing personal can ride a link into
// a store's report. APPLE needs our provider token (`pt`) as well; until the PD posts it on HQ it is '' and iPhones go untagged (#691).
// PAID TAGS (HQ #2736, founder's first boost 27 Nov 2026): the same platforms with "ad" on the end, so the store reports tell a paid tap
// from an organic one — by the source itself AND by utm_medium=paid (organic tags say social).
// STORY TAGS (28 Nov 2026): igs / fbs — the link stickers on Instagram and Facebook Stories (#2848, #2927) — reach the store tagged too
// PDF TAG (PD #2940-F, 28 Nov 2026): pdf — the trip PDF footer's "Get the app: brimm.ai/download" link; medium pdf, not social
window.BRIMM_TAGS = { sources: ['ig', 'tt', 'x', 'yt', 'fb', 'li', 'igad', 'ttad', 'xad', 'ytad', 'fbad', 'igs', 'fbs', 'pdf'], applePt: '' };
// THE STORE APP, NOT ITS WEB PAGE (HQ #2694, founder 27 Nov 2026): from an app's in-app browser (X, Instagram, TikTok…) the web address
// opens the store's WEB page inside that app — one tap more. Android's intent link asks the system for the Play Store app directly, with
// the same referrer and Play's web page as its own fallback (S.browser_fallback_url); market:// is the same request without the fallback;
// itms-apps:// asks iOS for the App Store app. Which of these each in-app browser honours is MEASURED on /download/try/ before
// /download uses any of them.
window.BRIMM_STORE_APP_URL = function (k, tag, how) {
  var web = window.BRIMM_STORE_URL(k, tag);
  if (!web) return '';
  if (k === 'play') {
    var q = web.split('?')[1] || '';   // id=ai.brimm.app[&referrer=…] — the same query the web address carries
    if (how === 'market') return 'market://details?' + q;
    return 'intent://details?' + q + '#Intent;scheme=market;package=com.android.vending;S.browser_fallback_url=' + encodeURIComponent(web) + ';end';
  }
  if (k === 'ios') return web.replace(/^https:\/\//, 'itms-apps://');
  return web;
};
// OPEN THE STORE — THE FOUNDER'S RULE (27 Nov 2026 18:2x, HQ #2794; approved page mock #385; measured #2719, #2792):
//  · A NORMAL BROWSER (Chrome, Safari…) opens the store by itself: Android gets the intent link (the Play app opens — measured on the
//    Pixel), an iPhone the App Store's web address (iOS opens the App Store app).
//  · INSIDE AN APP'S MINI-BROWSER (X, Instagram, TikTok, Facebook, LinkedIn… — "; wv)" or the app's mark in the user agent) nothing jumps
//    to Play's WEB page any more: X ignored every automatic jump and its Play web page sent the founder back to us (a loop, #2792/#2793).
//    The visitor stays on the /download page and its ONE button opens the store APP on a tap (BRIMM_STORE_TAP_URL). Android still makes
//    one harmless invisible try first (an app that honours it — Instagram did — opens the Play app with no tap; one that ignores it shows
//    nothing). An iPhone mini-browser makes no automatic try.
window.BRIMM_IN_APP = /; wv\)|Instagram|FBAN|FBAV|FB_IAB|Twitter|musical_ly|Bytedance|TikTok|LinkedInApp|Line\//i.test(navigator.userAgent || '');
// TIKTOK'S OWN BROWSER (PD #2878, 28 Nov 2026 — the TikTok leak): on an iPhone it is the one in-app browser where the page now asks for the
// App Store by itself (below), because its visitors were measured not reaching the store: 8 opens, 0 taps, 0 automatic.
window.BRIMM_TIKTOK = /musical_ly|Bytedance|TikTok/i.test(navigator.userAgent || '');
/** The link a TAP should open for store k on this device: the store APP where the device can ask for it, the web address otherwise. */
window.BRIMM_STORE_TAP_URL = function (k, tag) {
  var web = window.BRIMM_STORE_URL(k, tag), d = window.BRIMM_DEVICE;
  if (!web) return '';
  if (k === 'play' && d === 'android') {
    var q = web.split('?')[1] || '';
    // a mini-browser gets market:// — the plain "open the Play app" request — and never a web fallback (Play's web page is the loop). Not
    // intent://: X's browser does not understand it and says "No apps can perform this action" (founder's tap, 27 Nov 2026 ~20:00, HQ
    // #2810 area / PD 19:5x). Chrome keeps the intent link, measured to open the Play app with Chrome's own fallback.
    return window.BRIMM_IN_APP ? window.BRIMM_STORE_APP_URL('play', tag, 'market')
      : window.BRIMM_STORE_APP_URL('play', tag, 'intent');
  }
  // iPhone: ALWAYS the plain https App Store address (Apple's universal link), never itms-apps:// — the founder's iPhone, Facebook's
  // browser, 27 Nov 2026 20:51 (#2830): itms-apps on the button did not reach the App Store; in-app browsers hand apps.apple.com to the
  // App Store app on a user tap.
  return web;
};
/** The automatic step of /download. `before(kind)` is called just BEFORE the store is asked for — 'auto' (a normal browser is sent there),
 *  'try' (an app's browser gets the page's own attempt) — so the counter's beacon leaves before the page does. Returns the kind, or ''. */
window.BRIMM_OPEN_STORE = function (k, tag, before) {
  var web = window.BRIMM_STORE_URL(k, tag), say = typeof before === 'function' ? before : function () {};
  if (!web) return '';
  if (!window.BRIMM_IN_APP) { say('auto'); location.replace(window.BRIMM_STORE_TAP_URL(k, tag)); return 'auto'; }
  if (k === 'play') {
    say('try');
    var f = document.createElement('iframe'); f.style.display = 'none'; f.src = window.BRIMM_STORE_TAP_URL(k, tag);
    (document.body || document.documentElement).appendChild(f);
    return 'try';
  }
  // iPhone, TikTok's browser only (#2878): ask for the App Store's own address. TikTok hands it to the App Store app, or shows Apple's
  // listing page with its own "View in App Store" button — either is nearer the store than a page nobody tapped. Every other iPhone
  // in-app browser keeps the button only: each was proven on the founder's iPhone (#2845) and is not touched.
  if (k === 'ios' && window.BRIMM_TIKTOK) { say('try'); location.href = web; return 'try'; }
  return '';
};
// ═══ THE ANONYMOUS TAP COUNTER (PD #2866, FOUNDER APPROVED 27 Nov 2026 23:2x) ══════════════════════════════════════════════════════
// /download and the store badges send ONE fire-and-forget beacon of three short words — the source tag, the device word (android · ios ·
// desktop) and what happened (open · auto = the store was asked for by itself · tap). The server adds 1 to that day's count and keeps
// NOTHING else: no cookie, no stored id, no IP, no user agent, nothing per person (the download-count door, in brimm-ai). It never
// waits and never throws — a lost count is a lost count, the visitor's way to the store is untouched.
window.BRIMM_COUNT = function (tag, ev) {
  try {
    var body = 't=' + String(tag || '').toLowerCase().replace(/[^a-z]/g, '').slice(0, 8) + '&p=' + (window.BRIMM_DEVICE || 'desktop') + '&e=' + ev;
    var u = 'https://oejnnujlcmtzlkyifzag.supabase.co/functions/v1/download-count';
    if (navigator.sendBeacon) navigator.sendBeacon(u, body);
    else if (window.fetch) fetch(u, { method: 'POST', body: body, keepalive: true, mode: 'no-cors' }).catch(function () {});
  } catch (e) { /* never in the visitor's way */ }
};
window.BRIMM_STORE_URL = function (k, tag) {
  var st = window.BRIMM_STORES[k], T = window.BRIMM_TAGS;
  if (!st || !st.url) return '';
  var s = T.sources.indexOf(tag) >= 0 ? tag : '';
  if (!s) return st.url;
  var sep = st.url.indexOf('?') >= 0 ? '&' : '?';
  if (k === 'play') return st.url + sep + 'referrer=' + encodeURIComponent('utm_source=' + s + '&utm_medium=' + (/ad$/.test(s) ? 'paid' : s === 'pdf' ? 'pdf' : 'social') + '&utm_campaign=download');
  if (k === 'ios') return T.applePt ? st.url + sep + 'pt=' + encodeURIComponent(T.applePt) + '&ct=' + s + '&mt=8' : st.url;
  return st.url;
};

// ═══ THE OFFICIAL STORE BADGES (founder, 28 Oct 2026 23:27; BADGES WITH "COMING SOON" UNTIL LIVE, 1 Nov 2026 13:00, HQ #74) ═══════════
// Google's and Apple's own badge artwork (assets/badges/, unaltered). The home and the check page write each badge as
// `.badge.soon[data-store]`, the guides as `.badge.pending` (assets/app-button.js redraws those), each with "Coming soon" under it, so
// a visitor without scripts sees both badges, dimmed, no link. WHICH badges a visitor sees is ONE rule for
// the whole site (home, check page, guides), BRIMM_SHOWS below (founder, HQ #74 + #71): every device sees BOTH badges
// (founder, 25 Nov 2026, HQ #2464 / mock #326 — replaced #74's "a phone sees only its own store"). ON (with a url), a store's badge becomes the link to that store, without the words.
(function () {
  var ua = navigator.userAgent || '';
  window.BRIMM_DEVICE = /Android/i.test(ua) ? 'android'
    : (/iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && 'ontouchend' in document)) ? 'ios' : 'desktop';
  window.BRIMM_LIVE = function (k) { var st = window.BRIMM_STORES[k]; return !!(st && st.on && st.url); };
  // BOTH BADGES ON EVERY DEVICE (founder OK 25 Nov 2026 15:33, HQ #2464: "same design as mock #326", which shows both on a phone —
  // Q#680 = B; replaces #74's "a phone sees only its own store"). brimm.ai/download is the per-device door. Kept as a function so
  // every caller (home, check page, guides) still asks ONE rule.
  window.BRIMM_SHOWS = function () { return true; };
  function apply() {
    document.querySelectorAll('.badge[data-store]').forEach(function (el) {
      var k = el.getAttribute('data-store');
      el.hidden = el.hidden || !window.BRIMM_SHOWS(k);
      if (!window.BRIMM_LIVE(k)) return;
      var a = document.createElement('a');
      a.className = 'badge'; a.href = (k === 'play' && window.BRIMM_DEVICE === 'android') || (k === 'ios' && window.BRIMM_DEVICE === 'ios') ? window.BRIMM_STORE_TAP_URL(k, '') : window.BRIMM_STORES[k].url; a.rel = 'noopener';   // #2794: a phone's own store opens as the APP on a tap
      if (el.id) a.id = el.id;
      a.hidden = el.hidden;
      var img = el.querySelector('img').cloneNode(true);
      img.alt = k === 'play' ? 'Get it on Google Play' : 'Download on the App Store';
      a.appendChild(img);
      // the counter (#2866): a tap on a store badge — 'home' on the home page, 'site' on every other page
      a.addEventListener('click', function () { window.BRIMM_COUNT(/^\/(index\.html)?$/.test(location.pathname) ? 'home' : 'site', 'tap'); });
      el.replaceWith(a);
    });
  }
  // the doors into the check, and "Get the app" (founder, 29 Oct 2026: hidden until Play is live) — written hidden, shown only by a switch
  function doors() {
    if (window.BRIMM_CHECK.on) {
      document.querySelectorAll('[data-check-entry]').forEach(function (el) { el.hidden = false; });
      // the words that promise the check come back with it (founder, 29 Oct 2026 07:25); their check-off wording goes
      document.querySelectorAll('[data-check-off]').forEach(function (el) { el.hidden = true; });
      document.querySelectorAll('meta[data-check-on]').forEach(function (m) { m.setAttribute('content', m.getAttribute('data-check-on')); });
      document.querySelectorAll('script[data-check-on-description]').forEach(function (s) {
        var off = JSON.stringify(s.getAttribute('data-check-off-description')), on = JSON.stringify(s.getAttribute('data-check-on-description'));
        s.textContent = s.textContent.split('"description":' + off).join('"description":' + on);
      });
    }
    var p = window.BRIMM_STORES.play;
    if (p && p.on && p.url) document.querySelectorAll('[data-getapp]').forEach(function (el) { el.hidden = false; });
  }
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', apply); document.addEventListener('DOMContentLoaded', doors); } else { apply(); doors(); }
})();
