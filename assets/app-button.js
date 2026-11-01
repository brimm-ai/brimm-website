// THE STORE BADGES IN THE GUIDES' APP PANEL (founder, 1 Nov 2026 13:00, HQ #74; was one "Plan your trip in brimm" button, 25 Oct 2026).
// Every city and visa guide marks its store spot in the "Make it yours in the brimm app" panel with `[data-app]`; this script puts the
// official Google Play and App Store badges there, exactly as the home page shows them. WHICH badges show is the site's one rule,
// assets/stores.js BRIMM_SHOWS: both, dimmed, "Coming soon" under each, until a store is live; then a phone sees its own store (iPhone
// never a Play badge) and a computer both. A live badge links:
//   Google Play on Android → ONE intent link: brimm installed → the app opens on "plan a new trip" (brimm://create-trip, the city
//              picked when the page has one); not installed → its Google Play page (the intent's own fallback).
//   Google Play on a computer → the Play page, plus the QR code to scan with the phone.
//   App Store → its listing.
// A visitor without scripts sees what the page wrote: the two dimmed badges (older pages: a plain link to the Play listing).
(function () {
  var stores = window.BRIMM_STORES || {};
  var PLAY = (stores.play && stores.play.url) || 'https://play.google.com/store/apps/details?id=ai.brimm.app';
  var live = window.BRIMM_LIVE || function () { return false; };
  var shows = window.BRIMM_SHOWS || function () { return true; };
  var android = window.BRIMM_DEVICE === 'android';
  // THE CITY COMES ALONG (founder #329, 26 Oct 2026 — mock 2026-10-26 §7): a city page's link carries its city, and Create opens with it
  // picked and still editable — the same prefilledDestination Explore's "Plan" uses. The Play fallback cannot carry it; a page with no
  // city (a visa guide) opens an empty Create.
  function intentFor(a) {
    var city = a.getAttribute('data-app-city'), country = a.getAttribute('data-app-country');
    var q = city ? '?prefilledDestination=' + encodeURIComponent(city) + (country ? '&prefilledCountry=' + encodeURIComponent(country) : '') : '';
    return 'intent://create-trip' + q + '#Intent;scheme=brimm;package=ai.brimm.app;S.browser_fallback_url=' + encodeURIComponent(PLAY) + ';end';
  }
  var ART = {
    play: { src: '/assets/badges/google-play.png?v=f72611e2', cls: 'gp', w: 167, h: 65, alt: 'Get it on Google Play', name: 'Google Play' },
    ios: { src: '/assets/badges/app-store.svg?v=86c9954e', cls: '', w: 132, h: 44, alt: 'Download on the App Store', name: 'App Store' },
  };
  function badge(k, a) {
    var art = ART[k], on = live(k);
    // no data-store attribute: stores.js's own pass over the home's badges must not rewrite these (the Play link here is the intent)
    var el = document.createElement(on ? 'a' : 'span');
    el.className = 'badge' + (on ? '' : ' pending');
    var img = document.createElement('img');
    // a screen reader names the store, then reads the "Coming soon" under it (founder, 1 Nov 2026); a live badge carries the full line
    img.src = art.src; img.width = art.w; img.height = art.h; img.alt = on ? art.alt : art.name;
    if (art.cls) img.className = art.cls;
    el.appendChild(img);
    if (on) {
      el.href = k === 'play' ? (android ? intentFor(a) : PLAY) : stores.ios.url;
      if (!(k === 'play' && android)) { el.target = '_blank'; el.rel = 'noopener'; }
    } else {
      var tag = document.createElement('span');
      tag.className = 'soon-tag'; tag.textContent = 'Coming soon';
      el.appendChild(tag);
    }
    return el;
  }
  // The builders write the two dimmed badges themselves (div.app-badges[data-app], so a visitor without scripts sees them too); an
  // older page wrote one <a data-app> link instead. Either way the panel ends as the badges the rule above allows.
  document.querySelectorAll('[data-app]').forEach(function (a) {
    var wrap = a.classList.contains('app-badges') ? a : document.createElement('div');
    wrap.className = 'app-badges';
    var kids = [];
    ['play', 'ios'].forEach(function (k) { if (shows(k)) kids.push(badge(k, a)); });
    if (wrap === a) { while (a.firstChild) a.removeChild(a.firstChild); } else a.replaceWith(wrap);
    kids.forEach(function (el) { wrap.appendChild(el); });
  });
  if (live('play') && window.BRIMM_DEVICE === 'desktop') document.querySelectorAll('[data-app-qr]').forEach(function (q) { q.hidden = false; });
})();
