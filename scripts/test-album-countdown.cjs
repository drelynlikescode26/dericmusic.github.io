// Serve the repository on 127.0.0.1:8765. No external requests or signups.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const release=Date.parse('2026-10-09T04:00:00Z');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 for(const [width,height] of [[320,568],[375,667],[390,844],[430,932],[568,320],[667,375],[844,390],[768,1024],[1024,768],[1440,900]]){
  const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});
  await page.route('**/*',route=>route.request().url().startsWith('http://127.0.0.1:8765')&&route.request().method()==='GET'?route.continue():route.abort());
  await page.clock.install({time:new Date(release-1000)});
  await page.goto('http://127.0.0.1:8765/');
  assert.equal(await page.locator('#album-title').innerText(),'#PLUGGAINTDEAD 2');
  assert.equal(await page.locator('[data-countdown-seconds]').innerText(),'01');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth && document.body.scrollWidth<=innerWidth),true,'no horizontal document overflow');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollHeight<=innerHeight && document.body.scrollHeight<=innerHeight),true,'no vertical document overflow');
  await page.evaluate(()=>window.scrollTo(100,100));
  await page.mouse.wheel(100,100);
  assert.deepEqual(await page.evaluate(()=>[scrollX,scrollY]),[0,0]);
  for(const selector of ['[data-album-countdown]','[data-album-presave]','[data-album-calendar]','.album-release-link','#open-email','.hero-social-row']){
   const box=await page.locator(selector).boundingBox();
   assert.ok(box.x>=0 && box.y>=0 && box.x+box.width<=width+1 && box.y+box.height<=height+1,`${selector} must fit ${width}x${height}`);
  }
  assert.equal(await page.locator('[data-countdown-clock]').getAttribute('aria-live'),'off');
  assert.equal(await page.locator('[data-album-presave]').getAttribute('href'),'https://hypeddit.com/nrihmk');
  assert.equal(await page.locator('[data-album-presave]').isVisible(),true);
  assert.equal(await page.locator('[data-album-calendar]').getAttribute('href'),'/assets/releases/pluggaintdead-2-release.ics');
  const calendar=await page.request.get('http://127.0.0.1:8765/assets/releases/pluggaintdead-2-release.ics');
  assert.match(await calendar.text(),/DTSTART:20261009T040000Z/);
  assert.match(await calendar.text(),/SUMMARY:#PLUGGAINTDEAD 2 release/);
  const card=await page.locator('[data-album-countdown]').boundingBox();
  const floor=await page.locator('.hero-floor').boundingBox();
  assert.ok(card.y+card.height<=floor.y+1 || card.x+card.width<=floor.x+1,'countdown must not overlap identity/signup');
  await page.screenshot({path:`/tmp/deric-countdown-${width}.png`,fullPage:true});
  await page.locator('#open-email').click();
  assert.equal(await page.locator('#emailModal').isVisible(),true);
  assert.equal(await page.locator('.ml-embedded').getAttribute('data-form'),'ZEx5pV');
  await page.locator('.ml-embedded').evaluate(e=>{const tall=document.createElement('div');tall.style.height='600px';e.appendChild(tall);});
  assert.equal(await page.locator('.email-card').evaluate(e=>e.scrollHeight>e.clientHeight && getComputedStyle(e).overflowY==='auto'),true);
  await page.locator('#close-email').focus();
  await page.locator('#heroEmailInput').focus();
  await page.locator('#heroEmailInput').scrollIntoViewIfNeeded();
  assert.equal(await page.locator('.email-card').evaluate(e=>{e.scrollTop=e.scrollHeight;return e.scrollTop>0;}),true,`modal scroll at ${width}x${height}`);
  await page.locator('#close-email').focus();
  assert.equal(await page.evaluate(()=>document.activeElement.id),'close-email');
  assert.deepEqual(await page.evaluate(()=>[scrollX,scrollY]),[0,0]);
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
 console.log('PASS 11 homepage scenarios: mobile, landscape, desktop, no JS; pre/exact/post release; signup retained.');
})().catch(error=>{console.error(error);process.exit(1)});
