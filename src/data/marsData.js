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

export const WEATHER_STATIONS = [
  {
    id: 'MEDA-WS1',
    name: 'NORTH RIDGE MET STATION',
    lngLat: [137.4025, -4.6425],
    elevOffset: +32,
    windMultiplier: 1.22
  },
  {
    id: 'MEDA-WS2',
    name: 'BAGNOLD DUNE ANEMOMETER',
    lngLat: [137.3955, -4.6535],
    elevOffset: -18,
    windMultiplier: 1.45
  },
  {
    id: 'MEDA-WS3',
    name: 'SULFATE BASIN BAROMETER',
    lngLat: [137.4085, -4.6510],
    elevOffset: -29,
    windMultiplier: 0.92
  }
];

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
    mineralogy: 'Crystalline Gray Hematite & Phyllosilicate Clay Beds',
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

export function getSurfaceReconAtLngLat(lng, lat) {
  const hash = Math.abs(Math.floor((lat * 10000 + lng * 10000) * 13.7));
  const item = SURFACE_RECON_CATALOG[hash % SURFACE_RECON_CATALOG.length];

  const elev = Math.round(-4425 + Math.sin(lat * 900) * 35 + Math.cos(lng * 900) * 28);
  const slope = +(Math.abs(Math.cos(lat * 1200) * 16 + Math.sin(lng * 1100) * 6)).toFixed(1);
  const thermalInertia = Math.round(410 + Math.sin((lat + lng) * 800) * 85);
  const svf = +(0.38 + Math.abs(Math.sin(lat * 650)) * 0.45).toFixed(2);

  const dLat = (lat - HABITAT_LNG_LAT[1]) * 59.2;
  const dLng = (lng - HABITAT_LNG_LAT[0]) * 59.0;
  const distKm = Math.sqrt(dLat * dLat + dLng * dLng).toFixed(2);

  return {
    id: 'RECON',
    code: `RECON-${String((hash % 900) + 100)}`,
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

// Helper: Generate regular or organic 3D polygon ring
function createPolygonRing(cLng, cLat, rLng, rLat, sides = 16, rot = 0, irregularity = 0) {
  const coords = [];
  for (let i = 0; i <= sides; i++) {
    const a = (i / sides) * Math.PI * 2 + rot;
    const jitter = irregularity ? 1 + Math.sin(i * 4.7) * irregularity : 1;
    coords.push([
      +(cLng + Math.cos(a) * rLng * jitter).toFixed(6),
      +(cLat + Math.sin(a) * rLat * jitter).toFixed(6)
    ]);
  }
  coords[coords.length - 1] = [...coords[0]];
  return [coords];
}

// Helper: Generate angled 3D bar/ridge segment
function createAngledBar(lng1, lat1, lng2, lat2, thickness) {
  const dx = lng2 - lng1;
  const dy = lat2 - lat1;
  const len = Math.sqrt(dx * dx + dy * dy) || 0.0001;
  const nx = (-dy / len) * thickness;
  const ny = (dx / len) * thickness;
  return [[
    [+(lng1 + nx).toFixed(6), +(lat1 + ny).toFixed(6)],
    [+(lng2 + nx).toFixed(6), +(lat2 + ny).toFixed(6)],
    [+(lng2 - nx).toFixed(6), +(lat2 - ny).toFixed(6)],
    [+(lng1 - nx).toFixed(6), +(lat1 - ny).toFixed(6)],
    [+(lng1 + nx).toFixed(6), +(lat1 + ny).toFixed(6)]
  ]];
}

// Build Detailed Multi-Tier 3D Martian Structures & Geological Formations
function generateDetailed3DMeshes() {
  const features = [];
  const [hLng, hLat] = HABITAT_LNG_LAT;

  // 1. HAB-01 MULTI-TIER GEODESIC BASE COMPOUND
  const domeTiers = [
    { r: 0.00055, base: 0, height: 8, color: '#27272A' },
    { r: 0.00044, base: 8, height: 18, color: '#E4E4E7' },
    { r: 0.00034, base: 18, height: 27, color: '#F4F4F5' },
    { r: 0.00020, base: 27, height: 33, color: '#06B6D4' },
    { r: 0.00004, base: 33, height: 62, color: '#38BDF8' } // Comms Mast
  ];
  domeTiers.forEach((t) => {
    features.push({
      type: 'Feature',
      properties: { name: 'HAB-01 Main Dome', base: t.base, height: t.height, color: t.color },
      geometry: { type: 'Polygon', coordinates: createPolygonRing(hLng, hLat, t.r, t.r, 20) }
    });
  });

  // Secondary Lab Pod + Pressurized Airlock Tunnel
  features.push({
    type: 'Feature',
    properties: { name: 'Airlock Corridor', base: 0, height: 9, color: '#71717A' },
    geometry: { type: 'Polygon', coordinates: createAngledBar(hLng, hLat, hLng + 0.00095, hLat + 0.00035, 0.00012) }
  });
  features.push({
    type: 'Feature',
    properties: { name: 'Astrobiology Lab Module', base: 0, height: 16, color: '#D4D4D8' },
    geometry: { type: 'Polygon', coordinates: createPolygonRing(hLng + 0.00105, hLat + 0.0004, 0.00028, 0.00028, 12) }
  });

  // 6 Solar Array Wings East of Habitat
  for (let i = 0; i < 6; i++) {
    const rowLat = hLat - 0.0006 - i * 0.00022;
    features.push({
      type: 'Feature',
      properties: { name: `Solar Wing ${i + 1}`, base: 1, height: 5, color: '#0284C7' },
      geometry: {
        type: 'Polygon',
        coordinates: createAngledBar(hLng + 0.0006, rowLat, hLng + 0.0015, rowLat, 0.00006)
      }
    });
  }

  // 2. GAMMA SHELTER: 5-LAYER STEPPED SANDSTONE CLIFF OVERHANG (Actual Overhanging Scarp!)
  const [gLng, gLat] = [137.3920, -4.6460];
  const cliffStrata = [
    { offsetLng: -0.0004, rLng: 0.0018, rLat: 0.0010, base: 0, height: 28, color: '#78350F' },
    { offsetLng: -0.0002, rLng: 0.0016, rLat: 0.0009, base: 28, height: 58, color: '#92400E' },
    { offsetLng: 0.0000, rLng: 0.0015, rLat: 0.0008, base: 58, height: 92, color: '#B45309' },
    // Upper overhanging caprock juts EAST over the shelter alcove (base > 0 creates 3D overhang!)
    { offsetLng: +0.00035, rLng: 0.0015, rLat: 0.00075, base: 85, height: 122, color: '#D97706' },
    { offsetLng: +0.00020, rLng: 0.0011, rLat: 0.00055, base: 122, height: 148, color: '#F59E0B' }
  ];
  cliffStrata.forEach((s) => {
    features.push({
      type: 'Feature',
      properties: { name: 'Gamma Sandstone Scarp', base: s.base, height: s.height, color: s.color },
      geometry: {
        type: 'Polygon',
        coordinates: createPolygonRing(gLng + s.offsetLng, gLat, s.rLng, s.rLat, 14, 0.4, 0.22)
      }
    });
  });

  // 3. ALPHA WAYPOINT: INTERLOCKING POLYGONAL BOXWORK SULFATE RIDGES
  const [aLng, aLat] = [137.4070, -4.6430];
  const boxworkLines = [
    [-0.0015, -0.0008, 0.0014, 0.0009, 26, '#A16207'],
    [-0.0012, 0.0009, 0.0015, -0.0007, 22, '#CA8A04'],
    [-0.0002, -0.0014, 0.0003, 0.0015, 31, '#854D0E'],
    [-0.0014, 0.0001, 0.0012, 0.0002, 19, '#A16207'],
    [0.0006, -0.0012, 0.0009, 0.0011, 24, '#713F12']
  ];
  boxworkLines.forEach(([x1, y1, x2, y2, h, col]) => {
    features.push({
      type: 'Feature',
      properties: { name: 'Boxwork Sulfate Dyke', base: 0, height: h, color: col },
      geometry: {
        type: 'Polygon',
        coordinates: createAngledBar(aLng + x1, aLat + y1, aLng + x2, aLat + y2, 0.00011)
      }
    });
  });

  // 4. BETA WAYPOINT: STEPPED LACUSTRINE MUDSTONE MESA & BOULDERS
  const [bLng, bLat] = [137.4100, -4.6560];
  [
    { r: 0.0014, base: 0, height: 18, color: '#57534E' },
    { r: 0.0010, base: 18, height: 38, color: '#78716C' },
    { r: 0.0006, base: 38, height: 56, color: '#A8A29E' }
  ].forEach((m) => {
    features.push({
      type: 'Feature',
      properties: { name: 'Beta Mudstone Butte', base: m.base, height: m.height, color: m.color },
      geometry: {
        type: 'Polygon',
        coordinates: createPolygonRing(bLng, bLat, m.r * 1.3, m.r, 12, 0.2, 0.18)
      }
    });
  });

  // 5. 3D IMPACT CRATER RIMS & SCATTERED BOULDER FIELDS ACROSS SECTOR
  const craters = [
    { lng: 137.4035, lat: -4.6518, r: 0.0009, h: 16 },
    { lng: 137.3970, lat: -4.6425, r: 0.0011, h: 21 },
    { lng: 137.4015, lat: -4.6455, r: 0.0006, h: 12 }
  ];
  craters.forEach((c) => {
    // Crater raised rim segments
    for (let s = 0; s < 8; s++) {
      const a1 = (s / 8) * Math.PI * 2;
      const a2 = ((s + 0.8) / 8) * Math.PI * 2;
      features.push({
        type: 'Feature',
        properties: { name: 'Impact Crater Rim', base: 0, height: c.h, color: '#684732' },
        geometry: {
          type: 'Polygon',
          coordinates: createAngledBar(
            c.lng + Math.cos(a1) * c.r,
            c.lat + Math.sin(a1) * c.r,
            c.lng + Math.cos(a2) * c.r,
            c.lat + Math.sin(a2) * c.r,
            0.00012
          )
        }
      });
    }
  });

  return { type: 'FeatureCollection', features };
}

export const EXTRUDED_3D_FEATURES = generateDetailed3DMeshes();

// Generate High-Density Topographic Contours (Every 5m Elevation Step)
function generateTopographicContours() {
  const features = [];
  const centerLng = 137.401;
  const centerLat = -4.649;

  for (let r = 0.0012; r <= 0.024; r += 0.0014) {
    const coords = [];
    for (let angle = 0; angle <= 360; angle += 6) {
      const rad = (angle * Math.PI) / 180;
      const warp = 1 + 0.16 * Math.sin(rad * 3) + 0.09 * Math.cos(rad * 5);
      coords.push([
        +(centerLng + Math.cos(rad) * r * 1.3 * warp).toFixed(6),
        +(centerLat + Math.sin(rad) * r * warp).toFixed(6)
      ]);
    }
    features.push({
      type: 'Feature',
      properties: {
        elev: `${Math.round(-4390 - r * 3200)}m`,
        major: Math.round(r * 10000) % 2 === 0
      },
      geometry: { type: 'LineString', coordinates: coords }
    });
  }
  return { type: 'FeatureCollection', features };
}

export const TOPO_CONTOURS_GEOJSON = generateTopographicContours();

// Live Dynamic Weather Vector Grid & Pressure Isobars (Updates with Time & Dust Vortex)
export function generateWeatherGridGeoJSON(hourMtc, dustDevilActive) {
  const features = [];
  const baseAngle = ((hourMtc - 6) / 12) * Math.PI * 0.65 + 0.4; // Wind shifts NW -> SE across sol

  for (let lng = 137.388; lng <= 137.414; lng += 0.0038) {
    for (let lat = -4.659; lat <= -4.639; lat += 0.0035) {
      // Swirl vectors around vortex center if dust devil is active
      const dLng = lng - 137.401;
      const dLat = lat - -4.648;
      const angle = dustDevilActive
        ? Math.atan2(dLat, dLng) + Math.PI * 0.55
        : baseAngle + Math.sin((lng + lat) * 400) * 0.25;

      const len = dustDevilActive ? 0.0019 : 0.0013;
      const endLng = lng + Math.cos(angle) * len;
      const endLat = lat + Math.sin(angle) * len;

      // Arrowhead wings
      const headAngle1 = angle + Math.PI * 0.82;
      const headAngle2 = angle - Math.PI * 0.82;
      const wingLen = len * 0.38;

      features.push({
        type: 'Feature',
        properties: {
          speed: dustDevilActive ? '26.4 m/s' : '8.2 m/s',
          hazard: dustDevilActive ? 'HIGH' : 'NOMINAL'
        },
        geometry: {
          type: 'MultiLineString',
          coordinates: [
            [
              [lng, lat],
              [endLng, endLat]
            ],
            [
              [endLng + Math.cos(headAngle1) * wingLen, endLat + Math.sin(headAngle1) * wingLen],
              [endLng, endLat],
              [endLng + Math.cos(headAngle2) * wingLen, endLat + Math.sin(headAngle2) * wingLen]
            ]
          ]
        }
      });
    }
  }

  return { type: 'FeatureCollection', features };
}

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
  const windHeading = dustDevilActive ? 'VORTEX SWIRL' : hourMtc < 12 ? '295° WNW' : '135° SE';

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

  const dustOpticalDepth = dustDevilActive
    ? 2.85
    : +(0.42 + diurnalFactor * 0.35).toFixed(2);

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
    windHeading,
    dustOpticalDepth,
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