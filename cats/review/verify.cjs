// Focused browser acceptance for the five-theme iteration. No tooling installation.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const base = process.env.CAT_PREVIEW_URL || 'http://127.0.0.1:8768';
const output = process.env.CAT_REVIEW_OUTPUT || path.join(__dirname, 'v2');
const themeIds = ['editorial', 'playful', 'hub', 'dark-retro', 'pastel-pink'];
const baseCommit = '8c274ad9ed4fcffd767cc60252239623122e4452';
fs.mkdirSync(output, { recursive: true });

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const results = { base: baseCommit, backend: `Playwright ${require((process.env.PLAYWRIGHT_MODULE || 'playwright') + '/package.json').version} / Edge ${browser.version()}`, checks: [], errors: [], failedLocalRequests: [], screenshots: [] };
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  const monitor = p => {
    p.on('pageerror', e => results.errors.push(e.message));
    p.on('console', m => { if (m.type() === 'error') results.errors.push(m.text()); });
    p.on('requestfailed', r => { if (r.url().startsWith(base)) results.failedLocalRequests.push(r.url()); });
    p.on('response', r => { if (r.url().startsWith(base) && r.status() >= 400) results.failedLocalRequests.push(`${r.status()} ${r.url()}`); });
  };
  monitor(page);
  const check = async (name, fn) => {
    try { await fn(); results.checks.push({ name, result: 'PASS' }); console.log('PASS', name); }
    catch (e) { results.checks.push({ name, result: 'FAIL', error: e.message }); throw e; }
  };
  const settled = p => p.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(document.getAnimations().map(a => a.finished.catch(() => {})));
  });
  const style = async (p, name) => {
    await p.getByRole('combobox', { name: 'Visual style' }).selectOption(name);
    await p.waitForFunction(n => document.documentElement.dataset.style === n, name);
    await settled(p);
  };
  const noOverflow = async p => assert(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Horizontal overflow');
  const fingerprint = p => p.evaluate(() => ({
    text: document.querySelector('main').textContent,
    links: [...document.querySelectorAll('a')].map(a => a.getAttribute('href')),
    images: [...document.images].map(i => [i.getAttribute('src'), i.alt]),
    headings: [...document.querySelectorAll('h1,h2,h3')].map(h => [h.tagName, h.textContent]),
    selected: document.querySelector('[role=tab][aria-selected=true]').id,
    open: [...document.querySelectorAll('details[open]')].map(d => d.dataset.signal)
  }));
  try {
    await page.goto(base + '/cats/', { waitUntil: 'domcontentloaded' });
    await check('Source content/semantics preserved; root Hub and cat photographs unchanged', async () => {
      const before = execFileSync('git', ['show', baseCommit + ':cats/index.html'], { encoding: 'utf8' });
      const after = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
      const main = s => s.match(/<main[\s\S]*?<\/main>/)[0].replace('Two ways to see it.', 'More ways to see it.').replace(/\r/g, '');
      assert.equal(main(before), main(after));
      const protectedPaths = ['index.html', 'projects.html', 'style.css', 'workshop-theme.css', 'home-workshop.css', 'script.js', 'assets', 'visuals', 'cats/assets'];
      assert.equal(execFileSync('git', ['diff', baseCommit, '--', ...protectedPaths], { encoding: 'utf8' }).trim(), '');
    });
    await check('Native selector: five names, current value, 48px target, visible focus', async () => {
      const select = page.getByRole('combobox', { name: 'Visual style' });
      assert.deepEqual(await select.locator('option').allTextContents(), ['Editorial', 'Playful', 'Personal Hub', 'Dark Retro', 'Pastel Pink']);
      assert.equal(await select.inputValue(), 'editorial');
      assert((await select.boundingBox()).height >= 48);
      await select.focus();
      assert.equal(await select.evaluate(e => getComputedStyle(e).outlineStyle), 'solid');
    });
    await check('Native menu opens; Escape/outside close, keyboard selects, focus and value stay synchronized', async () => {
      const select = page.locator('#visual-style');
      await select.focus(); await page.keyboard.press('Alt+ArrowDown');
      assert(await select.evaluate(e => e.matches(':open')));
      await page.keyboard.press('ArrowDown'); await page.keyboard.press('Escape');
      assert(!(await select.evaluate(e => e.matches(':open'))));
      const keyboardValue = await select.inputValue();
      await page.waitForFunction(value => document.documentElement.dataset.style === value, keyboardValue);
      await settled(page);
      assert.equal(await page.locator(':focus').getAttribute('id'), 'visual-style');
      await select.click(); assert(await select.evaluate(e => e.matches(':open')));
      await page.locator('h1').click(); assert(!(await select.evaluate(e => e.matches(':open'))));
      await select.focus(); await page.keyboard.press('Alt+ArrowDown'); await page.keyboard.press('End'); await page.keyboard.press('Enter');
      await page.waitForFunction(() => document.documentElement.dataset.style === 'pastel-pink');
      await settled(page);
      assert.equal(await select.inputValue(), 'pastel-pink');
      assert.equal(await page.locator(':focus').getAttribute('id'), 'visual-style');
    });
    await check('Repeated five-style cycle preserves text, links, photos, tab/fact/disclosure state', async () => {
      await page.locator('#tab-coats').click();
      await page.locator('#another-fact').click();
      await page.locator('details[data-signal=eyes] summary').click();
      const before = await fingerprint(page);
      for (let round = 0; round < 2; round++) for (const theme of themeIds) {
        await style(page, theme);
        assert.deepEqual(await fingerprint(page), before);
        assert.equal(await page.locator('#visual-style').inputValue(), theme);
        assert.equal(await page.evaluate(() => localStorage.getItem('cat-visual-style')), theme);
      }
      // Simulate rapid input changes before pending native view transitions settle.
      await page.evaluate(ids => { const s = document.querySelector('select'); ids.forEach(id => { s.value = id; s.dispatchEvent(new Event('change')); }); }, [...themeIds, 'editorial']);
      await page.waitForFunction(() => document.documentElement.dataset.style === 'editorial');
      await settled(page);
      assert.deepEqual(await fingerprint(page), before);
      assert.equal(await page.locator('#visual-style').inputValue(), 'editorial');
    });
    await check('Reload persistence for every style; restoration occurs before stylesheets', async () => {
      for (const theme of themeIds) {
        await style(page, theme); await page.reload({ waitUntil: 'domcontentloaded' });
        assert.equal(await page.locator('html').getAttribute('data-style'), theme);
        assert.equal(await page.locator('#visual-style').inputValue(), theme);
      }
      const fresh = await browser.newContext();
      await fresh.addInitScript(() => localStorage.setItem('cat-visual-style', 'hub'));
      const p = await fresh.newPage(); monitor(p);
      let release; const gate = new Promise(resolve => { release = resolve; });
      await p.route('**/cats.css', async route => { await gate; await route.continue(); });
      await p.goto(base + '/cats/', { waitUntil: 'commit' });
      try {
        // RAF cannot run while a render-blocking stylesheet is deliberately stalled.
        await p.waitForFunction(() => document.documentElement.dataset.style === 'hub', null, { polling: 100 });
        assert.equal(await p.evaluate(() => [...document.styleSheets].some(s => s.href?.endsWith('/cats.css'))), false);
      } finally { release(); }
      await p.waitForLoadState('domcontentloaded'); await fresh.close();
    });
    await check('Existing interactions and keyboard in all five styles', async () => {
      for (const theme of themeIds) {
        await style(page, theme);
        await page.locator('#tab-facts').click(); await page.keyboard.press('ArrowRight');
        assert(await page.locator('#panel-coats').isVisible());
        await page.keyboard.press('End'); assert.equal(await page.locator(':focus').getAttribute('id'), 'tab-behavior');
        await page.keyboard.press('Home'); assert.equal(await page.locator(':focus').getAttribute('id'), 'tab-facts');
        if (['editorial','hub'].includes(theme)) { await page.keyboard.press('ArrowDown'); assert.equal(await page.locator(':focus').getAttribute('id'), 'tab-coats'); }
        await page.keyboard.press('Tab'); assert.equal(await page.locator(':focus').getAttribute('role'), 'tabpanel');
        await page.keyboard.press('Shift+Tab'); assert.equal(await page.locator(':focus').getAttribute('role'), 'tab');
        const before = await page.locator('#random-fact').textContent();
        await page.locator('#another-fact').click(); assert.notEqual(await page.locator('#random-fact').textContent(), before);
        if (theme === 'hub') {
          await page.locator('#another-fact').focus(); await page.keyboard.press('Tab');
          assert.equal(await page.locator(':focus').getAttribute('class'), 'fact-source');
          assert.equal(await page.locator('.fact-source').evaluate(e => getComputedStyle(e).outlineColor), 'rgb(71, 60, 44)');
          await page.locator('.fact-section').screenshot({ path: path.join(output, 'hub-keyboard-focus.png'), animations: 'disabled' });
        }
        await page.locator('details[data-signal=posture] summary').focus(); await page.keyboard.press('Enter');
        assert(await page.locator('details[data-signal=posture]').evaluate(e => e.open));
        await page.waitForFunction(() => document.querySelector('.cat-diagram').dataset.signal === 'posture');
        await page.locator('details[data-signal=tail] summary').click();
      }
    });
    await check('Responsive geometry at 1440/390/768/320, all styles; long content and zoom', async () => {
      for (const theme of themeIds) {
        await style(page, theme);
        for (const width of [1440, 390, 768, 320]) { await page.setViewportSize({width,height:900}); await noOverflow(page); }
        const text = await page.locator('.intro').textContent();
        await page.locator('.intro').evaluate(e => { e.textContent += ' A longer description keeps the same content flow.'.repeat(8); });
        await noOverflow(page); await page.locator('.intro').evaluate((e,t) => e.textContent=t, text);
        await page.setViewportSize({width:1280,height:900}); await page.evaluate(() => document.body.style.zoom='2'); await noOverflow(page); await page.evaluate(() => document.body.style.zoom='');
      }
    });
    await check('Mobile touch opens native popup; selection, tabs/facts/disclosures in every style', async () => {
      const mobile = await browser.newContext({ viewport:{width:390,height:844}, isMobile:true, hasTouch:true, deviceScaleFactor:1 });
      const p = await mobile.newPage(); monitor(p); await p.goto(base + '/cats/', {waitUntil:'domcontentloaded'});
      for (const theme of themeIds) {
        await p.locator('#visual-style').tap(); assert(await p.locator('#visual-style').evaluate(e => e.matches(':open')));
        await p.keyboard.press('Escape'); await style(p, theme);
        await p.locator('#tab-coats').tap(); assert(await p.locator('#panel-coats').isVisible());
        await p.locator('#tab-facts').tap();
        const old = await p.locator('#random-fact').textContent(); await p.locator('#another-fact').tap(); assert.notEqual(await p.locator('#random-fact').textContent(),old);
        await p.locator('details[data-signal=ears] summary').tap(); assert(await p.locator('details[data-signal=ears]').evaluate(e=>e.open));
        await p.locator('details[data-signal=tail] summary').tap(); await noOverflow(p);
      }
      await mobile.close();
    });
    await check('Reduced motion: all five switches/interactions have no running animations', async () => {
      await page.emulateMedia({ reducedMotion:'reduce' });
      for (const theme of themeIds) {
        await style(page,theme); await page.locator('#another-fact').click(); await page.locator('#tab-coats').click();
        assert.equal(await page.evaluate(()=>document.getAnimations().length),0);
        assert.equal(await page.locator('html').evaluate(e=>getComputedStyle(e).scrollBehavior),'auto');
        assert.equal(await page.locator('.button').first().evaluate(e=>getComputedStyle(e).transitionDuration),'0s');
      }
    });
    await check('All local links/assets resolve; one DOM, shared photos, no external runtime requests', async () => {
      for (const href of await page.locator('a[href]').evaluateAll(a=>a.map(x=>x.getAttribute('href')))) {
        if (href.startsWith('#')) assert(await page.locator(href).count());
        else if (!href.startsWith('https:')) assert((await context.request.get(new URL(href,base+'/cats/').href)).ok());
      }
      const externalOrigins = await page.evaluate(()=>[...new Set(performance.getEntriesByType('resource').filter(r=>!r.name.startsWith(location.origin)).map(r=>new URL(r.name).origin))]);
      // The host antivirus injects its own script/XHR into Edge; this is not a page dependency.
      results.environmentInjectedOrigins = externalOrigins.filter(origin => origin === 'http://me.kis.v2.scr.kaspersky-labs.com');
      assert.deepEqual(externalOrigins.filter(origin => !results.environmentInjectedOrigins.includes(origin)), []);
      await page.evaluate(async()=>{await Promise.all([...document.images].map(i=>{i.loading='eager';return i.decode()}))});
      assert.equal(await page.locator('main').count(),1);
    });
    await check('Invalid saved style and denied storage fallback; native list supports 20 entries', async () => {
      const invalid = await browser.newContext(); await invalid.addInitScript(()=>localStorage.setItem('cat-visual-style','missing-theme'));
      const p = await invalid.newPage(); monitor(p); await p.goto(base+'/cats/'); assert.equal(await p.locator('html').getAttribute('data-style'),'editorial');
      // UI-only scalability fixture. No sixth theme is added to the product.
      await p.locator('select').evaluate(s=>{for(let i=6;i<=20;i++)s.add(new Option('Future style '+i,'fixture-'+i));});
      await p.setViewportSize({width:390,height:844}); await noOverflow(p);
      await p.locator('select').focus(); await p.keyboard.press('Alt+ArrowDown'); assert(await p.locator('select').evaluate(e=>e.matches(':open'))); await p.keyboard.press('Escape');
      await invalid.close();
      const blocked = await browser.newContext(); await blocked.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw Error('blocked')}}));
      const bp=await blocked.newPage();monitor(bp);await bp.goto(base+'/cats/');await style(bp,'hub');await blocked.close();
    });
    await check('No JS/console errors or failed local requests',async()=>{assert.deepEqual(results.errors,[]);assert.deepEqual(results.failedLocalRequests,[])});
    // Use CAPTURE=1 only when render inputs changed. Inspection is recorded separately.
    if (process.env.CAPTURE === '1') {
      for (const theme of themeIds) {
        await page.goto(base+'/cats/'); await style(page,theme);
        await page.evaluate(async()=>{await Promise.all([...document.images].map(i=>{i.loading='eager';return i.decode()}))});
        for (const width of [1440,390]) {
          await page.setViewportSize({width,height:width===390?844:1000}); await page.evaluate(()=>scrollTo(0,0));
          const file=theme+'-'+(width===390?'mobile':'desktop')+'.png';
          await page.screenshot({path:path.join(output,file),fullPage:true,animations:'disabled'});results.screenshots.push(file);
        }
      }
    }
  } finally {
    fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(results,null,2)+'\n');
    await browser.close();
  }
})().catch(e=>{console.error(e);process.exitCode=1});
