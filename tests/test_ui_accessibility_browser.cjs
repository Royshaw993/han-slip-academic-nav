/* P0/P1 keyboard, mobile and compact-state regressions. No production fixtures are changed. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || path.join(os.tmpdir(),'research-hubs-tests/node_modules/playwright'));
const root = path.resolve(__dirname,'..');
const output = path.join(os.tmpdir(),'academic-ui-browser');
const allowed = new Set(['index.html','script.js','style.css','academic-updates.js','research-topics.js','data/research-hubs.js','data/core-bibliography.js','data/classic-papers.js','data/search-taxonomy.js','favicon.svg']);
const server = http.createServer((req,res)=>{
  const file=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';
  if(!allowed.has(file)){res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript; charset=utf-8':file.endsWith('.css')?'text/css; charset=utf-8':file.endsWith('.svg')?'image/svg+xml':'text/html; charset=utf-8');
  res.end(fs.readFileSync(path.join(root,file)));
});

const frames = page => page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
(async()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const browser=await chromium.launch(process.env.UI_BROWSER_EXECUTABLE ? {executablePath:process.env.UI_BROWSER_EXECUTABLE,headless:true} : {channel:process.env.HUB_BROWSER_CHANNEL||'msedge',headless:true});
  const page=await browser.newPage();
  const errors=[],report=[],metrics=[];
  page.on('pageerror',e=>errors.push(e.message));
  const url='http://127.0.0.1:'+server.address().port;
  const focus=locator=>locator.evaluate(e=>document.activeElement===e);
  const keyboard=async locator=>{await locator.focus();await locator.press('Enter');await frames(page);};
  const layout=async()=>assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  const pass=(w,name)=>report.push({width:w,name});
  try {
    for(const width of [320,375,390,430]) {
      await page.setViewportSize({width,height:850});await page.goto(url);
      const beforeCSS=fs.readFileSync(path.join(root,'style.css'),'utf8').split('/* 第一轮 UI/UX')[0];
      const measure=()=>page.evaluate(()=>({hero:Math.round(document.querySelector('.hero').getBoundingClientRect().height),first:Math.round(document.querySelector('.update-card').getBoundingClientRect().top+scrollY)}));
      await page.route('**/style.css',r=>r.fulfill({contentType:'text/css',body:beforeCSS}));await page.reload();const before=await measure();
      await page.unroute('**/style.css');await page.reload();const after=await measure();
      assert.ok(after.hero<before.hero);assert.ok(after.first<before.first);await layout();metrics.push({width,before,after});pass(width,'mobile content earlier without overflow');
      await keyboard(page.locator('[data-module="resources"]'));
      await keyboard(page.locator('[data-category="🧱 古文字数据库"]'));
      assert.ok(await focus(page.locator('[data-category="🧱 古文字数据库"]')));
      await keyboard(page.locator('[data-genre="金文"]'));assert.ok(await focus(page.locator('[data-genre="金文"]')));
      await keyboard(page.locator('#returnHomeButton'));assert.ok(await focus(page.locator('.brand')));pass(width,'category, genre and home keyboard focus');
      for(const [attr,value] of [['data-direction','简牍'],['data-update-type','新论文']]) {
        await page.goto(url);if(attr==='data-direction')await keyboard(page.locator('[data-module="resources"]'));const target=page.locator('['+attr+'="'+value+'"]');await keyboard(target);
        assert.ok(await focus(target));assert.equal(await target.getAttribute('aria-pressed'),'true');
        const states=await page.locator('['+attr+']').evaluateAll(es=>es.every(e=>e.getAttribute('aria-pressed')===String(e.classList.contains('is-active'))));assert.ok(states);
      }
      pass(width,'filter focus and aria-pressed stay synchronized');
      await page.goto(url);const wechat=page.locator('[data-module="wechat"]');await keyboard(wechat);assert.ok(await focus(page.locator('#moduleBack')));assert.equal(await page.locator('#wechatPanel .wechat-card:visible').count(),14);
      await keyboard(page.locator('#moduleBack'));assert.ok(await focus(wechat));assert.equal(await page.locator('#wechatPanel').isVisible(),false);pass(width,'WeChat module and keyboard return retain focus');
      await page.locator('#searchInput').fill('张家山');const trigger=page.locator('#unifiedSearchResults [data-research-topic="zhangjiashan-hanjian"]');await keyboard(trigger);await keyboard(page.locator('[data-hub-back]'));assert.ok(await focus(trigger));assert.equal(await page.locator('#searchInput').inputValue(),'张家山');await layout();pass(width,'search hub return restores result focus');
      const hits=await page.evaluate(()=>searchUnified(searchQuery).map(e=>e.type+':'+e.id));await page.locator('#searchInput').fill('简');await layout();await page.locator('#searchInput').fill('张家山');assert.deepEqual(await page.evaluate(()=>searchUnified(searchQuery).map(e=>e.type+':'+e.id)),hits);
      await page.locator('#clearSearch').click();pass(width,'compact search preserves results and exit');
      await page.evaluate(()=>openResearchHub('mawangdui-silk'));await frames(page);assert.equal(await page.locator('.hub-section-empty').count(),4);assert.equal(await page.locator('.hub-section').count(),5);
      assert.ok(await page.locator('.hub-section-empty').evaluateAll(es=>es.every(e=>e.getBoundingClientRect().height<140)));await layout();pass(width,'four compact empty sections retain boundaries alongside existing papers');
      await page.goto(url);assert.equal(await page.locator('#latestUpdateDate').evaluate(e=>parseFloat(getComputedStyle(e).fontSize)>=13),true);
      await page.keyboard.press('Tab');await page.locator('[data-update-type="新论文"]').focus();await page.waitForFunction(()=>getComputedStyle(document.activeElement).outlineColor==='rgb(142, 48, 40)');assert.equal(await page.locator('[data-update-type="新论文"]').evaluate(e=>getComputedStyle(e).outlineColor),'rgb(142, 48, 40)');
      pass(width,'readable metadata and solid focus indicator');
    }
    assert.deepEqual(errors,[]);fs.mkdirSync(output,{recursive:true});fs.writeFileSync(path.join(output,'report.json'),JSON.stringify({report,metrics,errors},null,2));console.log(JSON.stringify({passed:report.length,metrics,errors,output},null,2));
  } finally {await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
