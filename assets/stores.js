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
window.BRIMM_TAGS = { sources: ['ig', 'tt', 'x', 'yt', 'fb', 'li'], applePt: '' };
window.BRIMM_STORE_URL = function (k, tag) {
  var st = window.BRIMM_STORES[k], T = window.BRIMM_TAGS;
  if (!st || !st.url) return '';
  var s = T.sources.indexOf(tag) >= 0 ? tag : '';
  if (!s) return st.url;
  var sep = st.url.indexOf('?') >= 0 ? '&' : '?';
  if (k === 'play') return st.url + sep + 'referrer=' + encodeURIComponent('utm_source=' + s + '&utm_medium=social&utm_campaign=download');
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
      a.className = 'badge'; a.href = window.BRIMM_STORES[k].url; a.rel = 'noopener';
      if (el.id) a.id = el.id;
      a.hidden = el.hidden;
      var img = el.querySelector('img').cloneNode(true);
      img.alt = k === 'play' ? 'Get it on Google Play' : 'Download on the App Store';
      a.appendChild(img);
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
