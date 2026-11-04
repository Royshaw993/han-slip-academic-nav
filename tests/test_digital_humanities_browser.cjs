// Targeted AI/digital humanities intake checks; local static site and test-only Playwright.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || path.join(os.tmpdir(),'research-hubs-tests/node_modules/playwright'));
const root = path.resolve(__dirname,'..');
const output = path.join(os.tmpdir(),'digital-humanities-intake-browser');
const allowed = new Set(['index.html','script.js','style.css','academic-updates.js','research-topics.js','data/research-hubs.js','data/core-bibliography.js','data/classic-papers.js','data/search-taxonomy.js','favicon.svg']);
const server = http.createServer((req,res)=>{
  const file = new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';
  if(!allowed.has(file)){res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript; charset=utf-8':file.endsWith('.css')?'text/css; charset=utf-8':file.endsWith('.svg')?'image/svg+xml':'text/html; charset=utf-8');
  res.end(fs.readFileSync(path.join(root,file)));
});
const frames = page=>page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
const ids = ['digital-humanities-research-journal','digital-humanities-collected-journal','ruc-digital-humanities-institute','tsinghua-cnki-digital-humanities-center','dhcn','fudan-zhuiyu-lianzhu','fudan-sifang-huitong','shidian-guji','imagej-fiji','collatex','epidoc','escriptorium','markus','docusky'];
async function layout(page){
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  assert.deepEqual(await page.locator('main .site-card:visible').evaluateAll(cards=>cards.flatMap(card=>{
    const bounds=card.getBoundingClientRect();
    return [...card.querySelectorAll('h3,.institution,.access-note,a')].filter(e=>{
      const range=document.createRange();range.selectNodeContents(e);
      return [...range.getClientRects()].some(r=>r.left<bounds.left-1||r.right>bounds.right+1);
    }).map(e=>e.textContent);
  })),[]);
}
(async()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
  const checks=[],errors=[];
  try{
    browser=await chromium.launch({channel:process.env.HUB_BROWSER_CHANNEL||'msedge',headless:true});
    const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));
    fs.mkdirSync(output,{recursive:true});
    for(const width of [320,390,1280]){
      await page.setViewportSize({width,height:900});await page.goto(`http://127.0.0.1:${server.address().port}/`);await frames(page);
      const home=await page.locator('#coreGrid').innerHTML();
      const protectedData=await page.evaluate(()=>JSON.stringify([coreBibliographyData,window.classicPapers,researchHubsData,academicUpdatesData]));
      assert.equal(await page.locator('#paperModuleCount').textContent(),'已收录 92 条');
      assert.equal(await page.locator('#periodicalModuleCount').textContent(),'已收录 5 条');
      await page.locator('[data-module="resources"]').click();await frames(page);
      await page.locator('[data-category="全部"]').click();await frames(page);
      while(await page.locator('#directoryResourcesMore').isVisible())await page.locator('#directoryResourcesMore').click();
      assert.equal(await page.locator('#siteGrid > .site-card').count(),64);
      assert.equal(await page.locator('#resourceModuleCount').textContent(),'已收录 64 条');
      assert.equal(await page.locator('#siteGrid h3').filter({hasText:/^武汉大学简帛研究中心$/}).count(),1);
      assert.equal(await page.locator('#siteGrid h3').filter({hasText:/^简帛网$/}).count(),1);
      await page.locator('[data-category="🏛️ 学术机构"]').click();await frames(page);
      assert.equal(await page.locator('#siteGrid > .site-card').count(),4);
      const centre=page.locator('#siteGrid > .site-card').filter({has:page.locator('h3',{hasText:/^武汉大学简帛研究中心$/})});
      assert.equal(await centre.locator('a').getAttribute('href'),'https://www.bsm.org.cn/?gaikuo/=');
      assert.equal(await centre.locator('a').textContent(),'查看机构介绍');
      for(const id of ids){
        const kind=await page.evaluate(id=>resourceKind(sites.find(s=>s.id===id)),id);
        const filter=({periodical:'📚 学术期刊',institution:'🏛️ 学术机构',tool:'🛠️ 学术工具'})[kind]||'全部';
        await page.locator('[data-category="'+filter+'"]').click();await frames(page);
        while(await page.locator('#directoryResourcesMore').isVisible())await page.locator('#directoryResourcesMore').click();
        const name=await page.evaluate(id=>sites.find(s=>s.id===id).name,id);
        assert.equal(await page.locator('#siteGrid h3').filter({hasText:new RegExp('^'+name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'$')}).count(),1,name);
      }
      await layout(page);
      await page.locator('[data-category="🛠️ 学术工具"]').click();await frames(page);
      await layout(page);
      if(width===390)await page.locator('#resourcesSection').screenshot({path:path.join(output,'tools-390.png')});
      await page.locator('[data-category="全部"]').click();await frames(page);
      await page.locator('[data-direction="数字人文"]').click();await frames(page);
      assert.equal(await page.locator('#siteGrid > .site-card').count(),12);
      await page.locator('#directoryResourcesMore').click();await frames(page);
      assert.equal(await page.locator('#siteGrid > .site-card').count(),13);
      await page.locator('[data-category="🛠️ 学术工具"]').click();await frames(page);
      assert.equal(await page.locator('#resources-title').textContent(),'研究工具');
      const directions=await page.locator('#siteGrid h3').allTextContents();
      assert.ok(directions.includes('CollateX'));assert.ok(!directions.includes('《数字人文研究》'));
      for(const name of ['简牍学术资源数据共享平台','简帛网','缀玉联珠：甲骨缀合信息库','四方会同：甲骨著录信息库','中国数字人文（DHCN）'])assert.ok(!directions.includes(name),name);
      await page.locator('#moduleBack').click();await frames(page);
      await page.locator('[data-open-periodicals]').click();await frames(page);
      assert.equal(await page.locator('[data-direction="数字人文"]').getAttribute('aria-pressed'),'false');
      assert.equal(await page.locator('[data-periodical-id]').count(),5);
      for(const [id,type] of [['digital-humanities-research-journal','学术期刊'],['digital-humanities-collected-journal','学术集刊']]){
        const card=page.locator(`[data-periodical-id="${id}"]`);
        assert.equal(await card.locator('.category-badge').textContent(),type);
        assert.equal(await card.locator('.visit-button').textContent(),'查看刊物目录');
        assert.equal(await card.locator('.visit-button').getAttribute('href'),await page.evaluate(id=>sites.find(s=>s.id===id).url,id));
        await card.locator('summary').click();assert.equal(await card.locator('[data-paper-id]:visible').count(),2);
      }
      await layout(page);
      if(width===390)await page.locator('#resourcesSection').screenshot({path:path.join(output,'periodicals-390.png')});
      await page.locator('#moduleBack').click();await frames(page);
      assert.equal(await page.locator('[data-direction="数字人文"]').getAttribute('aria-pressed'),'false');
      for(const id of ids){
        const data=await page.evaluate(id=>sites.find(s=>s.id===id),id);
        await page.locator('#searchInput').fill(data.name);await frames(page);
        const hit=page.locator('[data-search-type="resource"]').filter({has:page.locator('h3',{hasText:new RegExp('^'+data.name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'$')})});
        assert.equal(await hit.count(),1,data.name);
        assert.ok(!(await hit.innerText()).includes(data.readerNote));
        const condition=await page.evaluate(id=>resourceCardView(sites.find(s=>s.id===id)).condition,id);
        if(condition)assert.equal(await hit.locator('.access-note').textContent(),condition);
        assert.equal(await hit.locator('.visit-button').getAttribute('href'),data.url);
        assert.equal(await hit.locator('.visit-button').getAttribute('rel'),'noopener noreferrer');
        await layout(page);
      }
      await page.locator('#searchInput').fill('');await frames(page);
      assert.equal(await page.locator('#coreGrid').innerHTML(),home);
      assert.equal(await page.evaluate(()=>JSON.stringify([coreBibliographyData,window.classicPapers,researchHubsData,academicUpdatesData])),protectedData);
      assert.deepEqual(await page.evaluate(()=>{
        const host=document.createElement('div');host.innerHTML=renderSiteCard({...sites.find(s=>s.id==='docusky'),url:'',institution:''});
        return {links:host.querySelectorAll('a').length,title:host.querySelector('h3').textContent,institution:host.querySelector('.institution')};
      }),{links:0,title:'DocuSky数位人文学术研究平台',institution:null});
      await page.locator('[data-genre="🏺 汉代简牍"]').click();await frames(page);
      assert.equal(await page.locator('#coreGrid > .site-card').count(),4);
      assert.equal(await page.locator('#coreResourcesMore').isVisible(),false);
      assert.ok((await page.locator('#coreGrid h3').allTextContents()).every(name=>!name.startsWith('《')));
      await page.locator('[data-research-topic="zhangjiashan-hanjian"]').first().click();await frames(page);
      const hubLinks=await page.locator('[data-hub-section="resources"] .visit-button').evaluateAll(es=>es.map(e=>e.getAttribute('href')));
      assert.equal(new Set(hubLinks).size,hubLinks.length);
      assert.ok(hubLinks.includes('https://www.bsm.org.cn/'));
      await layout(page);
      checks.push({width,resources:64,publicRecords:64,added:14,periodicals:5,passed:true});
    }
    assert.deepEqual(errors,[]);fs.writeFileSync(path.join(output,'report.json'),JSON.stringify({checks,errors},null,2));
    console.log(JSON.stringify({checks,errors,output},null,2));
  }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
