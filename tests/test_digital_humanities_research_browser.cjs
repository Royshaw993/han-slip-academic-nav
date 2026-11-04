// Digital humanities research intake only: local static data, desktop and 375px.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),http=require('node:http');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||path.join(os.tmpdir(),'research-hubs-tests/node_modules/playwright'));
const root=path.resolve(__dirname,'..'),output=path.join(os.tmpdir(),'digital-humanities-research-intake');
const allowed=new Set(['index.html','script.js','style.css','academic-updates.js','research-topics.js','data/research-hubs.js','data/core-bibliography.js','data/classic-papers.js','data/search-taxonomy.js','favicon.svg']);
const server=http.createServer((req,res)=>{
  const name=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';
  if(!allowed.has(name)){res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type',name.endsWith('.js')?'text/javascript; charset=utf-8':name.endsWith('.css')?'text/css; charset=utf-8':name.endsWith('.svg')?'image/svg+xml':'text/html; charset=utf-8');
  res.end(fs.readFileSync(path.join(root,name)));
});
const frames=page=>page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
async function checkLayout(page){
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'viewport overflow');
  const errors=await page.locator('.classic-paper-card:visible').evaluateAll(cards=>cards.flatMap(card=>{
    const bounds=card.getBoundingClientRect(),failures=[];
    for(const el of card.querySelectorAll('h4,p,a')){
      const range=document.createRange();range.selectNodeContents(el);
      if([...range.getClientRects()].some(r=>r.left<bounds.left-1||r.right>bounds.right+1))failures.push(el.textContent);
    }
    return failures;
  }));
  assert.deepEqual(errors,[],'card text/link overflow');
}
async function expandPapers(page){while(await page.locator('#papersMore').isVisible()){await page.locator('#papersMore').click();await frames(page);}}
(async()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;const checks=[],errors=[],warnings=[];
  try{
    browser=await chromium.launch({channel:process.env.HUB_BROWSER_CHANNEL||'msedge',headless:true});
    fs.mkdirSync(output,{recursive:true});
    for(const width of [1280,375]){
      const page=await browser.newPage({viewport:{width,height:900}});
      page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='warning')warnings.push(m.text());});
      await page.goto('http://127.0.0.1:'+server.address().port+'/');await frames(page);
      const originals=await page.evaluate(()=>JSON.stringify([sites,coreBibliographyData,window.classicPapers,researchHubsData,academicUpdatesData]));
      const featured=await page.locator('#coreGrid').innerHTML();
      assert.equal(await page.locator('#paperModuleCount').textContent(),'已收录 92 条');
      assert.equal(await page.locator('#periodicalModuleCount').textContent(),'已收录 5 条');
      assert.equal(await page.locator('#bookModuleCount').textContent(),'已收录 17 条');
      assert.equal(await page.locator('#digitalHumanitiesModuleCount').textContent(),'已收录 31 条');
      assert.equal(await page.evaluate(()=>sites.length),65);
      const added=await page.evaluate(()=>window.classicPapers.filter(p=>p.id.startsWith('paper-dh-')));
      assert.equal(added.length,18);
      await checkLayout(page);
      await page.locator('[data-open-digital-humanities]').click();await frames(page);
      assert.equal(await page.locator('#resourcesSection').isVisible(),true);assert.equal(await page.locator('#papersSection').isVisible(),true);
      assert.equal(await page.locator('#papers-title').textContent(),'数字人文研究成果');
      assert.equal(await page.locator('#papersGrid [data-paper-id]').count(),12);
      await page.locator('#directoryResourcesMore').click();await frames(page);
      assert.equal(await page.locator('#siteGrid > .site-card').count(),13);
      await expandPapers(page);
      const ids=await page.locator('#papersGrid [data-paper-id]').evaluateAll(es=>es.map(e=>e.dataset.paperId));
      assert.equal(ids.length,18);assert.equal(new Set(ids).size,18);assert.deepEqual(ids.slice().sort(),added.map(p=>p.id).sort());
      assert.equal(await page.locator('#papersStatus').isVisible(),false);assert.equal(await page.locator('#papersCollapse').isVisible(),true);
      assert.equal(await page.locator('#siteGrid [data-paper-id]').count(),0);
      const grid=await page.locator('#papersGrid').innerHTML();
      for(const p of added){
        const card=page.locator('#papersGrid [data-paper-id="'+p.id+'"]');
        assert.equal(await card.locator('.bibliography-type').textContent(),p.type);
        assert.equal(await card.locator('[data-paper-source="primary"]').count(),p.url?1:0);
        assert.ok(!(await card.innerText()).match(/核验|权限未核|未取得|本轮|批准|2026-11-04/));
        if(!p.url)assert.equal(await card.getByText(/阅读原文/).count(),0);
        for(const a of await card.locator('a').all()){
          assert.equal(await a.getAttribute('target'),'_blank');assert.equal(await a.getAttribute('rel'),'noopener noreferrer');
          assert.match(await a.getAttribute('href'),/^https?:\/\//);
        }
      }
      assert.match(await page.locator('[data-paper-id="paper-dh-bamboo-virtual-unwrapping"]').innerText(),/制作的.*样本.*尚非真实出土/);
      assert.match(await page.locator('[data-paper-id="paper-dh-jinwen-mingsi-chazhong"]').innerText(),/算法细节另文说明/);
      const deep=page.locator('#papersGrid [data-paper-id="paper-dh-deepjiandu"]');
      assert.equal(await deep.locator('[data-related-id="nwnu-jiandu"]').getAttribute('href'),'https://jiandu.nwnu.edu.cn/');
      assert.equal(await deep.locator('[data-related-id="nwnu-deepjiandu"]').getAttribute('href'),'https://jiandu.nwnu.edu.cn/article/229.html');
      await checkLayout(page);
      await page.locator('#papersSection').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(output,'research-'+width+'.png')});
      await deep.scrollIntoViewIfNeeded();await page.screenshot({path:path.join(output,'deepjiandu-'+width+'.png')});
      for(const p of added){
        await page.locator('#searchInput').fill(p.title);await frames(page);
        const hit=page.locator('[data-search-type="paper"][data-search-id="'+p.id+'"]');
        assert.equal(await hit.count(),1,p.reviewId);assert.equal(await hit.locator('[data-paper-id]').count(),1);
        assert.equal(await page.locator('#papersSection').isVisible(),false);await checkLayout(page);
      }
      await page.locator('#searchInput').fill('');await frames(page);
      assert.equal(await page.locator('#papersGrid').innerHTML(),grid);
      assert.equal(await page.locator('#papersSection').isVisible(),true);
      await page.locator('#papersCollapse').click();await frames(page);assert.equal(await page.locator('#papersGrid [data-paper-id]').count(),12);
      await page.locator('[data-category="🛠️ 学术工具"]').click();await frames(page);assert.equal(await page.locator('#papersSection').isVisible(),false);
      await page.locator('[data-category="全部"]').click();await frames(page);assert.equal(await page.locator('#papersSection').isVisible(),true);
      await page.locator('[data-direction="简牍"]').click();await frames(page);assert.equal(await page.locator('#papersSection').isVisible(),false);
      await page.locator('[data-direction="数字人文"]').click();await frames(page);assert.equal(await page.locator('#papersSection').isVisible(),true);
      await page.locator('#moduleBack').click();await frames(page);
      assert.equal(await page.locator('#papersSection').isVisible(),false);
      assert.equal(await page.locator('#coreGrid').innerHTML(),featured);
      assert.equal(await page.locator('[data-open-digital-humanities]').evaluate(e=>document.activeElement===e),true);
      await page.locator('[data-open-periodicals]').click();await frames(page);
      assert.equal(await page.locator('[data-periodical-id]').count(),5);
      for(const [id,count,reviews] of [['digital-humanities-research-journal',2,['R01','R02']],['digital-humanities-collected-journal',2,['R03','R04']],['chutu-wenxian-journal',4,['R15']]]){
        const record=page.locator('[data-periodical-id="'+id+'"]');
        await record.locator('summary').click();assert.equal(await record.locator('[data-paper-id]:visible').count(),count);
        for(const review of reviews)assert.equal(await record.locator('[data-paper-id="'+added.find(p=>p.reviewId===review).id+'"]').count(),1);
      }
      await checkLayout(page);
      await page.locator('#moduleBack').click();await page.locator('[data-module="papers"]').click();await frames(page);
      await expandPapers(page);assert.equal(await page.locator('#papersGrid [data-paper-id]').count(),92);
      assert.equal(await page.locator('#papersStatus').isVisible(),false);
      for(const p of added)assert.equal(await page.locator('#papersGrid [data-paper-id="'+p.id+'"]').count(),1);
      await checkLayout(page);
      assert.equal(await page.evaluate(()=>JSON.stringify([sites,coreBibliographyData,window.classicPapers,researchHubsData,academicUpdatesData])),originals);
      assert.deepEqual(await page.evaluate(()=>classicPaperCatalog.warnings),[]);
      const noUrl=await page.evaluate(()=>{
        const host=document.createElement('div');host.innerHTML=classicPaperCardTemplate({id:'test-no-url',title:'无URL题录样本',author:'',journal:'',year:'',type:'期刊论文',note:'',url:'',accessType:'none'});
        return {title:host.querySelector('h4').textContent,links:host.querySelectorAll('a').length};
      });
      assert.deepEqual(noUrl,{title:'无URL题录样本',links:0});
      checks.push({width,papers:92,digitalResearch:18,digitalResources:13,periodicals:5,passed:true});
      await page.close();
    }
    assert.deepEqual(errors,[]);assert.deepEqual(warnings,[]);
    fs.writeFileSync(path.join(output,'report.json'),JSON.stringify({checks,errors,warnings},null,2));
    console.log(JSON.stringify({checks,errors,warnings,output},null,2));
  }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
