# Cat Visual Playground — first review

Independent static experiment at `/cats/`. Base: `f352f82142cfbfd347c865a49109d18d476709ba` (current `main`, fetched and pulled with a clean checkout on 2026-10-02). Review branch: `web-visuals-try`.

## Preview

From the repository root:

```sh
python -m http.server 8768 --bind 127.0.0.1
```

Open http://127.0.0.1:8768/cats/ . No build, package installation or network dependency is needed by the page. The root Hub still has its existing external links/assets.

Pages evidence: the latest successful [production run](https://github.com/wzzzodiac/wzzzodiac.github.io/actions/runs/36019447472) uses `main` at the base commit via `dynamic/pages/pages-build-deployment`; the checkout has no custom `.github/workflows` or branch preview configuration. The Pages settings REST endpoint was unavailable through the connected read API (and unauthenticated access returned 404), so the deployment/workflow evidence was used. No settings, deployment or production source was changed. This draft uses a local preview because no isolated branch preview is configured.

## What to review

- **Editorial:** Georgia headlines, warm paper, forest ink, rust accents, fine rules, spacious asymmetrical photography, vertical desktop field-guide tabs, quiet reveals.
- **Playful:** heavy system sans, yellow/teal/coral palette, rounded and rotated photo frames, hard shadows, horizontal desktop tabs, a compact collage, stronger hover response.
- Shared DOM/content, three actual tab panels, five non-repeating random facts, four native body-language disclosures with diagram highlights, real photos, anchor navigation and credits.
- The visual switch uses `aria-pressed`, restores optional localStorage before CSS paints, preserves live tab/fact/disclosure state, and uses native View Transitions with a WAAPI fallback. Reduced motion disables both. Persistence across reload covers the visual choice only.
- Keyboard: one tab stop in the tablist; Left/Right, Home/End and vertical Up/Down; Tab enters the active panel. Focus outlines, skip link, native links/buttons/details and polite fact announcements.
- Four local photos with 640/1200 WebP variants as used (approximately 360 KiB combined), explicit dimensions, below-fold lazy loading, no web fonts or runtime dependencies. [Photo and content sources](SOURCES.md), also available via `credits.html`.

The only root changes are project **13 — Cat Visual Playground**, its `cats/` link, and the two actual project counts from 12 to 13. The index uses text rows, so no thumbnail was added. Home Featured Projects, shared styles/scripts, other projects and historical `visuals/` are unchanged.

## Evidence — 2026-10-02

Backend actually launched: **Playwright 1.62.1 / Edge 154.0.4258.48**, existing bundled runtime. No new testing dependency.

| Visual | Desktop, 1440 × 1000 viewport | Mobile emulation, 390 × 844 viewport |
| --- | --- | --- |
| Editorial | [Full screenshot](review/editorial-desktop.png) | [Full screenshot](review/editorial-mobile.png) |
| Playful | [Full screenshot](review/playful-desktop.png) | [Full screenshot](review/playful-mobile.png) |

All four full screenshots were opened and inspected, with mobile crops inspected at readable size. Reviewed hierarchy, spacing, photo crops, control visibility, clipping and reflow. No clear visual defect remained. Screenshots show different random facts because the mobile interaction checks exercise the shuffle; they use the same fact pool.

`review/results.json`: 12 passing focused groups plus a passing orientation follow-up. Theme switch/state/persistence; pointer and keyboard tabs; focus; random fact; native disclosures; mobile taps; decoded images; local links and Hub counts; reduced motion; denied storage; no-JS reading fallback. No JavaScript/console errors or failed local requests in the experiment. Overflow checks also passed at 768 and 320 CSS px, with long introduction text and a 200% CSS zoom proxy. Orientation correction was rechecked separately and did not change the captured appearance. `node --check cats/cats.js` and scoped Git whitespace checks passed.

To repeat using an already-installed Playwright module, start the HTTP server and run:

```powershell
$env:PLAYWRIGHT_MODULE = 'C:/Users/Walter Zafra/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'
node cats/review/verify.cjs
```

Override `CAT_PREVIEW_URL` or `CAT_REVIEW_OUTPUT` if needed. Test script writes screenshots/results only to the selected output directory. It does not install tools. Screenshots alone are not an inspection result.

## Toolkit and focused review

Used v0.7.0 `coding-standards` for native/scoped implementation; `frontend-patterns` plus `visual-direction-and-reference.md` for coherent distinct directions; `e2e-testing` plus `ui-verification-by-risk.md` for browser evidence; `verification-lite` for the completion/diff gate. No intake blocker; the user-prescribed workflow did not need additional `project-workflow` coordination. Toolkit files were read only, never changed.

One read-only `reviewer` agent inspected changed code, root diff, test evidence and representative screenshots. **No actionable findings**; no subjective findings accepted or rejected. The author corrected tab orientation/Up/Down handling during verification, before that review.

Limits: Edge desktop plus mobile emulation, not real-device/Safari/Firefox testing. CSS zoom is a reflow proxy, not native browser-zoom testing. No screen-reader session or exhaustive accessibility audit; no WCAG compliance claim. Pexels pages/license were consulted; no legal certification. No public branch deployment, no merge, no third visual.

**READY FOR FIRST REVIEW**
