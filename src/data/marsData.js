export const HABITAT_LNG_LAT = [137.4000, -4.6500]; // Gale Crater - Mount Sharp Boxwork

export const SCIENCE_TARGETS = [
  {
    id: 'ALPHA',
    code: 'WP-01',
    name: 'Boxwork Sulfate Vein Network',
    coords: [-4.643, 137.407],
    lngLat: [137.4070, -4.6430],
    elevation: -4420,
    slopeDeg: 11.4,
    thermalInertia: 430,
    svf: 0.78,
    priority: 'PRIMARY ASTROBIOLOGY',
    mineralogy: 'Polyhydrated Ca-Sulfate & Mg-Sulfate Fracture Fill',
    description:
      'Cemented fracture-fill boxwork ridges formed by early Martian groundwater circulation. High biosignature preservation potential.',
    imageUrl:
      'https://images-assets.nasa.gov/image/PIA26443/PIA26443~orig.jpg',
    fallbackImage:
      'https://images-assets.nasa.gov/image/PIA19912/PIA19912~orig.jpg',
    sol: 'Curiosity Mastcam // Sol 4102 Boxwork Ridge',
    distanceKm: '0.94 km'
  },
  {
    id: 'BETA',
    code: 'WP-02',
    name: 'Basal Mudstone & Hematite Contact',
    coords: [-4.656, 137.410],
    lngLat: [137.4100, -4.6560],
    elevation: -4465,
    slopeDeg: 8.2,
    thermalInertia: 395,
    svf: 0.65,
    priority: 'STRATIGRAPHY BENCHMARK',
    mineralogy: 'Lacustrine Mudstone with Ferric Oxide Concretions',
    description:
      'Stratigraphic boundary marking the ancient transition from neutral lakebed clays to acidic sulfate-bearing eras.',
    imageUrl:
      'https://images-assets.nasa.gov/image/PIA19912/PIA19912~orig.jpg',
    fallbackImage:
      'https://images-assets.nasa.gov/image/PIA20755/PIA20755~orig.jpg',
    sol: 'Curiosity Mastcam // Kimberley & Murray Contact',
    distanceKm: '1.32 km'
  },
  {
    id: 'GAMMA',
    code: 'SH-01',
    name: 'Indurated Sandstone Scarp Overhang',
    coords: [-4.646, 137.392],
    lngLat: [137.3920, -4.6460],
    elevation: -4390,
    slopeDeg: 19.8,
    thermalInertia: 485,
    svf: 0.34,
    priority: 'EMERGENCY SPE SHELTER',
    mineralogy: 'High-Inertia Cross-Bedded Aeolian Sandstone',
    description:
      'Steep topographic cliff overhang occluding 66% of the sky dome (SVF 0.34). Primary abort sanctuary during Solar Particle Events.',
    imageUrl:
      'https://images-assets.nasa.gov/image/PIA20755/PIA20755~orig.jpg',
    fallbackImage:
      'https://images-assets.nasa.gov/image/PIA19912/PIA19912~orig.jpg',
    sol: 'Curiosity Mastcam // Stimson Sandstone Butte',
    distanceKm: '0.78 km'
  }
];

// High-Resolution Real NASA Curiosity Surface Recon Library for Click-Anywhere Inspection
export const SURFACE_RECON_CATALOG = [
  {
    zone: 'SULFATE BOXWORK FRACTURE ZONE',
    camera: 'MSL Mastcam-100mm Telephoto // NASA/JPL-Caltech/MSSS',
    imageUrl: 'https://images-assets.nasa.gov/image/PIA26443/PIA26443~orig.jpg',
    mineralogy: 'Mg-Sulfate & Calcium Sulfate Cemented Polygonal Ridges',
    geologyNote:
      'High-relief polygonal fractures resistant to wind erosion. Firm footing for EVA boots (Thermal Inertia > 420 TIU).'
  },
  {
    zone: 'MOUNT SHARP LAYERED SULFATE BUTTE',
    camera: 'MSL Mastcam Mosaic // NASA/JPL-Caltech/MSSS',
    imageUrl: 'https://images-assets.nasa.gov/image/PIA20755/PIA20755~orig.jpg',
    mineralogy: 'Cross-Bedded Aeolian Sandstone & Hematite Laminae',
    geologyNote:
      'Finely laminated sedimentary bench offering strong natural topographic radiation shielding (SVF < 0.42 near scarp base).'
  },
  {
    zone: 'GALE CRATER STRIATED BEDROCK BENCH',
    camera: 'MSL Mastcam Right Eye // NASA/JPL-Caltech/MSSS',
    imageUrl: 'https://images-assets.nasa.gov/image/PIA19912/PIA19912~orig.jpg',
    mineralogy: 'Felsic Sandstone & Lacustrine Siltstone Outcrop',
    geologyNote:
      'Exposed low-albedo bedrock slabs swept clear of loose dust. Low triboelectric Paschen discharge hazard.'
  },
  {
    zone: 'BAGNOLD AEOLIAN DARK DUNE DRIFT',
    camera: 'MSL Mastcam Panorama // NASA/JPL-Caltech/MSSS',
    imageUrl: 'https://images-assets.nasa.gov/image/PIA20168/PIA20168~orig.jpg',
    mineralogy: 'Basaltic Olivine-Pyroxene Windblown Sand Ripples',
    geologyNote:
      'CAUTION: Low thermal inertia (165 TIU) fine basaltic sand. High wheel/boot sinkage and elevated triboelectric dust charging during afternoon gusts.'
  },
  {
    zone: 'VERA RUBIN RIDGE HEMATITE EXPOSURE',
    camera: 'MSL Mastcam Calibrated Color // NASA/JPL-Caltech/MSSS',
    imageUrl: 'https://images-assets.nasa.gov/image/PIA22210/PIA22210~orig.jpg',
    mineralogy: 'Crystalline Gray Hematite & phyllosilicate clay beds',
    geologyNote:
      'Dense, erosion-resistant ridge crest with high bearing strength and unobstructed horizon lines for optical TRN navigation.'
  },
  {
    zone: 'GEDIZ VALLIS DEBRIS CHANNEL',
    camera: 'MSL Mastcam 34mm Wide // NASA/JPL-Caltech/MSSS',
    imageUrl: 'https://images-assets.nasa.gov/image/PIA25969/PIA25969~orig.jpg',
    mineralogy: 'Alluvial Boulder Conglomerate & Hydrated Sulfate Clasts',
    geologyNote:
      'Ancient water-carved channel containing angular meter-scale boulders transported from upper Mount Sharp.'
  }
];

// Deterministic Ground-Truth Recon Lookup for Any Clicked Coordinate
export function getSurfaceReconAtLngLat(lng, lat) {
  const hash = Math.abs(Math.floor((lat * 10000 + lng * 10000) * 13.7));
  const item = SURFACE_RECON_CATALOG[hash % SURFACE_RECON_CATALOG.length];

  const elev = Math.round(-4425 + Math.sin(lat * 900) * 35 + Math.cos(lng * 900) * 28);
  const slope = +(Math.abs(Math.cos(lat * 1200) * 16 + Math.sin(lng * 1100) * 6)).toFixed(1);
  const thermalInertia = Math.round(410 + Math.sin((lat + lng) * 800) * 85);
  const svf = +(0.38 + (Math.abs(Math.sin(lat * 650)) * 0.45)).toFixed(2);

  const dLat = (lat - HABITAT_LNG_LAT[1]) * 59.2;
  const dLng = (lng - HABITAT_LNG_LAT[0]) * 59.0;
  const distKm = Math.sqrt(dLat * dLat + dLng * dLng).toFixed(2);

  return {
    id: 'RECON',
    code: `RECON-${String(hash % 900 + 100)}`,
    name: item.zone,
    lngLat: [+lng.toFixed(5), +lat.toFixed(5)],
    elevation: elev,
    slopeDeg: slope,
    thermalInertia,
    svf,
    priority: 'LIVE SURFACE RECONNAISSANCE',
    mineralogy: item.mineralogy,
    description: item.geologyNote,
    imageUrl: item.imageUrl,
    fallbackImage: 'https://images-assets.nasa.gov/image/PIA19912/PIA19912~orig.jpg',
    sol: item.camera,
    distanceKm: `${distKm} km`
  };
}

export const NOMINAL_ROUTE_LNGLAT = [
  [137.4000, -4.6500],
  [137.4030, -4.6470],
  [137.4070, -4.6430], // Alpha
  [137.4090, -4.6500],
  [137.4100, -4.6560], // Beta
  [137.4040, -4.6530],
  [137.4000, -4.6500]
];

export const ABORT_ROUTE_LNGLAT = [
  [137.4000, -4.6500],
  [137.3960, -4.6480],
  [137.3920, -4.6460] // Gamma Shelter
];

function generateTopographicContours() {
  const features = [];
  const centerLng = 137.401;
  const centerLat = -4.649;

  for (let r = 0.002; r <= 0.022; r += 0.0025) {
    const coords = [];
    for (let angle = 0; angle <= 360; angle += 10) {
      const rad = (angle * Math.PI) / 180;
      const warp = 1 + 0.18 * Math.sin(rad * 3) + 0.1 * Math.cos(rad * 5);
      coords.push([
        +(centerLng + Math.cos(rad) * r * 1.3 * warp).toFixed(6),
        +(centerLat + Math.sin(rad) * r * warp).toFixed(6)
      ]);
    }
    features.push({
      type: 'Feature',
      properties: { elev: Math.round(-4400 - r * 2500) },
      geometry: { type: 'LineString', coordinates: coords }
    });
  }
  return { type: 'FeatureCollection', features };
}

export const TOPO_CONTOURS_GEOJSON = generateTopographicContours();

export const EXTRUDED_3D_FEATURES = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'HAB-01 Pressurized Module', height: 42, color: '#06B6D4' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [137.3996, -4.6496],
          [137.4004, -4.6496],
          [137.4004, -4.6504],
          [137.3996, -4.6504],
          [137.3996, -4.6496]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Gamma Scarp Overhang', height: 145, color: '#10B981' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [137.3905, -4.6445],
          [137.3932, -4.6445],
          [137.3935, -4.6475],
          [137.3910, -4.6475],
          [137.3905, -4.6445]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Alpha Boxwork Ridge', height: 68, color: '#52525B' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [137.4055, -4.6418],
          [137.4085, -4.6422],
          [137.4080, -4.6442],
          [137.4052, -4.6438],
          [137.4055, -4.6418]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Beta Mudstone Butte', height: 54, color: '#3F3F46' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [137.4088, -4.6550],
          [137.4115, -4.6552],
          [137.4112, -4.6572],
          [137.4086, -4.6570],
          [137.4088, -4.6550]
        ]]
      }
    }
  ]
};

export const NASA_DATASETS = [
  {
    instrument: 'MRO HiRISE & CTX 5m Mosaic',
    resolution: '1.0–5.0 m/px Grid (100×100 DTM)',
    role: 'Slope metabolic penalty, void collapse cutoff, 8-ray Sky-View Factor (SVF)',
    source: 'USGS Astrogeology / NASA Mars Trek WMTS'
  },
  {
    instrument: 'Perseverance MEDA & Curiosity REMS',
    resolution: '1 Hz Diurnal Sol Table',
    role: 'Ambient barometric pressure (P_amb), wind speed, and triple-point sublimator ΔP',
    source: 'NASA PDS Atmospheres Node'
  },
  {
    instrument: 'Mars Odyssey THEMIS IR',
    resolution: '100 m/px Thermal Inertia',
    role: 'Distinguishes firm bedrock (I > 400 TIU) from triboelectric dust traps (I < 180 TIU)',
    source: 'ASU Mars Space Flight Facility'
  },
  {
    instrument: 'Curiosity RAD Dosimeter',
    resolution: 'Continuous Surface Dose Equivalent',
    role: 'Baseline GCR (0.23 mSv/sol) & Solar Particle Event proton flux modeling',
    source: 'Southwest Research Institute / PDS'
  }
];

export function getAstronautPosition(hourMtc, dustDevilActive) {
  const path = dustDevilActive ? ABORT_ROUTE_LNGLAT : NOMINAL_ROUTE_LNGLAT;
  const progress = Math.max(0, Math.min(1, (hourMtc - 6) / 12));
  const totalSegments = path.length - 1;
  const exactIndex = progress * totalSegments;
  const segIndex = Math.min(Math.floor(exactIndex), totalSegments - 1);
  const segFraction = exactIndex - segIndex;

  const [lng1, lat1] = path[segIndex];
  const [lng2, lat2] = path[segIndex + 1];

  const lng = +(lng1 + (lng2 - lng1) * segFraction).toFixed(5);
  const lat = +(lat1 + (lat2 - lat1) * segFraction).toFixed(5);
  const elev = Math.round(-4410 - Math.sin(progress * Math.PI) * 55);

  return { lng, lat, elev, progressPct: Math.round(progress * 100) };
}

export function computeTelemetry(hourMtc, payloadKg, dustDevilActive, speAlertActive) {
  const diurnalFactor = Math.sin(((hourMtc - 6) / 12) * Math.PI);
  const tempK = Math.round(195 + diurnalFactor * 52);
  const baseWind = 3.2 + Math.pow(Math.max(0, (hourMtc - 6) / 12), 1.5) * 11.8;
  const windSpeed = dustDevilActive ? +(baseWind + 18.5).toFixed(1) : +baseWind.toFixed(1);

  const localPressurePa = +(638 - diurnalFactor * 34).toFixed(1);
  const deltaP = +(611.65 - localPressurePa).toFixed(1);
  const sublimatorStatus =
    deltaP > 15 ? 'OPTIMAL' : deltaP > 0 ? 'MARGINAL' : 'CRITICAL';

  const thermalInertia = dustDevilActive ? 160 : 415;
  const eCrit = 20.0 * (localPressurePa / 650.0);
  const dustFactor = Math.max(1.0, 450.0 / Math.max(thermalInertia, 50.0));
  const eInduced = 0.5 * Math.pow(windSpeed, 1.4) * dustFactor;
  const paschenRisk = +(eInduced / eCrit).toFixed(2);

  const uvRadiation = speAlertActive
    ? 4.85
    : +(0.23 + diurnalFactor * 0.14).toFixed(2);

  const elapsedHours = hourMtc - 6;
  const metabolicLoad = 1 + payloadKg * 0.015;
  const o2Pct = Math.max(12, Math.round(100 - elapsedHours * 4.2 * metabolicLoad));
  const waterPct = Math.max(15, Math.round(100 - elapsedHours * 3.8 * metabolicLoad));
  const batteryPct = Math.max(18, Math.round(100 - elapsedHours * 4.5 * (1 + payloadKg * 0.01)));
  const co2ScrubberPct = Math.max(20, Math.round(100 - elapsedHours * 3.5 * metabolicLoad));
  const kcalBurned = Math.round(elapsedHours * 310 * metabolicLoad);

  return {
    tempK,
    windSpeed,
    localPressurePa,
    deltaP,
    sublimatorStatus,
    paschenRisk,
    eCrit: +eCrit.toFixed(1),
    eInduced: +eInduced.toFixed(1),
    uvRadiation,
    o2Pct,
    waterPct,
    batteryPct,
    co2ScrubberPct,
    kcalBurned
  };
}
