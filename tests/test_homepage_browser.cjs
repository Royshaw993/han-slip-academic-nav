/* Portal homepage interactions; optional HOME_BASELINE snapshot measures before/after. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),http=require('node:http');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||path.join(os.tmpdir(),'research-hubs-tests/node_modules/playwright'));
const root=path.resolve(__dirname,'..'),output=path.join(os.tmpdir(),'academic-portal-browser');
const baseline=process.env.HOME_BASELINE?JSON.parse(fs.readFileSync(process.env.HOME_BASELINE,'utf8')):null;
const allowed=new Set(['index.html','script.js','style.css','academic-updates.js','research-topics.js','data/research-hubs.js','data/core-bibliography.js','data/classic-papers.js','data/search-taxonomy.js','favicon.svg']);
const server=http.createServer((req,res)=>{
  const url=new URL(req.url,'http://localhost'),old=url.pathname.startsWith('/before/');
  const file=url.pathname.replace(old?/^\/before\//:/^\//,'')||'index.html';
  if(!allowed.has(file)){res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript; charset=utf-8':file.endsWith('.css')?'text/css; charset=utf-8':file.endsWith('.svg')?'image/svg+xml':'text/html; charset=utf-8');
  res.end(old&&baseline?.files[file]!==undefined?baseline.files[file]:fs.readFileSync(path.join(root,file)));
});
const frames=page=>page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
(async()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
  const metrics=[],report=[],errors=[];
  try{
    browser=await chromium.launch({channel:process.env.HUB_BROWSER_CHANNEL||'msedge',headless:true});
    const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));
    const url='http://127.0.0.1:'+server.address().port+'/';
    const height=()=>page.evaluate(()=>document.documentElement.scrollHeight);
    const count=selector=>page.locator(selector+':visible').count();
    const state=()=>page.evaluate(()=>({category:activeCategory,updateType:activeUpdateType,updateObject:activeUpdateObject,expanded:updatesExpanded,query:searchInput.value}));
    const layout=async()=>{
      const result=await page.evaluate(()=>({page:document.documentElement.scrollWidth>document.documentElement.clientWidth,
        nodes:[...document.querySelectorAll('main article, main article h3, main button, .overview-list li, .portal-topic span, summary')].filter(e=>e.getClientRects().length).filter(e=>{const r=e.getBoundingClientRect();return r.left < -1||r.right>document.documentElement.clientWidth+1||e.scrollWidth>e.clientWidth+1;}).map(e=>e.id||e.className)}));
      assert.deepEqual(result,{page:false,nodes:[]});
    };
    const open=async name=>{await page.locator('[data-module="'+name+'"]').click();await frames(page);};
    const back=async()=>{await page.locator('#moduleBack').click();await frames(page);};
    fs.mkdirSync(output,{recursive:true});
    for(const width of [320,375,390,430,1280]){
      await page.setViewportSize({width,height:900});let before;
      if(baseline){await page.goto(url+'before/');await frames(page);before=await height();}
      await page.goto(url);await frames(page);const after=await height();
      if(before)assert.ok(after<before*.65,'portal must be materially shorter at '+width);
      metrics.push({width,before,after,reduction:before?((1-after/before)*100).toFixed(1)+'%':undefined});
      assert.equal(await count('#updatesGrid .update-card'),6);
      assert.equal(await count('#researchTopics .research-topic-card'),8);
      assert.equal(await count('#coreGrid .featured-card'),4);
      assert.equal(await page.locator('#coreGrid .keywords, #coreGrid .fit-for, #coreSection .research-tags-wrap').count(),0);
      assert.equal(await count('#siteGrid .site-card'),0);assert.equal(await count('#bibliographyGrid .bibliography-card'),0);assert.equal(await count('#wechatGrid .wechat-card'),0);
      assert.equal(await count('#guide'),0);assert.equal(await count('.filters'),0);
      assert.equal(await page.locator('#commonSection, [data-update-view], #coreToggle, #sitesToggle').count(),0);
      assert.equal(await page.locator('#navigationOverview li').count(),7);
      assert.equal(await page.locator('#navigationOverview button:disabled').count(),1);
      assert.match(await page.locator('#wechatModuleCount').textContent(),/14/);
      assert.equal(await page.locator('[data-genre]').count(),5);
      const ids=await page.locator('#researchTopics [data-research-topic]').evaluateAll(es=>es.map(e=>e.dataset.researchTopic));
      assert.deepEqual(new Set(ids),new Set(['zhangjiashan-hanjian','qinghua-slips','mawangdui-silk','yinxu-oracle','western-zhou-bronze','xuanquan-hanjian','zoumalou-western-han-slips','wuyi-eastern-han-slips']));
      const data=await page.evaluate(()=>JSON.stringify([sites,researchHubsData,coreBibliographyData,window.classicPapers,academicUpdatesData]));
      await layout();
      if(width===390||width===1280)await page.screenshot({path:path.join(output,'home-'+width+'.png'),fullPage:true});
      report.push(width+': only three content areas plus compact overview; no library lists or duplicate navigation');

      await page.locator('[data-genre="金文"]').click();await frames(page);
      await page.locator('#updatesToggle').isVisible().then(async shown=>{if(shown)await page.locator('#updatesToggle').click();});
      const origin=await state();
      for(const name of ['resources','bibliography','papers','wechat','guide']){
        const trigger=page.locator('[data-module="'+name+'"]');await trigger.scrollIntoViewIfNeeded();await trigger.focus();await frames(page);
        const scroll=await page.evaluate(()=>scrollY);assert.ok((await trigger.boundingBox()).height>=44);
        await trigger.press('Enter');await frames(page);
        assert.equal(await page.evaluate(()=>activeModule),name);
        assert.equal(await page.locator('#moduleBack').isVisible(),true);
        assert.equal(await page.locator('#moduleBack').evaluate(e=>e===document.activeElement),true);
        assert.equal(await count('#navigationOverview'),0);assert.equal(await count('#updatesGrid .update-card'),0);assert.equal(await count('#researchTopics .research-topic-card'),0);
        if(name==='resources'){
          assert.equal(await count('#siteGrid .site-card'),12);
          assert.equal(await count('.filters'),1);assert.equal(await page.locator('#categoryFilters button').count(),9);
          assert.equal(await page.locator('#categoryFilters [data-category="🏺 汉代简牍"]').count(),0);
          const homeCards=await page.locator('#coreGrid').innerHTML();
          for(const type of ['🤖 AI & 数字人文','🧱 古文字数据库','🛠️ 学术工具','全部']){
            await page.locator('[data-category="'+type+'"]').click();await frames(page);
            assert.deepEqual(await state(),origin);assert.equal(await page.evaluate(()=>activeModule),'resources');
            const names=await page.locator('#siteGrid h3').allTextContents();
            const expected=await page.evaluate(type=>sites.filter(s=>!s.commonOnly&&(type==='全部'||s.category===type||(s.resourceCategories||[]).includes(type))).slice(0,12).map(s=>s.name),type);
            assert.deepEqual(names,expected);assert.equal(await page.locator('#coreGrid').innerHTML(),homeCards);
          }
          assert.ok(await page.locator('#siteGrid .fit-for').count()>0,'complete resource details retain use cases');
        }
        if(name==='bibliography')assert.equal(await count('#bibliographyGrid .bibliography-card'),17);
        if(name==='papers'){
          assert.equal(await count('#papersGrid [data-paper-id]'),12);
          while(await page.locator('#papersMore').isVisible()){await page.locator('#papersMore').click();await frames(page);}
          assert.equal(await count('#papersGrid [data-paper-id]'),74);
          assert.match(await page.locator('#paperModuleCount').textContent(),/^74篇$/);
          const paperIds=await page.locator('#papersGrid [data-paper-id]').evaluateAll(es=>es.map(e=>e.dataset.paperId));
          assert.equal(new Set(paperIds).size,74);
          assert.deepEqual(paperIds.slice(0,2),['dongzuobin-jiaguwen-duandai-yanjiuli','xuyahui-xizhou-qingtong-liqi-jinwen-jiantao']);
          assert.deepEqual(paperIds.slice(-2),['liuguozhong-lixueqin-yu-qinghuajian','chengwei-wuyi-donghan-zhengli-yanjiu-qianjing']);
          assert.equal(await page.locator('#papersGrid .bibliography-level').filter({hasText:'补充题录'}).count(),2);
          assert.doesNotMatch(await page.locator('#paperModuleCount').innerText(),/含|补充题录/);
          for(const id of ['chengwei-wuyi-donghan-zhengli-yanjiu-qianjing','chensongchang-chenxiangyuan-zoumalou-xihan-xinjinzhan'])assert.equal(await page.locator('#papersGrid [data-paper-id="'+id+'"] a').count(),await page.evaluate(id=>Number(Boolean(window.classicPapers.find(p=>p.id===id).url)),id));
          assert.doesNotMatch(await page.locator('#papersSection').innerText(),/sourceNote|批准候选/);
          if(width===390||width===1280)await page.locator('#papersSection').screenshot({path:path.join(output,'papers-'+width+'.png')});
          await page.locator('#searchInput').fill('清华简');await frames(page);
          assert.equal(await page.locator('#papersSection').isVisible(),false);
          assert.equal(await page.locator('[data-search-type="paper"]').count(),3);
          await page.locator('[data-search-exit]').click();await frames(page);
          assert.equal(await page.locator('#papersSection').isVisible(),true);
          assert.deepEqual(await page.locator('#papersGrid [data-paper-id]').evaluateAll(es=>es.map(e=>e.dataset.paperId)),paperIds);
        }
        if(name==='wechat'){
          assert.equal(await count('#wechatGrid .wechat-card'),14);
          const shared=await page.evaluate(()=>['#wechatGrid article','#bibliographyGrid article'].map(q=>{const c=getComputedStyle(document.querySelector(q));return [c.fontFamily,c.fontSize,c.padding,c.border,c.backgroundColor];}));
          assert.deepEqual(shared[0],shared[1]);
          assert.equal(await page.locator('#wechatPanel .wechat-card').evaluateAll(es=>new Set(es.map(e=>e.id)).size),14);
          if(width===390)await page.locator('#wechatPanel').screenshot({path:path.join(output,'wechat-390.png')});
        }
        if(name==='guide'){assert.equal(await page.locator('#guide li').count(),5);assert.equal(await page.locator('details.research-path').getAttribute('open'),null);await page.locator('summary.path-heading').click();}
        await layout();await back();assert.deepEqual(await state(),origin);
        assert.ok(Math.abs(await page.evaluate(()=>scrollY)-scroll)<2,'return restores exact homepage scroll '+name);
        assert.equal(await trigger.evaluate(e=>e===document.activeElement),true);
      }
      report.push(width+': modules show full existing contents; filters only affect library; keyboard return preserves genre, expansion and scroll');

      await page.locator('[data-research-topic="western-zhou-bronze"]').click();await frames(page);
      assert.equal(await page.locator('#hubDetail').isVisible(),true);
      await page.locator('[data-hub-back]').click();await frames(page);assert.deepEqual(await state(),origin);
      await open('wechat');await page.locator('#searchInput').fill('张家山');await frames(page);
      await page.locator('[data-search-exit]').click();await frames(page);
      assert.equal(await page.locator('#wechatPanel').isVisible(),true);assert.equal(await count('#wechatGrid .wechat-card'),14);
      await back();assert.deepEqual(await state(),origin);
      await open('bibliography');const moduleLabel=await page.locator('#moduleBack').textContent();
      await page.locator('#searchInput').fill('学术公众号');await frames(page);
      await page.locator('[data-search-wechat]').click();await frames(page);
      assert.match(await page.locator('#moduleBack').textContent(),/返回搜索结果/);
      await page.locator('#searchInput').press('Escape');await frames(page);
      assert.equal(await page.locator('#bibliographySection').isVisible(),true);
      assert.equal(await page.locator('#moduleBack').textContent(),moduleLabel);
      await back();assert.deepEqual(await state(),origin);
      assert.equal(await page.evaluate(()=>JSON.stringify([sites,researchHubsData,coreBibliographyData,window.classicPapers,academicUpdatesData])),data);
      assert.equal(page.url(),url);assert.equal(page.context().pages().length,1);
      await page.evaluate(()=>document.querySelectorAll('#coreGrid h3,.portal-topic .topic-button span:first-child,.overview-list li > span').forEach(e=>{e.textContent='长标题与古文字研究LongUnbrokenAcademicTitle'.repeat(8);}));
      await layout();report.push(width+': hub/search return, unchanged academic records and long title wrapping');
    }
    assert.deepEqual(errors,[]);
    fs.writeFileSync(path.join(output,'report.json'),JSON.stringify({report,metrics,errors},null,2));
    console.log(JSON.stringify({passed:report.length,metrics,errors,output},null,2));
  }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
