// Targeted publication/series integration checks; Edge + test-only Playwright.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || path.join(os.tmpdir(),'research-hubs-tests/node_modules/playwright'));
const root = path.resolve(__dirname,'..');
const output = process.env.PUBLICATION_TEST_OUTPUT || path.join(os.tmpdir(),'publication-intake-browser');
const allowed = new Set(['index.html','script.js','style.css','academic-updates.js','research-topics.js','data/research-hubs.js','data/core-bibliography.js','data/classic-papers.js','data/search-taxonomy.js','favicon.svg']);
const server = http.createServer((req,res)=>{
  const file = new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';
  if(!allowed.has(file)){res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript; charset=utf-8':file.endsWith('.css')?'text/css; charset=utf-8':file.endsWith('.svg')?'image/svg+xml':'text/html; charset=utf-8');
  res.end(fs.readFileSync(path.join(root,file)));
});
const frames = page=>page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
async function layout(page){
  assert.deepEqual(await page.evaluate(()=>({page:document.documentElement.scrollWidth>document.documentElement.clientWidth,
    overflow:[...document.querySelectorAll('main article,main h3,main a,main summary,main li')].filter(e=>e.getClientRects().length).filter(e=>{
      const r=e.getBoundingClientRect();
      // CJK closing punctuation can hang into card padding; inspect the painted title against its card.
      if(e.tagName==='H3' && e.closest('article')){
        const range=document.createRange();range.selectNodeContents(e);const card=e.closest('article').getBoundingClientRect();
        return [...range.getClientRects()].some(text=>text.left<card.left||text.right>card.right);
      }
      return r.left < -1 || r.right>innerWidth+1 || e.scrollWidth>e.clientWidth+1;
    }).map(e=>({node:e.className||e.tagName,text:e.textContent.slice(0,65)}))})),{page:false,overflow:[]});
}
(async()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
  const checks=[],errors=[];
  try{
    browser=await chromium.launch({channel:process.env.HUB_BROWSER_CHANNEL||'msedge',headless:true});
    const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));
    fs.mkdirSync(output,{recursive:true});
    for(const width of [320,375,390,430]){
      await page.setViewportSize({width,height:900});await page.goto(`http://127.0.0.1:${server.address().port}/`);await frames(page);
      assert.equal(await page.locator('#paperModuleCount').textContent(),'已收录 92 条');
      const featured=await page.locator('#coreGrid').innerHTML();
      const trigger=page.locator('[data-module="bibliography"]');await trigger.scrollIntoViewIfNeeded();await trigger.focus();await frames(page);
      const scroll=await page.evaluate(()=>scrollY);await trigger.press('Enter');await frames(page);
      assert.equal(await page.locator('#bibliographyGrid .bibliography-card').count(),17);
      const cards=page.locator('#bibliographyGrid .bibliography-card');
      assert.equal(await cards.locator('a').count(),1);
      assert.equal(await cards.locator('a').textContent(),'查看馆藏信息');
      assert.equal(await cards.locator('a').getAttribute('href'),'https://ci.nii.ac.jp/ncid/BB05580838');
      assert.doesNotMatch((await cards.allTextContents()).join(' '),/sourceNote|原始封面|本轮授权|网址待补|ISBN\s*undefined/);
      const series=cards.filter({has:page.locator('h3',{hasText:/^《长沙走马楼西汉简牍》$/})});
      const wuyi=cards.filter({has:page.locator('h3',{hasText:/^《长沙五一广场东汉简牍》$/})});
      for(const [card,count] of [[series,3],[wuyi,2]]){
        assert.equal(await card.locator('a').count(),0);
        assert.equal(await card.locator('details').getAttribute('open'),null);
        await card.locator('summary').click();assert.equal(await card.locator('li:visible').count(),count);await layout(page);
      }
      await page.locator('#bibliographySection').screenshot({path:path.join(output,`bibliography-${width}.png`)});
      await page.locator('#moduleBack').click();await frames(page);
      assert.equal(await trigger.evaluate(e=>e===document.activeElement),true);
      assert.ok(Math.abs(await page.evaluate(()=>scrollY)-scroll)<=2);
      assert.equal(await page.locator('#coreGrid').innerHTML(),featured);
      await page.locator('[data-module="resources"]').click();await frames(page);
      await page.locator('[data-category="📚 学术期刊"]').click();await frames(page);
      assert.equal(await page.getByRole('link',{name:'查看刊物信息',exact:true}).count(),3);
      assert.equal(await page.getByRole('link',{name:'查看刊物目录',exact:true}).count(),2);await layout(page);
      await page.locator('#moduleBack').click();await frames(page);
      for(const [query,title,volumes] of [['长沙走马楼西汉简牍（贰）','《长沙走马楼西汉简牍》',3],['长沙五一广场东汉简牍（玖）','《长沙五一广场东汉简牍》',2],['9787511809964','《汉代诉讼制度研究》',0]]){
        await page.locator('#searchInput').fill(query);await frames(page);
        const hit=page.locator('[data-search-type="bibliography"]');assert.equal(await hit.count(),1);
        assert.equal(await hit.locator('h3').textContent(),title);
        if(volumes){await hit.locator('summary').click();assert.equal(await hit.locator('li:visible').count(),volumes);assert.equal(await hit.locator('a').count(),0);}
        else assert.equal(await hit.locator('a').textContent(),'查看馆藏信息');
        await layout(page);
      }
      await page.locator('#searchInput').fill('');await frames(page);
      await page.evaluate(()=>openResearchHub('zoumalou-western-han-slips'));await frames(page);
      assert.equal(await page.locator('[data-hub-section="bibliography"] .bibliography-card').count(),3);
      assert.equal(await page.locator('[data-hub-section="bibliography"] details li').count(),3);
      await layout(page);
      checks.push({width,passed:true,books:17,seriesVolumes:5});
    }
    assert.deepEqual(errors,[]);fs.writeFileSync(path.join(output,'report.json'),JSON.stringify({checks,errors},null,2));
    console.log(JSON.stringify({passed:checks.length,checks,errors,output},null,2));
  }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
