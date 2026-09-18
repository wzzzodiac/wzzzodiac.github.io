# Homepage materials

The homepage uses `home-workshop.css`, loaded only by `index.html` after the shared stylesheet. The `home-workshop` body class scopes every rule. Other pages and `style.css` are unchanged.

## Source map

| Supplied source | Web asset | Role |
| --- | --- | --- |
| 01_HERO_REFERENCE.png | Not shipped | Visual target only; never embedded as website UI. |
| 02_WORKSHOP_HERO_BACKGROUND.png | 02_workshop_hero_background.webp | Decorative hero scene and muted ambient page backdrop. |
| 03_DARK_METAL_TEXTURE.png | 03_dark_metal_texture.webp | Sidebar, top rail, frames and project shells. |
| 04_WEAR_SCRATCHES_OVERLAY.png | 04_wear_scratches_overlay.webp | Restrained wear on frame surfaces. |
| 05_HEISENBERG_PAPER.png | 05_heisenberg_paper.webp | Clipped paper behind the existing HTML quote. |
| 06_DECORATIVE_PAPERS.png | 06_decorative_papers.webp | One blank decorative sidebar scrap, shown through a CSS sprite window. Hidden on small screens. |
| 07_BLUEPRINT_OVERLAY.png | 07_blueprint_overlay.webp | Faint, non-interactive technical layer in the hero. |
| 08_GLASS_OVERLAY.png | 08_glass_overlay.webp | Low-opacity optical surface on hero and thumbnails. |

The seven supplied implementation assets were converted to WebP with transparency retained where present. The scene retains its original dimensions; textures and overlays use smaller web dimensions. Combined size is approximately 1.26 MiB. The PNG originals remain in the supplied files, not duplicated in the site. No new image content was generated.

## Editing

- Change the existing text, links and projects in `index.html`. Hero decoration is `aria-hidden`; content and buttons remain normal HTML.
- Change material paths, colors, spacing, wear and glass strengths in the variable block at the top of `home-workshop.css`.
- The hero uses local layers: scene 0, glass/blueprint 1, copy 2, frame hardware 3. No overlay intercepts controls.
- Quote text is inside `.clipped-note .paper-note`; its position is relative to the paper asset.
- The sidebar scrap uses the original decorative-papers atlas. Its background position selects the upper-left blank note; it contains no added caption.
- Homepage desktop descriptions use a three-line preview, matching the established compact-card behavior; full project descriptions remain on the Projects page and in the HTML. Small screens show the complete descriptions.
- The layout switches to two project columns and two support modules at 1100px, then a horizontal navigation and a single column at 700px. Reduced-motion and forced-colors overrides are at the end.

The existing project thumbnails, counts, status wording, quote, navigation and footer are preserved. Words visible within the supplied workshop/blueprint imagery are decorative image content, not new site data.

## Panel material pass (09–11)

The material block at the end of `home-workshop.css` adds component recipes without changing layout dimensions. Each `material-panel` contains one decorative, `aria-hidden` `.surface-coat` with a `.surface-reflection` child. These layers never receive pointer input.

| Supplied source | Web asset | Layer |
| --- | --- | --- |
| 09_smoked_glass_panel_overlay.png | 09_smoked_glass_panel_overlay.webp | `.surface-coat::before`: smoked acrylic edge, smudges and fine wear. |
| 10_warm_reflection_overlay.png | 10_warm_reflection_overlay.webp | `.surface-reflection`: restrained amber ambient pickup. |
| 11_panel_specular_overlay.png | 11_panel_specular_overlay.webp | `.surface-coat::after`: front-edge gloss and corner highlights. |

All three web assets preserve alpha and are 1200×675; their combined size is about 551 KiB. `01_HERO_REFERENCE.png` remains a visual target only. The supplied baseline screenshot is named `12_ACTUAL_STATUS.png` (called `12_CURRENT_STATUS.png` in the request); it is not a runtime asset.

`--material-opacity` controls the actual shell transparency. `--material-glass`, `--material-warm`, `--material-specular`, `--material-blur`, and reflection positioning control its optical response. Header, structural metal sidebar, hero, status, note frame, showcase and individual cards have separate recipes. The paper and its quote are unaffected. Header and outer showcase/status/note surfaces reveal the real backdrop; cards retain a darker reading area. The sidebar keeps its solid metal base.

Coatings are at layer 1; content stays at layer 2 and panel screws at 3. Fallbacks cover browsers without backdrop blur, reduced transparency and forced colors. Mobile cards are slightly more opaque for readability. The pass adds no JavaScript, new text or continuous animation.
