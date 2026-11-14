# Phase 1 Site and Data Brief — Gale Crater

**Project:** AETHON — NASA-data-only regional field atlas  
**Site:** Project-defined study area near lower Mount Sharp, Gale Crater  
**Review date:** 14 November 2026  
**Status:** CTX regional image retrieval verified; cross-source coordinate registration pending; not a traverse-planning baseline

## Product in this phase

AETHON Phase 1 is a map-first viewer of real NASA MRO Context Camera imagery with explicit provenance and coordinate context. It lists project AOI bounds and a NASA MSL Curiosity Sol 4452 waypoint as coordinate references, but does not plot external coordinates onto the CTX image pending a CRS check. The UI does not make route, hazard, slope, elevation, pressure, radiation, or life-support predictions. Unsupported measurements remain unavailable/omitted. No drawn MOLA contour or assumed HiRISE footprint is retained.

## Study area

The selected AOI is a **project-defined rectangle**, not a measured landform boundary: 4.90°–4.78°S and 137.24°–137.36°E. Its reference coordinate is 4.843°S, 137.298°E. Approximate dimensions are 7.10 km north–south and 7.07 km east–west (about 50.2 km², using Mars mean radius 3,389.5 km). These values describe the chosen coordinate box only; they do not characterize local relief or terrain.

## Data findings

### MRO Context Camera (CTX)

- **Role:** Displayed grayscale orbital image mosaic and regional surface context.
- **Service:** NASA Mars Trek WMTS advertises the tile URL at the Caltech/Bruce Murray Laboratory OnMars CTX MapServer. Mars Trek WMTS advertises ESRI:104905 (Mars 2000 ellipsoid), while linked ArcGIS REST MapServer metadata reports WKID 104971 (Mars 2000 sphere). This mismatch is unresolved; external coordinate overlays are withheld. See the [Mars Trek WMTS capabilities](https://trek.nasa.gov/tiles/Mars/EQ/CTX_beta01_uncontrolled_5m_Caltech/1.0.0/WMTSCapabilities.xml) and linked [ArcGIS service metadata](https://astro.arcgis.com/arcgis/rest/services/OnMars/CTX/MapServer?f=pjson).
- **Independent retrieval:** 30 level-12 PNG tiles covering an extended view were independently fetched. Every tile returned HTTP 200 and decoded as a 512 × 512 image. Individual rows, columns, byte counts, and SHA-256 hashes are recorded in `ctx_tile_manifest.json`.
- **Displayed asset:** `gale_ctx_extended_z12.png`, 2,330 × 2,097 px, with bounds 137.22–137.42°E and 4.93–4.75°S. Tile-matrix pixel spacing at Gale is approximately 5.08 m/pixel.
- **Caveat:** Crop extent is reconstructed from the service tile matrix, but its CRS mismatch against the NASA WMTS declaration is unresolved and no cross-source annotations are drawn. The image has not been independently validated against ground-control points. Pixel spacing is not an assertion of uniform source-image resolution or positional accuracy. CTX is an image, not a numeric DEM; mosaic seams may show.

### MGS MOLA shaded relief

A 256 × 256 level-5 JPEG (`gale_mola_tile_level5.jpg`) was fetched and decoded. It is a rendered shaded-relief visualization, not numeric elevation samples. The viewer shows it as a separate thumbnail only; it is not aligned as a map overlay, and no elevation range, contour, or slope is derived from it. Its coarseness makes it unsuitable for walking-scale terrain assessment.

### HiRISE PSP_001752_1750

The observation record and PDS directory are metadata references only in this build. The map-projected image was not downloaded, and a verified georeferenced footprint was not loaded. Therefore the viewer asserts no HiRISE image coverage of the AOI and draws no swath polygon. Source: [HiRISE observation page](https://www.uahirise.org/PSP_001752_1750).

### Curiosity waypoint and Mastcam reference

The Sol 4452 waypoint coordinate is from NASA's [MSL waypoint GeoJSON](https://mars.nasa.gov/mmgis-maps/MSL/Layers/json/MSL_waypoints.json): approximately 4.7872261°S, 137.3926205°E. It is retained as a coordinate reference only and is not plotted on the raster; no cross-CRS spatial relationship to the AOI is asserted. Mastcam panorama PIA26559 remains metadata-only and unplaced; it is not registered to the orbital map.

## Feasibility decision

**Feasible now:** a regional imagery, coordinate-context, and data-provenance demonstration.  
**Not feasible from these current layers:** a walking-scale traverse planner, slope/obstacle assessment, or safety scoring. The rendered MOLA tile is not a DEM; the displayed CTX product is imagery only. Before any terrain analysis, obtain an appropriate numeric elevation product and validate its coverage, resolution, vertical reference, and registration against source products. Until that gate is met, do not generate routes or hazard values.

| Field | Phase 1 treatment |
|---|---|
| Walking-scale slopes | Unavailable — no verified numeric DTM |
| Traverse routes or hazard scores | Omitted — no terrain analysis/pathfinding |
| Local pressure | Unavailable — no local measurement included |
| Radiation dose rate | Unavailable — no calibrated RAD telemetry included |
| Life-support reserves | Unavailable — no vehicle telemetry included |

## Audit artifacts

- `index.html` — revised map-first viewer with crop switcher, 4-step judge walkthrough, and slide deck link
- `slides.html` — standalone, browser-based 7-slide official presentation
- `AETHON_7Slide_Presentation.pptx` — official widescreen 16:9 presentation deck (7 slides)
- `gale_ctx_extended_z12.png` — displayed CTX regional mosaic crop (2,330 × 2,097 px)
- `gale_ctx_aoi_z12.png` — displayed CTX study box crop (1,398 × 1,398 px)
- `phase1_layers.json` — corrected layer and availability registry
- `ctx_tile_manifest.json` — tile-level fetch and checksum evidence
- `phase1_quality_report.md` — independent UI/data check and limitations
- `README.md` — setup, browser requirements, provenance documentation, and Drive sharing note
- `METHODOLOGY_AND_MANIFEST.md` — classification of observed, derived, metadata, and unavailable data
- `SUBMISSION_NARRATIVE.md` — official Space Apps submission page content, 7-slide storyboard, and 30-second script
- `test_phase1_quality.py` — fifteen Phase 1 integrity tests
- `test_phase1_data.py` — companion fifteen Phase 1 integrity tests
- `build_real_data.py` — CTX tile downloader and mosaic builder