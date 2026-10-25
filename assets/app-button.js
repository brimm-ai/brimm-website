// THE "PLAN YOUR TRIP IN BRIMM" BUTTON (founder, 25 Oct 2026 21:25; mock 2026-10-25/mocks/search-journey-mock.html §3) — one button, and
// the page works out where it goes. Preview branch only: it goes live with the app launch, not before.
//   Android  → ONE intent link: brimm installed → the app opens on "plan a new trip" (brimm://create-trip); not installed → its Google Play
//              page (the intent's own fallback — no guessing whether the app is there).
//   iPhone   → "Coming soon to iPhone" (no link, no e-mail collected).
//   Computer → the Google Play link, plus a QR code to scan with the phone.
(function () {
  var PLAY = 'https://play.google.com/store/apps/details?id=ai.brimm.app';
  var ua = navigator.userAgent || '';
  var android = /Android/i.test(ua);
  var ios = /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && 'ontouchend' in document);
  var intent = 'intent://create-trip#Intent;scheme=brimm;package=ai.brimm.app;S.browser_fallback_url=' + encodeURIComponent(PLAY) + ';end';
  document.querySelectorAll('[data-app]').forEach(function (a) {
    if (ios) {
      var s = document.createElement('span');
      s.className = a.className + ' soon';
      s.textContent = 'Coming soon to iPhone';
      a.replaceWith(s);
      return;
    }
    a.href = android ? intent : PLAY;
    if (!android) { a.target = '_blank'; a.rel = 'noopener'; }
  });
  if (!android && !ios) document.querySelectorAll('[data-app-qr]').forEach(function (q) { q.hidden = false; });
})();
