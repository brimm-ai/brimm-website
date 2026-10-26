// THE "PLAN YOUR TRIP IN BRIMM" BUTTON (founder, 25 Oct 2026 21:25; mock 2026-10-25/mocks/search-journey-mock.html §3) — one button, and
// the page works out where it goes. Preview branch only: it goes live with the app launch, not before.
//   Android  → ONE intent link: brimm installed → the app opens on "plan a new trip" (brimm://create-trip); not installed → its Google Play
//              page (the intent's own fallback — no guessing whether the app is there).
//   iPhone   → "Coming soon to iPhone" (no link, no e-mail collected).
//   Computer → the Google Play link, plus a QR code to scan with the phone.
// THE STORE SWITCH (founder #336, 26 Oct 2026 — mock 2026-10-26 §7): the button reads the SAME switch as the home page's badges
// (assets/stores.js). Off → "Coming soon to Google Play": no link, no QR, so no stranger lands on a listing they cannot open.
(function () {
  var stores = window.BRIMM_STORES || {};
  var play = stores.play || {};
  var PLAY = play.url || 'https://play.google.com/store/apps/details?id=ai.brimm.app';
  var playOn = !!(play.on && play.url);
  var ua = navigator.userAgent || '';
  var android = /Android/i.test(ua);
  var ios = /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && 'ontouchend' in document);
  // THE CITY COMES ALONG (founder #329, 26 Oct 2026 — mock 2026-10-26 §7): a city page's button carries its city, and Create opens with it
  // picked and still editable — the same prefilledDestination Explore's "Plan" uses (seen on the Pixel 8: London, United Kingdom). The
  // Play fallback cannot carry it; a page with no city (a visa guide) opens an empty Create as before.
  function intentFor(a) {
    var city = a.getAttribute('data-app-city'), country = a.getAttribute('data-app-country');
    var q = city ? '?prefilledDestination=' + encodeURIComponent(city) + (country ? '&prefilledCountry=' + encodeURIComponent(country) : '') : '';
    return 'intent://create-trip' + q + '#Intent;scheme=brimm;package=ai.brimm.app;S.browser_fallback_url=' + encodeURIComponent(PLAY) + ';end';
  }
  function soon(a, words) {
    var s = document.createElement('span');
    s.className = a.className + ' soon';
    s.textContent = words;
    a.replaceWith(s);
  }
  document.querySelectorAll('[data-app]').forEach(function (a) {
    if (ios) return soon(a, 'Coming soon to iPhone');
    if (!playOn) return soon(a, 'Coming soon to Google Play');
    a.href = android ? intentFor(a) : PLAY;
    if (!android) { a.target = '_blank'; a.rel = 'noopener'; }
  });
  if (playOn && !android && !ios) document.querySelectorAll('[data-app-qr]').forEach(function (q) { q.hidden = false; });
})();
