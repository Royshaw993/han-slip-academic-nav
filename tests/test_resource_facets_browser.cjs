// Focused resource facets / navigation acceptance at the requested 375px viewport.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),http=require('node:http');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||path.join(os.tmpdir(),'research-hubs-tests/node_modules/playwright'));
const root=path.resolve(__dirname,'..'),output=path.join(os.tmpdir(),'resource-facets-375');
const allowed=new Set(['index.html','script.js','style.css','academic-updates.js','research-topics.js','data/research-hubs.js','data/core-bibliography.js','data/classic-papers.js','data/search-taxonomy.js','favicon.svg']);
const server=http.createServer((req,res)=>{const name=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';if(!allowed.has(name)){res.writeHead(404);res.end();return;}res.setHeader('Content-Type',name.endsWith('.js')?'text/javascript; charset=utf-8':name.endsWith('.css')?'text/css; charset=utf-8':name.endsWith('.svg')?'image/svg+xml':'text/html; charset=utf-8');res.end(fs.readFileSync(path.join(root,name)));});
const frames=page=>page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
const types=['全部','🧱 古文字数据库','📚 学术期刊','🏛️ 学术机构','🛠️ 学术工具','🌏 海外汉学'];
const directions=['','甲骨','金文','石刻','简牍','帛书','数字人文'];
const expected=[[64,11,10,13,10,7,12],[34,9,8,13,4,2,0],[5,2,2,0,3,2,2],[4,0,0,0,2,2,2],[16,0,0,0,0,0,7],[30,6,6,7,2,1,6]];
async function layout(page){
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  assert.deepEqual(await page.locator('.resource-facet-row button:visible').evaluateAll(es=>es.filter(e=>{const r=e.getBoundingClientRect();return r.left<0||r.right>innerWidth||e.scrollWidth>e.clientWidth+1;}).map(e=>e.textContent)),[]);
}
(async()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;const errors=[],checks=[];
  try{
    browser=await chromium.launch({channel:process.env.HUB_BROWSER_CHANNEL||'msedge',headless:true});
    const page=await browser.newPage({viewport:{width:375,height:900}});page.on('pageerror',e=>errors.push(e.message));
    fs.mkdirSync(output,{recursive:true});await page.goto(`http://127.0.0.1:${server.address().port}/`);await frames(page);
    const home=await page.locator('#coreGrid').innerHTML();
    const records=await page.evaluate(()=>JSON.stringify([sites,coreBibliographyData,window.classicPapers,researchHubsData,academicUpdatesData]));
    assert.deepEqual(await page.locator('#navigationOverview li > span').allTextContents(),['学术资源','学术刊物','研究书目','学术公众号','学术论文','数字人文','网站使用说明']);
    assert.equal(await page.locator('#digitalHumanitiesModuleCount').textContent(),'已收录 30 条');
    assert.equal(await page.locator('[data-open-digital-humanities]').isEnabled(),true);
    await page.locator('[data-module="resources"]').click();await frames(page);
    assert.deepEqual(await page.locator('#categoryFilters button').allTextContents(),['全部','数据库','学术刊物','研究机构','研究工具','海外资源']);
    assert.deepEqual(await page.locator('#researchTags button').allTextContents(),['全部','甲骨','金文','石刻','简牍','帛书','数字人文']);
    for(let i=0;i<types.length;i++){
      await page.locator(`[data-category="${types[i]}"]`).click();await frames(page);
      for(let j=0;j<directions.length;j++){
        await page.locator(`[data-direction="${directions[j]}"]`).click();await frames(page);
        assert.equal(await page.evaluate(()=>sites.filter(matchesResourceBase).filter(matchesResourceDirection).length),expected[i][j],`${types[i]} + ${directions[j]||'全部'}`);
        assert.equal(await page.locator('#siteGrid > .site-card,#siteGrid > .periodical-record').count(),Math.min(12,expected[i][j]));
        assert.equal(await page.locator('#directoryResourceStatus').isVisible(),expected[i][j]>12);
        assert.equal(await page.locator(`[data-direction="${directions[j]}"]`).getAttribute('aria-pressed'),'true');
        await layout(page);
      }
    }
    checks.push('42 type/direction combinations');
    await page.locator('[data-category="🧱 古文字数据库"]').click();await page.locator('[data-direction="石刻"]').click();await frames(page);
    await page.locator('#directoryResourcesMore').click();await frames(page);
    assert.equal(await page.locator('#siteGrid > .site-card').count(),13);
    assert.equal(await page.locator('#directoryResourceStatus').isVisible(),false);
    assert.equal(await page.locator('#directoryResourcesCollapse').isVisible(),true);
    await page.locator('#directoryResourcesCollapse').click();await frames(page);assert.equal(await page.locator('#siteGrid > .site-card').count(),12);
    await page.locator('[data-direction="简牍"]').click();await frames(page);
    assert.deepEqual((await page.locator('#siteGrid h3').allTextContents()).sort(),['简牍学术资源数据共享平台','简牍字典','贯联汗青','先秦甲骨金文簡牘詞彙資料庫'].sort());
    await page.locator('.filters').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(output,'database-slips-375.png')});
    await page.locator('[data-category="🌏 海外汉学"]').click();await page.locator('[data-direction="石刻"]').click();await frames(page);
    const html=await page.locator('#siteGrid').innerHTML();
    await page.locator('#searchInput').fill('武汉大学简帛研究中心');await frames(page);
    for(const id of ['bsm','wuhan-bamboo-silk-center'])assert.equal(await page.locator(`[data-search-type="resource"][data-search-id="${id}"]`).count(),1);
    assert.equal(await page.evaluate(()=>searchTypeLabels.resource),'学术资源');
    assert.ok((await page.locator('.search-result-meta').allTextContents()).every(t=>!t.includes('学术网站与数据库')));
    await page.locator('#searchInput').fill('');await frames(page);assert.equal(await page.locator('#siteGrid').innerHTML(),html);
    assert.equal(await page.evaluate(()=>activeResourceType),'🌏 海外汉学');assert.equal(await page.evaluate(()=>activeDirectionTag),'石刻');
    checks.push('slips / stone databases, full-list status, search state');
    await page.locator('#moduleBack').click();await frames(page);
    await page.locator('[data-open-digital-humanities]').click();await frames(page);
    assert.equal(await page.locator('#resources-title').textContent(),'数字人文');assert.equal(await page.evaluate(()=>activeDirectionTag),'数字人文');
    assert.equal(await page.locator('#directoryResourcesMore').isVisible(),false);assert.equal(await page.locator('#siteGrid > .site-card').count(),12);
    assert.equal(await page.locator('#directoryResourceStatus').isVisible(),false);
    await page.locator('.filters').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(output,'digital-humanities-375.png')});
    await page.locator('#moduleBack').click();await frames(page);assert.equal(await page.locator('[data-open-digital-humanities]').evaluate(e=>e===document.activeElement),true);
    assert.equal(await page.locator('#coreGrid').innerHTML(),home);
    await page.locator('[data-open-periodicals]').click();await frames(page);assert.equal(await page.locator('#resources-title').textContent(),'学术刊物');assert.equal(await page.locator('[data-periodical-id]').count(),5);
    assert.deepEqual(await page.locator('[data-periodical-id] .category-badge').allTextContents(),['学术期刊','学术集刊','学术集刊','学术期刊','学术集刊']);
    assert.equal(await page.locator('#directoryResourceStatus').isVisible(),false);
    await page.locator('#moduleBack').click();await page.locator('[data-module="bibliography"]').click();await frames(page);assert.equal(await page.locator('#bibliography-title').textContent(),'研究书目');assert.equal(await page.locator('#bibliographyGrid > .bibliography-card').count(),17);
    await page.locator('#moduleBack').click();await frames(page);
    assert.equal(await page.evaluate(()=>JSON.stringify([sites,coreBibliographyData,window.classicPapers,researchHubsData,academicUpdatesData])),records);
    assert.deepEqual(errors,[]);checks.push('digital entry, names, five publications, 17 books, unchanged records');
    fs.writeFileSync(path.join(output,'report.json'),JSON.stringify({width:375,checks,errors},null,2));console.log(JSON.stringify({width:375,checks,errors,output},null,2));
  }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
