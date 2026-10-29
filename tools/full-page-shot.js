#!/usr/bin/env node
// tools/full-page-shot.js — a full-length screenshot of a page as a phone or a desktop sees it, from the laptop's own Chrome (headless,
// through its DevTools port; no library). The viewport stays the device's (so "one screen tall" stays one screen), the page is scrolled
// through once so lazy photos load, the scroll reveals are switched on, and the whole length is captured.
//   node tools/full-page-shot.js <url> <out.png> phone|desktop
const { spawn } = require('child_process'), fs = require('fs'), os = require('os'), path = require('path');
const [, , URL_, OUT, KIND = 'phone'] = process.argv;
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
// 1x for both: a full-length capture past ~16,000 px stalls Chrome silently (the phone page at 2x is ~24,000 px — the first run hung on it)
const DEV = KIND === 'phone' ? { width: 390, height: 844, deviceScaleFactor: 1, mobile: true } : { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false };
// every step is bounded and the run always ends with one word — DONE or FAILED — never silence
const TOTAL = setTimeout(() => { console.error('FAILED: no result in 120 s'); try { ch.kill(); } catch {} process.exit(2); }, 120000);
const port = 9300 + Math.floor(Math.random() * 500);
const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'brimm-shot-'));
const ch = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${prof}`, '--hide-scrollbars', '--no-first-run', `--window-size=${DEV.width},${DEV.height}`, 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
(async () => {
  let ws;
  for (let i = 0; i < 50 && !ws; i++) { try { const t = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); const pg = t.find(x => x.type === 'page'); if (pg) ws = new WebSocket(pg.webSocketDebuggerUrl); } catch { await sleep(200); } }
  await new Promise((ok, no) => { ws.onopen = ok; ws.onerror = no; });
  let id = 0; const wait = {};
  ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && wait[d.id]) { wait[d.id](d); delete wait[d.id]; } };
  const send = (method, params = {}) => new Promise((r, no) => { const i = ++id; wait[i] = r; ws.send(JSON.stringify({ id: i, method, params }));
    setTimeout(() => { if (wait[i]) { delete wait[i]; no(new Error(`${method} timed out`)); } }, 45000); });
  const evalJs = async (expr) => (await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true })).result?.result?.value;
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', DEV);
  if (DEV.mobile) await send('Emulation.setTouchEmulationEnabled', { enabled: true });
  await send('Page.navigate', { url: URL_ }); await sleep(2500);
  // a still page: the hero's slideshow is stopped on its first photo (before its first change at 7 s) so a long capture cannot catch
  // a crossfade with the previous photo's credit — every pending timer is cleared, and the page's own code is not touched
  await evalJs('(()=>{let id=setTimeout(()=>{},0);while(id>0){clearTimeout(id);id--}return 1})()');
  // scroll through once (lazy photos load), then back to the top; reveals switched on; the fixed header only at the top of the shot
  // for the shot only, every lazy image is asked for now (an off-screen capture never "scrolls to" them); the page itself stays lazy
  await evalJs(`(async()=>{document.querySelectorAll('img[loading="lazy"]').forEach(i=>i.loading='eager');const H=document.documentElement.scrollHeight;for(let y=0;y<H;y+=600){scrollTo({top:y,behavior:'instant'});await new Promise(r=>setTimeout(r,150));}scrollTo({top:0,behavior:'instant'});document.querySelectorAll('.rv').forEach(e=>e.classList.add('in'));await Promise.all([...document.images].map(i=>(i.complete&&i.naturalWidth)?1:new Promise(r=>{i.addEventListener('load',r);i.addEventListener('error',r);setTimeout(r,8000)})));return [...document.images].filter(i=>!i.naturalWidth).length})()`).then(n => console.log(n ? `${n} image(s) not loaded` : 'all images loaded'));
  await sleep(1500);
  const h = await evalJs('Math.ceil(document.documentElement.scrollHeight)');
  if (h > 16000) throw new Error(`page is ${h}px tall — over the ~16,000 px a single capture can hold`);
  if (DEV.mobile) {
    // PHONES ARE STITCHED FROM SCREENS. A single full-length capture under phone emulation drew the larger wall photos BLANK while
    // every image reported loaded (29 Oct 2026: 8 of 16 tiles empty; the same tiles drew in a plain viewport capture). So: one frame
    // per screen, the fixed header only in the first, and tools/stitch-shot.py joins them — every pixel is one the screen really drew.
    const dir = OUT.replace(/\.(jpg|png)$/, '-frames'); fs.mkdirSync(dir, { recursive: true });
    const frames = [];
    for (let y = 0, k = 0; y < h; y += DEV.height, k++) {
      const at = await evalJs(`(async()=>{scrollTo({top:${y},behavior:'instant'});await new Promise(r=>setTimeout(r,450));${k ? "document.querySelector('.site-head')&&(document.querySelector('.site-head').style.visibility='hidden');" : ''}return Math.round(scrollY)})()`);
      const shot = await send('Page.captureScreenshot', { format: 'png' });
      const file = path.join(dir, `f${String(k).padStart(2, '0')}.png`); fs.writeFileSync(file, Buffer.from(shot.result.data, 'base64'));
      frames.push({ file, want: y, at });
    }
    fs.writeFileSync(path.join(dir, 'frames.json'), JSON.stringify({ height: h, width: DEV.width, frames }));
    console.log(`DONE: ${frames.length} frames in ${dir} — ${KIND} ${DEV.width}px wide, ${h}px tall; join with tools/stitch-shot.py`);
    clearTimeout(TOTAL); ws.close(); ch.kill(); process.exit(0);
  }
  const shot = await send('Page.captureScreenshot', { format: OUT.endsWith('.jpg') ? 'jpeg' : 'png', quality: OUT.endsWith('.jpg') ? 85 : undefined, captureBeyondViewport: true, clip: { x: 0, y: 0, width: DEV.width, height: h, scale: 1 } });
  fs.writeFileSync(OUT, Buffer.from(shot.result.data, 'base64'));
  console.log(`DONE: ${OUT} — ${KIND} ${DEV.width}px wide, ${h}px tall`);
  clearTimeout(TOTAL); ws.close(); ch.kill(); process.exit(0);
})().catch(e => { console.error('FAILED: ' + (e && e.message || e)); try { ch.kill(); } catch {} process.exit(1); });
