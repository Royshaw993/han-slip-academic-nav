// Resource-card display policy only: desktop and 375px, no external navigation.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),http=require('node:http');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||path.join(os.tmpdir(),'research-hubs-tests/node_modules/playwright'));
const root=path.resolve(__dirname,'..'),output=path.join(os.tmpdir(),'resource-cards-display');
const allowed=new Set(['index.html','script.js','style.css','academic-updates.js','research-topics.js','data/research-hubs.js','data/core-bibliography.js','data/classic-papers.js','data/search-taxonomy.js','favicon.svg']);
const server=http.createServer((req,res)=>{const name=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';if(!allowed.has(name)){res.writeHead(404);res.end();return;}res.setHeader('Content-Type',name.endsWith('.js')?'text/javascript; charset=utf-8':name.endsWith('.css')?'text/css; charset=utf-8':name.endsWith('.svg')?'image/svg+xml':'text/html; charset=utf-8');res.end(fs.readFileSync(path.join(root,name)));});
const frames=page=>page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
async function checkCards(page,selector){
  const result=await page.locator(selector).evaluateAll(cards=>{
    const failures=[];
    for(const card of cards){
      const name=card.querySelector('h3').textContent,source=sites.find(s=>s.name===name);
      if(!source){failures.push(name+': source missing');continue;}
      const text=card.textContent;
      for(const key of ['sourceNote','accessNote','readerNote','fitFor'])if(source[key]&&text.includes(source[key]))failures.push(name+': raw '+key);
      if(card.querySelector('.fit-for')||/核验日期|官网可能不稳定|连接可能不稳定|权限未核|适合：/.test(text))failures.push(name+': audit text');
      if(!card.classList.contains('featured-card')&&card.querySelector('.description').textContent!==source.description)failures.push(name+': changed description');
      const key=value=>value.normalize('NFKC').toLowerCase().replace(/[\s《》〈〉（）()·—–-]/g,'');
      const metadata=[card.querySelector('h3'),card.querySelector('.institution'),card.querySelector('.core-subtitle')].filter(Boolean).map(e=>key(e.textContent));
      if(new Set(metadata).size!==metadata.length)failures.push(name+': duplicate metadata');
      const tags=[...card.querySelectorAll('.keyword')].map(e=>key(e.textContent));
      if(tags.length>4||new Set(tags).size!==tags.length)failures.push(name+': tags');
      const link=card.querySelector('a');
      if(source.url&&(!link||link.getAttribute('href')!==source.url))failures.push(name+': changed link');
      const bounds=card.getBoundingClientRect();
      for(const e of card.querySelectorAll('h3,.institution,.core-subtitle,.access-note,.keyword,a')){
        const range=document.createRange();range.selectNodeContents(e);
        if([...range.getClientRects()].some(r=>r.left<bounds.left-1||r.right>bounds.right+1))failures.push(name+': text overflow');
      }
    }
    return {count:cards.length,failures};
  });
  assert.deepEqual(result.failures,[]);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);return result.count;
}
async function expand(page){while(await page.locator('#directoryResourcesMore').isVisible())await page.locator('#directoryResourcesMore').click();await frames(page);}
(async()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;const checks=[],errors=[];
  try{
    browser=await chromium.launch({channel:process.env.HUB_BROWSER_CHANNEL||'msedge',headless:true});const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));fs.mkdirSync(output,{recursive:true});
    for(const width of [375,1280]){
      await page.setViewportSize({width,height:900});await page.goto(`http://127.0.0.1:${server.address().port}/`);await frames(page);
      const records=await page.evaluate(()=>JSON.stringify([sites,coreBibliographyData,window.classicPapers,researchHubsData,academicUpdatesData]));
      const home=await page.locator('#coreGrid').innerHTML();assert.equal(await checkCards(page,'#coreGrid > .site-card'),4);
      await page.locator('[data-module="resources"]').click();await frames(page);await expand(page);assert.equal(await checkCards(page,'#siteGrid > .site-card'),64);
      for(const [type,total] of [['🧱 古文字数据库',34],['🏛️ 学术机构',4],['🛠️ 学术工具',16],['📚 学术期刊',5]]){
        await page.locator(`[data-category="${type}"]`).click();await frames(page);await expand(page);assert.equal(await checkCards(page,'#siteGrid .site-card'),total);
        if(type==='🛠️ 学术工具'){
          const ctext=page.locator('#siteGrid > .site-card').filter({has:page.locator('h3',{hasText:'中国哲学书电子化计划'})});
          assert.equal(await ctext.locator('.core-subtitle').count(),0);assert.equal(await ctext.locator('.institution').textContent(),'Chinese Text Project');
          const docu=page.locator('#siteGrid > .site-card').filter({has:page.locator('h3',{hasText:'DocuSky数位人文学术研究平台'})});
          assert.equal(await docu.locator('.access-note').textContent(),'需申请账号；仅限学术研究');
          await ctext.screenshot({path:path.join(output,`ctext-${width}.png`)});
        }
        if(type==='🏛️ 学术机构'){
          const ruc=page.locator('#siteGrid > .site-card').filter({has:page.locator('h3',{hasText:'中国人民大学数字人文研究院'})});
          assert.equal(await ruc.locator('.access-note,.institution').count(),0);await ruc.screenshot({path:path.join(output,`institution-${width}.png`)});
        }
      }
      await page.locator('#moduleBack').click();await frames(page);await page.locator('[data-open-digital-humanities]').click();await frames(page);await expand(page);assert.equal(await checkCards(page,'#siteGrid > .site-card'),13);
      for(const query of ['CCL','eScriptorium','殷周金文暨青銅器資料庫']){
        await page.locator('#searchInput').fill(query);await frames(page);assert.ok(await checkCards(page,'[data-search-type="resource"] > .site-card')>0);
      }
      await page.locator('#searchInput').fill('');await frames(page);await page.locator('#moduleBack').click();await frames(page);
      assert.equal(await page.locator('#coreGrid').innerHTML(),home);
      await page.locator('[data-research-topic="zhangjiashan-hanjian"]').first().click();await frames(page);assert.equal(await checkCards(page,'[data-hub-section="resources"] .site-card'),3);
      assert.equal(await page.evaluate(()=>JSON.stringify([sites,coreBibliographyData,window.classicPapers,researchHubsData,academicUpdatesData])),records);
      checks.push({width,publicResources:64,digitalHumanities:13,passed:true});
    }
    assert.deepEqual(errors,[]);fs.writeFileSync(path.join(output,'report.json'),JSON.stringify({checks,errors},null,2));console.log(JSON.stringify({checks,errors,output},null,2));
  }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
