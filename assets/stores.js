// ═══ THE STORE SWITCHES — ONE PLACE (founder, 23 Oct 2026; one switch for every page since #336, 26 Oct 2026) ═══════════════════════
// Each store says "Coming soon" — greyed, never a link — until ITS switch is on. The home page's badges AND every city / visa page's
// "Plan your trip in brimm" button read THIS file, so the site flips in one edit: before launch no page links to a Play listing a
// stranger cannot open. The App Store's url exists once its listing is created; an empty url keeps it "Coming soon".
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
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply); else apply();
})();
