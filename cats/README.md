# Cat Visual Playground — five visual systems

Static experiment at `/cats/`. Second iteration: branch `cats-more-visuals`, based on `main` at `8c274ad9ed4fcffd767cc60252239623122e4452`, fetched/pulled from a clean checkout on 2026-10-02. This iteration changes only `cats/`; project 13, counts, Featured Projects, the root Hub and Toolkit remain unchanged.

## Preview

From the repository root, run `python -m http.server 8768 --bind 127.0.0.1` and open http://127.0.0.1:8768/cats/ . No build or installation. The review branch is not deployed to production and must not be merged until visual review.

## Selector and architecture

A labelled native `<select>` replaces the two buttons. Its selected name and adjacent swatch identify the current visual; its target is 48px tall. Native semantics provide keyboard navigation, platform popup, Escape/outside dismissal and touch handling without a custom menu/focus manager. Popup appearance and when keyboard changes commit depend on the browser/OS. In tested Edge, arrow navigation can commit before Escape; Escape closes and focus/value remain synchronized.

`themes.js` is the single registry for IDs, names, swatches, browser chrome colors, tab orientation and reveal timing. It restores a validated stored theme before stylesheets load. `cats.js` builds options from the registry and keeps one interaction implementation. A request counter prevents stale transition callbacks from overwriting rapid selections. Storage is optional. Changing visual preserves the current tab, fact and disclosures; reload preserves the visual only.

One semantic DOM and one photo set serve all five visuals. `cats.css` retains Editorial/Playful; `themes.css` scopes the three additions to `data-style`. Add a registry entry and scoped CSS for a future theme; no independent selector button or copied HTML is needed. A test-only native list of 20 options checks compact selector geometry without adding a sixth product theme.

| Visual | Direction |
| --- | --- |
| Editorial | Existing warm paper, Georgia, spacious asymmetrical photography; selector-only presentation adjustments. |
| Playful | Existing yellow/teal/coral, heavy sans, collage and hard shadows; selector-only presentation adjustments. |
| Personal Hub | Actual W.ZC workshop materials, inset rims/hardware, smoked glass, cyan navigation edges, warm paper, compact technical labels and restrained reveals. |
| Dark Retro | Charcoal workstation and off-white manual pages, amber/green accents, bevel controls, discreet static scanlines, stepped reveals; no flickering loop. |
| Pastel Pink | Rose/cream editorial, lavender tabs, peach paper, mint diagram, tape details and soft reveals. |

The hero note now says “More ways to see it” instead of “Two ways to see it”; all five styles share it. Main content otherwise matches the base exactly. Native tabs, random facts, disclosures, links, photos and semantics are shared. Reduced motion disables transitions and WAAPI reveals.

## Personal Hub fidelity

Source of truth inspected: `index.html`, `projects.html`, `style.css`, `workshop-theme.css`, `home-workshop.css`, `docs/WORKSHOP_DESIGN_SYSTEM.md` and `assets/hub-rebuild/README.md`. Local renders of the real Hub and Projects were compared with the Cats Hub render for material hierarchy, borders, color, typography, density and controls.

Reused by relative URL from `../assets/hub-rebuild/`:

- `02_workshop_hero_background.webp`
- `03_dark_metal_texture.webp`
- `09_smoked_glass_panel_overlay.webp`
- `10_warm_reflection_overlay.webp`
- `11_panel_specular_overlay.webp`

The scoped adaptation uses the Hub palette, Consolas/Impact family, material gradients, inset highlights, cyan active edges and paper controls. It keeps the cat page composition rather than copying the Hub dashboard. No global Hub stylesheet is imported; no material asset is duplicated. These five existing textures total about 859 KiB and are used only by the Hub theme. The four existing cat photographs (about 360 KiB total variants) and system fonts are reused by all themes. [Existing photo/content provenance](SOURCES.md).

## Visual evidence — 2026-10-02

| Visual | Desktop 1440 × 1000 | Mobile emulation 390 × 844 |
| --- | --- | --- |
| Editorial | [Full screenshot](review/v2/editorial-desktop.png) | [Full screenshot](review/v2/editorial-mobile.png) |
| Playful | [Full screenshot](review/v2/playful-desktop.png) | [Full screenshot](review/v2/playful-mobile.png) |
| Personal Hub | [Full screenshot](review/v2/hub-desktop.png) | [Full screenshot](review/v2/hub-mobile.png) |
| Dark Retro | [Full screenshot](review/v2/dark-retro-desktop.png) | [Full screenshot](review/v2/dark-retro-mobile.png) |
| Pastel Pink | [Full screenshot](review/v2/pastel-pink-desktop.png) | [Full screenshot](review/v2/pastel-pink-mobile.png) |

All ten screenshots were opened and inspected. Mobile full-page content was additionally split into readable 390px-wide strips for inspection. Checked hierarchy, spacing, crop, contrast, controls, clipping, theme leakage and reflow. Compared [real Hub](review/v2/hub-reference-index.png) and [Projects](review/v2/hub-reference-projects.png) with Personal Hub; their external avatar was blocked during reference capture, so that image is not fidelity evidence. No obvious visual defect remained. The original two-theme evidence in `review/` is historical.

## Focused verification

Backend: existing Playwright 1.62.1 / Edge 154.0.4258.48. Results are in `review/v2/results.json`; the script checks content invariants, selector keyboard/focus/dismissal, repeated and rapid switching, state, reload/pre-stylesheet restoration, tabs/facts/disclosures, 1440/390/768/320 geometry, long text, 200% CSS zoom, mobile taps, reduced motion, links/images, invalid/denied storage, 20-option fixture and local console/network errors.

Final run: **12/12 groups PASS**, zero JavaScript/console errors and zero failed local requests. JavaScript syntax and Git whitespace checks passed. The corrected paper-card focus was asserted in the browser and its [focused screenshot](review/v2/hub-keyboard-focus.png) was opened and inspected. This additional capture does not replace any of the ten full-page views.

To repeat with the existing bundled module (start the HTTP server first):

```powershell
$env:PLAYWRIGHT_MODULE = 'C:/Users/Walter Zafra/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'
node cats/review/verify.cjs
```

Optional `CAT_PREVIEW_URL` and `CAT_REVIEW_OUTPUT` override the server/output. `CAPTURE=1` refreshes the ten screenshots; normal verification reuses them and writes results only. Saving screenshots is not proof of inspection.

Limits: Edge desktop plus mobile emulation, not physical-device/Safari/Firefox testing. Mobile taps open the native popup; option changes use Playwright's native select API rather than a physical OS picker. CSS zoom is a reflow proxy. No screen-reader session or exhaustive accessibility/compliance audit. Current evidence does not imply a public branch deployment.

The host antivirus injects requests to `me.kis.v2.scr.kaspersky-labs.com` into Edge. The check records that observed environmental origin separately and rejects any other external resource origin. The page's own runtime assets are local; the antivirus was not disabled or reconfigured.

## Workflow and review

Read-only Toolkit v0.7.0 guidance: `coding-standards`, `frontend-patterns` with `visual-direction-and-reference.md`, `e2e-testing` with `ui-verification-by-risk.md`, and `verification-lite`. No Toolkit/skill edits or installations. The user-prescribed Git flow made additional workflow coordination unnecessary.

One independent read-only reviewer compared Hub references and the new mobile screenshots, and reviewed the selector, scoped CSS and shared logic. Its P2 finding was a low-contrast cyan focus outline on Personal Hub's light fact card; a local dark-outline override fixes it. Runtime verification also identified and fixed an unhandled View Transition `ready` rejection during rapid switching. No unrelated redesign was made.

The reviewer rechecked both corrections and closed the P2 finding: no remaining actionable findings. It did not rerun browser tests; the author supplied the final runtime evidence above.

**NO MERGE — visual review required.**
