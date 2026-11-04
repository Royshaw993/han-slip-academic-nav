/* node tests/test_unified_search_browser.cjs
 * Real browser; fixtures live only in memory. Screenshots/reports go to TEMP.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || path.join(os.tmpdir(),'research-hubs-tests/node_modules/playwright'));
const root = path.resolve(__dirname,'..');
const output = path.join(os.tmpdir(),'unified-search-browser');
const allowed = new Set(['index.html','script.js','style.css','academic-updates.js','research-topics.js','data/research-hubs.js','data/core-bibliography.js','data/classic-papers.js','data/search-taxonomy.js','favicon.svg']);
const server = http.createServer((req,res)=>{
  const file=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';
  if(!allowed.has(file)){res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript; charset=utf-8':file.endsWith('.css')?'text/css; charset=utf-8':file.endsWith('.svg')?'image/svg+xml':'text/html; charset=utf-8');
  res.end(fs.readFileSync(path.join(root,file)));
});
const frames = page => page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
const query = async (page,value) => {await page.locator('#searchInput').fill(value);await frames(page);};
const inputAtCurrentScroll = async (page,value) => {
  await page.evaluate(value=>{searchInput.value=value;searchInput.dispatchEvent(new Event('input',{bubbles:true}));},value);await frames(page);
};
const state = page => page.evaluate(()=>({
  activeCategory,activeResourceCategory,activeResourceType,activeModule,moduleReturnContext,activeDirectionTag,activeUpdateType,activeUpdateView,
  updatesExpanded,researchTagsExpanded,sitesExpanded,topicSelectionActive,updateSearchIgnored,wechatExpanded,
  bibliographyExpanded,hubsExpanded,activeHubId,hubReturnContext,hubExpandedSections:[...hubExpandedSections],
  hidden:searchBrowseSections().map(s=>s.hidden),scrollY:window.scrollY
}));
async function layout(page,label){
  const metrics=await page.evaluate(()=>{
    const width=document.documentElement.clientWidth;
    const visible=[...document.querySelectorAll('#unifiedSearchResults *, .search-box, #hubDetail')].filter(e=>e.getClientRects().length);
    return {width,scrollWidth:document.documentElement.scrollWidth,
      overflow:visible.filter(e=>{const r=e.getBoundingClientRect();return r.left < -1 || r.right > width+1 || e.scrollWidth>e.clientWidth+1;}).map(e=>e.className||e.tagName)};
  });
  assert.ok(metrics.scrollWidth<=metrics.width,`${label}: page overflow ${JSON.stringify(metrics)}`);
  assert.deepEqual(metrics.overflow,[],`${label}: element overflow`);
  return metrics;
}
(async()=>{
  fs.mkdirSync(output,{recursive:true});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  let browser;const report=[],errors=[],warnings=[];
  const pass=(name,details={})=>report.push({name,pass:true,...details});
  try{
    browser=await chromium.launch({channel:process.env.HUB_BROWSER_CHANNEL||'msedge',headless:true});
    const page=await browser.newPage({viewport:{width:1280,height:900}});
    page.on('pageerror',error=>errors.push(error.message));
    page.on('console',message=>{if(message.type()==='warning')warnings.push(message.text());});
    const url=`http://127.0.0.1:${server.address().port}/`;
    await page.goto(url);await frames(page);
    assert.equal(await page.locator('input[type=search]').count(),1);
    assert.equal(await page.evaluate(()=>unifiedSearchCatalog.entries.length),await page.evaluate(()=>researchHubsData.length+sites.length+coreBibliographyData.length+classicPaperCatalog.papers.length+academicUpdatesData.filter(u=>!u.example).length));
    await page.locator('[data-genre="金文"]').click();await query(page,'张家山');
    for(const type of ['hub','resource','bibliography','update'])assert.ok(await page.locator(`[data-search-type="${type}"]`).count()>0);
    assert.equal(await page.evaluate(()=>activeCategory),'金文');
    const hits=await page.evaluate(()=>searchUnified(searchQuery).map(e=>e.type+':'+e.id));
    assert.equal(new Set(hits).size,hits.length);
    assert.match(await page.locator('#unifiedSearchResults [role=status]').textContent(),new RegExp(`找到 ${hits.length} 项`));
    pass('all-site search from bronze, multiple types and deduplicated count');
    await query(page,'林澐');assert.equal(await page.locator('[data-search-type=paper]').count(),1);
    assert.equal(await page.locator('[data-search-type=paper] [data-paper-source="primary"]').count(),0);
    assert.equal(await page.locator('[data-search-type=paper] a').textContent(),'查看出版信息（2019年文集重收） ↗');
    await query(page,'本轮用户确认');assert.match(await page.locator('#unifiedSearchResults').textContent(),/找到 0 项/);
    await query(page,'西北师范大学');
    assert.ok(await page.locator('[data-search-type=resource]').count()>0);assert.ok(await page.locator('[data-search-type=update]').count()>0);
    for(const selector of ['[data-search-type=resource] a','[data-search-type=update] a']){
      const link=page.locator(selector).first();assert.equal(await link.getAttribute('target'),'_blank');assert.equal(await link.getAttribute('rel'),'noopener noreferrer');
    }
    pass('author/institution matching, internal-note exclusion and existing external-link behavior');
    for(const paper of await page.evaluate(()=>window.classicPapers)){
      for(const term of [paper.title,paper.author]){
        await query(page,term);
        const result=page.locator(`[data-search-type="paper"][data-search-id="${paper.id}"]`);
        if(await result.count()===0 && await page.locator('[data-search-expand="paper"]').count()){
          await page.locator('[data-search-expand="paper"]').click();await frames(page);
        }
        assert.equal(await result.count(),1);
        assert.ok((await result.innerText()).includes(paper.pages||paper.journal));
        assert.equal(await result.locator('.classic-paper-access').count(),0);
        assert.doesNotMatch(await result.innerText(),/题录已核|暂无经核验|未核实无登录|目标报纸文章HTML正文|非期刊PDF/);
        if(paper.note)assert.ok((await result.innerText()).includes(paper.note));
        const link=result.locator('[data-paper-source="primary"]');
        assert.equal(await link.count(),paper.url?1:0);
        assert.equal(await result.locator('[data-paper-source="related"]').count(),(paper.relatedSources||[]).length);
        if(paper.url){
          assert.equal(await link.getAttribute('href'),paper.url);
          assert.equal(await link.getAttribute('target'),'_blank');
          assert.equal(await link.getAttribute('rel'),'noopener noreferrer');
          const labels={'scan-pdf':'阅读原文（扫描PDF）','full-pdf':'阅读原文（PDF）',excerpt:'阅读节选','paper-info':'查看论文信息',bibliography:'查看出版信息','full-html':'阅读原文'};
          assert.equal(await link.innerText(),labels[paper.accessType]+' ↗');
        }
        if(paper.recommendationStatus==='catalog-only')assert.match(await result.innerText(),/补充题录/);
      }
    }
    await query(page,'批准候选');assert.match(await page.locator('#unifiedSearchResults').innerText(),/找到 0 项/);
    pass('all 92 papers searchable by title and author with accurate access labels, limits and safe links; C records retained');
    await query(page,'清华简');
    await page.locator('#unifiedSearchResults [data-research-topic="qinghua-slips"]').click();await frames(page);
    assert.equal(await page.locator('#hubDetail [data-paper-id="liuguozhong-lixueqin-yu-qinghuajian"]').count(),0);
    await page.locator('[data-hub-expand="papers"]').click();await frames(page);
    assert.equal(await page.locator('#hubDetail [data-paper-id="liuguozhong-lixueqin-yu-qinghuajian"]').count(),1);
    await page.locator('[data-hub-back]').click();await frames(page);
    assert.equal(await page.locator('#searchInput').inputValue(),'清华简');
    assert.equal(await page.locator('[data-search-type="paper"][data-search-id="liuguozhong-lixueqin-yu-qinghuajian"]').count(),1);
    pass('C paper hidden from hub preview, retained on expansion and search return');
    await query(page,'简牍');
    const expected=await page.evaluate(()=>searchUnified(searchQuery).filter(e=>e.type==='update').length);
    assert.ok(expected>4);assert.equal(await page.locator('[data-search-type=update]').count(),4);
    await page.locator('[data-search-expand=update]').click();assert.equal(await page.locator('[data-search-type=update]').count(),expected);
    await page.locator('[data-search-expand=update]').click();assert.equal(await page.locator('[data-search-type=update]').count(),4);
    assert.equal(await page.locator('[data-search-expand=update]').evaluate(e=>e===document.activeElement),true);
    pass('group cap, expand, collapse and retained keyboard focus');
    await query(page,'学术公众号');
    assert.equal(await page.locator('[data-search-id=academic-wechat] a').count(),0);
    const tabs=browser.contexts()[0].pages().length;
    await page.locator('[data-search-wechat]').click();assert.equal(await page.locator('#wechatPanel').isVisible(),true);
    assert.equal(page.url(),url);assert.equal(browser.contexts()[0].pages().length,tabs);
    assert.equal(await page.locator('#wechatPanel .wechat-card:visible').count(),14);
    await page.locator('#moduleBack').click();await frames(page);
    assert.equal(await page.locator('#unifiedSearchResults').isVisible(),true);
    await page.locator('[data-search-wechat]').click();assert.equal(await page.locator('#wechatPanel').isVisible(),true);
    await page.locator('#clearSearch').click();assert.equal(await page.evaluate(()=>activeCategory),'金文');
    pass('internal resource expands in place without a link/new tab and exit restores context');

    for(const width of [320,375,390,430]){
      await page.setViewportSize({width,height:900});
      await page.goto(url);await frames(page);
      await page.evaluate(()=>{
        activateCategory('🏺 汉代简牍');activeUpdateView='topics';hubsExpanded=true;bibliographyExpanded=true;
        sitesExpanded=true;researchTagsExpanded=true;activeUpdateType='新书';activeDirectionTag='释文';
        renderResearchTopics();renderBibliography();renderUpdateView();renderDirectionTags();window.scrollTo({top:600,behavior:'instant'});
      });await frames(page);
      const origin=await state(page);
      await inputAtCurrentScroll(page,'简牍');
      await page.evaluate(()=>{window.firstSearchSnapshot=searchSession;});
      await query(page,'張家山');assert.equal(await page.evaluate(()=>searchSession===window.firstSearchSnapshot),true);
      await page.locator('#unifiedSearchResults [data-research-topic="zhangjiashan-hanjian"]').click();await frames(page);
      assert.match(await page.locator('[data-hub-back]').textContent(),/返回搜索结果/);
      assert.equal(await page.locator('#hubDetail').isVisible(),true);
      await page.locator('[data-hub-back]').click();await frames(page);
      assert.equal(await page.evaluate(()=>searchSession===window.firstSearchSnapshot),true);
      assert.equal(await page.locator('#searchInput').inputValue(),'張家山');
      await layout(page,`${width} result return`);
      if(width===390){await page.locator('#unifiedSearchResults').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(output,'search-results-390.png')});}
      await page.locator('#clearSearch').click();await frames(page);
      assert.deepEqual(await state(page),origin);
      pass(`${width}: repeated query and result hub round trip restore first snapshot including scroll`);

      await page.evaluate(()=>openResearchHub('zhangjiashan-hanjian'));await frames(page);
      await page.evaluate(()=>{hubExpandedSections.add('updates');renderHubDetail();window.scrollTo({top:680,behavior:'instant'});});await frames(page);
      const hubOrigin=await state(page),hubHtml=await page.locator('#hubDetail').innerHTML();
      await inputAtCurrentScroll(page,'甲骨');
      await page.locator('#unifiedSearchResults [data-research-topic="yinxu-oracle"]').click();await frames(page);
      // 在搜索结果专题内部再次改词，原专题快照仍需保留。
      await query(page,'马王堆');await page.locator('[data-search-exit]').click();await frames(page);
      assert.deepEqual(await state(page),hubOrigin);assert.equal(await page.locator('#hubDetail').innerHTML(),hubHtml);
      pass(`${width}: search inside hub, open another hub and edit again restores original hub`);

      await query(page,'ZZZ<不存在>&');assert.match(await page.locator('#unifiedSearchResults').textContent(),/找到 0 项/);
      await layout(page,`${width} empty`);await page.locator('#searchInput').press('Escape');await frames(page);
      assert.equal(await page.locator('#hubDetail').isVisible(),true);
      pass(`${width}: empty state and Escape return`);

      // 长题名和多条论文仅注入测试运行时，不写入正式数据。
      await page.evaluate(()=>{
        const long='长题名检索样本：'+ '秦汉简牍研究与材料释读'.repeat(12);
        const sources={resource:sites,hub:researchHubsData,bibliography:coreBibliographyData,paper:Array.from({length:6},(_,i)=>({
          id:'test-long-'+i,title:long+i,author:'测试作者',journal:'测试刊物',year:'',note:'测试说明',featured:false,
          type:'经典论文',categories:['slips'],hubIds:[],url:i===0?'https://www.bsm.org.cn/':''
        })),update:[{id:'test-long-update',title:long,type:'研究动态',source:'测试来源',summary:'长标题测试',date:'2026-01-01',tags:['长题名检索样本']}]};
        const fixtures=buildSearchCatalog(sources);unifiedSearchCatalog.entries.splice(0,unifiedSearchCatalog.entries.length,...fixtures.entries);
      });
      await query(page,'长题名检索样本');assert.equal(await page.locator('[data-search-type=paper]').count(),4);
      const metrics=await layout(page,`${width} long titles`);
      const wraps=await page.locator('[data-search-type=paper] h4').first().evaluate(e=>e.getBoundingClientRect().height>parseFloat(getComputedStyle(e).lineHeight)*2);
      assert.equal(wraps,true);
      assert.equal(await page.locator('[data-search-id=test-long-0] a').getAttribute('href'),'https://www.bsm.org.cn/');
      await page.locator('[data-search-expand=paper]').click();assert.equal(await page.locator('[data-search-type=paper]').count(),6);
      await layout(page,`${width} expanded`);
      await page.screenshot({path:path.join(output,`search-${width}.png`),fullPage:true});
      await page.locator('[data-search-expand=paper]').click();assert.equal(await page.locator('[data-search-type=paper]').count(),4);
      pass(`${width}: long paper/update titles wrap, expansion works and no horizontal overflow`,{metrics});
    }
    assert.deepEqual(errors,[]);
    assert.ok(warnings.every(m=>m==='Search data: resource: URL shared by bsm, wuhan-bamboo-silk-center'),JSON.stringify(warnings));
    // 初始数据中的坏引用及 tags 类型异常也不能使整个页面崩溃。
    await page.route('**/data/research-hubs.js',async route=>{
      const text=fs.readFileSync(path.join(root,'data/research-hubs.js'),'utf8');
      await route.fulfill({contentType:'text/javascript; charset=utf-8',body:text+'\nwindow.researchHubs[0].resourceIds.push("missing-resource");window.researchHubs[0].bibliographyIds.push("missing-book");window.researchHubs[0].relatedHubIds.push("missing-hub");'});
    });
    await page.route('**/academic-updates.js',async route=>{
      const text=fs.readFileSync(path.join(root,'academic-updates.js'),'utf8');
      await route.fulfill({contentType:'text/javascript; charset=utf-8',body:text+'\nwindow.academicUpdates[0].tags=42;window.academicUpdates[0].relatedResources.push("missing-resource");'});
    });
    await page.goto(url);await frames(page);
    assert.ok(warnings.some(m=>m.includes('Search data: hub:zhangjiashan-hanjian: resourceIds 无效引用')));
    await query(page,'张家山');await page.locator('#unifiedSearchResults [data-research-topic="zhangjiashan-hanjian"]').click();await frames(page);
    assert.equal(await page.locator('[data-hub-section=resources] .site-card').count(),3);
    await page.locator('[data-hub-back]').click();await query(page,'姚磊');assert.deepEqual((await page.locator('[data-search-type=update]').evaluateAll(es=>es.map(e=>e.dataset.searchId))).sort(),(await page.evaluate(()=>academicUpdatesData.filter(u=>(u.title+' '+u.summary+' '+u.source).includes('姚磊')).map(u=>u.id))).sort());
    assert.deepEqual(errors,[]);
    pass('initial relationship validation warns and malformed references/tags preserve usable page and search');
    fs.writeFileSync(path.join(output,'report.json'),JSON.stringify({report,errors,warnings},null,2));
    console.log(`Unified search browser: ${report.length}/${report.length} passed; ${output}`);
  }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
