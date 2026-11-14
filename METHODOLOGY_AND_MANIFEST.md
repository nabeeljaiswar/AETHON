# AETHON Phase 1 — Data Manifest & Methodology Note

**Project:** AETHON (NASA Space Apps Challenge 2026)  
**Study Site:** Boxwork Structure Study Area, Lower Mount Sharp / Gale Crater, Mars  
**Geographic Target:** 4.843°S, 137.298°E (Planetographic Latitude, East-Positive Longitude)  
**Review Date:** 14 November 2026

---

## 1. Classification of Project Data

To ensure rigorous transparency and avoid misrepresenting orbital visualizations as ground truth or terrain models, all data items in AETHON Phase 1 are strictly categorized into four classes:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. OBSERVED DATA                                                            │
│    Direct physical measurements or optical sensor acquisitions from NASA    │
│    spacecraft, fetched from authoritative repositories without modification. │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. DERIVED DATA                                                             │
│    Deterministic mathematical calculations derived from verified NASA       │
│    inputs using documented physical and geometric constants.                │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. METADATA-ONLY REFERENCES                                                 │
│    Authoritative mission catalog entries, observation identifiers, and      │
│    telemetry records that provide scientific context but are unplaced on    │
│    the 2D raster canvas pending geodetic co-registration.                   │
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. UNAVAILABLE OR OMITTED ITEMS                                             │
│    Operational metrics, pathfinding routes, or safety scores that cannot be │
│    defensibly computed from Phase 1 inputs and are explicitly withheld.     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Itemized Manifest

### Class 1: Observed Data

| Item Name | Mission / Instrument | Processing Level & Provider | File Path / Identifier | Verification Method |
|---|---|---|---|---|
| **MRO CTX Level-12 Tile Matrix (30 tiles)** | NASA Mars Reconnaissance Orbiter (MRO) / Context Camera (CTX) | Uncontrolled global mosaic (MSSS raw data, assembled by Bruce Murray Laboratory, Caltech; served via Esri OnMars MapServer) | `data/ctx_z12_{row}_{col}.png` (rows 2154–2159, cols 7218–7222) | HTTP 200, PNG 512×512, mode `L`, unique SHA-256 digests in `ctx_tile_manifest.json`. |
| **Regional CTX Mosaic Crop** | NASA MRO CTX | Equirectangular service mosaic crop | `gale_ctx_extended_z12.png` | 2,330 × 2,097 px, non-zero pixel standard deviation, ~5.08 m/px spacing. |
| **Study Box CTX Crop** | NASA MRO CTX | Equirectangular service mosaic crop ($0.12^\circ \times 0.12^\circ$) | `gale_ctx_aoi_z12.png` | 1,398 × 1,398 px, exact subset of service tile matrix. |
| **MGS MOLA Global Shaded Relief Tile** | NASA Mars Global Surveyor (MGS) / Mars Orbiter Laser Altimeter (MOLA) | Level-5 WMTS rendered shaded-relief visualization (USGS Astrogeology / NASA Mars Trek) | `gale_mola_tile_level5.jpg` (zoom 5, row 16, col 56) | HTTP 200, JPEG 256×256, 8-bit RGB color. Classified as **visual reference only; not a numeric DEM**. |

### Class 2: Derived Data

| Item Name | Derivation Method | Formula & Assumptions | Output Value | Cartographic Caveats |
|---|---|---|---|---|
| **AOI North–South Span** | Arc length along meridian | $\Delta \phi \times \frac{\pi}{180} \times R_{\text{vol}}$, where $\Delta \phi = 0.12^\circ$, $R_{\text{vol}} = 3,389.5\text{ km}$ | **7.099 km (~7.10 km)** | Assumes IAU mean volumetric sphere. Using equatorial sphere ($R=3396.19\text{ km}$) yields 7.113 km. |
| **AOI East–West Span** | Parallel arc length at target center latitude | $\Delta \lambda \times \frac{\pi}{180} \times R_{\text{vol}} \times \cos(-4.843^\circ)$, where $\Delta \lambda = 0.12^\circ$ | **7.074 km (~7.07 km)** | Valid for local equirectangular approximation at $-4.843^\circ$ latitude. |
| **AOI Projected Surface Area** | Planar rectangle product | $7.099\text{ km} \times 7.074\text{ km}$ | **50.215 km² (~50.2 km²)** | Valid for coordinate box; does not account for topographic surface relief. |
| **Curiosity Sol 4452 Ground Distance** | Great-circle Haversine & planar ENU offset | Haversine formula on $R_{\text{vol}} = 3,389.5\text{ km}$ between $(-4.843^\circ, 137.298^\circ)$ and $(-4.7872^\circ, 137.3926^\circ)$ | **6.481 km (~6.48 km)** at Azimuth **59.4° (NE)** | Planar offset: $\Delta X = +5.578\text{ km}$ (East), $\Delta Y = +3.299\text{ km}$ (North). Waypoint lies outside AOI. |
| **Tile-Matrix Pixel Scale** | Circumferential grid spacing | $\frac{360^\circ}{8192 \times 512} \times \frac{\pi}{180} \times 3,389.5\text{ km} \times 1000$ | **5.078 m/pixel (~5.08 m/px)** | Represents tile matrix sampling rate; not uniform native optical MTF resolution or absolute point accuracy. |
| **Geodetic CRS Displacement** | Oblate ellipsoid vs. sphere latitudinal divergence | $\Delta \phi = |\phi_g - \arctan((b/a)^2 \tan \phi_g)|$ at $\phi_g = -4.843^\circ$, with $a=3396190\text{ m}, b=3376200\text{ m}$ | **0.056578° = 3,353.7 m (~3.35 km)** | Discrepancy between advertised `ESRI:104905` and declared `WKID 104971`. Proves why vector overlays must be withheld. |

### Class 3: Metadata-Only References (Unplaced Context Cards)

| Reference Name | NASA Source Record | Stated Coordinates / Bounds | Role in Product | Why Kept Off-Map |
|---|---|---|---|---|
| **HiRISE Observation PSP_001752_1750** | University of Arizona / NASA PDS observation catalog (`uahirise.org/PSP_001752_1750`) | Center: -4.843°S, 137.298°E. Swath width: 1.2 km (color) / ~5.0 km (RED). Length: ~15 km. | Source context card | Primary map-projected RDR image was not downloaded; verified georeferenced footprint was not loaded into the viewer. |
| **MSL Curiosity Sol 4452 End-of-Drive Waypoint** | NASA MSL MMGIS official waypoint repository (`MSL_waypoints.json`) | Latitude: -4.7872261°S, Longitude: 137.3926205°E | Telemetry context card | Rover ground coordinates cannot be co-registered to the uncontrolled CTX mosaic without geodetic reconciliation and ground control. |
| **Curiosity Mastcam Panorama PIA26559** | NASA JPL-Caltech / MSSS Photojournal (`photojournal.jpl.nasa.gov/catalog/PIA26559`) | Acquired Sol 4452 at Gediz Vallis boxwork ridges | Science target context card | In-situ ground panorama; not geolocated or projected onto the orbital view. |

### Class 4: Unavailable or Omitted Items

| Field / Feature | Phase 1 Treatment | Technical Rationale & Prerequisite for Reintroduction |
|---|---|---|
| **Walking-Scale Slopes (degrees / %)** | **Unavailable** | The CTX product is 2D panchromatic optical surface imagery; MOLA is an 8-bit rendered JPEG thumbnail. Extracting slopes from optical brightness or shaded relief is scientifically invalid. Requires a registered floating-point 32-bit DTM with vertical elevation in meters relative to the MOLA areoid. |
| **Traverse Routes & Cost Surfaces** | **Omitted** | Without valid slope, obstacle, and geomechanical trafficability layers, pathfinding algorithms (e.g., A*, Dijkstra) produce meaningless or hazardous lines on the map. Omitted to prevent false sense of navigational safety. |
| **Local Atmospheric Pressure** | **Unavailable** | The MOLA 0m areoid is a geodetic reference surface, not a constant 610.5 Pa isobar. Surface pressure at Gale Crater swings diurnally and seasonally by >25% (~700–950 Pa). Inferring pressure without calibrated MSL REMS/MEDA sensor data is unsupported. |
| **Radiation Dose Rates** | **Unavailable** | Requires calibrated, time-averaged MSL RAD telemetry (e.g., Hassler et al., 2014: 0.21 ± 0.04 mGy/day absorbed, 0.64 ± 0.12 mSv/day equivalent). Omitted from user-facing real-time dials. |
| **Suit Life-Support Reserves & Event Simulation** | **Unavailable** | EVA consumables (oxygen, battery, sublimator cooling water) depend on metabolic work rate and ECLSS architecture. Synthetic event simulation buttons and mock telemetry are completely purged. |
