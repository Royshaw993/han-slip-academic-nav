/* Real-browser integration tests. Synthetic papers exist only in this test.
 * Run: node tests/test_classic_papers_browser.cjs
 * PLAYWRIGHT_MODULE / HUB_BROWSER_CHANNEL can override local Playwright / Edge.
 * Screenshots and report are written to the system temporary directory.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || path.join(os.tmpdir(),'research-hubs-tests/node_modules/playwright'));
const root = path.resolve(__dirname,'..');
const output = path.join(os.tmpdir(),'classic-papers-browser');
const allowed = new Set(['index.html','script.js','style.css','academic-updates.js','research-topics.js','data/research-hubs.js','data/core-bibliography.js','data/classic-papers.js','favicon.svg']);
const server = http.createServer((req,res)=>{
  const file = new URL(req.url,'http://localhost').pathname.slice(1) || 'index.html';
  if(!allowed.has(file)){res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript; charset=utf-8':file.endsWith('.css')?'text/css; charset=utf-8':file.endsWith('.svg')?'image/svg+xml':'text/html; charset=utf-8');
  res.end(fs.readFileSync(path.join(root,file)));
});
const empty = '当前暂无已整理的经典论文与研究史资料。';
const section = '[data-hub-section="papers"]';
const cards = `${section} [data-paper-id]`;
const toggle = '[data-hub-expand="papers"]';
const sourceNote = 'INTERNAL-SOURCE-NOTE-NOT-FOR-UI';
const sample = (id,changes={})=>({id,title:`测试论文 ${id}`,author:'测试作者',year:'',journal:'',categories:['slips'],hubIds:['zhangjiashan-hanjian'],type:'经典论文',note:'',featured:false,sourceNote,...changes});
const fixtures = [
  sample('test-first',{title:'长标题换行测试'.repeat(8)+'LongUnbrokenTitle'.repeat(6),note:'这是一条仅用于测试的读者说明。'}),
  sample('test-second',{url:'https://www.bsm.org.cn/',year:'2000',journal:'测试刊名',volume:'1',issue:'2',pages:'3–5'}),
  sample('test-featured',{featured:true,type:'研究史'}),
  sample('test-fourth',{type:'重要综述'}),sample('test-fifth'),
  sample('test-shared',{categories:['slips','bronze'],hubIds:['qinghua-slips','western-zhou-bronze']}),
  sample('test-oracle',{categories:['oracle'],hubIds:['yinxu-oracle']}),
  sample('test-general',{categories:['general','slips'],hubIds:[]})
];
const frames = page=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
const ids = page=>page.locator(cards).evaluateAll(nodes=>nodes.map(n=>n.dataset.paperId));
async function topics(page){await page.locator('[data-update-view="topics"]').click();await frames(page);}
async function open(page,id){await page.locator(`#researchTopics [data-research-topic="${id}"]`).click();await frames(page);}
async function back(page){await page.locator('[data-hub-back]').click();await frames(page);}
async function layout(page,label){
  const result = await page.evaluate(()=>{
    const width=document.documentElement.clientWidth;
    const nodes=[...document.querySelectorAll('[data-hub-section="papers"],.classic-paper-card,.classic-paper-card h4,.classic-paper-card p,.classic-paper-link,[data-hub-expand="papers"]')].filter(e=>e.getClientRects().length);
    const overflow=nodes.filter(e=>{const r=e.getBoundingClientRect();return r.left < -1 || r.right > width+1 || e.scrollWidth>e.clientWidth+1;}).map(e=>e.className||e.tagName);
    const grid=document.querySelector('[data-hub-section="papers"] .hub-grid');
    return {width,scrollWidth:document.documentElement.scrollWidth,overflow,columns:grid?getComputedStyle(grid).gridTemplateColumns.split(' ').length:0};
  });
  assert.ok(result.scrollWidth<=result.width,`${label}: page overflow`);
  assert.deepEqual(result.overflow,[],`${label}: card overflow`);
  if(result.width<=430)assert.ok(result.columns<=1,`${label}: single column`);
  return result;
}
(async()=>{
  fs.mkdirSync(output,{recursive:true});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  let browser;const report=[],errors=[],warnings=[];
  const pass=(name,extra={})=>report.push({case:name,pass:true,...extra});
  try{
    browser=await chromium.launch({channel:process.env.HUB_BROWSER_CHANNEL||'msedge',headless:true});
    const page=await browser.newPage({viewport:{width:1280,height:900}});
    page.on('pageerror',e=>errors.push(e.message));
    page.on('console',m=>{if(m.type()==='warning')warnings.push(m.text());});
    const url=`http://127.0.0.1:${server.address().port}/`;
    await page.goto(url);
    assert.equal(await page.evaluate(()=>classicPaperCatalog.papers.length),1);
    assert.equal(await page.locator(section).count(),0);
    pass('production source loads; no new homepage paper module');
    for(const id of await page.evaluate(()=>researchHubsData.map(h=>h.id))){
      await page.evaluate(id=>openResearchHub(id),id);await frames(page);
      assert.deepEqual(await ids(page),[]);
      assert.equal(await page.locator(`${section} .hub-empty`).textContent(),empty);
      assert.equal(await page.locator(toggle).count(),0);
      assert.deepEqual(await page.locator('[data-hub-section]').evaluateAll(nodes=>nodes.map(n=>n.dataset.hubSection)),['resources','bibliography','papers','updates','related']);
      assert.doesNotMatch(await page.locator('#hubDetail').textContent(),/sourceNote|本轮用户确认|先秦古文字中待探索的偏旁/);
      pass(`production ${id}: explicit empty state and five-section order`);
    }
    for(const width of [320,375,390,430]){
      await page.setViewportSize({width,height:850});
      await layout(page,`${width} production empty`);
      if(width===375)await page.locator(section).screenshot({path:path.join(output,'production-empty-375.png')});
    }
    pass('production empty state at all four mobile widths');
    assert.deepEqual(warnings,[]);

    // Route substitutes only this browser's response; no project data is edited.
    let testData=fixtures;
    await page.route('**/data/classic-papers.js',route=>route.fulfill({contentType:'text/javascript; charset=utf-8',body:`window.classicPapers = ${JSON.stringify(testData)};`}));
    for(const width of [320,375,390,430]){
      await page.setViewportSize({width,height:850});await page.goto(url);
      await page.locator('[data-genre="🏺 汉代简牍"]').click();await topics(page);
      await page.locator('#hubsToggle').click();
      await open(page,'zhangjiashan-hanjian');
      const origin=await page.evaluate(()=>({...hubReturnContext}));
      assert.deepEqual(await ids(page),['test-featured','test-first','test-second']);
      assert.equal(await page.locator(toggle).getAttribute('aria-expanded'),'false');
      assert.match(await page.locator(toggle).textContent(),/（5）/);
      assert.doesNotMatch(await page.locator('body').innerText(),new RegExp(sourceNote));
      const metrics=await layout(page,`${width} default cards`);
      await page.locator(section).screenshot({path:path.join(output,`papers-${width}.png`)});
      pass(`${width}: default three, featured priority, hidden sourceNote and long-title layout`,{metrics});

      assert.equal(await page.locator('[data-paper-id="test-first"] a').count(),0);
      const link=page.locator('[data-paper-id="test-second"] .classic-paper-link');
      assert.equal(await link.getAttribute('href'),'https://www.bsm.org.cn/');
      assert.equal(await link.getAttribute('target'),'_blank');
      assert.equal(await link.getAttribute('rel'),'noopener noreferrer');
      assert.match(await link.textContent(),/查看来源/);
      assert.match(await page.locator('[data-paper-id="test-second"]').textContent(),/测试刊名 · 2000 · 卷：1 · 期：2 · 页：3–5/);
      pass(`${width}: valid URL link and URL-less card`);

      await page.locator(toggle).click();await frames(page);
      assert.deepEqual(await ids(page),['test-featured','test-first','test-second','test-fourth','test-fifth']);
      assert.equal(await page.locator(toggle).getAttribute('aria-expanded'),'true');
      await layout(page,`${width} expanded`);
      await page.locator(toggle).click();await frames(page);
      assert.equal((await ids(page)).length,3);
      assert.equal(await page.locator(toggle).getAttribute('aria-expanded'),'false');
      assert.equal(await page.locator(toggle).evaluate(e=>e===document.activeElement),true);
      await layout(page,`${width} collapsed`);
      pass(`${width}: expand, collapse, count and focus`);

      // Test-only related links exercise cross-category navigation and shared IDs.
      await page.locator(toggle).click();
      await page.evaluate(()=>{hubsById.get('zhangjiashan-hanjian').relatedHubIds=['qinghua-slips'];hubsById.get('qinghua-slips').relatedHubIds=['western-zhou-bronze'];renderHubDetail();});
      await page.locator('#hubDetail [data-research-topic="qinghua-slips"]').click();await frames(page);
      assert.deepEqual(await ids(page),['test-shared']);
      assert.equal(await page.locator(toggle).count(),0);
      assert.equal(await page.evaluate(()=>hubExpandedSections.has('papers')),false);
      await page.locator('#hubDetail [data-research-topic="western-zhou-bronze"]').click();await frames(page);
      assert.deepEqual(await ids(page),['test-shared']);
      assert.deepEqual(await page.evaluate(()=>({...hubReturnContext})),origin);
      await layout(page,`${width} related paper`);
      await back(page);
      assert.equal(await page.evaluate(()=>activeCategory),'🏺 汉代简牍');
      assert.equal(await page.locator('[data-update-view="topics"]').getAttribute('aria-pressed'),'true');
      assert.equal(await page.locator('#hubsToggle').getAttribute('aria-expanded'),'true');
      assert.equal(await page.locator('#researchTopics .research-topic-card').count(),5);
      assert.ok(Math.abs(await page.evaluate(()=>window.scrollY)-origin.scrollY)<2);
      assert.equal(await page.locator('#researchTopics [data-research-topic="zhangjiashan-hanjian"]').evaluate(e=>e===document.activeElement),true);
      pass(`${width}: related hub updates, cross-category sharing and origin restoration`);
    }
    await page.setViewportSize({width:1280,height:900});
    await page.goto(url);
    for(const [category,id,expected] of [['甲骨文','yinxu-oracle',['test-oracle']],['金文','western-zhou-bronze',['test-shared']],['帛书','mawangdui-silk',[]]]){
      await page.locator(`[data-genre="${category}"]`).click();await topics(page);await open(page,id);
      assert.deepEqual(await ids(page),expected);
      if(!expected.length)assert.equal(await page.locator(`${section} .hub-empty`).textContent(),empty);
      await layout(page,`desktop ${id}`);await back(page);
      pass(`${id}: explicit associations without general fallback`);
    }
    assert.deepEqual(warnings,[],'valid production and fixtures must not warn');

    testData=[null,sample('test-valid',{hubIds:['missing-hub','zhangjiashan-hanjian']}),sample('test-valid',{title:'重复 ID'}),sample('test-bad-url',{url:'https://example.com/'}),sample('test-bad-type',{type:'新论文'})];
    await page.goto(url);await topics(page);await open(page,'zhangjiashan-hanjian');
    assert.deepEqual(await ids(page),['test-valid']);
    assert.equal(warnings.length,5);
    assert.ok(warnings.every(m=>m.startsWith('Classic papers:')));
    assert.equal(await page.locator('[data-hub-section="resources"] .site-card').count(),2);
    assert.deepEqual(errors,[]);
    pass('malformed data and references warn, skip and preserve the rest of the hub');
    fs.writeFileSync(path.join(output,'report.json'),JSON.stringify({report,errors,expectedWarnings:warnings},null,2));
    console.log(JSON.stringify({passed:report.length,errors,output},null,2));
  }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
