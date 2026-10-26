// ═══ THE STORE SWITCHES — ONE PLACE (founder, 23 Oct 2026; one switch for every page since #336, 26 Oct 2026) ═══════════════════════
// Each store says "Coming soon" — greyed, never a link — until ITS switch is on. The home page's badges AND every city / visa page's
// "Plan your trip in brimm" button read THIS file, so the site flips in one edit: before launch no page links to a Play listing a
// stranger cannot open. The App Store's url exists once its listing is created; an empty url keeps it "Coming soon".
window.BRIMM_STORES = {
  play: { on: false, url: 'https://play.google.com/store/apps/details?id=ai.brimm.app', main: 'Get it on' },
  ios:  { on: false, url: '', main: 'Download on the' },
};
