// Focused local Edge checks. External resource status is recorded in the audit report.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),http=require('node:http');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||path.join(os.tmpdir(),'research-hubs-tests/node_modules/playwright'));
const root=path.resolve(__dirname,'..'),output=path.join(os.tmpdir(),'stone-resources-audit-2026-11-03','local-preview');
const files=new Set(['index.html','script.js','style.css','academic-updates.js','research-topics.js','data/research-hubs.js','data/core-bibliography.js','data/classic-papers.js','data/search-taxonomy.js','favicon.svg']);
const server=http.createServer((req,res)=>{
  const file=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';
  if(!files.has(file)){res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript; charset=utf-8':file.endsWith('.css')?'text/css; charset=utf-8':file.endsWith('.svg')?'image/svg+xml':'text/html; charset=utf-8');
  res.end(fs.readFileSync(path.join(root,file)));
});
const frames=page=>page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
const ids=['nlc-beitie-jinghua','shl-beitie','zju-epitaphs','ncl-stone-rubbings','pku-rare-books','shukutoku-stone-rubbings','kyoto-stone-rubbings','china-jinshi-zonglu'];
async function layout(page){
  const result=await page.evaluate(()=>({page:document.documentElement.scrollWidth>document.documentElement.clientWidth,
    nodes:[...document.querySelectorAll('main article,main h3,main button,main a,.filter-list')].filter(e=>e.getClientRects().length).filter(e=>{const r=e.getBoundingClientRect();return r.left< -1||r.right>innerWidth+1||e.scrollWidth>e.clientWidth+1;}).map(e=>e.className||e.tagName)}));
  assert.deepEqual(result,{page:false,nodes:[]});
}
(async()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;const checks=[],errors=[];
  try{
    browser=await chromium.launch({channel:process.env.HUB_BROWSER_CHANNEL||'msedge',headless:true});
    const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));fs.mkdirSync(output,{recursive:true});
    const url=`http://127.0.0.1:${server.address().port}/`;
    for(const width of [320,375,390,430,1280]){
      await page.setViewportSize({width,height:900});await page.goto(url);await frames(page);
      assert.equal(await page.locator('#coreGrid .featured-card:visible').count(),4);
      const featured=await page.locator('#coreGrid').innerHTML();
      const data=await page.evaluate(()=>JSON.stringify(sites));
      assert.equal(await page.locator('#core-title').innerText(),'精选学术资源');
      assert.equal(await page.locator('#coreSection .section-kicker').innerText(),'FEATURED ACADEMIC RESOURCES');
      assert.equal(await page.locator('#paperModuleCount').innerText(),'74篇');assert.equal(await page.locator('#bookModuleCount').innerText(),'17 本');assert.equal(await page.locator('#periodicalModuleCount').innerText(),'3 种');
      await page.locator('[data-genre="🏺 汉代简牍"]').click();await frames(page);
      assert.equal(await page.locator('#core-title').innerText(),'学术网站与数据库');
      assert.equal(await page.locator('#core-kicker').innerText(),'ACADEMIC RESOURCES');
      assert.equal(await page.locator('#coreGrid .site-card:visible').count(),4);
      assert.equal(await page.locator('#researchTopics .topic-button:visible').count(),4);
      assert.doesNotMatch(await page.locator('#researchTopics').innerText(),/清华|殷墟|西周|马王堆/);
      assert.equal(await page.locator('#navigationOverview').isVisible(),true);
      assert.equal(await page.locator('#bibliographyGrid .bibliography-card:visible').count(),0);
      assert.equal(await page.locator('#papersGrid [data-paper-id]:visible').count(),0);
      assert.equal(await page.locator('#literatureGrid article:visible').count(),4);
      assert.deepEqual(await page.evaluate(()=>[...document.querySelector('main').children].filter(e=>['topicsSection','coreSection','literatureSection','navigationOverview','updatesSection'].includes(e.id)).map(e=>e.id)),['updatesSection','topicsSection','coreSection','literatureSection','navigationOverview']);
      await layout(page);
      if(width===375||width===1280)await page.screenshot({path:path.join(output,`han-page-${width}.png`),fullPage:true});
      await page.locator('#coreResourcesMore').focus();await page.locator('#coreResourcesMore').press('Enter');await frames(page);
      assert.equal(await page.locator('#coreGrid .site-card:visible').count(),7);
      assert.equal(await page.locator('#coreResourcesCollapse').evaluate(e=>e===document.activeElement),true);
      await page.locator('#researchTopics .topic-button').first().click();await frames(page);
      await page.locator('[data-hub-back]').click();await frames(page);
      assert.equal(await page.locator('#coreGrid .site-card:visible').count(),7);
      await page.locator('#searchInput').fill('清华简');await frames(page);
      assert.ok(await page.locator('[data-search-type="hub"][data-search-id="qinghua-slips"]').count());
      await page.locator('[data-search-exit]').click();await frames(page);
      assert.equal(await page.locator('#coreGrid .site-card:visible').count(),7);
      await page.locator('#coreResourcesCollapse').click();await frames(page);
      assert.equal(await page.locator('#coreGrid .site-card:visible').count(),4);
      await page.locator('#literatureMore').click();await frames(page);assert.equal(await page.locator('#literatureGrid article:visible').count(),8);
      await page.locator('#literatureCollapse').click();await frames(page);assert.equal(await page.locator('#literatureGrid article:visible').count(),4);
      await page.locator('#updatesToggle').click();await frames(page);
      assert.equal(await page.locator('#updatesGrid .update-card:visible').count(),await page.evaluate(()=>academicUpdatesData.filter(isHanUpdate).length));
      await layout(page);
      await page.locator('#returnHomeButton').click();await frames(page);
      assert.equal(await page.locator('#coreGrid').innerHTML(),featured);
      // Regression: the original stone genre itself must show the full list before opening the directory.
      await page.locator('[data-genre="石刻"]').click();await frames(page);
      assert.equal(await page.locator('#core-title').innerText(),'学术网站与数据库');
      assert.equal(await page.locator('#coreGrid .site-card:visible').count(),4);
      await page.locator('#coreResourcesMore').scrollIntoViewIfNeeded();await page.locator('#coreResourcesMore').focus();await frames(page);
      const stoneScroll=await page.evaluate(()=>scrollY);
      await page.locator('#coreResourcesMore').press('Enter');await frames(page);
      assert.ok(Math.abs(await page.evaluate(()=>scrollY)-stoneScroll)<=2);
      assert.equal(await page.locator('#coreGrid .site-card:visible').count(),8);
      await page.locator('#coreResourcesMore').click();await frames(page);
      assert.equal(await page.locator('#coreGrid .site-card:visible').count(),12);
      await page.locator('#coreResourcesMore').click();await frames(page);
      assert.equal(await page.locator('#coreGrid .site-card:visible').count(),13);
      assert.deepEqual(await page.locator('#coreGrid h3').allTextContents(),await page.evaluate(()=>sites.filter(s=>s.resourceCategories?.includes('石刻')).map(s=>s.name)));
      assert.doesNotMatch(await page.locator('#coreGrid').innerText(),/核验|超时|未核|待复核|2026-11-03/);
      const genre=await page.locator('#coreGrid').innerHTML();
      await layout(page);
      if(width===375||width===1280)await page.locator('#coreSection').screenshot({path:path.join(output,`stone-genre-${width}.png`)});
      await page.locator('#searchInput').fill('中国金石总录');await frames(page);
      assert.equal(await page.locator('[data-search-type="resource"][data-search-id="china-jinshi-zonglu"]').count(),1);
      await page.locator('[data-search-exit]').click();await frames(page);
      assert.equal(await page.locator('#coreGrid').innerHTML(),genre);
      assert.equal(await page.locator('#core-title').innerText(),'学术网站与数据库');
      await page.locator('#returnHomeButton').click();await frames(page);
      assert.equal(await page.locator('#coreGrid').innerHTML(),featured);
      assert.equal(await page.locator('#core-title').innerText(),'精选学术资源');
      await page.locator('[data-module="resources"]').click();await frames(page);
      assert.equal(await page.locator('#resources-title').innerText(),'学术网站与数据库');
      assert.equal(await page.locator('#resourcesSection .section-kicker').innerText(),'ACADEMIC WEBSITES & DATABASES');
      assert.equal(await page.locator('#siteGrid .site-card').count(),12);
      await page.locator('#directoryResourcesMore').scrollIntoViewIfNeeded();await page.locator('#directoryResourcesMore').focus();await frames(page);
      const directoryScroll=await page.evaluate(()=>scrollY);
      await page.locator('#directoryResourcesMore').press('Enter');await frames(page);assert.equal(await page.locator('#siteGrid .site-card').count(),24);
      assert.ok(Math.abs(await page.evaluate(()=>scrollY)-directoryScroll)<=2);
      await page.locator('#searchInput').fill('碑帖菁华');await frames(page);
      await page.locator('[data-search-exit]').click();await frames(page);assert.equal(await page.locator('#siteGrid .site-card').count(),24);
      await page.locator('#directoryResourcesCollapse').click();await frames(page);assert.equal(await page.locator('#siteGrid .site-card').count(),12);
      await page.locator('[data-category="🪨 石刻资源"]').click();await frames(page);
      assert.equal(await page.locator('#siteGrid .site-card').count(),12);
      await page.locator('#directoryResourcesMore').click();await frames(page);
      assert.equal(await page.locator('#siteGrid .site-card').count(),13);
      assert.match(await page.locator('#siteGrid').innerText(),/旧格式阅读提示/);
      assert.equal(await page.locator('#coreGrid').innerHTML(),featured);
      assert.equal(await page.locator('#categoryFilters [aria-pressed="true"]').innerText(),'🪨 石刻资源');
      const markup=await page.locator('#siteGrid').innerHTML();
      const card=page.locator('#siteGrid .site-card').filter({has:page.locator('h3',{hasText:'中国金石总录'})});
      assert.equal(await card.count(),1);assert.equal(await card.locator('a').count(),1);
      assert.equal(await card.locator('a').getAttribute('href'),'http://121.89.86.151:6722/home');
      assert.equal(await card.locator('a').innerText(),'进入数据库');
      assert.doesNotMatch(await page.locator('#siteGrid').innerText(),/核验|超时|未核|待复核|2026-11-03/);
      for(const link of await page.locator('#siteGrid a').evaluateAll(es=>es.map(e=>{const s=getComputedStyle(e);return{href:e.getAttribute('href'),target:e.target,rel:e.rel,color:s.color,height:e.getBoundingClientRect().height};}))){
        assert.match(link.href,/^https?:\/\//);assert.equal(link.target,'_blank');assert.equal(link.rel,'noopener noreferrer');assert.equal(link.color,'rgb(142, 48, 40)');assert.ok(link.height>=44);
      }
      await layout(page);
      if(width===375||width===1280)await page.locator('#resourcesSection').screenshot({path:path.join(output,`stone-directory-${width}.png`)});
      for(const id of ids){
        const name=await page.evaluate(id=>sites.find(s=>s.id===id).name,id);
        await page.locator('#searchInput').fill(name);await frames(page);
        const entry=page.locator(`[data-search-type="resource"][data-search-id="${id}"]`);assert.equal(await entry.count(),1);
        assert.equal(await entry.locator('a').count(),1);
        if(id==='china-jinshi-zonglu')assert.equal(await entry.locator('a').getAttribute('href'),'http://121.89.86.151:6722/home');
        assert.doesNotMatch(await entry.innerText(),/核验|超时|未核|待复核|2026-11-03|sourceNote/);await layout(page);
      }
      if(width===375)await page.locator('#unifiedSearchResults').screenshot({path:path.join(output,'stone-jinshi-search-375.png')});
      await page.locator('[data-search-exit]').click();await frames(page);
      assert.equal(await page.locator('#siteGrid').innerHTML(),markup);
      assert.equal(await page.evaluate(()=>activeResourceType),'🪨 石刻资源');
      await page.locator('#moduleBack').click();await frames(page);
      assert.equal(await page.locator('#coreGrid').innerHTML(),featured);
      // The pre-existing stone genre remains a valid route to the directory.
      await page.locator('[data-genre="石刻"]').click();await frames(page);
      assert.equal(await page.locator('#coreGrid .site-card:visible').count(),4);
      await page.locator('[data-module="resources"]').click();await frames(page);
      assert.equal(await page.locator('#siteGrid .site-card').count(),12);
      await page.locator('#directoryResourcesMore').click();await frames(page);
      assert.equal(await page.locator('#siteGrid .site-card').count(),13);
      await page.locator('#moduleBack').click();await frames(page);
      assert.equal(await page.evaluate(()=>activeCategory),'石刻');await layout(page);
      assert.equal(await page.locator('#coreGrid .site-card:visible').count(),4);
      assert.equal(await page.locator('#core-title').innerText(),'学术网站与数据库');
      assert.equal(await page.evaluate(()=>JSON.stringify(sites)),data);
      checks.push(`${width}px: home 4, Han 4→7→4 and unified literature, stone 4→8→12→13, directory 12→24→12, precise Han relations, search, titles, focus and return state`);
    }
    assert.deepEqual(errors,[]);fs.writeFileSync(path.join(output,'result.json'),JSON.stringify({checks,errors},null,2));console.log(JSON.stringify({checks,errors,output},null,2));
  }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
