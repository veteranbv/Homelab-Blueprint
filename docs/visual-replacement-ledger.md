# Visual replacement ledger

This ledger records every visual artifact that this rebuild retired, along
with the reason and the new plate or prose that carries the same
information. Two groups are covered.

The first group is the original 2023 blueprint. Thirteen raster illustrations,
two markdown diagram sources, and three remote Mermaid figures were carried by
the older README. None of them survive here.

The second group is the interim 2026 attempt. Six generated SVG and PNG
diagram families, ten interactive screenshots, one animated GIF, six JSON
diagram sources, and the interactive `BlueprintCanvas.tsx` were reviewed and
rejected for looking generated. All of them are retired.

The replacement is a single design language: five architect-style plates. Each
plate is a React component whose source lives under `site/src/plates/`. The
same source is rendered server-side by `scripts/render_plates.mjs` into
`docs/images/plate-0N.svg` (light) and `docs/images/plate-0N-dark.svg` (dark),
then rasterized to matching PNGs through the already-installed Playwright
Chromium. A SHA-256 manifest at `docs/images/render-manifest.json` makes
regressions loud.

## Group A: original 2023 blueprint

| Id | Legacy artifact | Kind | Resolution |
| -- | --------------- | ---- | ---------- |
| A1 | `visualizations/homelab_blueprint.jpg` | Painterly cover illustration | Retired. Replaced by Plate 01, the question sheet. |
| A2 | `visualizations/homelab_blueprint_realistic.jpg` | Painterly cover illustration | Retired. Duplicate purpose of A1. Same replacement. |
| A3 | `visualizations/homelab_expansion.jpeg` | Painterly montage | Retired. Covered by prose in `docs/11-grow-share.md`. |
| A4 | `visualizations/homelab_install.jpeg` | Painterly install scene | Retired. Replaced by Plate 02, the one useful host elevation. |
| A5 | `visualizations/homelab_install_configure_services_apps.png` | Product mind-map raster | Retired. Product catalogs contradict the decision-first thesis. See `docs/07-services.md`. |
| A6 | `visualizations/homelab_install_configure_services_appsSML.png` | Product mind-map raster | Retired. Same as A5. |
| A7 | `visualizations/homelab_install_configure_services_apps.md` | Markdown outline | Retired. Same as A5. |
| A8 | `visualizations/homelab_install_configure_services_appsSML.md` | Markdown outline | Retired. Same as A5. |
| A9 | `visualizations/homelab_learning.jpeg` | Painterly learning montage | Retired. The roadmap table is now the learning path. |
| A10 | `visualizations/homelab_networking.jpeg` | Painterly networking scene | Retired. Replaced by Plate 03, the trust boundaries plan. |
| A11 | `visualizations/homelab_plan_matrix.jpg` | Rasterized table | Retired. Table lives as markdown in `docs/01-plan.md`. The visual moves to Plate 01. |
| A12 | `visualizations/homelab_share_experience.jpeg` | Painterly sharing scene | Retired. `docs/11-grow-share.md` covers this in prose. |
| A13 | `visualizations/homelab_software_install.jpeg` | Painterly install scene | Retired. Not carried in the current README. |
| A14 | `visualizations/skill_assessment_radar_chart.jpeg` | Radar chart | Retired. A radar chart is not an honest skill check. The roadmap gates are the honest check. |
| A15 | `visualizations/hardware_selection.png` | PlantUML block diagram | Retired. `docs/02-hardware.md` explains hardware selection in a table. |
| A16 | Remote Mermaid figure 1 in README@b8e1e34 (Homelab Goals and Purposes) | Third-party hosted image | Retired. Replaced by Plate 01. `mermaid.ink` links removed to avoid a third-party dependency for public prose. |
| A17 | Remote Mermaid figure 2 in README@b8e1e34 (Homelab Security Best Practices) | Third-party hosted image | Retired. Replaced by Plate 03. |
| A18 | Remote Mermaid figure 3 in README@b8e1e34 (Monitoring Diagram) | Third-party hosted image | Retired. `docs/08-operations.md` covers monitoring in prose. |

The `visualizations/` tree is not committed to this repository; the entries
above are historical, kept here so anyone who follows a link from the old
README can find the replacement.

## Group B: interim 2026 attempt

Every artifact below was in this repository before the rebuild. It has been
removed on the same commit that lands the plates.

| Id | Retired artifact | Kind | Replacement |
| -- | ---------------- | ---- | ----------- |
| B1 | `docs/images/choose-your-path.svg` and `-dark.svg`, plus PNGs | Generated four-column diagram | Plate 01. |
| B2 | `docs/images/maturity-tiers.svg` and `-dark.svg`, plus PNGs | Generated tier stack | Plate 01, destination stack. |
| B3 | `docs/images/trust-boundaries.svg` and `-dark.svg`, plus PNGs | Generated bubble diagram | Plate 03. |
| B4 | `docs/images/recovery-flow.svg` and `-dark.svg`, plus PNGs | Generated four-column diagram | Plate 04. |
| B5 | `docs/images/automation-loop.svg` and `-dark.svg`, plus PNGs | Generated flow diagram | Plate 05. |
| B6 | `docs/images/agentic-safety.svg` and `-dark.svg`, plus PNGs | Generated flow diagram | Plate 05. |
| B7 | `docs/images/experience/compass-light.png` and `-dark.png` | Screenshot of BlueprintCanvas scene 01 | Plate 01. Screenshot capture is no longer part of the build. |
| B8 | `docs/images/experience/first-host-light.png` and `-dark.png` | Screenshot of scene 02 | Plate 02. |
| B9 | `docs/images/experience/architecture-light.png` and `-dark.png` | Screenshot of scene 03 | Plate 03. |
| B10 | `docs/images/experience/recovery-light.png` and `-dark.png` | Screenshot of scene 04 | Plate 04. |
| B11 | `docs/images/experience/agentic-loop-light.png` and `-dark.png` | Screenshot of scene 05 | Plate 05. |
| B12 | `docs/images/experience/living-blueprint-tour.gif` | Autoplay tour recording | Retired. Motion belongs to the interactive site, not to a recording. |
| B13 | `docs/images/render-manifest.json` (old shape) | Manifest for the retired diagrams | Regenerated with plate hashes by `scripts/render_plates.mjs`. |
| B14 | `diagrams/agentic-safety.json` | JSON source for B6 | Retired. Same information now expressed as a typed model in `site/src/plates/models.ts` and `Plate05Loop.tsx`. |
| B15 | `diagrams/automation-loop.json` | JSON source for B5 | Retired. Covered by Plate 05. |
| B16 | `diagrams/choose-your-path.json` | JSON source for B1 | Retired. Covered by Plate 01. |
| B17 | `diagrams/maturity-tiers.json` | JSON source for B2 | Retired. Covered by Plate 01. |
| B18 | `diagrams/recovery-flow.json` | JSON source for B4 | Retired. Covered by Plate 04. |
| B19 | `diagrams/trust-boundaries.json` | JSON source for B3 | Retired. Covered by Plate 03. |
| B20 | `scripts/render_diagrams.py` | Python renderer for B1 to B6 | Retired. `scripts/render_plates.mjs` reads the same TypeScript source as the site. |
| B21 | `scripts/capture_experience.mjs` | Playwright screenshot recorder for B7 to B12 | Retired. Static plates from the same source remove the need to screenshot the live site. |
| B22 | `site/src/BlueprintCanvas.tsx` | Panoramic five-scene SVG canvas | Retired. Replaced by `PlateStage.tsx` plus five focused plate components. |
| B23 | `tests/test_diagrams.py` | Python tests for the retired diagram renderer | Retired. Deterministic plate rendering is covered by `scripts/render_plates.mjs --check`. |
| B24 | `tests/e2e/experience.spec.ts` | Playwright test for the canvas experience | Retired. Replaced by `tests/e2e/plates.spec.ts`. |

## Invariants the ledger enforces

- No new visual bypasses this ledger. Adding a plate or a static image is a
  change to `site/src/plates/models.ts` or `Plate0N.tsx`, then a run of
  `npm run render:plates`.
- No plate ever contains a real hostname, IP address, personal name, external
  service brand, port range that ties to real infrastructure, or a value that
  would only be true of a specific homelab. Where a concrete record teaches
  the shape of evidence, the whole element is marked `EXAMPLE RECORD,
  SYNTHETIC` and uses placeholders or RFC documentation ranges only.
- Every plate source produces byte-identical output whether rendered by the
  interactive site or the deterministic build. `scripts/render_plates.mjs
  --check` guards this on every pull request.
