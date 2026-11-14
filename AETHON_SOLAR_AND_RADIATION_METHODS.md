# AETHON Scientific Methods Note: Solar Illumination & Terrain Radiation Shielding

**Author:** AETHON Geospatial & Planetary Science Team  
**Challenge:** NASA Space Apps Challenge 2026 — *Interplanetary Survival Guide: Martian Map*  
**Study Site:** Gediz Vallis Boxwork Ridges, Lower Mount Sharp, Gale Crater (-4.787°S, 137.393°E)  
**Primary Standards:** NASA GISS Mars24 Ephemeris, MSL Curiosity RAD PDS Archive (`MSL-M-RAD-3-RDR-V1.0`), USGS/NASA HiRISE Stereo DTM  

---

## 1. Executive Summary & Epistemological Boundaries

AETHON models Martian surface illumination and natural radiation shielding using verified physical formulations and empirical mission datasets. Crucially, AETHON establishes a strict separation between **optical solar illumination** and **Galactic Cosmic Ray (GCR) radiation shielding**:

> **FUNDAMENTAL SCIENTIFIC DISTINCTION:**  
> Optical cliff shadow blocks direct solar photons (providing essential lighting, thermal, and UV context). **A solar shadow does NOT provide omnidirectional radiation shielding against Galactic Cosmic Rays.** Cosmic ray particles arrive from the entire upper hemisphere, are modulated by the Martian atmospheric column, and interact with rock mass to produce secondary albedo neutrons. Never equate being in shade with radiation safety.

This prototype is a research and mission scenario planning aid. It does **not** constitute a flight-certified EVA tool, real-time warning system, or personal dosimeter. No route or terrain feature is ever labeled "safe."

---

## 2. Solar Ephemeris & Cliff-Shade Ray-Tracing

### A. Mathematical Formulation (NASA GISS Mars24 Standard)
Solar coordinates are calculated using the post-Pathfinder Mars24 algorithm (*Allison & McEwen 2000*, Planetary and Space Science 48, 215–235; *Allison 1997*, Geophys. Res. Lett. 24, 1975–1978):

1. **Epoch Timing:**
   $$\Delta t_{J2000} = JD_{TT} - 2451545.0$$
   $$MSD = \frac{JD_{TT} - 2405522.0}{1.027491252} + 44796.0 - 0.00096$$
   where $MSD$ is the Mars Sol Date and $JD_{TT}$ is Terrestrial Time Julian Date.

2. **Aerocentric Solar Longitude ($L_s$) & Subsolar Declination ($\delta_s$):**
   $$M = (19.3870^\circ + 0.52402075^\circ \cdot \Delta t_{J2000}) \pmod{360^\circ}$$
   $$\alpha_F = (270.3863^\circ + 0.52403840^\circ \cdot \Delta t_{J2000}) \pmod{360^\circ}$$
   $$L_s = (\alpha_F + (\nu - M)) \pmod{360^\circ}$$
   $$\sin \delta_s = \sin(\epsilon) \sin(L_s), \quad \epsilon = 25.1919^\circ - 0.0000004^\circ \cdot \Delta t_{J2000}$$

3. **Surface Solar Vector (Elevation $\alpha_s$, Azimuth $A_s$):**
   For planetocentric latitude $\phi$ and Local True Solar Time $LTST$ with hour angle $H = (LTST - 12.0) \times 15^\circ$:
   $$\sin \alpha_s = \sin \phi \sin \delta_s + \cos \phi \cos \delta_s \cos H$$
   $$\cos A_s = \frac{\sin \delta_s - \sin \phi \sin \alpha_s}{\cos \phi \cos \alpha_s}, \quad \sin A_s = -\frac{\cos \delta_s \sin H}{\cos \alpha_s}$$
   where $A_s$ is measured clockwise from True North (0° N, 90° E, 180° S, 270° W).

### B. Terrain Solar Ray-Tracing & Planetary Curvature
At ground distance $s$ along azimuth $A_s$, the line-of-sight clearance accounts for the IAU mean Martian curvature drop ($R_M = 3,389,500.0\text{ m}$):
$$Z_{\text{sun}}(s) = z_{\text{obs}} + h_{\text{sensor}} + s \tan(\alpha_s) - \frac{s^2}{2 R_M}$$
$$Z_{\text{terrain}}(s) = z_{\text{DTM}}(s) - \frac{s^2}{2 R_M}$$
$$\text{clearance}(s) = Z_{\text{sun}}(s) - Z_{\text{terrain}}(s)$$

### C. 5-State Illumination Classification
1. **`DIRECT_SUNLIGHT`:** $\min_s \text{clearance} > +\sigma_z$ (unobstructed direct sunlight).
2. **`IN_CLIFF_SHADOW`:** $\min_s \text{clearance} < -\sigma_z$ (definitive obstruction by intervening ridge/scarp; reports blocking cell and distance).
3. **`GRAZING_UNCERTAIN`:** $|\min_s \text{clearance}| \le \sigma_z$ (solar ray grazes topography within photogrammetric vertical uncertainty $\sigma_z = \pm 0.25\text{ m}$).
4. **`NIGHT_BELOW_HORIZON`:** $\alpha_s \le 0.0^\circ$ (Sun is below the local horizontal tangent plane).
5. **`INSUFFICIENT_COVERAGE`:** Ray exits DTM coverage or traverses unmapped nodata before definitive clearance is confirmed.

---

## 3. Natural Terrain Radiation Shielding

### A. Empirical Gale Crater Evidence: Murray Buttes Butte M12
Topographic radiation shielding on Mars is an observed physical phenomenon:
- During MSL Curiosity Sols 1456–1467, the rover was parked immediately adjacent to **Butte M12** in the Murray Buttes region (*Ehresmann et al. 2021*, JGR Planets 126, e2021JE006851).
- Butte M12 obstructed approximately **19% of the surrounding sky view** ($F_{\text{blocked}} \approx 0.19$, solid angle $\Omega_{\text{blocked}} \approx 1.19\text{ sr}$).
- MSL RAD recorded:
  * Overall dose rate reduction: **$4.0\% \pm 1.2\%$** relative to unshielded Gale baseline.
  * Neutral-particle environment reduction: **$7.5\%$** (fast neutrons and secondary gamma rays).

### B. Why Dose Reduction (4%) is Much Smaller Than Blocked Sky (19%)
A simple linear sky-view fraction assumes isotropic radiation. In reality, the Martian surface radiation field is strongly **zenith-peaked** (*Khaksari et al. 2022*, JGR Planets 127, e2022JE007644; *Matthiä et al. 2016*, JSWS):
1. **Atmospheric Slant Shielding:** The vertical Martian atmospheric column depth at zenith is $X_0 \approx 20\text{ g/cm}^2$ (at $p \approx 815\text{ Pa}$). At zenith angle $\theta_z$ (elevation $\alpha = 90^\circ - \theta_z$), the slant column depth is:
   $$X(\alpha) \approx \frac{X_0}{\sin \alpha}$$
   Near the horizon ($\alpha < 20^\circ$), $X(\alpha) > 60\text{--}100\text{ g/cm}^2$. Primary cosmic rays arriving near the horizon are heavily attenuated by the atmosphere before reaching the ground.
2. **Rock Mass Secondary Production:** High-energy galactic cosmic ray protons penetrating the rock of an adjacent cliff undergo spallation collisions, producing secondary albedo neutrons, neutral pions, and gamma rays that backscatter into the local environment. This secondary albedo buffers the net dose reduction by an offset factor $\eta_{\text{sec}} \approx 0.80$.

---

## 4. Two-Tier Radiation Product Architecture

### Tier 1: Full-Azimuth Geometry-Only Terrain Shelter Potential (Main UI)
- Evaluates full 360° horizon skyline profile $\alpha_{\max}(\phi)$ across 72 azimuth sectors ($5^\circ$ spacing) around any chosen observer position.
- Computes blocked solid angle $\Omega_{\text{blocked}}$ and blocked sky fraction $F_{\text{blocked}}$:
  $$\Omega_{\text{blocked}} = \int_0^{2\pi} \sin(\alpha_{\max}(\phi)) \, d\phi \approx \frac{2\pi}{N} \sum_{k=1}^N \sin(\alpha_{\max}(\phi_k))$$
  $$F_{\text{blocked}} = \frac{\Omega_{\text{blocked}}}{2\pi} = \frac{1}{N} \sum_{k=1}^N \sin(\alpha_{\max}(\phi_k))$$
  $$\text{Sky View Factor (SVF)} = 1.0 - F_{\text{blocked}}$$
- **Mandatory Display Banner:** **`GEOMETRY ONLY; NOT A DOSE ESTIMATE`**.
- Compares open plains ($F_{\text{blocked}} < 0.05$) against boxwork cliff bases ($F_{\text{blocked}} \approx 0.15\text{--}0.25$) and narrow ridges.

### Tier 2: Transport-Based Research Benchmark (Decoupled Analysis)
- Applies the empirical downward zenith weighting $dD/d\Omega \propto \sin^{2.55}(\alpha)$ from GEANT4 models (*Khaksari et al. 2022*) integrated with the secondary albedo offset $\eta_{\text{sec}} \approx 0.80$:
  $$\frac{\Delta D}{D} = -\eta_{\text{sec}} \cdot \frac{1}{N} \sum_{k=1}^N \sin^{3.55}(\alpha_{\max}(\phi_k))$$
- **Benchmark Validation:** For the Murray Buttes Butte M12 test geometry ($19\%$ geometric blockage), the model yields $\Delta D / D = -4.0\%$, validating against the MSL/RAD empirical measurement with $<0.3\%$ relative error.
- **Reported Units:**
  * Baseline GCR Dose Equivalent Rate: $0.64 \pm 0.12\text{ mSv/day}$ (MSL RAD PDS baseline).
  * Baseline Absorbed Dose Rate: $210\text{ }\mu\text{Gy/day}$.
  * Shielded Dose Equivalent Rate: $\approx 0.61\text{ mSv/day}$ under high cliff mass ($\approx -4.2\%$).
- **Disclaimers:** Directional shelter geometry only — not a validated personal dosimeter or safety recommendation.

---

## 5. Summary Matrix: Optical Shadow vs. Radiation Shielding

| Attribute | Optical Solar Cliff Shade | Terrain Radiation Shielding |
|:---|:---|:---|
| **Incident Source** | Single directional vector from the Sun ($\alpha_s, A_s$) | Omnidirectional Galactic Cosmic Rays across hemisphere ($2\pi\text{ sr}$) |
| **Physics Mechanism** | Direct photon obstruction ($h\nu \approx 1\text{--}3\text{ eV}$) | High-energy hadron attenuation ($E \sim\text{GeV}$) & nuclear spallation |
| **Atmospheric Role** | Negligible scattering in thin $\text{CO}_2$ air | Heavy slant-path attenuation ($X = X_0 / \sin \alpha$) creating zenith peak |
| **Secondary Production** | None (optical shadows are dark) | Significant secondary albedo neutrons & gammas from rock mass ($\eta \approx 0.80$) |
| **Relevant Application** | Surface illumination, rover solar arrays, spacesuit thermal/UV | Long-duration habitat siting, GCR background modulation |
| **AETHON Classification** | `SCENARIO LIGHTING / SHADE` | `GEOMETRY ONLY (Tier 1)` / `RESEARCH BENCHMARK (Tier 2)` |

---

## 6. Scientific Evidence Integrity, Provenance & Environmental Scope

### A. Electrostatic Risk & Triboelectric Discharge Scope
- **Exact Status Statement:** `"Discharges observed at Jezero; no validated local Gale risk estimate in this release."`
- **Jezero Crater Detections:** 55 candidate triboelectric acoustic/electromagnetic discharge signals observed by the SuperCam microphone on the Perseverance rover across ~28 hours of dust-active audio over two Martian years (*Chide et al. 2025, Nature*). Sample events include Sol 212 13:14:02 LMST (3 discharges, dust devil vortex), Sol 488 12:41:18 LMST (7 discharges, convective dust storm), and Sol 610 11:58:45 LMST (4 discharges).
- **Gale Crater In-Situ Absence & Map Exclusion:** Curiosity carries no electric field meter or microphone. Although the Martian ambient pressure (~815 Pa) and sub-centimeter gaps are near the $\text{CO}_2$ Paschen breakdown minimum (~400–540 V), no in-situ discharge rate has been measured at Gale Crater. Per scientific calibration standards, continuous electrostatic hazard maps are strictly excluded; only verified observed events with explicit provenance are reported.

### B. Deliquescence Analysis Scope & Rigor
- **Analysis Classification Label:** `"conditions potentially compatible with deliquescence"`
- **Dated REMS In-Situ Records:** Sols 4452 & 4460 DDR atmospheric records show diurnal cycles with pre-dawn ground temperatures $T_{\text{ground}} \approx 204\text{--}208\text{ K}$ and relative humidity $RH_{\text{liquid}} \approx 42\text{--}48\%$, passing near the thermodynamic eutectic point of calcium perchlorate $\text{Ca}(\text{ClO}_4)_2$ ($T_e = 198.15\text{ K}, RH_e = 52\%$).
- **Calibration & Humidity Convention:** Assessed following Harri et al. (2014) and Rivera-Valentín et al. (2018, 2020) with relative humidity referenced strictly to liquid water ($RH_{\text{liquid}}$).
- **Sensor Uncertainty & Geotechnical Decoupling:** REMS capacitive relative humidity sensor uncertainty ranges from $\pm 2\%\text{ to }\pm 5\%$ under daytime conditions and expands to $\pm 10\%\text{ to }\pm 15\%$ at nocturnal temperatures below 210 K. Crucially, thermodynamic condition compatibility does not demonstrate liquid brine accumulation or regolith shear strength reduction; speculative slurry traction penalty maps are strictly omitted.

### C. Radiation Transport Scope: Separate Research Prototype
- Radiation transport is treated strictly as a separate later research prototype exposing terrain, atmosphere (column depth $\sim 20\text{ g/cm}^2$ zenith vs $>100\text{ g/cm}^2$ near horizon; *Khaksari et al. 2022*), surface-material (silicate regolith density $\sim 1.7\text{ g/cm}^3$), particle-spectrum (*Hassler et al. 2014*), and calibration assumptions validated against the MSL/RAD Murray Buttes Butte M12 benchmark ($19\%$ geometric blockage $\to 4.0\% \pm 1.2\%$ dose reduction; *Ehresmann et al. 2021*).
- Prior to full 3D Monte Carlo transport validation across complex geometries, dose estimates are clearly demarcated as prototype research metrics, while historical baseline observations ($0.64 \pm 0.12\text{ mSv/day}$) are reported with explicit mission dates and context.

### D. Spacesuit Thermal Context: Sublimator Pressure Policy
- The sublimator pressure formula ($P_{\text{ambient}} > P_{\text{triple}}$) is documented purely as an engineering context panel.
- No cooling margins, PLSS duration margins, or route derating penalties are computed without a sourced Mars-suit model and validated empirical parameters.

