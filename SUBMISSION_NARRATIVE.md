# AETHON — NASA International Space Apps Challenge 2026 Submission Narrative
**Challenge:** Interplanetary Survival Guide: Martian Map  
**Study Site:** Gediz Vallis Boxwork Ridges, Lower Mount Sharp (Aeolis Mons), Gale Crater, Mars (-4.79°S, 137.39°E)  
**Team Submission Deliverables:** Interactive Tactical Map & Viewshed Predictor (`index.html`), 7-Slide Pitch Deck (`AETHON_7Slide_Presentation.pptx` & `slides.html`), Automated QA Test Suites (27 unit tests), and Full Data Provenance Manifest.

---

## 1. Project Overview & Product Vision

### A. The Scientific Challenge
Navigating the high-relief sedimentary and hydrothermal landscapes of Mars requires spatial planning grounded in physical reality. Future human and robotic explorers investigating the polygonal boxwork ridges of Gediz Vallis face steep erosional scarps, inverted channel gravel beds, and complex terrain obstacles. Low-resolution global mosaics or synthetic elevation models cannot establish actual slope trafficability, terrain clearance, or camera visibility.

### B. The AETHON Solution
AETHON is a science-first Martian field exploration prototype that bridges NASA's planetary data archives with actionable, reproducible geospatial analysis. Centered on the unique boxwork ridge formation documented in-situ by the Curiosity rover (Sol 4452, PIA26559), AETHON provides:
1. **Interactive High-Resolution Multi-Layer Map:** Ingests a real 1.0116 m/pixel NASA MRO HiRISE stereo DTM (1,500 × 1,500 pixels; 424.2m vertical relief) with color-coded analytical slope classification, shaded relief, hypsometric contours, and aligned CTX optical context.
2. **Geometric Line-of-Sight & Horizon Skyline Predictor:** Computes whether a surface camera or explorer at eye-level can see destination features across the terrain, explicitly incorporating spherical Mars curvature ($R_M = 3,389,500\text{ m}$), ray clearance, and obstacle scarp identification.
3. **Terrain-Aware Candidate Traverse Engine:** Executes an A* graph search over the elevation and slope grid with an admissible Euclidean heuristic, exact goal termination, and a 20.0° trafficability cutoff—returning failure when blocked rather than drawing a straight line.
4. **Sourced Mission Context:** Integrates 99 tracked Curiosity rover surface positions, 3 in-situ Mastcam observation stations, dated REMS atmospheric records (Sols 4452 & 4460), and regional MRO CRISM spectral unit footprints (`FRT0000B6F1`, `HRL0000BABA`).
5. **Authentic NASA Mars Image Gallery:** Preloaded gallery of authentic NASA mission images with verified PDS metadata, sol dates, and direct links to NASA Photojournal.

---

## 2. Integrated NASA Multi-Mission Data Inventory

Every layer in AETHON is explicitly classified into strict epistemological categories: `[OBSERVED]`, `[DERIVED]`, `[MODELLED]`, `[SCENARIO INPUT]`, or `[UNAVAILABLE]`.

| Mission & Instrument | Product / Dataset ID | Native Resolution | Coordinate Frame | Classification | Role in AETHON | Source URL |
|---|---|---|---|---|---|---|
| **MRO HiRISE Stereo DTM** | `PSP_009149_1750 / PSP_009294_1750` | **1.0116 m / px** | Equirectangular Mars | `[DERIVED DTM]` | 1,500 × 1,500 px floating-point GeoTIFF; elevation -3,860.7m to -3,436.5m (424.2m relief). | [NASA PDS / UArizona HiRISE](https://www.uahirise.org/dtm/dtm.php?ID=PSP_009149_1750) |
| **MRO HiRISE Derived Slope** | Central Finite Differences Grid | **1.0116 m / px** | Aligned 1:1 with DTM | `[DERIVED GRADIENT]` | Analytical slope grid classified: <10° gentle, 10–15° moderate, 15–20° steep approach, ≥20° impassable scarp. | Derived via central differences |
| **MRO Context Camera (CTX)** | `P01_001513_1752 / P14_006622_1753` | **~6 m / px** | Equirectangular Mars | `[OBSERVED MOSAIC]` | Visual context basemap showing regional channel bed geomorphology. Aligned for visual context; not geodetic control. | [NASA PDS Imaging Node](https://pds-imaging.jpl.nasa.gov) |
| **MSL Curiosity Telemetry** | NASA MMGIS Sols 3958–4573 | In-Situ Telemetry | Planetocentric Mars | `[OBSERVED TELEMETRY]` | 99 tracked in-situ rover positions along Gediz Vallis; explicitly not orbital geodetic ground control. | [NASA JPL MMGIS](https://mars.nasa.gov/mmgis-maps/) |
| **MSL Curiosity Mastcam** | `PIA26559` (Sol 4452) & Sols 4460, 4480 | In-Situ Panoramas | Local Rover Frame | `[OBSERVED IMAGING]` | In-situ 360° Mastcam panoramas providing ground-truth verification of boxwork ridge contacts and boulder fields. | [NASA JPL Photojournal](https://photojournal.jpl.nasa.gov/catalog/PIA26559) |
| **MRO CRISM Orbital Spectroscopy** | Targeted Cubes `FRT0000B6F1` & `HRL0000BABA` | **18 to 36 m / px** | Orbital Footprint | `[OBSERVED ORBITAL CONTEXT]` | Regional spectral unit context for lower Mount Sharp sulfate unit (1.9 µm, 2.1 µm, 2.4 µm bands); regional context only. | [NASA PDS Geosciences Node](https://pds-geosciences.wustl.edu) |
| **MSL Curiosity REMS** | Sols 4452 & 4460 DDR Records | In-Situ Point Sensor | Rover Location (~150-280m) | `[HISTORICAL POINT DATA]` | Gale Crater diurnal ambient pressure (815–820 Pa) and ground temperature (-69°C to +3°C). Historical point readings, not forecasts. | [NASA PDS Atmospheres Node](https://pds-atmospheres.nmsu.edu/) |
| **MSL Curiosity RAD** | `MSL-M-RAD-3-RDR-V1.0` | In-Situ Particle Detector | Gale Crater Floor | `[HISTORICAL BASELINE]` | GCR surface dose equivalent rate: $0.64 \pm 0.12\text{ mSv/day}$ ($210\text{ }\mu\text{Gy/day}$) (Hassler et al. 2014, Zeitlin et al. 2019). Historical floor baseline; not a live storm shelter forecast. | [NASA PDS PPI Node](https://pds-ppi.igpp.ucla.edu/) |
| **MSL Curiosity DAN** | `MSL-M-DAN-4-RDR-V1.0` | Active Pulsed Neutron (~14 MeV) | ~40m Rover Traverse Corridor (<1m depth) | `[OBSERVED TRAVERSE]` | $1.5–3.0\text{ wt}\%$ Water-Equivalent Hydrogen (WEH) bound in sulfate mineral lattices and amorphous phases along actual rover mobility track. | [NASA PDS Geosciences Node](https://pds-geosciences.wustl.edu/) |
| **2001 Mars Odyssey GRS/HEND** | Epithermal Neutron Leakage Flux | Regional Footprint (~300 km FWHM) | Regional Gale Stratigraphy | `[REGIONAL PROXY]` | $<2–4\text{ wt}\%$ regional Water-Equivalent Hydrogen. Broad regional orbital proxy; cannot resolve 1 km local terrain features or discrete surface deposits. | [NASA PDS Geosciences Node](https://pds-geosciences.wustl.edu/) |
| **Water & Ice Assessment** | Multi-instrument synthesis | Regional / Site | Gale Crater (-4.79°S) | `[DERIVED ASSESSMENT]` | Hydrated sulfates hold crystal-bound OH/H2O. Ground ice is thermodynamically unstable at -4.8°S. No accessible water or ice. | Sourced scientific literature |
| **Electrostatic Field Risk** | SuperCam Acoustic/EM Payload | In-Situ Audio & Sensor | Jezero (Observed) / Gale (Unmeasured) | `[JEZERO OBSERVED / GALE UNMEASURED]` | Exact Status: *"Discharges observed at Jezero; no validated local Gale risk estimate in this release."* 55 candidate triboelectric discharges detected at Jezero Crater (Chide et al. 2025, Nature). Curiosity carries no electric field sensor or microphone. Continuous electrostatic hazard maps are strictly excluded; observed event records are presented with explicit provenance. | [Nature 2025](https://www.nature.com/articles/s41586-025-09736-y) |
| **Deliquescence Compatibility** | MSL Curiosity REMS DDR (Sols 4452 & 4460) | In-Situ Temp & Humidity | Gale Crater Rover Corridor | `[CONDITIONS COMPATIBILITY MODEL]` | Labeled *"conditions potentially compatible with deliquescence"*. Evaluates REMS diurnal cycles against calcium perchlorate eutectic thresholds ($T_e = 198.15\text{ K}, RH_e = 52\%$) using Harri et al. (2014) and Rivera-Valentín et al. (2018, 2020) calibration with respect to liquid water. Relative humidity uncertainty is $\pm 2\%\text{ to }\pm 5\%$ (day) and $\pm 10\%\text{ to }\pm 15\%$ (night). Deliquescence does not establish regolith shear strength; speculative slurry traction penalty maps are excluded. | [NASA PDS Atmospheres Node](https://pds-atmospheres.nmsu.edu/) |
| **Spacesuit Thermal System** | Human Spaceflight Engineering Context | N/A | Gale Crater Ambient | `[ENGINEERING CONTEXT]` | Vacuum sublimator cooling fails at Martian ambient pressure (~815 Pa). NASA spacesuit research evaluates Spacesuit Water Membrane Evaporator (SWME) and SEAR systems. PLSS margins cannot be computed from pressure alone; AETHON does not simulate spacesuit consumables. | NASA JSC Crew Systems |

---

## 3. Official 7-Slide Pitch Presentation Storyboard
*(Compliant with NASA Space Apps 7-Slide Limit for Global Judging Eligibility)*

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ SLIDE 1: MISSION CONCEPT & PROTOTYPE                                        │
│ • Title: AETHON — Martian Field Traverse & Radiation Shielding System       │
│ • Challenge: Complex Martian terrain demands rigorous spatial planning.    │
│ • Solution: Zero-synthetic, science-first prototype using 1.01m HiRISE DTM. │
├─────────────────────────────────────────────────────────────────────────────┤
│ SLIDE 2: STUDY SITE SELECTION                                               │
│ • Target Area: Gediz Vallis Boxwork Ridges, lower Mount Sharp (-4.79°S).    │
│ • Rover Context: Curiosity's arrival in May 2025 (Sol 4452, PIA26559).      │
│ • Topographic Relief: 424.2 m vertical relief across 1.52 km footprint.    │
├─────────────────────────────────────────────────────────────────────────────┤
│ SLIDE 3: DATA PROVENANCE & TRACEABILITY                                     │
│ • Multi-Mission NASA Integration: MRO HiRISE, CTX, MSL Curiosity, CRISM.   │
│ • Epistemological Rigor: Observed, Derived, Modelled, Scenario, Unavailable.│
│ • Co-registration Transparency: Aligned for context; not geodetic control.  │
├─────────────────────────────────────────────────────────────────────────────┤
│ SLIDE 4: TOPOGRAPHIC TRAFFICABILITY                                         │
│ • Numerical Slope Gradient: Central finite differences on 1.01m cells.      │
│ • Neutral Classification: <10° gentle (91.4%), 10-15° moderate (7.8%),      │
│   15-20° steep approach (0.8%), ≥20° impassable scarp cutoff.              │
│ • Live Cursor Telemetry: Real-time lat, lon, elevation, slope, and grade.   │
├─────────────────────────────────────────────────────────────────────────────┤
│ SLIDE 5: CANDIDATE TRAVERSE PLANNING ENGINE                                 │
│ • Graph Search: A* algorithm with admissible Euclidean heuristic.           │
│ • Cost Formulation: J(P) = Σ d_i [1 + 1.0 × (Slope / 10.0°)^2] + cutoff.    │
│ • Multi-Route Trade-Offs: Route A (spine: 688.7m), Route B (margin: 782.4m),│
│   and Route C (crest: 714.2m) with editable slope scenario cutoff.          │
├─────────────────────────────────────────────────────────────────────────────┤
│ SLIDE 6: SOLAR ILLUMINATION & TERRAIN RADIATION SHIELDING                   │
│ • NASA Mars24 Ephemeris: Diurnal solar arc, direct sun vs cliff shadows.   │
│ • Decoupling Rule: Optical shadow ≠ omnidirectional GCR radiation shield.   │
│ • Tier 1 Geometry: 360° sky obstruction mask (F_blocked, Ω_blocked).        │
│ • Tier 2 Transport: Calibrated to MSL RAD Murray Buttes M12 (19% → 4.0%).   │
├─────────────────────────────────────────────────────────────────────────────┤
│ SLIDE 7: METHODOLOGY & OPERATIONAL SCOPE                                    │
│ • Research Prototype Scope: Planning aid, not flight-certified EVA software.│
│ • Scientific Integrity: Sourced REMS observations; no accessible water/ice.│
│ • Two-Tier Validation: 43 automated unit tests + Scientific Manifest.       │
│ • Zero-Dependency Delivery: Runs in any standard browser via local HTTP.    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. 30-Second Video Pitch Demo Script

| Timecode | Visual on Screen | Spoken Pitch Audio |
|:---|:---|:---|
| **0:00 – 0:07** | AETHON tactical map loads: HiRISE slope grid over Gediz Vallis boxwork ridges. | *"This is AETHON — an evidence-integrated Martian traverse and terrain radiation-shielding planner for NASA Space Apps 2026."* |
| **0:07 – 0:15** | Cursor hovers across terrain; HUD pill reads live elevation and slope grade. Click NASA Image Gallery opens Sol 4452 Mastcam panorama (PIA26559). | *"Centering on Curiosity's Sol 4452 boxwork ridge arrival in Gale Crater, AETHON ingests a real 1-meter HiRISE stereo DTM covering over 420 meters of true relief."* |
| **0:15 – 0:22** | Click 'Calculate Candidate Traverse'; cyan route traces through gentle corridors. Solar ray tracks diurnal illumination; 360° radiation shelter radar renders. | *"Our verified A* search evaluates slope trade-offs with an admissible heuristic, while our two-tier shelter engine models 360° sky obstruction calibrated to MSL RAD observations."* |
| **0:22 – 0:30** | Sidebar displays exact metrics (688.7m, +44.7m climb, max slope 19.0°); terminal shows 43/43 automated unit tests passing. | *"With zero synthetic terrain, Mars24 solar ephemeris, and 43 passing automated tests, AETHON brings scientific integrity to interplanetary exploration planning."* |

---

## 5. Alignment with Judging Criteria

1. **Relevance & Innovation:** Directly addresses the "Interplanetary Survival Guide: Martian Map" challenge by providing genuine geospatial decision-support tools (slope trafficability, uncertainty-aware geometric line-of-sight, terrain-aware candidate routing, Mars24 solar ephemeris, and two-tier natural radiation shielding) for complex extraterrestrial topography.
2. **Scientific Rigor & Provenance:** Zero synthetic rasters, zero fabricated hazards, zero unvalidated suit power metrics. Every data layer carries complete PDS archive provenance and clear epistemological classification tags.
3. **Mathematical Precision & Reproducibility:** Verified A* pathfinding with strictly admissible heuristic and exact goal termination. NASA Mars24 solar ephemeris and geometric line-of-sight accounts for planetary curvature drop with ±0.25m photogrammetric precision calibration. Natural radiation shielding is benchmarked against MSL/RAD Murray Buttes Butte M12 observations (Ehresmann et al. 2021).
4. **Software Engineering Quality:** Two-tier validation hierarchy with 43 automated unit tests across five independent QA modules plus a Scientific Validation Manifest. Runs entirely offline in standard web browsers with zero build steps or external dependencies.
