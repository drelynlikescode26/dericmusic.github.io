// Requires Playwright and a local server: python -m http.server 8765 --bind 127.0.0.1
// All external requests are intercepted; vendor markup is a fixture, not a live verification.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const embed=`<div id="mlb2-46624565" class="ml-form-embedContainer"><div class="ml-form-embedWrapper"><div class="ml-form-embedBody"><div class="ml-form-embedContent"><h4>Newsletter</h4><p>Signup for news and special offers!</p></div><form action="https://assets.mailerlite.com/jsonp/2674520/forms/200179939677307921/subscribe" method="post" target="_blank"><div class="ml-form-fieldRow"><label for="testEmail">Email address</label><input id="testEmail" type="email" name="fields[email]" required placeholder="Email"></div><input type="hidden" name="ml-submit" value="1"><input type="hidden" name="anticsrf" value="true"><div class="ml-form-embedSubmit"><button type="submit">Subscribe</button></div></form></div></div></div>`;
const vendorURL='https://groot.mailerlite.com/js/w/webforms.min.js?test-fixture';
const renderFixture=`document.querySelector('.ml-embedded').innerHTML=${JSON.stringify(embed)};
 const script=document.createElement('script');script.src=${JSON.stringify(vendorURL)};document.head.appendChild(script);`;
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 let count=0;
 for(const width of [320,390,1440]) for(const path of ['/','/contact/']) {
  const page=await browser.newPage({viewport:{width,height:844}});
  let submits=0,loaders=0;
  await page.route('**/*',route=>{
   const req=route.request();
   if(/\/subscribe(?:\?|$)/.test(req.url())||req.method()==='POST'){submits++;return route.abort();}
   if(req.url()==='https://assets.mailerlite.com/js/universal.js'){
    loaders++;
    return route.fulfill({contentType:'application/javascript',body:renderFixture});
   }
   if(req.url()===vendorURL)return route.fulfill({contentType:'application/javascript',body:'/* successful vendor load fixture */'});
   return req.url().startsWith('http://127.0.0.1:8765')?route.continue():route.abort();
  });
  await page.goto('http://127.0.0.1:8765'+path);
  await page.waitForFunction(()=>!!document.querySelector('.ml-embedded form') && !document.querySelector('[data-newsletter-fallback]').open);
  if(path==='/')await page.locator('#open-email').click();
  assert.equal(await page.locator('[data-newsletter-fallback]').evaluate(e=>e.open),false);
  assert.equal(loaders,1);
  assert.equal(await page.locator('.ml-embedded').getAttribute('data-form'),'ZEx5pV');
  assert.equal(await page.evaluate(()=>window.ml.q[0][1]),'2674520');
  assert.equal(await page.locator('.ml-embedded').count(),1);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  assert.equal(await page.locator('[data-newsletter]').evaluate(e=>e.scrollWidth<=e.clientWidth+1),true);
  await page.locator('.ml-embedded button').click();
  assert.equal(await page.locator('#testEmail').evaluate(e=>e.validity.valueMissing),true);
  await page.locator('#testEmail').fill('invalid');
  await page.locator('.ml-embedded button').click();
  assert.equal(await page.locator('#testEmail').evaluate(e=>e.validity.typeMismatch),true);
  assert.equal(submits,0);
  if(path==='/'){
   await page.locator('[data-newsletter-fallback] summary').focus();
   await page.keyboard.press('Tab');
   assert.equal(await page.evaluate(()=>document.activeElement.id),'close-email');
   await page.keyboard.press('Shift+Tab');
   assert.equal(await page.evaluate(()=>document.activeElement.tagName),'SUMMARY');
   await page.keyboard.press('Escape');
   assert.equal(await page.locator('#emailModal').isVisible(),false);
   assert.equal(await page.evaluate(()=>document.activeElement.id),'open-email');
   await page.locator('#open-email').click();
  }else{
   for(const id of ['fanForm','bizForm']) assert.equal(await page.locator('#'+id).getAttribute('action'),'https://formspree.io/f/xjgpwpyv');
  }
  await page.screenshot({path:`/tmp/deric-ml-${path==='/'?'home':'contact'}-${width}.png`});
  await page.close(); count++;
 }
 for(const path of ['/','/contact/']) for(const mode of ['vendor-blocked','vendor-delayed','vendor-delayed-active-fallback']) {
  const page=await browser.newPage({viewport:{width:390,height:844}});
  let releaseVendor;
  const vendorGate=new Promise(resolve=>{releaseVendor=resolve;});
  let submits=0;
  await page.route('**/*',async route=>{
   const req=route.request();
   if(/\/subscribe(?:\?|$)/.test(req.url())||req.method()==='POST'){submits++;return route.abort();}
   if(req.url()==='https://assets.mailerlite.com/js/universal.js')return route.fulfill({contentType:'application/javascript',body:renderFixture});
   if(req.url()===vendorURL){
    if(mode==='vendor-blocked')return route.abort();
    await vendorGate;
    return route.fulfill({contentType:'application/javascript',body:'/* successful delayed vendor load fixture */'});
   }
   return req.url().startsWith('http://127.0.0.1:8765')?route.continue():route.abort();
  });
  await page.goto('http://127.0.0.1:8765'+path,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>!!document.querySelector('.ml-embedded form'));
  if(path==='/')await page.locator('#open-email').click();
  assert.equal(await page.locator('[data-newsletter-fallback]').evaluate(e=>e.open),true);
  assert.equal(await page.locator('[data-newsletter-fallback] form').isVisible(),true);
  if(mode==='vendor-blocked'){
   await page.waitForFunction(()=>document.querySelector('[data-newsletter-status]').textContent.includes('could not load'));
   assert.equal(await page.locator('[data-newsletter-fallback]').evaluate(e=>e.open),true);
  }else{
   assert.match(await page.locator('[data-newsletter-status]').innerText(),/Loading/);
   if(mode==='vendor-delayed-active-fallback')await page.locator('[data-newsletter-fallback] input[type="email"]').fill('unsent@example.com');
   releaseVendor();
   await page.waitForFunction(()=>document.querySelector('[data-newsletter-status]').textContent==='');
   assert.equal(await page.locator('[data-newsletter-fallback]').evaluate(e=>e.open),mode==='vendor-delayed-active-fallback');
   assert.equal(await page.locator('[data-newsletter-fallback] summary').isVisible(),true);
  }
  assert.equal(submits,0);
  await page.close(); count++;
 }
 for(const mode of ['blocked','timeout','nojs']){
  const page=await browser.newPage({javaScriptEnabled:mode!=='nojs',viewport:{width:390,height:844}});
  await page.route('**/*',route=>{
   if(route.request().url().startsWith('http://127.0.0.1:8765'))return route.continue();
   if(mode==='timeout'&&route.request().url().endsWith('/universal.js'))return route.fulfill({contentType:'application/javascript',body:''});
   return route.abort();
  });
  await page.goto('http://127.0.0.1:8765/contact/');
  if(mode==='timeout')await page.waitForTimeout(12500);
  assert.equal(await page.locator('[data-newsletter-fallback]').evaluate(e=>e.open),true);
  assert.equal(await page.locator('#newsletterForm').isVisible(),true);
  assert.equal(await page.locator('#newsletterForm').getAttribute('action'),'https://formspree.io/f/xjgpwpyv');
  if(mode!=='nojs')assert.match(await page.locator('[data-newsletter-status]').innerText(),/could not load/);
  await page.close(); count++;
 }
 await browser.close();
 console.log(`PASS ${count} browser scenarios; no real subscriptions sent. Vendor rendering simulated.`);
})().catch(e=>{console.error(e);process.exit(1)});
