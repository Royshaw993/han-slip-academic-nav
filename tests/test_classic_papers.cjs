// Run: node --test tests/test_classic_papers.cjs. Synthetic records stay in tests.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const plain = value => JSON.parse(JSON.stringify(value));
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
  const c=vm.createContext({URL,window:{scrollY:0,scrollTo(){}},document:{querySelector:get,querySelectorAll:()=>[]},console:{warn:m=>warnings.push(m),info(){}},requestAnimationFrame:()=>1,cancelAnimationFrame(){}});
  for(const file of ['academic-updates.js','data/research-hubs.js','research-topics.js','data/core-bibliography.js','data/classic-papers.js','script.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),c,{filename:file});
  const run=code=>vm.runInContext(code,c);
  return {c,run,get,warnings,validate(items){c.testItems=items;return run('validateClassicPapers(testItems)');},inject(items){c.testItems=items;run('const testCatalog=validateClassicPapers(testItems);classicPaperCatalog.byHub.clear();testCatalog.byHub.forEach((list,id)=>classicPaperCatalog.byHub.set(id,list));');}};
}
test('production data loads with one confirmed general entry and no fabricated metadata',()=>{
  const {c,run,warnings}=load(), records=plain(c.window.classicPapers);
  assert.equal(records.length,1);assert.equal(records[0].id,'linyun-xianqin-pianpang');
  assert.equal(records[0].author,'林澐');assert.equal(records[0].title,'先秦古文字中待探索的偏旁');
  for(const key of ['year','journal','note','url','volume','issue','pages'])assert.ok(!records[0][key]);
  assert.deepEqual(records[0].categories,['general']);assert.deepEqual(records[0].hubIds,[]);
  assert.match(records[0].sourceNote,/本轮用户确认/);assert.equal(records[0].featured,false);
  assert.deepEqual(warnings,[]);assert.equal(run('classicPaperCatalog.papers.length'),1);
});
test('all production IDs, relationships, categories, types, years and featured flags validate',()=>{
  const {c,validate}=load();const result=validate(c.window.classicPapers);
  assert.equal(result.warnings.length,0);assert.equal(new Set(result.papers.map(p=>p.id)).size,result.papers.length);
  assert.ok(c.window.researchHubs.every(h=>!('paperIds' in h)));
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
for(const id of ['zhangjiashan-hanjian','qinghua-slips','yinxu-oracle','western-zhou-bronze','mawangdui-silk','xuanquan-hanjian','zoumalou-western-han-slips','wuyi-eastern-han-slips'])test(`${id}: explicit paper empty state stays between books and updates`,()=>{
  const app=load();app.run(`openResearchHub(${JSON.stringify(id)})`);const html=app.get('#hubDetail').innerHTML;
  assert.match(html,/当前暂无已整理的经典论文与研究史资料。/);assert.doesNotMatch(html,/data-paper-id/);
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
