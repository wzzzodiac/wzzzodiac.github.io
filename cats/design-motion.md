# Complete reference templates — corrective rebuild

Walter requested three genuinely different visual systems after the first shared-DOM additions remained too similar. Complete template reuse was explicitly authorized. The following official template pages and their live demos were opened and visually inspected; their downloadable HTML/CSS was retrieved and adapted, with retained licensing and visible attribution.

| Adaptation | Primary source | What is actually reused and changed |
| --- | --- | --- |
| Ethereal | https://html5up.net/ethereal | Its horizontal panel/banner/spotlight architecture and full base CSS. Stock images and remote font/icon imports are replaced; the cat content, Syne/Karla, warm gradients and custom finite motion are local. Mobile uses vertical reading. |
| Dimension | https://html5up.net/dimension | Its full-stage background, logo/connecting rules, central navigation and article-room structure with the full base CSS. Space Mono, cat imagery, native dialogs and bounded parallax replace the demo content and jQuery interaction layer. |
| Multiverse | https://html5up.net/multiverse | Its photographic wall, thumbnail/caption treatment and fixed bottom navigation with the full base CSS. Bodoni Moda/Karla, an asymmetric photo grid, native expanding lightbox and right-side content drawers adapt the template to the same cat material. |

This is deliberate reuse of licensed template code, not a claim that the layouts were invented here. Sources are HTML5 UP / AJ under [CC BY 3.0](https://html5up.net/license). Each `templates/<name>/LICENSE.txt` is retained. Adapted files are `index.html`, `template.css`, `edition.css` and `edition.js`; original template headers remain in `template.css`. No original demo photographs, remote icon library or jQuery runtime is shipped. Local fonts use their included OFL licenses; photo sources are listed in SOURCES.md.

## Motion ownership and interaction

The template-specific scripts own page choreography; `shared.js` owns its finite WAAPI effects, cancels them on visibility/policy changes, and samples visible photo transforms before close. Geometry and information remain usable with motion off. Image decoding and a revision guard prevent old photo loads from overwriting a newer selection. Native dialogs provide modal semantics, Escape and focus return; root scroll is locked while a dialog is open, with contained inner scrolling. The viewer keeps close/previous/next controls in the viewport, including 320px layouts.

Ethereal follows native horizontal scroll, with scene controls and a desktop vertical-wheel mapping that yields to genuinely scrollable inner content. Ctrl+wheel is not intercepted. Mobile has normal document scroll. Dimension keeps pointer parallax bounded and restricted to fine pointers. Multiverse image entrances are triggered once on intersection; caption hover/zoom also has keyboard focus and static touch/reduced-motion states. There is no idle RAF loop or mandatory 3D effect.

The first-pass work below is preserved as a historical experiment, not the current implementation or current source attribution.

---

# Historical first-pass motion editions

Brief: keep the feline content and functions, but explore three distinctly expressive compositions. Walter delegated design selection and publication; no intermediate sketch approval was required. The original five editions and prior trial evidence remain.

| Edition | Composition | Focal interaction |
| --- | --- | --- |
| Night Safari | Olive-black, acid lime, monumental condensed type, orbital portrait | Pointer light/tilt and a filmstrip advancing with native vertical scroll |
| Paper Riot | Cobalt letterpress, scarlet/yellow collage, alternating full-width photographic rows | Repeated image sheets fan on pointer/focus and animate through the photo button |
| Prism Room | Lavender room, serif typography, panoramic aperture, physical contact sheets | Scroll opens the aperture and separates an overlapping stack in perspective |

## References consulted on 2026-10-28

These are mechanism/visual references, not imported templates or licensed copies of their artwork. All new implementation is original native DOM/CSS/WAAPI; existing locally licensed cat photography is reused. No source code, photos or dependencies were imported from the demos.

- [Codrops — Rapid Image Layers Animation](https://tympanus.net/codrops/2020/04/07/rapid-image-layers-animation/): article and live demo inspected; movement of a covering layer relative to stable content informed the reveal choreography.
- [Codrops — On-Scroll Column & Row Animations](https://tympanus.net/codrops/2023/08/15/on-scroll-column-row-animations/): article and scrolled live image grid inspected; movement/rotation tied to scroll informed the filmstrip and contact-sheet spread.
- [Codrops — Repetition Image Hover Effects](https://tympanus.net/codrops/2022/02/22/repetition-image-hover-effects/): article consulted for repeated layers and staggered scales/origins. The live demo remained at a loader during inspection; its runtime hover behavior is not claimed as observed.
- Local frontend-patterns continuity/reveal and choreography source studies informed cancellation, state ownership, counter-motion and reduced-motion resolution. Their source was read; local file-protocol browser observation was unavailable.

The Awwwards UI gallery timed out during lookup and was not used as observed evidence.

## Ownership and fallbacks

One semantic page, one selector registry, shared tabs/facts/disclosures. New rules are scoped to their style ids or the expressive flag. The motion module owns only its own animations and cancels them on style/policy changes. Repeated finite gestures sample the visible pose before cancellation. Frame work is scheduled by scroll/pointer/resize, with no continuous idle animation loop, wheel interception or replacement cursor. Background visibility stops animation work. Native scroll remains authoritative.

Static states expose all information. Small viewports remove sticky scenes; motion off/reduced exposes the full image and spread gallery. Fine-pointer effects have keyboard/button equivalents. No 3D renderer was added: perspective here is the artistic effect of photographic sheets occupying and unfolding through space.
