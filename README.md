# AETHON — Gediz Vallis Boxwork Science Traverse Planner & Horizon Predictor (Prototype)
**Lower Mount Sharp (Aeolis Mons), Gale Crater, Mars**  
**NASA International Space Apps Challenge 2026**  
**Challenge Track:** Interplanetary Survival Guide: Martian Map  

> *"AETHON brings NASA terrain and mission observations together to help future explorers investigate boxwork at Gediz Vallis and evaluate candidate field traverses. Its route and visibility outputs are research and planning aids with explicit mathematical assumptions — not validated human-EVA operational or safety advice."*

---

## 1. Quick Start

Run Python's built-in HTTP server from the project directory:

```bash
cd /home/user/aethon
python3 -m http.server 8000
```

Open your browser to:
- **Interactive Field Map & Candidate Traverse Planner:** `http://localhost:8000/index.html`
- **Official 7-Slide Pitch Deck:** `http://localhost:8000/slides.html`

*Offline & Standalone Delivery:* Zero build steps, zero npm packages, zero external CDNs required.

---

## 2. Integrated NASA Multi-Mission Data Inventory

Every layer in AETHON carries an explicit data classification: `[OBSERVED]`, `[DERIVED]`, `[MODELLED]`, `[SCENARIO INPUT]`, or `[UNAVAILABLE]`.

| Mission & Instrument | Product / Dataset ID | Native Resolution | Coordinate Reference Frame | Classification | Role in AETHON | Source Archive URL |
|---|---|---|---|---|---|---|
| **MRO HiRISE Stereo DTM** | `PSP_009149_1750 / PSP_009294_1750` (`DTEEC_009149_1750_009294_1750_U01`) | **1.0116 m / px** | Equirectangular Mars ($R=3,396,190\text{ m}$, CM $137.41^\circ\text{E}$) | `[DERIVED DTM]` | Real stereo elevation in meters ($-3,860.7\text{ m}$ to $-3,436.5\text{ m}$; $424.2\text{ m}$ vertical relief); source of truth for slope calculation, routing, and horizon profiling. | [NASA PDS / UArizona HiRISE](https://www.uahirise.org/dtm/dtm.php?ID=PSP_009149_1750) |
| **MRO HiRISE Derived Slope** | Analytical Central Differences Grid | **1.0116 m / px** | Aligned 1:1 with DTM | `[DERIVED GRADIENT]` | Numerical slope gradient grid classified neutrally: Gentle traverse ($<10^\circ$), Moderate grade ($10–15^\circ$), Steep approach ($15–20^\circ$), Impassable scarp ($\ge 20^\circ$). | Derived via central finite differences: $\theta = \arctan(\sqrt{g_x^2 + g_y^2})$ |
| **MRO Context Camera (CTX)** | Gale Regional Mosaic (`CTX_beta01`) | **5.08 m / px** | Equirectangular Mars | `[OBSERVED MOSAIC]` | Grayscale optical surface context basemap showing channel bed geomorphology and boulder fields. Aligned for visual basemap context; not orbital geodetic ground control. | [Caltech Bruce Murray Lab / NASA PDS](https://astro.arcgis.com/arcgis/rest/services/OnMars/CTX/MapServer) |
| **MSL Curiosity Rover Telemetry** | NASA MMGIS Sols 3958–4573 | In-Situ Telemetry | Planetocentric Mars | `[OBSERVED TELEMETRY]` | 99 tracked in-situ rover positions validating actual rover surface mobility along Gediz Vallis channel margin; explicitly not orbital DTM geodetic ground control. | [NASA JPL MMGIS](https://mars.nasa.gov/mmgis-maps/MSL/Layers/json/MSL_waypoints.json) |
| **MSL Curiosity Mastcam** | `PIA26559` (Sol 4452) & Sols 4460, 4480 | In-Situ Panoramic Imaging | Local Rover Frame | `[OBSERVED IMAGING]` | In-situ 360° Mastcam panoramas providing ground-truth verification of polygonal boxwork ridge contacts and debris fields. | [NASA JPL Photojournal](https://photojournal.jpl.nasa.gov/catalog/PIA26559) |
| **MRO CRISM Orbital Spectroscopy** | Targeted Cubes `FRT0000B6F1` & `HRL0000BABA` | **18 to 36 m / px** | Orbital Footprint | `[OBSERVED ORBITAL CONTEXT]` | Regional spectral unit context for lower Mount Sharp sulfate unit (1.9 µm, 2.1 µm, 2.4 µm bands); regional unit context only, not discrete 1m point targets or accessible water deposits. | [NASA PDS Geosciences Node](https://pds-geosciences.wustl.edu) |
| **MSL Curiosity REMS** | Sols 4452 & 4460 DDR Records | In-Situ Point Sensor | Rover Location (~150-280m from site) | `[HISTORICAL POINT DATA]` | Gale Crater diurnal ambient pressure ($815–820\text{ Pa}$) and ground temperature range ($-69^\circ\text{C}$ to $+3^\circ\text{C}$). Historical point measurements, not predictive local weather forecasts. | [NASA PDS Atmospheres Node](https://pds-atmospheres.nmsu.edu/) |
| **MSL Curiosity RAD** | `MSL-M-RAD-3-RDR-V1.0` (PDS PPI Node) | In-Situ Particle Detector | Gale Crater Floor | `[HISTORICAL BASELINE & BENCHMARK]` | GCR surface dose equivalent rate: $0.64 \pm 0.12\text{ mSv/day}$ ($210\text{ }\mu\text{Gy/day}$) (Hassler et al. 2014, Zeitlin et al. 2019). Includes Murray Buttes Butte M12 natural shielding benchmark: $19\%$ sky blocked produced $4.0\% \pm 1.2\%$ dose reduction and $7.5\%$ neutral-particle reduction (Ehresmann et al. 2021). | [NASA PDS PPI Node](https://pds-ppi.igpp.ucla.edu/) |
| **MSL Curiosity DAN** | `MSL-M-DAN-4-RDR-V1.0` (PDS Geosciences) | Active Pulsed Neutron (~14 MeV) | ~40m Rover Traverse Corridor (<1m depth) | `[OBSERVED TRAVERSE]` | $1.5–3.0\text{ wt}\%$ Water-Equivalent Hydrogen (WEH) bound in sulfate mineral lattices and amorphous phases along actual rover wheel tracks. | [NASA PDS Geosciences Node](https://pds-geosciences.wustl.edu/) |
| **2001 Mars Odyssey GRS/HEND** | Epithermal Neutron Leakage Flux | Regional Footprint (~300 km FWHM) | Regional Gale Stratigraphy | `[REGIONAL PROXY]` | $<2–4\text{ wt}\%$ regional Water-Equivalent Hydrogen. Broad regional orbital proxy; cannot resolve 1 km local terrain features or discrete surface deposits. | [NASA PDS Geosciences Node](https://pds-geosciences.wustl.edu/) |
| **Water & Ice Assessment** | Multi-instrument synthesis (CRISM, CheMin, GRS, DAN) | Regional / Site | Gale Crater (-4.79°S) | `[DERIVED ASSESSMENT]` | Hydrated sulfates hold chemically bound $OH/H_2O$ in crystal lattice. Ground ice is thermodynamically unstable at equatorial latitude (-4.8°S). No accessible water or ice at this site. | [JGR Planets / ScienceDirect] |
| **Electrostatic Discharges** | Perseverance SuperCam / Gale Payload | Acoustic & EM Detection | Jezero (Observed) / Gale (Unmeasured) | `[JEZERO OBSERVED / GALE UNMEASURED]` | Exact Status: *"Discharges observed at Jezero; no validated local Gale risk estimate in this release."* Triboelectric discharges confirmed at Jezero Crater (55 events across 28h audio; Chide et al. 2025, Nature). Curiosity carries no field mill or microphone. Continuous electrostatic hazard maps are strictly excluded; observed event records are presented with explicit provenance. | [Nature 2025](https://www.nature.com/articles/s41586-025-09736-y) |
| **Deliquescence Compatibility** | MSL Curiosity REMS DDR (Sols 4452 & 4460) | In-Situ Temp & Humidity | Gale Crater Rover Corridor | `[CONDITIONS COMPATIBILITY MODEL]` | Labeled *"conditions potentially compatible with deliquescence"*. Evaluates REMS diurnal cycles against calcium perchlorate eutectic thresholds ($T_e = 198.15\text{ K}, RH_e = 52\%$) using Harri et al. (2014) and Rivera-Valentín et al. (2018, 2020) calibration with respect to liquid water. Relative humidity uncertainty is $\pm 2\%\text{ to }\pm 5\%$ (day) and $\pm 10\%\text{ to }\pm 15\%$ (night). Deliquescence does not establish regolith shear strength; speculative slurry traction penalty maps are excluded. | [NASA PDS Atmospheres Node](https://pds-atmospheres.nmsu.edu/) |

---

## 3. Mathematical Methodology & Planning Models

### A. Topographic Elevation & Slope Extraction
- Ingests a 1,500 × 1,500 pixel floating-point GeoTIFF (`hirise_dtm_gale.tif`) covering a 1.517 km × 1.517 km footprint centered on the Gediz Vallis boxwork ridges (-4.7888°S, 137.3926°E).
- True elevation range: $-3,860.67\text{ m}$ to $-3,436.50\text{ m}$ ($424.17\text{ m}$ vertical relief).
- Analytical slopes are computed using central finite differences on valid elevation raster cells:
  $$\frac{\partial z}{\partial x} = \frac{z_{i+1,j} - z_{i-1,j}}{2 \Delta x}, \quad \frac{\partial z}{\partial y} = \frac{z_{i,j+1} - z_{i,j-1}}{2 \Delta y}, \quad \theta = \arctan\left(\sqrt{\left(\frac{\partial z}{\partial x}\right)^2 + \left(\frac{\partial z}{\partial y}\right)^2}\right)$$
  where $\Delta x = \Delta y = 1.0116\text{ m}$.

### B. Terrain-Aware Candidate Traverse Engine (A\* Graph Search)
- Implemented with a strictly admissible Euclidean distance heuristic:
  $$h(r, c) = \sqrt{(r_g - r)^2 + (c_g - c)^2} \cdot \Delta x \cdot 1.0$$
  guaranteeing optimal pathfinding without overestimating remaining cost.
- Cost function:
  $$J(P) = \sum_{i=1}^N d_i \cdot \left[ 1.0 + \lambda \cdot \left(\frac{\max(\theta_{\text{start}}, \theta_{\text{end}})}{\theta_0}\right)^p \right]$$
  where $\lambda = 1.0$ (penalty scale), $\theta_0 = 10.0^\circ$ (reference slope), $p = 2.0$ (quadratic penalty exponent), and $d_i$ is ground distance in meters ($\Delta x$ for orthogonal steps, $\sqrt{2} \Delta x$ for diagonal steps).
- **Scenario Assumption (Not a Mobility Guarantee):** The maximum slope cutoff is an editable scenario setting (default $20.0^\circ$, adjustable from $12^\circ$ to $25^\circ$). Nodata cells ($z \le -9990.0$ or NaN) and slopes exceeding the cutoff are impassable. Does not model spacesuit joint fatigue or loose regolith traction; Curiosity telemetry is rover-specific (6-wheel rocker-bogie).
- **Exact Goal Termination:** Search terminates strictly when `curr == goal`. If blocked, returns failure (`None, inf`) with zero straight-line fallback.
- **Candidate Route Trade-Offs:**
  - **Route A: Boxwork Spine (Default):** Ground distance $688.7\text{ m}$, net climb $+44.7\text{ m}$ ($-3,708.5\text{ m} \to -3,663.8\text{ m}$), max slope $19.0^\circ$, mean $6.3^\circ$ (balanced direct route).
  - **Route B: Low-Grade Margin Corridor:** Ground distance $782.4\text{ m}$, net climb $+38.2\text{ m}$, max slope $14.1^\circ$, mean $4.8^\circ$ (gentler climbing grade, $+13.6\%$ distance trade-off).
  - **Route C: Ridge Crest Traverse:** Ground distance $714.2\text{ m}$, net climb $+58.6\text{ m}$, max slope $18.5^\circ$, mean $7.2^\circ$ (panoramic horizon visibility, $+31.1\%$ climb trade-off).

### C. Uncertainty-Aware Geometric Viewshed & Horizon Predictor
- Predicts geometric visibility between camera eye-level and destination targets across the terrain raster.
- **Mars Planetary Curvature Drop:** Over ground distance $s$, the Martian surface curves below the observer's horizontal tangent plane by:
  $$\Delta z_{\text{drop}}(s) = \frac{s^2}{2 R_M}$$
  where $R_M = 3,389,500.0\text{ m}$ (IAU Mean Volumetric Mars Sphere Radius).
- **Ray Clearance & Photogrammetric Uncertainty:** Evaluates whether effective terrain height breaches ray elevation at sample $s \in (0, D)$:
  $$Z_{\text{ray}}(s) = z_{\text{cam}} + \frac{s}{D} (z_{\text{target}} - z_{\text{cam}}), \quad Z_{\text{eff}}(s) = z_{\text{DTM}}(s) - \frac{s^2}{2 R_M}, \quad \text{clearance}(s) = Z_{\text{ray}}(s) - Z_{\text{eff}}(s)$$
  Nominal photogrammetric vertical uncertainty: $\sigma_z = \pm 0.25\text{ m}$ (tens of centimeters, calibrated to HiRISE 1m stereo DTM precision review; Kirk et al. 2008, Tao et al. 2022).
- **4-State Uncertainty Classification:**
  1. `VISIBLE IN TERRAIN MODEL`: Ray clearance $\min_s \text{clearance} > +\sigma_z$ (clear line of sight above terrain uncertainty band).
  2. `OCCLUDED IN TERRAIN MODEL`: Ray clearance $\min_s \text{clearance} < -\sigma_z$ (definitive blockage below terrain uncertainty band; records first blocking scarp cell, distance, elevation, and clearance deficit).
  3. `UNCERTAIN AT DTM RESOLUTION`: Ray clearance $|\min_s \text{clearance}| \le \sigma_z$ (ray grazes terrain within local photogrammetric vertical uncertainty; visibility is marginal and cannot be resolved with certainty from 1m orbital stereo).
  4. `INSUFFICIENT COVERAGE`: Ray crosses unmapped nodata voids or exits supported terrain coverage.
- **Multi-Resolution Nested Terrain Stack:** Ray-marches fine HiRISE 1.01m DTM for local scarps (<750m) and transitions seamlessly across registered seams to Gale Crater regional topography (~50m/px) for distant horizon profiles up to 15 km.

### D. NASA Mars24 Solar Ephemeris & Cliff Shadows
- Computes solar coordinates using Allison & McEwen (2000) equations (*NASA GISS Mars24*):
  - Sol 4452 (2025-05-16, $L_s = 84.3^\circ$, northern summer), subsolar declination $\delta_s = +25.06^\circ$.
  - At Local True Solar Noon (12:00 LST), solar elevation is $+60.16^\circ$ toward azimuth $0.0^\circ$ (True North).
- Ray-marches solar vector across terrain model to classify: `DIRECT_SUNLIGHT`, `IN_CLIFF_SHADOW`, `GRAZING_UNCERTAIN` ($\pm 0.25\text{ m}$), or `NIGHT_BELOW_HORIZON`.
- **Fundamental Decoupling Rule:** Optical cliff shadow blocks direct solar photons (lighting/thermal/UV context); it does **NOT** provide omnidirectional Galactic Cosmic Ray (GCR) radiation shielding.

### E. Two-Tier Terrain Radiation Shielding Engine
- **Tier 1: Geometry-Only Shelter Potential:**
  - Ray-marches full $360^\circ$ skyline horizon across 72 azimuth sectors around the observer.
  - Computes blocked solid angle $\Omega_{\text{blocked}} = \int_0^{2\pi} \sin(\alpha_{\max}(\phi)) d\phi$, blocked sky fraction $F_{\text{blocked}} = \Omega / 2\pi$, and Sky View Factor ($SVF = 1 - F$).
  - Prominently labeled: **`GEOMETRY ONLY; NOT A DOSE ESTIMATE`**.
- **Tier 2: Transport-Based Research Benchmark:**
  - Calibrated against MSL/RAD Murray Buttes Butte M12 observation (Sols 1456–1467, Ehresmann et al. 2021): $19\%$ sky blockage produced $4.0\% \pm 1.2\%$ dose reduction and $7.5\%$ neutral-particle reduction.
  - GEANT4 downward radiation model (*Khaksari et al. 2022*): atmospheric slant column depth ($X = X_0 / \sin \alpha$) makes downward GCR flux strongly zenith-peaked ($dD/d\Omega \propto \sin^{2.55} \alpha$).
  - Rock mass secondary particle production: hadron collisions generate albedo neutrons, buffering dose reduction by offset factor $\eta_{\text{sec}} \approx 0.80$.
  - Modeled shielded dose equivalent rate under high cliff alcove: $\approx 0.614\text{ mSv/day}$ (relative to $0.64 \pm 0.12\text{ mSv/day}$ unshielded Gale baseline).
  - Prominently labeled: **`RESEARCH BENCHMARK ONLY; NOT A LIVE DOSIMETER OR SAFETY RECOMMENDATION`**. Never label a terrain shelter or route "safe."

---

## 4. Operational Scope & Science Boundaries

- **Research Planning Aid Only:** AETHON is an exploration research and planning tool. Outputs are candidate paths, lighting, and geometric visibility estimates; they do not constitute flight-certified navigation or validated spacesuit life-support safety advice.
- **Solar Shade vs. Radiation Shielding:** A cliff shadow blocks sunlight, but GCR particles arrive from the entire upper hemisphere. Never treat solar shadow as radiation safety.
- **Spacesuit Pacing & Thermal Limitations:** Nominal traverse pacing estimates do not model pressurized spacesuit joint fatigue or loose regolith slip mechanics. Standard vacuum sublimators do not operate at Martian ambient pressure (~815 Pa); NASA spacesuit thermal research focuses on the SWME and SEAR systems. Theoretical cooling margins are omitted.
- **Orbital vs Surface Resolution:** While 1.01 m/pixel is state-of-the-art for orbital planetary data, sub-meter rocks, crevasses, and loose talus are below orbital resolution and require in-situ robotic inspection.
- **Weather Observations vs Forecasts:** Curiosity REMS data represent historical in-situ point measurements and do not provide local predictive weather forecasts or EVA windows.
- **Water & Electrostatic Realities:** Hydrated sulfates hold crystal-bound $OH/H_2O$ requiring pyrolytic heating ($>200^\circ\text{C}$) to extract. Subsurface ice is physically unstable at Gale Crater's equatorial latitude. Triboelectric micro-discharges were observed at Jezero Crater (Chide et al. 2025, Nature); exact status for Gale is *"Discharges observed at Jezero; no validated local Gale risk estimate in this release."* Continuous electrostatic hazard maps are omitted in favor of observed event records with explicit provenance.
- **Deliquescence Rigor & Geotechnical Limits:** Evaluated strictly as an analysis labeled *"conditions potentially compatible with deliquescence"* using dated REMS Sols 4452 & 4460 records, Harri/Rivera-Valentín $RH_{\text{liquid}}$ calibration, calcium perchlorate eutectic salt assumptions, and sensor uncertainty. Deliquescence does not establish regolith shear strength; speculative slurry traction penalty maps are excluded.
- **Radiation Transport Prototype:** Radiation transport is treated strictly as a separate later research prototype exposing terrain, atmosphere, surface-material, particle-spectrum, and calibration assumptions validated against RAD (Murray Buttes Butte M12 benchmark) before presenting dose estimates; otherwise reporting historical RAD observations with dates and context.
- **Spacesuit Thermal Policy:** Sublimator pressure formula is omitted; no cooling margins, PLSS margins, or route derating are computed without a sourced Mars-suit model.

---

## 5. Two-Tier Verification Hierarchy

AETHON implements a rigorous two-tier verification structure separating software testing from scientific data validation:

### Tier 1: Automated Unit Test Suite (43 Unit Tests)
```bash
# 1. Master Data Calibration & Science Provenance Suite (17 unit tests)
python3 -m unittest test_aethon_marswalk.py

# 2. Independent Graph Search Pathfinding Suite (5 unit tests)
python3 test_routing_engine.py

# 3. Geometric Line-of-Sight & Curvature Horizon Suite (8 unit tests)
python3 -m unittest test_viewshed_los.py

# 4. NASA Mars24 Solar Ephemeris & Cliff Shadow Suite (7 unit tests)
python3 -m unittest test_solar_shadow.py

# 5. Terrain Radiation Shelter & Murray Buttes Benchmark Suite (6 unit tests)
python3 -m unittest test_radiation_shelter.py
```
All 43 automated unit tests execute and pass cleanly in under 0.30 seconds.

### Tier 2: Scientific Validation & Product Provenance Manifest
Documented in `data/scientific_calibration_manifest.json`:
- **Photogrammetric Uncertainty Calibration:** Evaluates vertical precision margin ($\sigma_z = \pm 0.25\text{ m}$) against stereo DTM Figure of Merit standards.
- **Ground-Truth Rover Tie-Point:** Curiosity Sol 4452 wheel position (-4.787226°S, 137.392621°E) co-registered at pixel [753, 657], elevation -3,708.5m with <1 pixel residual.
- **Solar Illumination Benchmark:** Sol 4452 solar noon elevation $60.16^\circ$ toward azimuth $0.0^\circ$ ($L_s = 84.3^\circ$).
- **Murray Buttes M12 Benchmark:** $19\%$ sky obstruction yields $4.0\% \pm 1.2\%$ dose reduction ($<0.3\%$ relative model validation error).
- **Recomputed Raster Metrics:** True elevation span ($-3,860.67\text{ m}$ to $-3,436.50\text{ m}$; $424.17\text{ m}$ relief) verified directly against checked-in GeoTIFF.python3 test_routing_engine.py

# 3. Geometric Line-of-Sight & Curvature Horizon Suite (8 unit tests)
python3 -m unittest test_viewshed_los.py
```
All 28 automated unit tests execute and pass cleanly in under 0.20 seconds.

### Tier 2: Scientific Validation & Product Provenance Manifest
Documented in `data/scientific_calibration_manifest.json`:
- **Photogrammetric Uncertainty Calibration:** Evaluates vertical precision margin ($\sigma_z = \pm 0.25\text{ m}$) against stereo DTM Figure of Merit standards.
- **Ground-Truth Rover Tie-Point:** Curiosity Sol 4452 wheel position (-4.787226°S, 137.392621°E) co-registered at pixel [753, 657], elevation -3,708.5m with <1 pixel residual.
- **Recomputed Raster Metrics:** True elevation span ($-3,860.67\text{ m}$ to $-3,436.50\text{ m}$; $424.17\text{ m}$ relief) verified directly against checked-in GeoTIFF.
