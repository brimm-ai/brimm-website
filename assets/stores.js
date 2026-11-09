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
  play: { on: false, url: 'https://play.google.com/store/apps/details?id=ai.brimm.app', main: 'Get it on' },
  ios:  { on: false, url: '', main: 'Download on the' },
};

// ═══ THE OFFICIAL STORE BADGES (founder, 28 Oct 2026 23:27; BADGES WITH "COMING SOON" UNTIL LIVE, 1 Nov 2026 13:00, HQ #74) ═══════════
// Google's and Apple's own badge artwork (assets/badges/, unaltered). The home and the check page write each badge as
// `.badge.soon[data-store]`, the guides as `.badge.pending` (assets/app-button.js redraws those), each with "Coming soon" under it, so
// a visitor without scripts sees both badges, dimmed, no link. WHICH badges a visitor sees is ONE rule for
// the whole site (home, check page, guides), BRIMM_SHOWS below (founder, HQ #74 + #71): before any store is live, everyone sees both;
// once one is live, a phone sees only its own store (Android: Google Play; iPhone: the App Store, still "Coming soon" until it is live,
// never a Play badge) and a computer sees both. ON (with a url), a store's badge becomes the link to that store, without the words.
(function () {
  var ua = navigator.userAgent || '';
  window.BRIMM_DEVICE = /Android/i.test(ua) ? 'android'
    : (/iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && 'ontouchend' in document)) ? 'ios' : 'desktop';
  window.BRIMM_LIVE = function (k) { var st = window.BRIMM_STORES[k]; return !!(st && st.on && st.url); };
  window.BRIMM_SHOWS = function (k) {
    if (!window.BRIMM_LIVE('play') && !window.BRIMM_LIVE('ios')) return true;
    var d = window.BRIMM_DEVICE;
    return d === 'desktop' || (d === 'android') === (k === 'play');
  };
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
    // 'Get the app' only where the visitor's OWN store is live (founder's launch-day prep, 9 Nov 2026; mock D:/brimm-planning/2026-11-09/launch/
    // site-switch): an iPhone never gets a button to a store that is not live; a computer gets it once either store is. The class lets the
    // phone header give the button the room it needs (site.css, has-getapp).
    var d = window.BRIMM_DEVICE, L = window.BRIMM_LIVE;
    var mine = d === 'android' ? L('play') : d === 'ios' ? L('ios') : L('play') || L('ios');
    if (mine) { document.documentElement.classList.add('has-getapp'); document.querySelectorAll('[data-getapp]').forEach(function (el) { el.hidden = false; }); }
  }
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', apply); document.addEventListener('DOMContentLoaded', doors); } else { apply(); doors(); }
})();
