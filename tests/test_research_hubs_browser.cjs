/* Browser integration and viewport tests; test-only Playwright, no site dependencies.
 * Run: node tests/test_research_hubs_browser.cjs
 * Set PLAYWRIGHT_MODULE to an installed Playwright directory if not on NODE_PATH.
 * Uses installed Microsoft Edge by default; set HUB_BROWSER_CHANNEL to override.
 * Screenshots/report go to the system temporary directory (or HUB_TEST_OUTPUT).
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || path.join(os.tmpdir(),'research-hubs-tests/node_modules/playwright'));
const root = path.resolve(__dirname,'..');
const output = process.env.HUB_TEST_OUTPUT || path.join(os.tmpdir(),'research-hubs-browser');
const allowed = new Set(['index.html','script.js','style.css','academic-updates.js','research-topics.js','data/research-hubs.js','data/core-bibliography.js','data/classic-papers.js','data/search-taxonomy.js','favicon.svg']);
const server = http.createServer((req,res)=>{
  const file = new URL(req.url,'http://localhost').pathname.slice(1) || 'index.html';
  if(!allowed.has(file)){res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript; charset=utf-8':file.endsWith('.css')?'text/css; charset=utf-8':file.endsWith('.svg')?'image/svg+xml':'text/html; charset=utf-8');
  res.end(fs.readFileSync(path.join(root,file)));
});
const frames = page => page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
async function layout(page,label){
  const result=await page.evaluate(()=>{
    const visible=element=>element.getClientRects().length>0;
    const width=document.documentElement.clientWidth;
    const overflow=[...document.querySelectorAll('.research-topic-card,.hub-detail,.hub-grid,.hub-back,.hub-heading h2,.hub-detail h3,.hub-detail .section-toggle')].filter(visible).filter(e=>{const r=e.getBoundingClientRect();return r.left < -1 || r.right > width+1;}).map(e=>e.className||e.tagName);
    return {width,scrollWidth:document.documentElement.scrollWidth,overflow,columns:[...document.querySelectorAll('.hub-grid,.research-topics-grid')].filter(visible).map(e=>getComputedStyle(e).gridTemplateColumns.split(' ').length)};
  });
  assert.ok(result.scrollWidth<=result.width,`${label}: horizontal overflow ${JSON.stringify(result)}`);
  assert.deepEqual(result.overflow,[],label);
  if(result.width<=430)assert.ok(result.columns.every(n=>n===1),`${label}: non-single-column grid`);
  return result;
}
async function genre(page,value){await page.locator(`[data-genre="${value}"]`).click();await frames(page);}
async function topics(page){await page.locator('[data-update-view="topics"]').click();await frames(page);}
async function open(page,id){await page.locator(`#researchTopics [data-research-topic="${id}"]`).click();await frames(page);assert.equal(await page.locator('#hubDetail').isVisible(),true);}
async function back(page){await page.locator('[data-hub-back]').click();await frames(page);assert.equal(await page.locator('#hubDetail').isVisible(),false);}
(async()=>{
  fs.mkdirSync(output,{recursive:true});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  let browser;const report=[], errors=[], warnings=[];
  try{
    browser=await chromium.launch({channel:process.env.HUB_BROWSER_CHANNEL||'msedge',headless:true});
    const page=await browser.newPage({viewport:{width:1280,height:900}});
    page.on('pageerror',e=>errors.push(e.message));
    page.on('console',message=>{if(message.type()==='warning' && message.text() !== 'Search data: resource: URL shared by bsm, wuhan-bamboo-silk-center')warnings.push(message.text());});
    const url=`http://127.0.0.1:${server.address().port}/`;
    await page.goto(url);
    assert.equal(await page.locator('#coreGrid .core-card').count(),4);
    assert.equal(await page.locator('#siteGrid .site-card').count(),6);
    assert.equal(await page.locator('#bibliographyGrid .bibliography-card').count(),2);
    await topics(page);
    assert.equal(await page.locator('#researchTopics .research-topic-card').count(),4);
    assert.deepEqual(await page.locator('#researchTopics [data-research-topic]').evaluateAll(nodes=>nodes.map(n=>n.dataset.researchTopic)),['zhangjiashan-hanjian','qinghua-slips','xuanquan-hanjian','zoumalou-western-han-slips']);
    assert.match(await page.locator('#hubsToggle').textContent(),/（5）/);
    await page.locator('#hubsToggle').click();
    assert.equal(await page.locator('#researchTopics .research-topic-card').count(),5);
    const homeContext=await page.evaluate(()=>({category:activeCategory,view:activeUpdateView,expanded:hubsExpanded,scrollY:window.scrollY}));
    await open(page,'xuanquan-hanjian');
    assert.equal(await page.locator('[data-hub-section="updates"] .update-card').count(),4);
    await page.locator('[data-hub-expand="updates"]').click();
    assert.equal(await page.locator('[data-hub-section="updates"] .update-card').count(),5);
    await page.locator('[data-hub-expand="updates"]').click();
    assert.equal(await page.locator('[data-hub-section="updates"] .update-card').count(),4);
    await back(page);
    assert.equal(await page.locator('#researchTopics .research-topic-card').count(),5);
    assert.equal(await page.locator('#hubsToggle').getAttribute('aria-expanded'),'true');
    assert.equal(await page.locator('[data-update-view="topics"]').getAttribute('aria-pressed'),'true');
    assert.deepEqual(await page.evaluate(()=>({category:activeCategory,view:activeUpdateView,expanded:hubsExpanded,scrollY:window.scrollY})),homeContext);
    report.push({case:'home limits, legacy topic, expansion and return',pass:true});

    for(const width of [320,375,390,430]){
      await page.setViewportSize({width,height:850});
      await page.goto(url);await topics(page);await layout(page,`${width} home`);
      for(const [category,id,title,resources,books,updates] of [
        ['🏺 汉代简牍','zhangjiashan-hanjian','张家山汉简专题',2,1,2],
        ['🏺 汉代简牍','qinghua-slips','清华简',1,0,2],
        ['帛书','mawangdui-silk','马王堆帛书',0,0,0],
        ['甲骨文','yinxu-oracle','殷墟甲骨',2,1,0],
        ['金文','western-zhou-bronze','西周金文',2,2,0]
      ]){
        await genre(page,category);await topics(page);await layout(page,`${width} ${category} list`);
        if(category==='🏺 汉代简牍')assert.equal(await page.locator('#updates-title').textContent(),'简牍 · 研究专题');
        let listIds=await page.locator('#researchTopics [data-research-topic]').evaluateAll(nodes=>nodes.map(n=>n.dataset.researchTopic));
        if(category==='🏺 汉代简牍'){
          assert.equal(await page.locator('#researchTopics .research-topic-card').count(),4);
          assert.match(await page.locator('#hubsToggle').textContent(),/（5）/);
          assert.ok(listIds.includes(id),`${width}: slips should show ${id}`);
          if(id==='wuyi-eastern-han-slips'){
            await page.locator('#hubsToggle').click();
            assert.equal(await page.locator('#researchTopics .research-topic-card').count(),5);
            listIds=await page.locator('#researchTopics [data-research-topic]').evaluateAll(nodes=>nodes.map(n=>n.dataset.researchTopic));
          }
        }else assert.deepEqual(listIds,[id]);
        await open(page,id);
        assert.equal(await page.locator('#hubTitle').textContent(),title);
        assert.equal(await page.locator('[data-hub-section="resources"] .site-card').count(),resources);
        assert.equal(await page.locator('[data-hub-section="bibliography"] .bibliography-card').count(),books);
        assert.equal(await page.locator('[data-hub-section="updates"] .update-card').count(),updates);
        assert.match(await page.locator('[data-hub-back]').textContent(),/返回当前门类/);
        const metrics=await layout(page,`${width} ${id}`);
        if(id==='mawangdui-silk')assert.doesNotMatch(await page.locator('#hubDetail').textContent(),/楚帛书/);
        if(!updates)assert.match(await page.locator('[data-hub-section="updates"]').textContent(),/当前暂无已收录的相关学术动态。/);
        if(id==='qinghua-slips'){
          assert.match(await page.locator('.hub-heading .section-kicker').textContent(),/简牍/);
          assert.doesNotMatch(await page.locator('.hub-heading').textContent(),/汉代简牍/);
          await page.screenshot({path:path.join(output,`qinghua-${width}.png`),fullPage:true});
        }
        if(width===375 && id==='mawangdui-silk')await page.screenshot({path:path.join(output,'mawangdui-375.png'),fullPage:true});
        if(id==='zhangjiashan-hanjian'){
          const origin=await page.evaluate(()=>({...hubReturnContext}));
          await page.evaluate(()=>{hubsById.get('zhangjiashan-hanjian').relatedHubIds=['western-zhou-bronze'];renderHubDetail();});
          assert.equal(await page.locator('#hubDetail [data-research-topic]').count(),1);
          await page.locator('#hubDetail [data-research-topic="western-zhou-bronze"]').click();await frames(page);
          assert.equal(await page.locator('#hubTitle').textContent(),'西周金文');
          assert.equal(await page.locator(`[data-genre="${category}"]`).getAttribute('aria-pressed'),'true');
          await layout(page,`${width} related`);
          assert.deepEqual(await page.evaluate(()=>({...hubReturnContext})),origin);
          await back(page);
          assert.ok(Math.abs(await page.evaluate(()=>window.scrollY)-origin.scrollY)<2,`${width} restored scroll`);
        }else await back(page);
        if(id==='wuyi-eastern-han-slips'){
          assert.equal(await page.locator('#hubsToggle').getAttribute('aria-expanded'),'true');
          assert.equal(await page.locator('#researchTopics .research-topic-card').count(),5);
          assert.equal(await page.evaluate(()=>activeCategory),'🏺 汉代简牍');
          assert.equal(await page.locator('[data-update-view="topics"]').getAttribute('aria-pressed'),'true');
        }
        assert.equal(await page.locator(`[data-genre="${category}"]`).getAttribute('aria-pressed'),'true');
        report.push({case:id,width,metrics,pass:true});
      }
      await genre(page,'石刻');await topics(page);
      assert.match(await page.locator('#researchTopics').textContent(),/暂无已整理的石刻/);
      await layout(page,`${width} stone`);
    }
    // Existing V1.2 entry points continue to work after leaving a hub.
    await page.setViewportSize({width:1280,height:900});
    await genre(page,'🏺 汉代简牍');await topics(page);await open(page,'qinghua-slips');
    await page.locator('#returnHomeButton').click();await frames(page);
    assert.equal(await page.locator('#hubDetail').isVisible(),false);
    assert.equal(await page.locator('#commonSection').isVisible(),true);
    await page.locator('[data-common-action="wechat"]').click();assert.equal(await page.locator('#wechatPanel').isVisible(),true);
    await page.locator('#wechatCollapse').click();assert.equal(await page.locator('#wechatPanel').isVisible(),false);
    await page.locator('#sitesToggle').click();assert.ok(await page.locator('#siteGrid .site-card').count()>6);
    await page.locator('#sitesToggle').click();assert.equal(await page.locator('#siteGrid .site-card').count(),6);
    await genre(page,'甲骨文');await page.locator('#bibliographyToggle').click();assert.equal(await page.locator('#bibliographyGrid .bibliography-card').count(),6);
    await page.locator('#bibliographyToggle').click();assert.equal(await page.locator('#bibliographyGrid .bibliography-card').count(),4);
    await genre(page,'🏺 汉代简牍');await page.locator('[data-update-type="新书"]').click();
    const prior=await page.locator('#updatesGrid').innerHTML();
    await topics(page);await open(page,'zhangjiashan-hanjian');await back(page);
    await page.locator('[data-update-view="latest"]').click();assert.equal(await page.locator('#updatesGrid').innerHTML(),prior);
    await topics(page);await open(page,'qinghua-slips');
    await page.locator('#searchInput').fill('说文');await frames(page);
    assert.equal(await page.locator('#hubDetail').isVisible(),false);
    assert.match(await page.locator('#unifiedSearchResults').textContent(),/说文/);
    await page.locator('#clearSearch').click();
    assert.equal(await page.locator('#hubDetail').isVisible(),true);
    await back(page);
    report.push({case:'V1.2 resource, bibliography, search, updates, WeChat and home controls',pass:true});
    assert.deepEqual(warnings,[],'normal data must not issue warnings');

    // Test-only data injection: long text, malformed references, resource/book expansion.
    await page.evaluate(()=>{
      const h=hubsById.get('qinghua-slips');
      h.resourceIds=['missing-resource',...sites.slice(0,6).map(s=>s.id),'nwnu-jiandu'];
      h.bibliographyIds=['missing-book',...coreBibliographyData.slice(0,6).map(b=>b.id)];
      h.relatedHubIds=['missing-hub'];
      coreBibliographyData[0].title='超长书目标题用于窄屏换行验证'.repeat(12);
      academicUpdatesData.find(u=>u.id==='tsinghua-gujianxinyi').title='超长学术动态标题用于窄屏换行验证'.repeat(12);
    });
    await genre(page,'🏺 汉代简牍');await topics(page);await open(page,'qinghua-slips');
    assert.equal(await page.locator('[data-hub-section="resources"] .site-card').count(),4);
    assert.equal(await page.locator('[data-hub-section="bibliography"] .bibliography-card').count(),4);
    for(const section of ['resources','bibliography']){
      await page.locator(`[data-hub-expand="${section}"]`).click();
      assert.equal(await page.locator(`[data-hub-section="${section}"] article`).count(),6);
      await page.locator(`[data-hub-expand="${section}"]`).click();
      assert.equal(await page.locator(`[data-hub-section="${section}"] article`).count(),4);
    }
    for(const width of [320,375,390,430]){await page.setViewportSize({width,height:850});await layout(page,`${width} long titles`);}
    assert.equal(warnings.length,3);
    assert.deepEqual(errors,[]);
    report.push({case:'fault tolerance, long titles, resource/book expansion at four widths',pass:true});
    fs.writeFileSync(path.join(output,'report.json'),JSON.stringify({report,errors,expectedWarnings:warnings},null,2));
    console.log(JSON.stringify({passed:report.length,errors,output},null,2));
  }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
