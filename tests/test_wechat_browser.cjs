/* node tests/test_wechat_browser.cjs; uses test-only Playwright and installed Edge. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || path.join(os.tmpdir(),'research-hubs-tests/node_modules/playwright'));
const root = path.resolve(__dirname,'..');
const output = path.join(os.tmpdir(),'academic-wechat-browser');
const allowed = new Set(['index.html','script.js','style.css','academic-updates.js','research-topics.js','data/research-hubs.js','data/core-bibliography.js','data/classic-papers.js','data/search-taxonomy.js','favicon.svg']);
const server = http.createServer((req,res)=>{
  const file = new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';
  if(!allowed.has(file)){res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript; charset=utf-8':file.endsWith('.css')?'text/css; charset=utf-8':file.endsWith('.svg')?'image/svg+xml':'text/html; charset=utf-8');
  res.end(fs.readFileSync(path.join(root,file)));
});
const expected = {
  '简牍学研究':['wechat-jiandu-studies','官方学术机构 简牍研究'],
  '先秦秦汉史':['wechat-pre-qin-qin-han-history','学者运营 先秦秦汉 出土文献'],
  '汉语史与文献学微刊':['wechat-chinese-language-history-philology','学术平台 汉语史 文献学'],
  '书目文献':['wechat-bibliography-documents','学者运营 历史文献 目录版本'],
  '古典文献学微刊':['wechat-classical-philology','学术平台 古典文献 古籍整理']
};
const frames=page=>page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
(async()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;const report=[],errors=[];
  try{
    browser=await chromium.launch({channel:process.env.HUB_BROWSER_CHANNEL||'msedge',headless:true});
    const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));
    const url='http://127.0.0.1:'+server.address().port+'/';
    const visible=()=>page.locator('#wechatPanel .wechat-card:visible');
    const layout=async()=>{
      const metrics=await page.evaluate(()=>({width:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,
        overflow:[...document.querySelectorAll('#wechatPanel, #wechatPanel *')].filter(e=>e.getClientRects().length).filter(e=>{const r=e.getBoundingClientRect();return r.left < -1||r.right > document.documentElement.clientWidth+1||e.scrollWidth>e.clientWidth+1;}).map(e=>e.id||e.className||e.tagName)}));
      assert.ok(metrics.scrollWidth<=metrics.width,JSON.stringify(metrics));assert.deepEqual(metrics.overflow,[]);
    };
    fs.mkdirSync(output,{recursive:true});
    for(const width of [320,375,390,430,1280]){
      await page.setViewportSize({width,height:900});await page.goto(url);await frames(page);
      assert.equal(await page.locator('#wechatPanel').isVisible(),false);assert.equal(await visible().count(),0);
      assert.equal(await page.locator('[data-module="wechat"]').count(),1);
      await page.locator('[data-module="wechat"]').focus();await page.keyboard.press('Enter');await frames(page);
      assert.equal(await visible().count(),14);assert.equal(await page.locator('main > #wechatPanel').count(),1);
      const cards=await page.locator('#wechatPanel .wechat-card').evaluateAll(es=>es.map(e=>({id:e.id,name:e.querySelector('h3').textContent,categories:e.dataset.categories})));
      assert.equal(cards.length,14);assert.equal(new Set(cards.map(c=>c.name)).size,14);assert.equal(new Set(cards.map(c=>c.id)).size,14);
      assert.ok(cards.every(c=>/^wechat-[a-z0-9-]+$/.test(c.id)));
      for(const [name,[id,categories]]of Object.entries(expected))assert.deepEqual(cards.find(c=>c.name===name),{id,name,categories});
      assert.match(await page.locator('#wechat-chinese-historical-literature-society').textContent(),/认证主体：中国历史文献研究会/);
      assert.equal(await page.locator('#wechatPanel a, #wechatPanel img').count(),0);
      assert.equal(await page.locator('#categoryFilters [data-category="🏺 汉代简牍"]').count(),0);
      await layout();report.push(width+': one compact home entry opens all 14 unique existing accounts');
      if(width===390||width===1280)await page.locator('#wechatPanel').screenshot({path:path.join(output,'module-'+width+'.png')});
      await page.locator('#searchInput').fill('张家山');await frames(page);assert.equal(await page.locator('#wechatPanel').isVisible(),false);
      await page.locator('#clearSearch').click();await frames(page);assert.equal(await visible().count(),14);
      await page.locator('#moduleBack').click();await frames(page);assert.equal(await visible().count(),0);
      assert.equal(await page.locator('[data-module="wechat"]').evaluate(e=>e===document.activeElement),true);
      await page.locator('#searchInput').fill('学术公众号');await frames(page);await page.locator('[data-search-wechat]').click();await frames(page);
      assert.equal(await visible().count(),14);assert.equal(await page.locator('#unifiedSearchResults').isVisible(),false);
      await page.locator('#moduleBack').click();await frames(page);assert.equal(await page.locator('#searchInput').inputValue(),'学术公众号');
      assert.equal(await page.locator('#unifiedSearchResults').isVisible(),true);
      assert.equal(await page.locator('[data-search-wechat]').evaluate(e=>e===document.activeElement),true);
      await page.locator('#clearSearch').click();await frames(page);await layout();
      assert.equal(page.url(),url);assert.equal(page.context().pages().length,1);
      report.push(width+': search restores full module; explicit back restores search result and focus in place');
      await page.locator('[data-genre="🏺 汉代简牍"]').click();await frames(page);
      assert.equal(await page.evaluate(()=>activeCategory),'🏺 汉代简牍');assert.equal(await page.locator('[data-genre="🏺 汉代简牍"]').getAttribute('aria-pressed'),'true');
      assert.equal(await page.locator('#coreSection').isVisible(),true);assert.equal(await visible().count(),0);
      await page.locator('#returnHomeButton').click();await frames(page);assert.equal(await page.evaluate(()=>activeCategory),'全部');
      await page.locator('[data-module="wechat"]').click();await frames(page);assert.equal(await visible().count(),14);await layout();
      report.push(width+': Hero slips and home remain independent from the sole account module');
    }
    assert.deepEqual(errors,[]);fs.writeFileSync(path.join(output,'report.json'),JSON.stringify({report,errors},null,2));
    console.log('WeChat browser: '+report.length+'/'+report.length+' passed; '+output);
  }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
