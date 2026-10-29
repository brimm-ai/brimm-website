// THE SITE'S SHARED BEHAVIOUR (29 Oct 2026): the header takes its solid ground once the page moves (a page that starts without a photo
// writes `solid` in its markup), and `.rv` blocks fade up as they come into view. Asked for less motion: everything is simply shown.
(function () {
  var head = document.getElementById('head');
  if (head && !head.classList.contains('always')) {
    var solid = function () { head.classList.toggle('solid', window.scrollY > 30); };
    window.addEventListener('scroll', solid, { passive: true }); solid();
  }
  var rv = document.querySelectorAll('.rv');
  if (!rv.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    rv.forEach(function (el) { el.classList.add('in'); }); return;
  }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  rv.forEach(function (el) { io.observe(el); });
})();
