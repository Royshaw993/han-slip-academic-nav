// Run: node --test tests/test_classic_papers.cjs. Synthetic records stay in tests.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const plain = value => JSON.parse(JSON.stringify(value));
const sourceReport = fs.readFileSync(path.join(root,'reports/classic-paper-source-links-and-card-copy-2026-11-03.md'),'utf8');
const linkedPapers = new Map(sourceReport.split(/\r?\n/).filter(line=>/^\| `[a-z][a-z0-9-]+` \|/.test(line) && line.includes('[入口]')).map(line=>{
  const cells=line.split('|').map(s=>s.trim());
  return [cells[1].replaceAll('`',''),{url:cells[4].match(/\[入口\]\((.*)\)/)[1],accessType:cells[6].replaceAll('`','')}];
}));
const sample = (overrides = {}) => ({id:'test-paper',title:'测试样本甲',author:'测试作者',year:'',journal:'',categories:['slips'],hubIds:['zhangjiashan-hanjian'],type:'经典论文',note:'',featured:false,...overrides});
function load() {
  const nodes=new Map(), warnings=[];
  const get=selector=>{
    if(!nodes.has(selector))nodes.set(selector,{
      innerHTML:'',textContent:'',value:'',hidden:false,attributes:{},listeners:{},classList:{toggle(){}},
      get childElementCount(){return (this.innerHTML.match(/<article/g)||[]).length;},
      setAttribute(k,v){this.attributes[k]=v;},addEventListener(k,v){this.listeners[k]=v;},
      querySelectorAll(){return [];},querySelector(){return null;},focus(){},getBoundingClientRect(){return {top:0};}
    });return nodes.get(selector);
  };
  const c=vm.createContext({URL,window:{scrollY:0,scrollTo(){}},document:{querySelector:get,querySelectorAll:()=>[]},console:{warn:m=>(m !== 'Search data: resource: URL shared by bsm, wuhan-bamboo-silk-center' && warnings.push(m)),info(){}},requestAnimationFrame:()=>1,cancelAnimationFrame(){}});
  for(const file of ['academic-updates.js','data/research-hubs.js','research-topics.js','data/core-bibliography.js','data/classic-papers.js','data/search-taxonomy.js','script.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),c,{filename:file});
  const run=code=>vm.runInContext(code,c);
  return {c,run,get,warnings,validate(items){c.testItems=items;return run('validateClassicPapers(testItems)');},inject(items){c.testItems=items;run('const testCatalog=validateClassicPapers(testItems);classicPaperCatalog.byHub.clear();testCatalog.byHub.forEach((list,id)=>classicPaperCatalog.byHub.set(id,list));');}};
}
test('production keeps nine original stable records within 74 papers and fills only verified Lin Yun metadata',()=>{
  const {c,run,warnings}=load(), records=plain(c.window.classicPapers);
  assert.equal(records.length,74);assert.equal(records[0].id,'linyun-xianqin-pianpang');
  assert.equal(records[0].author,'林澐');assert.equal(records[0].title,'先秦古文字中待探索的偏旁');
  assert.equal(records[0].year,'2001');assert.equal(records[0].journal,'古文字研究');assert.equal(records[0].issue,'第21辑');
  for(const key of ['url','volume','pages'])assert.ok(!records[0][key]);
  assert.deepEqual(records[0].categories,['general']);assert.deepEqual(records[0].hubIds,[]);
  assert.match(records[0].sourceNote,/本轮用户确认/);assert.equal(records[0].featured,false);
  assert.deepEqual(warnings,[]);assert.equal(run('classicPaperCatalog.papers.length'),74);
});
test('all production IDs, relationships, categories, types, years and featured flags validate',()=>{
  const {c,validate}=load();const result=validate(c.window.classicPapers);
  assert.equal(result.warnings.length,0);assert.equal(new Set(result.papers.map(p=>p.id)).size,result.papers.length);
  assert.ok(c.window.researchHubs.every(h=>!('paperIds' in h)));
});

test('only the eight approved candidates are added with report metadata and persistent IDs',()=>{
  const {c}=load(),records=plain(c.window.classicPapers).slice(1,9);
  const approved={
    O1:'dongzuobin-jiaguwen-duandai-yanjiuli',Q1:'lixueqin-qinghuajian-chubu-zhengli-yanjiu',
    Q2:'liuguozhong-lixueqin-yu-qinghuajian',O2:'zhufenghan-yinxu-jiaguwen-yanjiu',
    O3:'zhaopeng-jiagu-zhuihe-yanjiu-huigu',B1:'xuyahui-xizhou-qingtong-liqi-jinwen-jiantao',
    L1:'chensongchang-chenxiangyuan-zoumalou-xihan-xinjinzhan',W1:'chengwei-wuyi-donghan-zhengli-yanjiu-qianjing'
  };
  assert.deepEqual(records.map(p=>p.id),Object.values(approved));
  const report=fs.readFileSync(path.join(root,'reports/classic-paper-candidates-2026-11-02.md'),'utf8');
  for(const [code,id] of Object.entries(approved)){
    const row=report.split(/\r?\n/).find(line=>line.startsWith(`| ${code} | `)&&line.split('|').length===15).split('|').map(s=>s.trim());
    const paper=records.find(p=>p.id===id);
    for(const [field,column] of Object.entries({type:2,title:4,author:5,year:6,journal:7,volume:8,issue:9,pages:10}))
      assert.equal(paper[field]||'',row[column],`${code}: ${field}`);
    assert.match(paper.sourceNote,new RegExp(`批准候选 ${code}`));
    assert.equal(paper.hubIds.length,1);
    assert.equal(paper.featured,false);
  }
  const byId=Object.fromEntries(records.map(p=>[p.id,p]));
  assert.equal(byId[approved.Q1].pages,'');assert.equal(byId[approved.W1].pages,'');
  assert.equal(byId[approved.L1].url,linkedPapers.get(approved.L1).url);assert.equal(byId[approved.Q2].pages,'52–61+84');
  assert.ok(!byId[approved.O1].issue);
});

test('non-array source and malformed records cannot crash the catalog',()=>{
  const {validate}=load();for(const value of [undefined,null,{},'bad']){const r=validate(value);assert.equal(r.papers.length,0);assert.ok(r.warnings.length);}
  const r=validate([null,0,'bad',sample()]);assert.equal(r.papers.length,1);assert.equal(r.warnings.length,3);
});
const invalidCases=[['ID',{id:'0'}],['title',{title:' '}],['author',{author:null}],['journal',{journal:[]}],['note',{note:{}}],['numeric year',{year:2000}],['future year',{year:String(new Date().getFullYear()+1)}],['date used as year',{year:'2024-07-23'}],['ancient year',{year:'0999'}],['category',{categories:['unknown']}],['empty categories',{categories:[]}],['type',{type:'新论文'}],['featured',{featured:'true'}],['hubIds shape',{hubIds:'qinghua-slips'}],['empty hub ID',{hubIds:['']}]];
for(const [name,change] of invalidCases)test(`invalid ${name} is warned and skipped`,()=>{const r=load().validate([sample(change)]);assert.equal(r.papers.length,0);assert.ok(r.warnings.length);});
test('blank bibliographic fields remain blank; known year and optional citation fields survive',()=>{
  const r=load().validate([sample({year:'2000',journal:'测试刊名',volume:'1',issue:'2',pages:'3–5'})]);
  assert.equal(r.warnings.length,0);assert.equal(r.papers[0].pages,'3–5');
});
test('bad hub references are skipped without losing the valid associations',()=>{
  const r=load().validate([sample({hubIds:['missing','zhangjiashan-hanjian','zhangjiashan-hanjian','qinghua-slips']})]);
  assert.equal(r.warnings.length,1);assert.equal(r.papers.length,1);
  assert.deepEqual(plain(r.papers[0].hubIds),['zhangjiashan-hanjian','qinghua-slips']);
  assert.equal(r.byHub.has('missing'),false);assert.equal(r.byHub.get('qinghua-slips').length,1);
});
test('one paper shared by multiple hubs uses the same catalog object',()=>{
  const r=load().validate([sample({hubIds:['qinghua-slips','western-zhou-bronze']})]);
  assert.equal(r.byHub.get('qinghua-slips')[0],r.byHub.get('western-zhou-bronze')[0]);
});
test('categories and general never imply a hub relationship',()=>{
  const r=load().validate([sample({categories:['general','slips'],hubIds:[]})]);assert.equal(r.byHub.size,0);assert.equal(r.papers.length,1);
});
test('duplicate IDs and author/title punctuation variants are not rendered twice',()=>{
  const r=load().validate([sample(),sample({title:'另一测试题名'}),sample({id:'test-variant',title:'《测试样本甲》。',author:' 测试作者 '})]);
  assert.equal(r.papers.length,1);assert.equal(r.byHub.get('zhangjiashan-hanjian').length,1);assert.equal(r.warnings.length,2);
});
test('ID persists across title, URL and year corrections',()=>{
  const {validate}=load();const p=sample();const original=validate([p]).papers[0].id;
  const corrected=validate([{...p,title:'修订测试题名',year:'2000',url:'https://www.bsm.org.cn/'}]);assert.equal(corrected.papers[0].id,original);
});
test('featured ordering is stable and ignores year and sourceNote contents',()=>{
  const {validate}=load();const items=[sample({id:'test-a',title:'甲',year:'2020'}),sample({id:'test-b',title:'乙',featured:true}),sample({id:'test-c',title:'丙',featured:true}),sample({id:'test-d',title:'丁',year:'2025'})];
  const before=validate(items);items.forEach(p=>{p.sourceNote='qinghua-slips featured general 9999';});const after=validate(items);
  assert.deepEqual(plain(before.byHub.get('zhangjiashan-hanjian').map(p=>p.id)),['test-b','test-c','test-a','test-d']);
  assert.deepEqual(plain(before.byHub.get('zhangjiashan-hanjian').map(p=>p.id)),plain(after.byHub.get('zhangjiashan-hanjian').map(p=>p.id)));
  assert.equal(after.byHub.has('qinghua-slips'),false);
});
test('no URL produces no link; verified URL produces a safe source link',()=>{
  const app=load();app.c.testPaper=sample();assert.doesNotMatch(app.run('classicPaperCardTemplate(testPaper)'),/<a\b/);
  app.c.testPaper=sample({url:'https://www.bsm.org.cn/?hanjian/10147.html'});const html=app.run('classicPaperCardTemplate(testPaper)');
  assert.match(html,/查看来源/);assert.match(html,/target="_blank" rel="noopener noreferrer"/);assert.match(html,/href="https:\/\/www.bsm.org.cn/);
});
test('unsafe, malformed and obvious placeholder URLs are warned and never rendered',()=>{
  const app=load();for(const url of ['TODO','https://','javascript:alert(1)','data:text/html,bad','/relative','https://example.com/a','https://a.example.org/a','https://placeholder.invalid/a','https://localhost/a']){
    const r=app.validate([sample({url})]);assert.equal(r.papers.length,0,url);assert.ok(r.warnings.length,url);
    app.c.testPaper=sample({url});assert.doesNotMatch(app.run('classicPaperCardTemplate(testPaper)'),/<a\b/,url);
  }
});
test('sourceNote is never rendered and cannot replace note; user-visible fields are escaped',()=>{
  const app=load();app.c.testPaper=sample({title:'<img src=x onerror=bad>',author:'<b>作者</b>',note:'读者说明',sourceNote:'INTERNAL-NOT-FOR-UI'});
  const html=app.run('classicPaperCardTemplate(testPaper)');assert.doesNotMatch(html,/INTERNAL-NOT-FOR-UI|<img|<b>/);assert.match(html,/&lt;img/);assert.match(html,/读者说明/);
  app.c.testPaper.note='';assert.doesNotMatch(app.run('classicPaperCardTemplate(testPaper)'),/读者说明|INTERNAL-NOT-FOR-UI/);
});
for(const id of ['zhangjiashan-hanjian','qinghua-slips','yinxu-oracle','western-zhou-bronze','mawangdui-silk','xuanquan-hanjian','zoumalou-western-han-slips','wuyi-eastern-han-slips'])test(`${id}: production associations and empty states stay between books and updates`,()=>{
  const app=load();app.run(`openResearchHub(${JSON.stringify(id)})`);const html=app.get('#hubDetail').innerHTML;
  const expected=plain(app.run('classicPapersForHub('+JSON.stringify(id)+').map(p=>p.id)'));
  const preview=expected.filter(id=>!['liuguozhong-lixueqin-yu-qinghuajian','chengwei-wuyi-donghan-zhengli-yanjiu-qianjing'].includes(id)).slice(0,3);
  assert.deepEqual([...html.matchAll(/data-paper-id="([^"]+)"/g)].map(m=>m[1]),preview);
  if(!expected.length)assert.match(html,/当前暂无已整理的学术论文与研究史资料。/);
  else assert.doesNotMatch(html,/当前暂无已整理的学术论文与研究史资料。/);
  if(preview.length!==expected.length){
    assert.match(html,/data-hub-expand="papers"/);
    if(!preview.length)assert.match(html,/本专题另有补充题录/);
    app.run(`hubExpandedSections.add('papers');renderHubDetail()`);
    assert.deepEqual([...app.get('#hubDetail').innerHTML.matchAll(/data-paper-id="([^"]+)"/g)].map(m=>m[1]),expected);
  }
  const order=[...html.matchAll(/data-hub-section="([^"]+)"/g)].map(m=>m[1]);assert.deepEqual(order,['resources','bibliography','papers','updates','related']);
});
test('related hub switching updates paper cards and resets only detail expansion',()=>{
  const app=load();app.inject([sample(),sample({id:'test-qinghua',title:'测试清华样本',hubIds:['qinghua-slips']})]);
  app.run(`activeUpdateView='topics';hubsExpanded=true;openResearchHub('zhangjiashan-hanjian');hubExpandedSections.add('papers');openResearchHub('qinghua-slips')`);
  assert.match(app.get('#hubDetail').innerHTML,/test-qinghua/);assert.doesNotMatch(app.get('#hubDetail').innerHTML,/data-paper-id="test-paper"/);
  assert.equal(app.run(`hubExpandedSections.has('papers')`),false);app.run('dismissResearchHub(true)');
  assert.equal(app.run('activeUpdateView'),'topics');assert.equal(app.run('hubsExpanded'),true);
});
test('papers default to three, expand/collapse without duplicate cards, other sections retain four',()=>{
  const app=load();app.inject(Array.from({length:5},(_,i)=>sample({id:`test-${i}`,title:`测试题名 ${i}`})));
  app.run(`openResearchHub('zhangjiashan-hanjian');renderHubDetail()`);assert.equal((app.get('#hubDetail').innerHTML.match(/data-paper-id=/g)||[]).length,3);
  app.run(`hubExpandedSections.add('papers');renderHubDetail();renderHubDetail()`);assert.equal((app.get('#hubDetail').innerHTML.match(/data-paper-id=/g)||[]).length,5);
  app.run(`hubExpandedSections.delete('papers');renderHubDetail()`);assert.equal((app.get('#hubDetail').innerHTML.match(/data-paper-id=/g)||[]).length,3);
  assert.equal(app.run(`(hubSectionTemplate('resources','资源',[1,2,3,4,5],()=>'<article></article>','').match(/<article>/g)||[]).length`),4);
});
test('invalid records coexist with a valid record without breaking the detail',()=>{
  const app=load();app.inject([null,sample({id:'invalid',title:''}),sample()]);app.run(`openResearchHub('zhangjiashan-hanjian')`);
  assert.equal((app.get('#hubDetail').innerHTML.match(/data-paper-id=/g)||[]).length,1);
});
test('rendering and catalog creation leave authoritative paper, hub and update data unchanged',()=>{
  const app=load(), before=plain(app.c.window);
  app.run(`validateClassicPapers(window.classicPapers);openResearchHub('zhangjiashan-hanjian');renderHubDetail()`);
  assert.deepEqual(plain(app.c.window),before);
});

test('source audit keeps A2/B5/C2 and uses accurate labels without presenting unavailable full text',()=>{
  const app=load(),papers=plain(app.c.window.classicPapers).slice(0,9);
  assert.deepEqual(['recommended','background','catalog-only'].map(s=>papers.filter(p=>p.recommendationStatus===s).length),[2,5,2]);
  const expected=['none','scan-pdf','excerpt','paper-info','paper-info','bibliography','full-pdf','paper-info','paper-info'];
  for(const [index,paper] of papers.entries()){
    assert.equal(paper.accessType,expected[index]);assert.match(paper.accessChecked,/^2026-11-0[23]$/);
    app.c.testPaper=paper;const html=app.run('classicPaperCardTemplate(testPaper)');
    assert.ok(paper.accessNote);assert.doesNotMatch(html,/classic-paper-access|题录已核|未核实无登录|非期刊PDF/);
    assert.equal((html.match(/data-paper-source="primary"/g)||[]).length,paper.url?1:0);
    if(['bibliography','paper-info','none'].includes(paper.accessType))assert.doesNotMatch(html,/阅读原文|阅读节选/);
  }
  assert.match(papers[1].url,/upload\.wikimedia\.org.*\.pdf$/);
  assert.match(papers[6].url,/newhistory\.org\.tw\/admin\/contents\/ajaxGetPic\/.*\.pdf$/);
  assert.match(papers[4].url,/\/Literature\/articleinfo\?id=1002096142/,'O2 now uses the verified single-paper page');
  assert.match(papers[8].url,/\/Literature\/articleinfo\?id=668522162/,'W1 links to its paper, not a project report');
  app.c.testPaper=papers[0];assert.match(app.run('classicPaperCardTemplate(testPaper)'),/查看出版信息（2019年文集重收）/);
});

test('typed source labels escape data, internal access notes stay hidden, and legacy URLs remain conservative',()=>{
  const app=load();
  for(const [accessType,label] of [['scan-pdf','阅读原文（扫描PDF）'],['full-pdf','阅读原文（PDF）'],['full-html','阅读原文'],['excerpt','阅读节选'],['paper-info','查看论文信息'],['bibliography','查看出版信息']]){
    app.c.testPaper=sample({url:'https://www.bsm.org.cn/',accessType});
    assert.ok(app.run('classicPaperCardTemplate(testPaper)').includes(label));
  }
  app.c.testPaper=sample({url:'https://www.bsm.org.cn/',accessNote:'<img src=x onerror=bad>',relatedSources:[{url:'https://www.bsm.org.cn/?a=1&b=2',accessType:'bibliography',context:'<b>书目</b>'},{url:'javascript:alert(1)',accessType:'full-pdf'}]});
  const html=app.run('classicPaperCardTemplate(testPaper)');
  assert.match(html,/查看来源（内容未核验）/);assert.doesNotMatch(html,/&lt;img/);assert.match(html,/&lt;b&gt;/);
  assert.doesNotMatch(html,/<img|<b>|javascript:/);assert.equal((html.match(/<a /g)||[]).length,2);
  app.c.testPaper=sample({url:'https://www.bsm.org.cn/',accessType:'none'});
  assert.doesNotMatch(app.run('classicPaperCardTemplate(testPaper)'),/<a /);
});

test('invalid new metadata cannot create false reading links or lose valid auxiliary records silently',()=>{
  const app=load();
  for(const change of [{accessType:'constructor'},{recommendationStatus:'invalid'},{accessNote:[]},{accessChecked:2026},{relatedSources:{}},{accessType:'none',url:'https://www.bsm.org.cn/'}]){
    const r=app.validate([sample(change)]);assert.equal(r.papers.length,0);assert.ok(r.warnings.length);
  }
  const r=app.validate([sample({relatedSources:[null,{url:'javascript:bad',accessType:'full-pdf'},{url:'https://www.bsm.org.cn/',accessType:'bibliography'}]})]);
  assert.equal(r.papers.length,1);assert.equal(r.papers[0].relatedSources.length,1);assert.equal(r.warnings.length,2);
});

test('catalog-only overrides featured in previews while full hub and directory keep every record',()=>{
  const app=load();app.inject([sample({id:'test-c',title:'丙',featured:true,recommendationStatus:'catalog-only'}),sample({id:'test-b',title:'乙',recommendationStatus:'background'}),sample({id:'test-a',title:'甲',recommendationStatus:'recommended'})]);
  app.run(`openResearchHub('zhangjiashan-hanjian')`);
  assert.deepEqual([...app.get('#hubDetail').innerHTML.matchAll(/data-paper-id="([^"]+)"/g)].map(m=>m[1]),['test-a','test-b']);
  app.run(`hubExpandedSections.add('papers');renderHubDetail()`);
  assert.deepEqual([...app.get('#hubDetail').innerHTML.matchAll(/data-paper-id="([^"]+)"/g)].map(m=>m[1]),['test-a','test-b','test-c']);
  app.run('papersVisibleCount=74;renderClassicPapers()');
  const ids=[...app.get('#papersGrid').innerHTML.matchAll(/data-paper-id="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(ids.length,74);assert.deepEqual(ids.slice(-2),['liuguozhong-lixueqin-yu-qinghuajian','chengwei-wuyi-donghan-zhengli-yanjiu-qianjing']);
});

test('the 65 intake rows retain verified fields and only gain source links declared in this review',()=>{
  const app=load(), records=plain(app.c.window.classicPapers), added=records.slice(9);
  const report=fs.readFileSync(path.join(root,'reports/classic-paper-broad-intake-review-2026-11-03.md'),'utf8').split('## 3. 拟正式论文清单')[1].split('## 4.')[0];
  const rows=report.split(/\r?\n/).filter(l=>/^\| [A-Z]\d+ \| (期刊论文|论文集文章|学术论文|硕士学位论文|博士学位论文|报纸文章) \|/.test(l)).map(l=>l.split('|').map(c=>c.trim()));
  assert.equal(rows.length,65);assert.equal(added.length,65);assert.equal(records.length,74);
  assert.equal(new Set(added.map(p=>p.reviewId)).size,65);
  assert.deepEqual(added.map(p=>p.reviewId),rows.map(r=>r[1]));
  for(const row of rows){
    const code=row[1],paper=added.find(p=>p.reviewId===code),[title,author]=row[3].split('<br>作者：');
    assert.equal(paper.id,'paper-'+code.toLowerCase());assert.equal(paper.title,title);assert.equal(paper.author,author);assert.equal(paper.type,row[2]);
    const metadata=Object.fromEntries([...row[4].matchAll(/(\w+)=「([^」]*)」/g)].map(m=>[m[1],m[2]]));
    for(const field of ['year','journal','volume','issue','pages','doi'])assert.equal(paper[field],metadata[field]||'',`${code}: ${field}`);
    assert.deepEqual(paper.hubIds,[...row[5].matchAll(/`([^`]+)`/g)].map(m=>m[1]));
    assert.equal(paper.note,'');assert.equal(paper.abstract,'');assert.equal(paper.featured,false);assert.equal(paper.recommendationStatus,'background');
    assert.doesNotMatch(paper.sourceNote,/[A-Z]:[\\/]/);
    const urlRow=report.split(/\r?\n/).find(l=>l.startsWith(`| ${code} | [目标入口]`));
    const sourceChange=linkedPapers.get(paper.id);
    assert.equal(paper.url,sourceChange?.url || (urlRow?urlRow.match(/\[目标入口\]\(([^)]+)\)/)[1]:''));
    assert.equal(paper.accessType,sourceChange?.accessType || (urlRow?urlRow.split('|')[3].trim().split(' / ')[0]:'none'));
    app.c.testPaper=paper;const html=app.run('classicPaperCardTemplate(testPaper)');
    assert.equal((html.match(/data-paper-source="primary"/g)||[]).length,paper.url?1:0);
    assert.doesNotMatch(html,/本地F\d|原始PDF|sourceNote|作者原摘要|本站编辑简介/);
    if(paper.type.endsWith('学位论文'))assert.ok(html.includes('学位授予单位：'+paper.journal));
    if(paper.accessType==='paper-info')assert.doesNotMatch(html,/阅读原文|阅读节选/);
    if(paper.accessType==='full-html')assert.ok(html.includes('阅读原文 ↗'));
  }
  assert.equal(added.filter(p=>p.url).length,17);assert.equal(added.filter(p=>!p.url).length,48);
  for(const id of ['N06','E03','N17','N26','E04','E05','E06','E07','E08','E09','E10'])assert.ok(!records.some(p=>p.reviewId===id));
  assert.ok(!records.some(p=>p.author==='肖若愚'||p.author==='霍文博'||p.author==='程政举'));
  assert.deepEqual(plain(app.run('Object.fromEntries(researchHubsData.map(h=>[h.id,classicPapersForHub(h.id).length]))')),{
    'zhangjiashan-hanjian':7,'qinghua-slips':3,'yinxu-oracle':3,'western-zhou-bronze':3,'mawangdui-silk':3,'xuanquan-hanjian':5,'zoumalou-western-han-slips':42,'wuyi-eastern-han-slips':11
  });
  assert.deepEqual(added.filter(p=>!p.hubIds.length).map(p=>p.reviewId),['N14','N15','E01','E02']);
});

test('all source changes are declared in the review report; no internal evidence renders in cards',()=>{
  const app=load(),records=plain(app.c.window.classicPapers);
  assert.equal(linkedPapers.size,14);
  assert.equal(records.filter(p=>p.url).length,25);assert.equal(records.filter(p=>!p.url).length,49);
  for(const paper of records){
    app.c.testPaper=paper;const html=app.run('classicPaperCardTemplate(testPaper)');
    assert.doesNotMatch(html,/classic-paper-access|题录已核|暂无经核验|未核实无登录|目标报纸文章HTML正文|非期刊PDF/);
    if(paper.note)assert.ok(html.includes(paper.note),'valuable reader notes remain visible');
    if(!paper.url&&!paper.relatedSources?.length)assert.doesNotMatch(html,/<a\b|classic-paper-actions/);
  }
});

test('reader abstract and note are escaped while audit fields cannot become fallback copy',()=>{
  const app=load();app.c.testPaper=sample({abstract:'<b>真实摘要</b>',note:'读者简介',accessNote:'INTERNAL-ACCESS',sourceNote:'INTERNAL-EVIDENCE'});
  let html=app.run('classicPaperCardTemplate(testPaper)');assert.match(html,/&lt;b&gt;真实摘要&lt;\/b&gt;/);assert.doesNotMatch(html,/INTERNAL-/);
  app.c.testPaper.abstract='';html=app.run('classicPaperCardTemplate(testPaper)');assert.match(html,/读者简介/);
  app.c.testPaper.note='';html=app.run('classicPaperCardTemplate(testPaper)');assert.doesNotMatch(html,/bibliography-note|INTERNAL-/);
});

test('directory grows by 12, collapses, preserves limit on rerender and never limits the search index',()=>{
  const app=load(),count=()=>[...app.get('#papersGrid').innerHTML.matchAll(/data-paper-id="([^"]+)"/g)].map(m=>m[1]);
  app.run('renderClassicPapers()');assert.equal(count().length,12);assert.equal(app.get('#papersCollapse').hidden,true);
  app.get('#papersMore').listeners.click();assert.equal(count().length,24);
  app.run('renderClassicPapers()');assert.equal(count().length,24);
  while(!app.get('#papersMore').hidden)app.get('#papersMore').listeners.click();
  assert.equal(count().length,74);assert.equal(new Set(count()).size,74);assert.equal(app.get('#papersStatus').textContent,'已显示 74 / 74 篇');
  assert.equal(app.run('unifiedSearchCatalog.entries.filter(e=>e.type==="paper").length'),74);
  app.get('#papersCollapse').listeners.click();assert.equal(count().length,12);assert.equal(app.get('#papersMore').hidden,false);
  assert.equal(app.get('#papersMore').attributes['aria-expanded'],'false');
});
