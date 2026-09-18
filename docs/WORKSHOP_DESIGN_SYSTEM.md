# Workshop design system

The approved Home on `main` at `ccc7adf` is the source of this theme. Its materials were extracted, not recreated from reference images. This is a static HTML/CSS site; no build step or framework is required.

## Stylesheets and loading order

1. `style.css`: existing reset, typography, grids, article/code behavior and legacy base styles.
2. `workshop-theme.css`: shared background, tokens, sidebar, topbar, materials, coatings, fasteners, cards, inner-page shell and accessibility fallbacks.
3. `home-workshop.css`: Home only: hero placement/crop, headline, featured grid, compact card copy, right column and clipped quote composition.

Inner pages load only the first two. Notes may additionally load `notes/notes-extra.css` for their existing code disclosures and utilities. Do not copy Home CSS into another page.

## Starting a page

Copy `page-template.html` to the desired page filename. Replace the title and content comments with real content, remove `noindex` when the page is ready, and mark the correct navigation link with `class="active" aria-current="page"`. Remove an unused sample panel instead of leaving an empty module in production.

Use `body.workshop-theme.workshop-page`, the canonical sidebar, `.workshop-layout`, `.topbar`, `main#main-content.main` and footer. Keep the skip link and `tabindex="-1"` on main. For nested pages, prefix stylesheet, script and navigation paths with `../` as appropriate. Asset URLs inside the shared CSS resolve relative to that stylesheet, so they do not need per-page changes.

Home uses `body.workshop-theme.home-workshop` and its own `.workspace` layout. Do not switch Home to the inner-page shell.

## Components

| Class | Purpose |
| --- | --- |
| `material-panel` | Shared material parameters and isolated layer stack |
| `panel` | Structural frame with small corner fasteners and inset rim |
| `material-metal` on `sidebar` | Approved solid metal navigation shell |
| `material-header` on `topbar` | Common header surface |
| `material-showcase` | Large glass content panel or page introduction |
| `material-card` | Darker card surface for projects, categories and contact |
| `material-status` | Recessed status/info surface |
| `material-note` | Surface behind a real note or paper element |
| `surface-coat` / `surface-reflection` | Glass, warm reflection and specular layers |
| `frame-fasteners` | Optional larger slotted fasteners for a structural panel |

Every material panel uses the same decorative coating, placed before its real content:

```html
<section class="panel material-panel material-showcase">
  <div class="surface-coat" aria-hidden="true">
    <span class="surface-reflection"></span>
  </div>
  <!-- REAL CONTENT -->
</section>
```

For cards, use `material-panel material-card` without `panel` to avoid corner screws on every small item. Existing `.project-row`, `.note-row` and `.contact-box` supply their content layout; they share the same card material. Project descriptions and links remain live HTML. Current Projects has text rows, not thumbnails; do not invent thumbnail content.

The sidebar uses the same markup/classes on every page. Header labels may vary, but reuse `.workbench-label`, `.motto` and `.topmark`. Static shell markup is repeated intentionally so navigation works without JavaScript; its visual implementation exists once in the theme. `script.js` continues to handle existing page interactions.

The sidebar's larger hardware is optional elsewhere:

```html
<div class="frame-fasteners" aria-hidden="true">
  <i></i><i></i><i></i><i></i>
</div>
```

Place it directly inside a positioned `material-panel`. Most structural panels already get smaller fasteners through `panel::before`; do not use both sets on one panel. Coatings and hardware ignore pointer events and never determine layout dimensions. Content is above coatings, hardware above content at the edges.

## Tuning variables

| Variables | Control |
| --- | --- |
| `--workshop-cyan`, `--workshop-text`, `--workshop-ink`, `--workshop-edge` | Shared palette |
| `--rail-width`, `--workshop-gap` | Responsive shell sizing and spacing |
| `--material-opacity` | Panel background opacity |
| `--material-glass`, `--material-specular` | Glass and edge highlights |
| `--material-warm`, `--ambient-warmth` | Local reflection strength and shared multiplier |
| `--material-reflection-size`, `--material-reflection-position` | Existing reflection asset placement |
| `--material-blur` | Background blur; cards default to zero on desktop |
| `--frame-warm-edge`, `--frame-top-highlight`, `--frame-inset-depth` | Frame lighting and depth |
| `--sidebar-metal-shade`, `--sidebar-wear` | Solid sidebar texture and wear |
| `--fastener-rim`, `--fastener-shadow` | Hardware colors |

Prefer changing a material recipe or variable once. Keep page-specific composition in its page stylesheet. Inner article panels intentionally use greater opacity and weaker reflections for long-form reading. Preserve the reduced-motion, reduced-transparency, forced-colors and no-backdrop-filter fallbacks.

## Existing assets

All paths below are under `assets/hub-rebuild/`; reuse the current WebP files.

| Prefix | Purpose |
| --- | --- |
| `02_workshop_hero_background` | Shared atmospheric background and Home hero scene |
| `03_dark_metal_texture` | Structural metal |
| `04_wear_scratches_overlay` | Restrained surface wear |
| `05_heisenberg_paper` | Home's existing clipped quote paper |
| `06_decorative_papers` | Available paper atlas; not added to navigation |
| `07_blueprint_overlay` | Home hero blueprint |
| `08_glass_overlay` | Existing hero/thumbnail glass |
| `09_smoked_glass_panel_overlay` | Reusable smoked glass coating |
| `10_warm_reflection_overlay` | Workshop amber reflections |
| `11_panel_specular_overlay` | Surface highlights |

Do not duplicate or regenerate these assets, add screenshot backgrounds, duplicate the material CSS, or copy Home-only hero dimensions to an inner page. Preserve real content, note ordering, destinations and existing note interactions when migrating a page.

## Validation when editing

Compare Home against the approved implementation at 1600, 1366, 1024, 768 and 390 pixels. Check inner pages at the same widths, keyboard focus, active navigation, local links, long article content and horizontal overflow. A shared material edit should be reviewed on both Home and an inner page before publishing.
