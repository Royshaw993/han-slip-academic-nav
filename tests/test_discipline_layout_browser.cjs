// Focused V1.3 acceptance: node tests/test_discipline_layout_browser.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || path.join(os.tmpdir(), 'research-hubs-tests/node_modules/playwright'));
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'tmp', 'v1.3-layout-check');
const files = new Set(['index.html', 'script.js', 'style.css', 'academic-updates.js', 'research-topics.js', 'data/research-hubs.js', 'data/core-bibliography.js', 'data/classic-papers.js', 'data/search-taxonomy.js', 'favicon.svg']);
const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const before = url.pathname.startsWith('/before/');
  const file = url.pathname.replace(before ? /^\/before\// : /^\//, '') || 'index.html';
  if (!files.has(file)) { res.writeHead(404); res.end(); return; }
  const baseline = path.join(root, 'tmp/v1.3-layout-baseline', file);
  res.setHeader('Content-Type', file.endsWith('.js') ? 'text/javascript; charset=utf-8' : file.endsWith('.css') ? 'text/css; charset=utf-8' : file.endsWith('.svg') ? 'image/svg+xml' : 'text/html; charset=utf-8');
  res.end(fs.readFileSync(before && fs.existsSync(baseline) ? baseline : path.join(root, file)));
});
const frames = page => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
const genres = ['甲骨文', '金文', '石刻', '🏺 汉代简牍'];
const genre = async (page, value) => { await page.locator(`[data-genre="${value}"]`).click(); await frames(page); };
const layout = async page => {
  const overflow = await page.evaluate(() => ({
    page: document.documentElement.scrollWidth > innerWidth,
    nodes: [...document.querySelectorAll('main article, main h2, main h3, main h4, main button, main a, .overview-list li')]
      .filter(e => e.getClientRects().length)
      .filter(e => { const r = e.getBoundingClientRect(); return r.left < -1 || r.right > innerWidth + 1 || e.scrollWidth > e.clientWidth + 1; })
      .map(e => e.id || e.className)
  }));
  assert.deepEqual(overflow, { page:false, nodes:[] });
};
const snapshot = page => page.evaluate(() => JSON.stringify({
  category:activeCategory, type:activeUpdateType, object:activeUpdateObject, updates:updatesExpanded,
  resources:resourceVisibleCounts, literature:literatureVisibleCount,
  resourceHTML:coreGrid.innerHTML, literatureHTML:literatureGrid.innerHTML
}));
const oracleStyle = page => page.locator('#coreGrid').evaluate(grid => {
  const g = getComputedStyle(grid), card = getComputedStyle(grid.firstElementChild);
  return [g.gridTemplateColumns, g.gap, card.padding, card.minHeight, card.border, card.backgroundColor];
});
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  const checks = [], errors = [], measurements = [];
  try {
    fs.mkdirSync(output, { recursive:true });
    browser = await chromium.launch({ channel:process.env.HUB_BROWSER_CHANNEL || 'msedge', headless:true });
    const page = await browser.newPage();
    page.on('pageerror', error => errors.push(error.message));
    const url = `http://127.0.0.1:${server.address().port}/`;
    const hasBaseline = fs.existsSync(path.join(root, 'tmp/v1.3-layout-baseline/index.html'));
    for (const width of [320, 375, 390, 430, 1280]) {
      await page.setViewportSize({ width, height:900 });
      let baselineStyle, baselineIndex, baselineHero, baselineHome;
      if (hasBaseline) {
        await page.goto(url + 'before/'); await frames(page);
        baselineIndex = await page.evaluate(() => JSON.stringify(unifiedSearchCatalog));
        baselineHome = await page.evaluate(() => ['updatesGrid','researchTopics','navigationOverview','about'].map(id => document.getElementById(id)?.innerHTML || ''));
        baselineHero = await page.locator('.hero').evaluate(e => e.getBoundingClientRect().height);
        await genre(page, '甲骨文'); baselineStyle = await oracleStyle(page);
      }
      await page.goto(url); await frames(page);
      const hero = await page.locator('.hero').evaluate(e => e.getBoundingClientRect().height);
      if (hasBaseline) {
        assert.ok(hero < baselineHero, 'Hero is tighter at ' + width);
        assert.equal(await page.evaluate(() => JSON.stringify(unifiedSearchCatalog)), baselineIndex, 'search catalog unchanged');
        assert.deepEqual(await page.evaluate(() => ['updatesGrid','researchTopics','navigationOverview','about'].map(id => document.getElementById(id)?.innerHTML || '')), baselineHome);
      }
      measurements.push({ width, baselineHero, hero });
      assert.equal(await page.locator('.hero .intro').count(), 0);
      assert.equal(await page.locator('.hero h1').innerText(), '古文字学术导航');
      assert.equal(await page.locator('.english-name').innerText(), 'Ancient Chinese Writing Academic Hub');
      assert.equal(await page.locator('.seal-line button').count(), 5);
      assert.deepEqual(await page.locator('#coreGrid h3').allTextContents(), ['简帛网', '简牍学术资源数据共享平台', '小學堂文字學資料庫', '殷周金文暨青銅器資料庫']);
      assert.deepEqual(await page.locator('#coreGrid a').evaluateAll(es => es.map(e => e.href)), ['https://www.bsm.org.cn/', 'https://jiandu.nwnu.edu.cn/', 'https://xiaoxue.iis.sinica.edu.tw/', 'https://bronze.asdc.sinica.edu.tw/']);
      assert.deepEqual(await page.evaluate(() => [classicPaperCatalog.papers.length, coreBibliographyData.length, sites.filter(isPeriodical).length]), [74,17,3]);
      const source = await page.evaluate(() => JSON.stringify([sites, researchHubsData, coreBibliographyData, window.classicPapers, academicUpdatesData]));
      await layout(page);
      if (width === 390 || width === 1280) await page.screenshot({ path:path.join(output, `home-${width}.png`), fullPage:true });
      for (const value of genres) {
        await genre(page, value);
        const order = await page.evaluate(() => [...document.querySelector('main').children].filter(e => !e.hidden && ['updatesSection','topicsSection','coreSection','literatureSection','navigationOverview','bibliographySection','papersSection'].includes(e.id)).map(e => e.querySelector('h2').textContent));
        assert.deepEqual(order, value === '石刻'
          ? ['最新学术动态', '学术网站与数据库', '学术导航总览']
          : ['最新学术动态', '研究专题', '学术网站与数据库', '研究文献', '学术导航总览']);
        assert.equal(await page.locator('#bibliographySection:visible, #papersSection:visible').count(), 0);
        assert.equal(await page.locator('#coreGrid article:visible').count(), 4);
        assert.equal(await page.locator('#literatureGrid article:visible').count(), value === '石刻' ? 0 : 4);
        assert.equal(await page.locator('#updateObjectFilterGroup').isVisible(), value === '🏺 汉代简牍');
        if (value === '甲骨文' && hasBaseline) assert.deepEqual(await oracleStyle(page), baselineStyle, 'original compact resource cards preserved');
        if (value === '金文') {
          const expected = ['tsinghua-ctwx-20260915-a5c60393', 'zzu-www5-20261024-a7de7cf4', 'zzu-www5-20261014-ae1843b5', 'bsm-20260909-2d6b6d9e'];
          assert.deepEqual(await page.evaluate(() => academicUpdatesData.filter(u => updateMatchesGenre(u, updateGenreDefinitions['金文'])).map(u => u.id)), expected);
          assert.doesNotMatch(await page.locator('#updatesGrid').innerText(), /《懸泉漢簡（六）》綴合|金关汉简释文校释|张家山汉简《■谷食气》/);
          assert.match(await page.locator('#updatesGrid').innerText(), /《簡帛》（第三十二輯）/);
        }
        await layout(page);
        if (width === 390 || width === 1280) await page.screenshot({ path:path.join(output, `${genres.indexOf(value)}-${width}.png`), fullPage:true });
        if (await page.locator('#coreResourcesMore').isVisible()) {
          await page.locator('#coreResourcesMore').scrollIntoViewIfNeeded();
          await page.locator('#coreResourcesMore').focus(); await frames(page);
          const y = await page.evaluate(() => scrollY);
          await page.locator('#coreResourcesMore').press('Enter'); await frames(page);
          assert.ok(await page.locator('#coreGrid article:visible').count() > 4);
          assert.ok(Math.abs(await page.evaluate(() => scrollY) - y) <= 2);
          assert.equal(await page.evaluate(() => document.activeElement.id), await page.locator('#coreResourcesMore').isVisible() ? 'coreResourcesMore' : 'coreResourcesCollapse');
          const expanded = await snapshot(page);
          // Search using a genuine DOM input event preserves the source scroll snapshot.
          await page.evaluate(() => { searchInput.value = '张家山'; searchInput.dispatchEvent(new Event('input', { bubbles:true })); }); await frames(page);
          assert.ok(await page.locator('[data-search-type="hub"]').count() > 0);
          await page.locator('#unifiedSearchResults [data-research-topic="zhangjiashan-hanjian"]').click(); await frames(page);
          await page.locator('[data-hub-back]').click(); await frames(page);
          assert.equal(await page.locator('[data-search-id="zhangjiashan-hanjian"] [data-research-topic]').evaluate(e => e === document.activeElement), true);
          await page.locator('[data-search-exit]').click(); await frames(page);
          assert.equal(await snapshot(page), expanded);
          assert.ok(Math.abs(await page.evaluate(() => scrollY) - y) <= 2);
          assert.equal(await page.evaluate(() => document.activeElement.id), 'searchInput');
          await page.locator('#coreResourcesCollapse').click(); await frames(page);
          assert.equal(await page.locator('#coreGrid article:visible').count(), 4);
          assert.equal(await page.evaluate(() => document.activeElement.id), 'coreResourcesMore');
        }
        if (await page.locator('#literatureMore').isVisible()) {
          await page.locator('#literatureMore').focus(); await page.locator('#literatureMore').press('Enter'); await frames(page);
          assert.equal(await page.locator('#literatureGrid article:visible').count(), await page.evaluate(() => Math.min(8, disciplineLiterature().length)));
          const expanded = await snapshot(page);
          await page.locator('#searchInput').fill('金文'); await frames(page);
          await page.locator('[data-search-exit]').click(); await frames(page);
          assert.equal(await snapshot(page), expanded, 'expanded literature survives unified search');
          const trigger = page.locator('#researchTopics .topic-button').first();
          await trigger.scrollIntoViewIfNeeded(); await trigger.focus(); await frames(page);
          const y = await page.evaluate(() => scrollY);
          await trigger.press('Enter'); await frames(page); await page.locator('[data-hub-back]').click(); await frames(page);
          assert.equal(await snapshot(page), expanded);
          assert.equal(await trigger.evaluate(e => e === document.activeElement), true);
          assert.ok(Math.abs(await page.evaluate(() => scrollY) - y) <= 2);
          // Complete literature list has the exact reference set and no empty links.
          while (await page.locator('#literatureMore').isVisible()) { await page.locator('#literatureMore').click(); await frames(page); }
          const ids = await page.locator('#literatureGrid article').evaluateAll(es => es.map(e => e.dataset.paperId || e.dataset.bibliographyId));
          assert.equal(new Set(ids).size, ids.length);
          assert.equal(ids.length, await page.evaluate(() => disciplineLiterature().length));
          assert.equal(await page.locator('#literatureGrid a[href=""], #literatureGrid a[href="undefined"], #literatureGrid a[href="TODO"]').count(), 0);
          for (const id of await page.evaluate(() => disciplineLiterature().filter(({kind,item}) => kind === 'paper' && !item.url && !item.relatedSources?.length).map(({item}) => item.id))) {
            assert.equal(await page.locator(`#literatureGrid [data-paper-id="${id}"] a`).count(), 0);
          }
          await layout(page);
          await page.locator('#literatureCollapse').click(); await frames(page);
          assert.equal(await page.locator('#literatureGrid article:visible').count(), 4);
          assert.equal(await page.evaluate(() => document.activeElement.id), 'literatureMore');
        }
        if (value === '🏺 汉代简牍') {
          await page.locator('[data-update-type="新书"]').click();
          await page.locator('[data-update-object="悬泉汉简"]').click(); await frames(page);
          assert.equal(await page.evaluate(() => activeUpdateType), '新书');
          assert.equal(await page.evaluate(() => activeUpdateObject), '悬泉汉简');
          assert.deepEqual(await page.locator('#updatesGrid h3').allTextContents(), await page.evaluate(() => academicUpdatesData.filter(u => isHanUpdate(u) && u.type === '新书' && [...searchStrings(u.tags), ...searchStrings(u.topics)].includes('悬泉汉简')).map(u => u.title)));
        }
        const state = await snapshot(page);
        const moduleTrigger = page.locator('#navigationOverview [data-module="papers"]');
        await moduleTrigger.scrollIntoViewIfNeeded(); await moduleTrigger.focus(); await frames(page);
        const y = await page.evaluate(() => scrollY);
        await moduleTrigger.press('Enter'); await frames(page);
        assert.equal(await page.locator('#papersGrid article:visible').count(), 12);
        await page.locator('#moduleBack').click(); await frames(page);
        assert.equal(await snapshot(page), state);
        assert.equal(await moduleTrigger.evaluate(e => e === document.activeElement), true);
        assert.ok(Math.abs(await page.evaluate(() => scrollY) - y) <= 2);
        await layout(page);
      }
      assert.equal(await page.evaluate(() => JSON.stringify([sites, researchHubsData, coreBibliographyData, window.classicPapers, academicUpdatesData])), source);
      checks.push(`${width}px: four disciplines, exact headings/order, empty section hiding, compact oracle styles, resource/literature paging, valid links, update filters, search/hub/module return, focus/scroll and unchanged records`);
    }
    assert.deepEqual(errors, []);
    fs.writeFileSync(path.join(output, 'result.json'), JSON.stringify({ checks, measurements, errors }, null, 2));
    console.log(JSON.stringify({ checks, measurements, errors, output }, null, 2));
  } finally { if (browser) await browser.close(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
