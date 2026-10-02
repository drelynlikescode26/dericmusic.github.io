// Serve the repository on 127.0.0.1:8765. No external requests or signups.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const release=Date.parse('2026-10-09T04:00:00Z');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 for(const [width,height] of [[320,568],[390,844],[844,390],[1440,900]]){
  const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});
  await page.route('**/*',route=>route.request().url().startsWith('http://127.0.0.1:8765')&&route.request().method()==='GET'?route.continue():route.abort());
  await page.clock.install({time:new Date(release-1000)});
  await page.goto('http://127.0.0.1:8765/');
  assert.equal(await page.locator('#album-title').innerText(),'#PLUGGAINTDEAD 2');
  assert.equal(await page.locator('[data-countdown-seconds]').innerText(),'01');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  assert.equal(await page.locator('[data-countdown-clock]').getAttribute('aria-live'),'off');
  assert.equal(await page.locator('[data-album-presave]').getAttribute('href'),'https://hypeddit.com/nrihmk');
  assert.equal(await page.locator('[data-album-presave]').isVisible(),true);
  assert.equal(await page.locator('[data-album-calendar]').getAttribute('href'),'/assets/releases/pluggaintdead-2-release.ics');
  const calendar=await page.request.get('http://127.0.0.1:8765/assets/releases/pluggaintdead-2-release.ics');
  assert.match(await calendar.text(),/DTSTART:20261009T040000Z/);
  assert.match(await calendar.text(),/SUMMARY:#PLUGGAINTDEAD 2 release/);
  const card=await page.locator('[data-album-countdown]').boundingBox();
  const floor=await page.locator('.hero-floor').boundingBox();
  assert.ok(card.y+card.height<=floor.y,'countdown must not overlap identity/signup');
  await page.screenshot({path:`/tmp/deric-countdown-${width}.png`,fullPage:true});
  await page.locator('#open-email').click();
  assert.equal(await page.locator('#emailModal').isVisible(),true);
  assert.equal(await page.locator('.ml-embedded').getAttribute('data-form'),'ZEx5pV');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#emailModal').isVisible(),false);
  await page.clock.runFor(1000);
  assert.equal(await page.locator('[data-countdown-clock]').isVisible(),false);
  assert.equal(await page.locator('[data-album-presave]').isVisible(),false);
  assert.equal(await page.locator('[data-album-calendar]').isVisible(),false);
  assert.equal(await page.locator('[data-release-status]').innerText(),'Release day is here.');
  await page.clock.runFor(5000);
  assert.equal(await page.locator('[data-countdown-seconds]').innerText(),'00');
  await page.close();
 }
 const page=await browser.newPage({javaScriptEnabled:false,viewport:{width:320,height:568}});
 await page.route('**/*',route=>route.request().url().startsWith('http://127.0.0.1:8765')?route.continue():route.abort());
 await page.goto('http://127.0.0.1:8765/');
 assert.match(await page.locator('.album-release-date').innerText(),/October 9, 2026.*12:00 AM Eastern \(EDT\)/);
 assert.equal(await page.locator('[data-countdown-clock]').isVisible(),false);
 assert.equal(await page.locator('[data-album-presave]').isVisible(),true);
 await browser.close();
 console.log('PASS 5 homepage scenarios: mobile, landscape, desktop, no JS; pre/exact/post release; signup retained.');
})().catch(error=>{console.error(error);process.exit(1)});
