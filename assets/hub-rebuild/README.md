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
