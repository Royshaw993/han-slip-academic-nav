// Local Edge/Playwright checks for the periodical preset, shared links and return state.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),http=require('node:http');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||path.join(os.tmpdir(),'research-hubs-tests/node_modules/playwright'));
const root=path.resolve(__dirname,'..'),output=path.join(os.tmpdir(),'navigation-buttons-browser');
const allowed=new Set(['index.html','script.js','style.css','academic-updates.js','research-topics.js','data/research-hubs.js','data/core-bibliography.js','data/classic-papers.js','data/search-taxonomy.js','favicon.svg']);
const server=http.createServer((req,res)=>{
  const file=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';
  if(!allowed.has(file)){res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript; charset=utf-8':file.endsWith('.css')?'text/css; charset=utf-8':file.endsWith('.svg')?'image/svg+xml':'text/html; charset=utf-8');
  res.end(fs.readFileSync(path.join(root,file)));
});
const frames=page=>page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
async function layout(page){
  const result=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,
    nodes:[...document.querySelectorAll('main article,main section,main a,main summary,main button')].filter(e=>e.getClientRects().length).filter(e=>{const r=e.getBoundingClientRect();return r.left< -1||r.right>innerWidth+1||e.scrollWidth>e.clientWidth+1;}).map(e=>e.className||e.id)}));
  assert.deepEqual(result,{overflow:false,nodes:[]});
}
async function links(page){
  const result=await page.locator('a.visit-button:visible,a.update-link:visible,a.classic-paper-link:visible').evaluateAll(es=>es.map(e=>{const s=getComputedStyle(e);return {text:e.textContent,href:e.getAttribute('href'),target:e.target,rel:e.rel,color:s.color,background:s.backgroundColor,border:s.borderTop,padding:s.padding,height:e.getBoundingClientRect().height};}));
  for(const item of result){
    assert.ok(item.href&&item.href!=='TODO');assert.equal(item.target,'_blank');assert.equal(item.rel,'noopener noreferrer');
    assert.equal(item.color,'rgb(142, 48, 40)');assert.equal(item.background,'rgba(252, 250, 244, 0.7)');
    assert.equal(item.border,'1px solid rgb(205, 187, 158)');assert.equal(item.padding,'8px 12px');assert.ok(item.height>=44);
  }
  await layout(page);return result.length;
}
(async()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
  const checks=[],errors=[];let checkedLinks=0;
  try{
    browser=await chromium.launch({channel:process.env.HUB_BROWSER_CHANNEL||'msedge',headless:true});
    const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));fs.mkdirSync(output,{recursive:true});
    const url=`http://127.0.0.1:${server.address().port}/`;
    for(const width of [320,375,390,430]){
      await page.setViewportSize({width,height:900});await page.goto(url);await frames(page);
      await page.addStyleTag({content:'* { transition:none!important; }'});
      const data=await page.evaluate(()=>JSON.stringify([sites,coreBibliographyData,window.classicPapers,researchHubsData,academicUpdatesData]));
      assert.deepEqual(await page.locator('#navigationOverview li > span').allTextContents(),['学术网站与数据库','学术期刊与集刊','研究著作与整理本','学术公众号','学术论文','数字人文工具','网站使用说明']);
      assert.equal(await page.locator('#periodicalModuleCount').textContent(),'3 种');
      assert.equal(await page.locator('#coreGrid .featured-card').count(),4);checkedLinks+=await links(page);
      await page.evaluate(()=>{activeResourceType='🛠️ 学术工具';activeDirectionTag='释文';});
      const trigger=page.locator('[data-open-periodicals]');await trigger.scrollIntoViewIfNeeded();await trigger.focus();await frames(page);
      const scroll=await page.evaluate(()=>scrollY);await trigger.press('Enter');await frames(page);
      assert.equal(await page.evaluate(()=>activeModule),'resources');assert.equal(page.url(),url);
      assert.equal(await page.locator('#resources-title').textContent(),'学术期刊与集刊');
      const publications=page.locator('[data-periodical-id]');assert.equal(await publications.count(),3);
      for(const [id,count] of [['chutu-wenxian-journal',3],['chutu-wenxian-yanjiu',6],['chutu-wenxian-falvshi',0]]){
        const record=page.locator(`[data-periodical-id="${id}"]`);const source=await page.evaluate(id=>sites.find(s=>s.id===id).url,id);
        assert.equal(await record.locator('.site-card a').textContent(),'查看刊物信息');assert.equal(await record.locator('.site-card a').getAttribute('href'),source);
        await record.locator('summary').click();assert.equal(await record.locator('[data-paper-id]:visible').count(),count);
        if(!count)assert.match(await record.innerText(),/本站暂未收录该刊论文/);
      }
      checkedLinks+=await links(page);
      await page.locator('#resourcesSection').screenshot({path:path.join(output,`periodicals-${width}.png`)});
      const markup=await page.locator('#siteGrid').innerHTML();
      await page.locator('#searchInput').fill('张家山');await frames(page);
      await page.locator('#unifiedSearchResults [data-research-topic="zhangjiashan-hanjian"]').click();await frames(page);checkedLinks+=await links(page);
      await page.locator('[data-hub-back]').click();await frames(page);checkedLinks+=await links(page);
      await page.locator('[data-search-exit]').click();await frames(page);
      assert.equal(await page.locator('#siteGrid').innerHTML(),markup);assert.equal(await page.evaluate(()=>activeResourceType),'📚 学术期刊');
      await page.locator('#moduleBack').click();await frames(page);
      assert.equal(await trigger.evaluate(e=>e===document.activeElement),true);assert.ok(Math.abs(await page.evaluate(()=>scrollY)-scroll)<=2);
      assert.equal(await page.evaluate(()=>activeResourceType),'🛠️ 学术工具');assert.equal(await page.evaluate(()=>activeDirectionTag),'释文');
      await page.locator('[data-module="bibliography"]').click();await frames(page);
      assert.equal(await page.locator('#bibliographyGrid .bibliography-card').count(),17);assert.equal(await page.locator('#bibliographyGrid a').count(),1);
      const catalog=page.locator('#bibliographyGrid a');assert.equal(await catalog.textContent(),'查看馆藏信息');checkedLinks+=await links(page);
      await page.keyboard.press('Tab');await catalog.focus();
      assert.equal(await catalog.evaluate(e=>getComputedStyle(e).outlineWidth),'3px');
      await catalog.hover();await frames(page);assert.equal(await catalog.evaluate(e=>getComputedStyle(e).borderTopColor),'rgb(142, 48, 40)');
      assert.equal(await catalog.evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(238, 228, 212)');
      await page.mouse.move(0,0);await page.locator('#moduleBack').click();await frames(page);
      await page.locator('[data-module="papers"]').click();while(await page.locator('#papersMore').isVisible())await page.locator('#papersMore').click();await frames(page);
      assert.equal(await page.locator('#papersGrid [data-paper-id]').count(),74);checkedLinks+=await links(page);
      for(const source of await page.locator('#papersGrid [data-paper-source="primary"]').evaluateAll(es=>es.map(e=>({id:e.closest('[data-paper-id]').dataset.paperId,href:e.getAttribute('href')}))))assert.equal(source.href,await page.evaluate(id=>window.classicPapers.find(p=>p.id===id).url,source.id));
      await page.locator('#moduleBack').click();await frames(page);
      await page.locator('#searchInput').fill('9787511809964');await frames(page);assert.equal(await page.locator('[data-search-type="bibliography"] a').textContent(),'查看馆藏信息');checkedLinks+=await links(page);
      await page.locator('[data-search-exit]').click();await frames(page);
      assert.equal(await page.evaluate(()=>JSON.stringify([sites,coreBibliographyData,window.classicPapers,researchHubsData,academicUpdatesData])),data);
      const disabled=await page.evaluate(()=>{const e=document.createElement('button');e.className='visit-button';e.disabled=true;document.body.append(e);const s=getComputedStyle(e);const value={opacity:s.opacity,pointer:s.pointerEvents};e.remove();return value;});
      assert.deepEqual(disabled,{opacity:'0.65',pointer:'none'});
      checks.push({width,pass:true,periodicals:3,relatedPapers:[3,6,0]});
    }
    assert.deepEqual(errors,[]);fs.writeFileSync(path.join(output,'report.json'),JSON.stringify({checks,checkedLinks,errors},null,2));
    console.log(JSON.stringify({passed:checks.length,checkedLinks,errors,output},null,2));
  }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
