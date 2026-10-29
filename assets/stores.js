// ═══ THE STORE SWITCHES — ONE PLACE (founder, 23 Oct 2026; one switch for every page since #336, 26 Oct 2026) ═══════════════════════
// Each store says "Coming soon" — greyed, never a link — until ITS switch is on. The home page's badges AND every city / visa page's
// "Plan your trip in brimm" button read THIS file, so the site flips in one edit: before launch no page links to a Play listing a
// stranger cannot open. The App Store's url exists once its listing is created; an empty url keeps it "Coming soon".
// THE VISA ANSWER SWITCH (founder, 29 Oct 2026 07:01): OFF until the answer goes on. While off, every way into the check is hidden —
// each one is written `data-check-entry hidden`, so a visitor without scripts sees none either — and check.html reads this same switch
// for its answer, so the page and its doors can never disagree. On (with the server's door open, docs/launch/2026-10-29-check-answer-on-plan.md
// in brimm-ai): the doors show.
window.BRIMM_CHECK = { on: false };
window.BRIMM_STORES = {
  play: { on: false, url: 'https://play.google.com/store/apps/details?id=ai.brimm.app', main: 'Get it on' },
  ios:  { on: false, url: '', main: 'Download on the' },
};

// ═══ THE OFFICIAL STORE BADGES (founder, 28 Oct 2026 23:27) ═════════════════════════════════════════════════════════════════════════
// Google's and Apple's own badge artwork (assets/badges/, unaltered). Every page writes a badge as `.badge.soon[data-store]` — dimmed,
// "Coming soon" under it, not a link — so a visitor without scripts sees exactly that. While a store's switch above is OFF this does
// nothing; ON (with a url) the same badge becomes the link to that store and loses its "Coming soon". Nothing else changes per page.
(function () {
  function apply() {
    document.querySelectorAll('.badge[data-store]').forEach(function (el) {
      var st = window.BRIMM_STORES[el.getAttribute('data-store')];
      if (!st || !st.on || !st.url) return;
      var a = document.createElement('a');
      a.className = 'badge'; a.href = st.url; a.rel = 'noopener';
      if (el.id) a.id = el.id;
      a.hidden = el.hidden;
      var img = el.querySelector('img').cloneNode(true);
      img.alt = el.getAttribute('data-store') === 'play' ? 'Get it on Google Play' : 'Download on the App Store';
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
