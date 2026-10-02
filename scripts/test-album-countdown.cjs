// Isolated layout/clock checks before the supplied artwork is available.
const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const css=fs.readFileSync(path.join(root,'css/album-countdown.css'),'utf8');
const js=fs.readFileSync(path.join(root,'js/album-countdown.js'),'utf8');
const release=Date.parse('2026-10-09T04:00:00Z');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 for(const width of [320,390,1440]){
  const page=await browser.newPage({viewport:{width,height:844}});
  await page.clock.install({time:new Date(release-1000)});
  await page.setContent(`<style>*{box-sizing:border-box}body{margin:0;background:#0b0a0a;font-family:Arial,sans-serif}${css}</style>
   <section class="album-release" data-album-countdown aria-labelledby="album-title">
   <div aria-hidden="true"></div><div class="album-release-copy">
   <p class="album-release-kicker">The new album</p><h2 id="album-title">#PLUGGAINTDEAD 2</h2>
   <p class="album-release-date"><time datetime="2026-10-09T00:00:00-04:00">October 9, 2026 · 12:00 AM Eastern (EDT)</time></p>
   <dl class="album-countdown" data-countdown-clock role="timer" aria-live="off" aria-label="Time until the album release">
   ${['days','hours','minutes','seconds'].map(unit=>`<div><dt>${unit}</dt><dd data-countdown-${unit}>—</dd></div>`).join('')}</dl>
   <p class="album-release-status" data-release-status role="status" aria-live="polite"></p>
   <a class="album-release-link" href="/music/">Explore Deric’s music</a></div></section><script>${js}</script>`);
  assert.equal(await page.locator('[data-countdown-seconds]').innerText(),'01');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  assert.equal(await page.locator('[data-countdown-clock]').getAttribute('aria-live'),'off');
  await page.clock.runFor(1000);
  assert.equal(await page.locator('[data-countdown-clock]').isVisible(),false);
  assert.equal(await page.locator('[data-release-status]').innerText(),'Release day is here.');
  await page.clock.runFor(5000);
  assert.equal(await page.locator('[data-countdown-seconds]').innerText(),'00');
  await page.close();
 }
 await browser.close();
 console.log('PASS isolated countdown at 320, 390, and 1440px; pre/exact/post release. Artwork not yet available.');
})().catch(error=>{console.error(error);process.exit(1)});
