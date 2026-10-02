// No installation needed. Set PLAYWRIGHT_MODULE to an existing compatible module.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const base = process.env.CAT_PREVIEW_URL || 'http://127.0.0.1:8768';
const output = process.env.CAT_REVIEW_OUTPUT || __dirname;

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const results = { backend: `Playwright ${require((process.env.PLAYWRIGHT_MODULE || 'playwright') + '/package.json').version} / Edge ${browser.version()}`, checks: [], errors: [], failedLocalRequests: [] };
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  const monitor = p => {
    p.on('pageerror', error => results.errors.push(error.message));
    p.on('console', msg => { if (msg.type() === 'error') results.errors.push(msg.text()); });
    p.on('requestfailed', req => { if (req.url().startsWith(base)) results.failedLocalRequests.push(req.url()); });
    p.on('response', res => { if (res.url().startsWith(base) && res.status() >= 400) results.failedLocalRequests.push(`${res.status()} ${res.url()}`); });
  };
  monitor(page);
  const check = async (name, fn) => { await fn(); results.checks.push({ name, result: 'PASS' }); };
  const settled = p => p.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(document.getAnimations().map(a => a.finished.catch(() => {})));
  });
  const style = async (p, name) => {
    await p.locator(`[data-style-choice="${name}"]`).click();
    await p.waitForFunction(n => document.documentElement.dataset.style === n, name);
    await settled(p);
  };
  const noOverflow = async p => assert(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Horizontal overflow');
  const capture = async (p, name) => {
    // Load lazy images and let all visible reveal animations finish before capture.
    await p.evaluate(async () => {
      const images = [...document.images];
      images.forEach(img => { img.loading = 'eager'; });
      await Promise.all(images.map(img => img.decode()));
    });
    await p.evaluate(() => scrollTo(0, 0));
    await settled(p);
    await p.screenshot({ path: path.join(output, name + '.png'), fullPage: true, animations: 'disabled' });
  };
  try {
    await page.goto(base + '/cats/', { waitUntil: 'networkidle' });
    await check('Default editorial; two style controls; correct pressed state', async () => {
      assert.equal(await page.locator('[data-style-choice]').count(), 2);
      assert.equal(await page.locator('[data-style-choice="editorial"]').getAttribute('aria-pressed'), 'true');
    });
    await check('Tabs change content; keyboard arrows, Home, End; Tab/Shift+Tab and focus', async () => {
      assert.equal(await page.getByRole('tablist').getAttribute('aria-orientation'), 'vertical');
      await page.locator('#tab-facts').focus();
      await page.keyboard.press('ArrowDown');
      assert.equal(await page.locator(':focus').getAttribute('id'), 'tab-coats');
      await page.keyboard.press('ArrowUp');
      assert.equal(await page.locator(':focus').getAttribute('id'), 'tab-facts');
      await page.getByRole('tab', { name: /Coats/ }).click();
      assert(await page.getByRole('tabpanel').getByText('A coat is not', { exact: false }).isVisible());
      await page.keyboard.press('ArrowRight');
      assert.equal(await page.locator(':focus').getAttribute('id'), 'tab-behavior');
      await page.keyboard.press('Home');
      assert.equal(await page.locator(':focus').getAttribute('id'), 'tab-facts');
      await page.keyboard.press('End');
      assert.equal(await page.locator(':focus').getAttribute('id'), 'tab-behavior');
      assert.equal(await page.locator(':focus').evaluate(e => getComputedStyle(e).outlineStyle), 'solid');
      await page.keyboard.press('Tab');
      assert.equal(await page.locator(':focus').getAttribute('id'), 'panel-behavior');
      await page.keyboard.press('Shift+Tab');
      assert.equal(await page.locator(':focus').getAttribute('id'), 'tab-behavior');
    });
    await check('Random facts change without reload and announce updates', async () => {
      const previous = await page.locator('#random-fact').textContent();
      await page.locator('#another-fact').click();
      assert.notEqual(await page.locator('#random-fact').textContent(), previous);
      assert.equal(await page.locator('#random-fact').getAttribute('aria-live'), 'polite');
    });
    await check('Style switch preserves tab, fact and disclosure; reload persists style', async () => {
      await page.locator('details[data-signal="eyes"] summary').click();
      const fact = await page.locator('#random-fact').textContent();
      await style(page, 'playful');
      assert.equal(await page.getByRole('tablist').getAttribute('aria-orientation'), 'horizontal');
      assert.equal(await page.locator('#random-fact').textContent(), fact);
      assert.equal(await page.locator('#tab-behavior').getAttribute('aria-selected'), 'true');
      assert(await page.locator('details[data-signal="eyes"]').evaluate(e => e.open));
      assert.equal(await page.locator('[data-style-choice="playful"]').getAttribute('aria-pressed'), 'true');
      await page.reload({ waitUntil: 'networkidle' });
      assert.equal(await page.locator('html').getAttribute('data-style'), 'playful');
    });
    await check('Keyboard style activation and disclosure; no focus loss', async () => {
      await page.locator('[data-style-choice="editorial"]').focus();
      await page.keyboard.press('Enter');
      await page.waitForFunction(() => document.documentElement.dataset.style === 'editorial');
      await settled(page);
      assert.equal(await page.locator(':focus').getAttribute('data-style-choice'), 'editorial');
      await page.locator('details[data-signal="ears"] summary').focus();
      await page.keyboard.press('Enter');
      assert(await page.locator('details[data-signal="ears"]').evaluate(e => e.open));
      await page.waitForFunction(() => document.querySelector('.cat-diagram').dataset.signal === 'ears');
      await page.locator('details[data-signal="tail"] summary').click();
    });
    await check('Desktop 1440: both visual systems and decoded images, no overflow', async () => {
      for (const name of ['editorial', 'playful']) {
        await style(page, name);
        await noOverflow(page);
        await capture(page, name + '-desktop');
      }
    });
    const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
    const mp = await mobile.newPage(); monitor(mp);
    await mp.goto(base + '/cats/', { waitUntil: 'networkidle' });
    await check('Mobile 390 touch interactions and both visual screenshots', async () => {
      assert.equal(await mp.getByRole('tablist').getAttribute('aria-orientation'), 'horizontal');
      for (const name of ['editorial', 'playful']) {
        await mp.locator(`[data-style-choice="${name}"]`).tap();
        await mp.waitForFunction(n => document.documentElement.dataset.style === n, name);
        await settled(mp);
        await mp.getByRole('tab', { name: /Coats/ }).tap();
        assert(await mp.locator('#panel-coats').isVisible());
        await mp.getByRole('tab', { name: /Everyday/ }).tap();
        const before = await mp.locator('#random-fact').textContent();
        await mp.locator('#another-fact').tap();
        assert.notEqual(await mp.locator('#random-fact').textContent(), before);
        await mp.locator('details[data-signal="posture"] summary').tap();
        assert(await mp.locator('details[data-signal="posture"]').evaluate(e => e.open));
        await mp.locator('details[data-signal="tail"] summary').tap();
        await noOverflow(mp);
        await capture(mp, name + '-mobile');
      }
    });
    await check('768px intermediate, 320px narrow, long text and 200% zoom proxy', async () => {
      for (const name of ['editorial', 'playful']) {
        await style(page, name);
        for (const width of [768, 320]) {
          await page.setViewportSize({ width, height: 900 });
          await noOverflow(page);
        }
        await page.setViewportSize({ width: 390, height: 844 });
        const original = await page.locator('.intro').textContent();
        await page.locator('.intro').evaluate(e => { e.textContent += ' A very curious cat takes a longer look at everything around the room.'.repeat(8); });
        await noOverflow(page);
        await page.locator('.intro').evaluate((e, text) => { e.textContent = text; }, original);
        await page.setViewportSize({ width: 1280, height: 900 });
        await page.evaluate(() => { document.body.style.zoom = '2'; });
        await noOverflow(page);
        await page.evaluate(() => { document.body.style.zoom = ''; });
      }
    });
    await check('Reduced motion disables CSS/WAAPI motion and preserves interactions', async () => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      for (const name of ['editorial', 'playful']) {
        await style(page, name);
        await page.locator('#another-fact').click();
        await page.getByRole('tab', { name: /Coats/ }).click();
        assert.equal(await page.evaluate(() => document.getAnimations().length), 0);
        assert.equal(await page.locator('html').evaluate(e => getComputedStyle(e).scrollBehavior), 'auto');
        assert.equal(await page.locator('.button').first().evaluate(e => getComputedStyle(e).transitionDuration), '0s');
      }
    });
    await check('All local links and anchors resolve; Hub entry and counters', async () => {
      const hrefs = await page.locator('a[href]').evaluateAll(links => links.map(a => a.getAttribute('href')));
      for (const href of hrefs) {
        if (href.startsWith('#')) assert(await page.locator(href).count(), `Missing ${href}`);
        else if (!href.startsWith('https:')) assert((await context.request.get(new URL(href, base + '/cats/').href)).ok());
      }
      const projects = await context.request.get(base + '/projects.html');
      const html = await projects.text();
      assert.equal((html.match(/class="project-number"/g) || []).length, 13);
      assert(html.includes('href="cats/"'));
      const home = await context.request.get(base + '/');
      assert((await home.text()).includes('<strong>13</strong><span>projects</span>'));
    });
    await check('Storage-denied fallback and no-JS readable content', async () => {
      const blocked = await browser.newContext();
      await blocked.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('Storage unavailable'); } }); });
      const bp = await blocked.newPage(); monitor(bp);
      await bp.goto(base + '/cats/'); await style(bp, 'playful'); await blocked.close();
      const nojs = await browser.newContext({ javaScriptEnabled: false });
      const np = await nojs.newPage();
      await np.goto(base + '/cats/');
      assert.equal(await np.locator('.guide-panel:visible').count(), 3);
      assert(await np.locator('.no-script').isVisible());
      await np.locator('details[data-signal="eyes"] summary').click();
      assert(await np.locator('details[data-signal="eyes"]').evaluate(e => e.open));
      await nojs.close();
    });
    await check('No runtime console errors or failed local requests', async () => {
      assert.deepEqual(results.errors, []);
      assert.deepEqual(results.failedLocalRequests, []);
    });
  } finally {
    fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(results, null, 2) + '\n');
    console.log(JSON.stringify(results, null, 2));
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
