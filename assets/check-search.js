// ═══ brimm.ai/check — THE SUGGESTION LISTS UNDER EACH BOX (founder HQ #117, 1 Nov 2026 22:48) ════════════════════════════════════
// The page's passport / where-you-live / where-to boxes used the browser's own <datalist>, which shows nothing on many phones. This is the
// matching behind the page's own dropdown, written ONCE here and copied to the site by tools/website-check/build.js (assets/check-search.js).
//   · places — the app's search ranking (services/destinationsService searchTier, used by searchPlaces): accents and "St."/"Saint" folded
//     the same way; exact city · a region route's own name · exact country / common name · exact alias · city starts · city contains ·
//     alias contains · country starts · country contains; within a tier the list's own order (marquee first, then population — the
//     builder sorts it so). ⚠️ A COPY OF THE APP'S TIERS, not the app's function (that one reads the whole bundled dataset): the test in
//     tools/saved-records-tests runs both on the same queries and fails when their places differ.
//   · countries — the app's countryMatches (data/countries): the name or a former name CONTAINS what was typed; names that START with it
//     come first, then the rest, each alphabetical.
//   · a destination may also be a whole country (the check accepts one): offered when the typed text is the country's name or a common
//     name (first), or starts it (after the cities that start with it).
(function (root) {
  'use strict';
  const DIACRITICS = /[̀-ͯ]/g;
  const fold = (s) => String(s || '').normalize('NFD').replace(DIACRITICS, '').toLowerCase()
    .replace(/[‘’]/g, "'").replace(/\bste\.?\s+/g, 'sainte ').replace(/\bst\.?\s+/g, 'saint ');
  const aliasHit = (aliases, code, q) => {
    const list = (code && aliases && aliases[code]) || null;
    if (!list || !q) return null;
    if (list.includes(q)) return 'exact';
    if (list.some(a => a.startsWith(q))) return 'starts';
    if (list.some(a => a.includes(q))) return 'contains';
    return null;
  };
  function tier(p, q, aliases) {
    const city = fold(p.city);
    if (city === q) return 0;
    if (p.r && (fold(p.r) === q || city.startsWith(q))) return 0.4;
    if (fold(p.country) === q || aliasHit(aliases, p.cc, q) === 'exact') return 0.5;
    if (p.a && p.a.some(a => fold(a) === q)) return 0.6;
    if (city.startsWith(q)) return 1;
    if (city.includes(q)) return 2;
    if (p.a && p.a.some(a => fold(a).includes(q))) return 3;
    const country = fold(p.country), al = aliasHit(aliases, p.cc, q);
    if (country.startsWith(q) || al === 'starts') return 4;
    if (country.includes(q) || al === 'contains') return 5;
    return -1;
  }
  /** Places ranked as the app ranks them: [{ city, country, cc }]. */
  function ranked(q, data) {
    const hits = [];
    data.places.forEach((p, i) => { const t = tier(p, q, data.countryAliases); if (t >= 0) hits.push({ p, t, i }); });
    return hits.sort((a, b) => a.t - b.t || a.i - b.i);
  }
  function places(query, data) {
    const q = fold(query.trim()); if (!q) return [];
    return ranked(q, data).map(h => h.p);
  }
  /** The dropdown under "Where to?": places, plus the whole country where the typed text names it or starts its name. */
  function destinations(query, data, max) {
    const q = fold(query.trim()); if (!q) return [];
    const ps = ranked(q, data);
    const countries = [];
    const seen = new Set();
    for (const p of data.places) {
      if (seen.has(p.cc)) continue; seen.add(p.cc);
      const name = fold(p.country), al = aliasHit(data.countryAliases, p.cc, q);
      if (name === q || al === 'exact') countries.push({ at: 0, row: { country: p.country, cc: p.cc, whole: true } });
      else if (name.startsWith(q) || al === 'starts') countries.push({ at: 1, row: { country: p.country, cc: p.cc, whole: true } });
    }
    const exact = countries.filter(c => c.at === 0).map(c => c.row), starts = countries.filter(c => c.at === 1).map(c => c.row);
    // an exact country first; a country that only STARTS with the letters goes after the app's tiers up to "city starts with" (≤ 1)
    const first = ps.filter(h => h.t <= 1).map(h => h.p), rest = ps.filter(h => h.t > 1).map(h => h.p);
    return [...exact, ...first, ...starts, ...rest].slice(0, max || 8);
  }
  /** Passport / where-you-live: [{ c, n }] whose name or former name contains the text — names starting with it first. */
  function countries(query, list, max) {
    const q = fold(query.trim()); if (!q) return [];
    const hit = list.filter(c => fold(c.n).includes(q) || (c.f || []).some(f => fold(f).includes(q)));
    const starts = c => fold(c.n).startsWith(q) || (c.f || []).some(f => fold(f).startsWith(q));
    return [...hit.filter(starts), ...hit.filter(c => !starts(c))].slice(0, max || 8);
  }
  const api = { fold, places, destinations, countries };
  if (typeof module === 'object' && module.exports) module.exports = api; else root.brimmSearch = api;
})(typeof self !== 'undefined' ? self : this);
