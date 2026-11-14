# AETHON Phase 1 — independent UI and NASA-data quality check

**Review date:** 14 November 2026  
**Decision:** The real CTX imagery works as a regional image/provenance view. Cross-source spatial registration remains unresolved, so no external AOI, HiRISE, or waypoint markers are drawn. This is **not** sufficient for a walking-scale traverse, slope, obstacle, or safety planner. **Phase 2 has not started.**

## What I changed

- Replaced the crowded dashboard with a map-first, responsive field atlas: the raster is the focus; source inventory and limitations are grouped separately.
- Removed the unsupported hand-drawn MOLA “0 m” contour and assumed HiRISE rectangle/rotation. The MOLA asset is now a non-georeferenced thumbnail only; HiRISE is metadata-only, with no footprint drawn.
- Removed unsupported elevation range/datum presentation and operational metric clutter. Routes, slopes, local pressure, radiation, and vehicle reserves remain unavailable/omitted—no substitute numbers are made.
- The map no longer plots external AOI/HiRISE/MSL coordinates. The AOI and NASA Curiosity Sol 4452 waypoint are shown as coordinate references only, held off-map until the source coordinate references are reconciled.
- Added service-grid cursor coordinates, a responsive map frame, source links, and visible data/resolution and CRS caveats.

## Independent data checks performed

1. Re-read the current Drive viewer and layer registry rather than relying on the supplied completion report. The previous HTML directly drew the purported MOLA contour as a Bezier curve and displayed a manually sized/rotated HiRISE swath. Neither was generated from a numeric DEM or loaded footprint asset.
2. Confirmed the NASA Mars Trek CTX WMTS capabilities advertises the tile resource URL used by the CTX MapServer. The live MapServer metadata reports a Mars geographic spatial reference (WKID 104971).
3. Independently fetched 30 level-12 CTX tiles around the project’s numeric coordinate range. All 30 returned HTTP 200 as PNG, decoded as 512 × 512 grayscale images, and have byte counts and SHA-256 digests in `ctx_tile_manifest.json`. This verifies retrieval and decoding—not confirmed AOI coverage.
4. Built an image crop at **2,330 × 2,097 px** from the service tile grid, whose numeric bounds are **137.22–137.42°E, 4.93–4.75°S**. Tile-matrix spacing near the target latitude is approximately **5.08 m/pixel**. Visually inspected the decoded raster; tile/mosaic seams are visible in places. Because of the unresolved CRS mismatch, these bounds have not been verified against external mission coordinates.
5. Independently fetched and decoded the reported MOLA level-5 JPEG (HTTP 200; 256 × 256 RGB). It is a rendered shaded-relief image, not numeric elevation data. Its color pixels cannot support an elevation contour or slope extraction.
6. Independently ran the local quality tests: **15 passed**. Served the viewer and key assets over HTTP: the HTML, CTX regional crop, CTX study box crop, MOLA image, slide deck, and retrieval manifest all returned HTTP 200.

## Geospatial and feasibility caveats

- **New registration blocker found:** NASA Mars Trek WMTS capabilities advertise ESRI:104905 (Mars 2000 ellipsoid), but the linked ArcGIS REST MapServer metadata reports WKID 104971 (Mars 2000 sphere). Those references are not interchangeable by assumption. At Gale latitude (-4.843°), the mathematical divergence between planetographic and planetocentric latitude is 0.05658° (~3,353.7 m North-South theoretical ground displacement). This ~3.35 km figure represents the theoretical ambiguity between the two declared coordinate systems; it is not an empirical measurement of raster shift. Because the Murray Lab Beta01 mosaic is uncontrolled (SPICE pointing only) and its internal tile-matrix projection semantics are unconfirmed against ground control, external vector overlays are deliberately withheld rather than assuming either datum.
- ~5.08 m/pixel is the tile grid spacing at the target latitude, not a guarantee of uniform native image resolution or absolute positional accuracy. The displayed mosaic is grayscale imagery, not a DEM.
- Current MOLA is much coarser and rendered. It can add broad regional context, but it cannot resolve walking-scale slopes. Neither MOLA nor CTX here supports route safety.
- HiRISE PSP_001752_1750 remains a source-page/PDS metadata reference only: the map-projected image and a verified georeferenced footprint were not loaded. Mastcam PIA26559 remains unplaced ground-context metadata; the waypoint is not used to locate the panorama.
- A useful next data gate—before any traverse analysis—is an appropriate numeric, registered elevation product plus validation of its coverage, vertical datum, resolution, and alignment against source products. Do not invent a route or hazard score in the meantime.

## Files

- `index.html` — revised local field-atlas UI with regional/AOI crop switcher, 4-step judge walkthrough, and slide deck link.
- `slides.html` — standalone browser-based 7-slide official presentation.
- `AETHON_7Slide_Presentation.pptx` — official widescreen 16:9 presentation deck (7 slides).
- `gale_ctx_extended_z12.png` — displayed CTX tile-matrix regional crop (2,330 × 2,097 px).
- `gale_ctx_aoi_z12.png` — displayed CTX tile-matrix study box crop (1,398 × 1,398 px).
- `gale_mola_tile_level5.jpg` — MOLA context thumbnail only.
- `phase1_layers.json` — corrected layer/availability registry; replaces unsupported footprint/contour claims.
- `phase1_verified_sample.json` — updated verification sample with current CTX zoom/coverage and explicit unavailable fields.
- `phase1_site_brief.md` — updated data/feasibility brief.
- `ctx_tile_manifest.json` — individual tile retrieval, decode, dimensions, bounds, and checksum evidence.
- `build_real_data.py` — reproducible CTX fetch/mosaic script.
- `README.md` — project quick start, browser requirements, data inventory, QA commands, and Drive permission notice.
- `METHODOLOGY_AND_MANIFEST.md` — formal classification of observed, derived, metadata, and unavailable data.
- `SUBMISSION_NARRATIVE.md` — official Space Apps submission page content, 7-slide storyboard, and 30-second script.
- `test_phase1_quality.py` — isolated NASA-only/asset/UI integrity tests (15 tests).
- `test_phase1_data.py` — companion NASA-only data integrity tests (15 tests).