import { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import {
  HABITAT_LNG_LAT,
  SCIENCE_TARGETS,
  WEATHER_STATIONS,
  NOMINAL_ROUTE_LNGLAT,
  ABORT_ROUTE_LNGLAT,
  EXTRUDED_3D_FEATURES,
  TOPO_CONTOURS_GEOJSON,
  generateWeatherGridGeoJSON,
  getAstronautPosition,
  getSurfaceReconAtLngLat
} from '../data/marsData';
import { RotateCw, Eye, Navigation, Crosshair, CloudRainWind } from 'lucide-react';

maplibregl.setWorkerUrl(maplibreWorkerUrl);

// Procedural High-Detail Martian Regolith, Ripple & Fracture Texture Generator
function createHighDetailMarsTextureDataURL() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Rich Martian iron-oxide base
  ctx.fillStyle = '#8C462B';
  ctx.fillRect(0, 0, 512, 512);

  // Aeolian wind-ripple micro-ridges
  ctx.strokeStyle = 'rgba(40, 16, 8, 0.28)';
  ctx.lineWidth = 1.2;
  for (let y = 0; y < 512; y += 8) {
    ctx.beginPath();
    for (let x = 0; x <= 512; x += 16) {
      const offsetY = y + Math.sin((x + y) * 0.05) * 3;
      if (x === 0) ctx.moveTo(x, offsetY);
      else ctx.lineTo(x, offsetY);
    }
    ctx.stroke();
  }

  // Polygonal bedrock sulfate fracture cracks
  ctx.strokeStyle = 'rgba(235, 175, 130, 0.22)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 45; i++) {
    const x1 = (i * 97) % 512;
    const y1 = (i * 53) % 512;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1 + ((i % 3) - 1) * 45, y1 + ((i % 2) ? 38 : -38));
    ctx.stroke();
  }

  // High-frequency regolith pebbles, clasts & micro-shadows
  for (let i = 0; i < 3800; i++) {
    const x = (i * 173) % 512;
    const y = (i * 311) % 512;
    const size = (i % 3) + 1;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(25, 10, 5, 0.35)' : 'rgba(220, 140, 95, 0.28)';
    ctx.fillRect(x, y, size, size);
  }

  return canvas.toDataURL('image/png');
}

export default function MarsMap({
  hourMtc,
  dustDevilActive,
  speAlertActive,
  onSelectTarget
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const evaMarkerRef = useRef(null);
  const clickPinRef = useRef(null);
  const weatherMarkersRef = useRef([]);
  const latestPropsRef = useRef({ hourMtc, dustDevilActive, onSelectTarget });
  latestPropsRef.current = { hourMtc, dustDevilActive, onSelectTarget };

  const [layerMode, setLayerMode] = useState('CTX_HD'); // CTX_HD | ALBEDO | MOLA_RELIEF
  const [is3DPitch, setIs3DPitch] = useState(true);
  const [autoOrbit, setAutoOrbit] = useState(false);
  const [weatherOverlayOn, setWeatherOverlayOn] = useState(true);

  const [cursorTelemetry, setCursorTelemetry] = useState({
    lat: -4.6500,
    lng: 137.4000,
    elev: -4425,
    slope: 8.4,
    inertia: 420
  });

  const evaPos = getAstronautPosition(hourMtc, dustDevilActive);

  useEffect(() => {
    if (mapRef.current) return;

    const {
      hourMtc: initialHourMtc,
      dustDevilActive: initialDustDevilActive
    } = latestPropsRef.current;
    const initialEvaPos = getAstronautPosition(initialHourMtc, initialDustDevilActive);
    const microTextureUrl = createHighDetailMarsTextureDataURL();

    const mapStyle = {
      version: 8,
      sources: {
        'mars-albedo': {
          type: 'raster',
          tiles: [
            'https://cartocdn-gusc.global.ssl.fastly.net/opmbuilder/api/v1/map/named/opm-mars-basemap-v0-2/all/{z}/{x}/{y}.png'
          ],
          tileSize: 256,
          maxzoom: 9
        },
        'mars-ctx-hd': {
          type: 'raster',
          tiles: [
            'https://trek.nasa.gov/tiles/Mars/EQ/CTX_beta01_uncontrolled_5m_Caltech/1.0.0/default/default028mm/{z}/{y}/{x}.png'
          ],
          tileSize: 256,
          maxzoom: 12
        },
        'mars-mola': {
          type: 'raster',
          tiles: [
            'https://trek.nasa.gov/tiles/Mars/EQ/Mars_MGS_MOLA_ClrShade_merge_global_463m/1.0.0/default/default028mm/{z}/{y}/{x}.jpg'
          ],
          tileSize: 256,
          maxzoom: 7
        },
        // High-Resolution Procedural Surface Regolith Overlay over the Gale Sector
        'mars-micro-detail': {
          type: 'image',
          url: microTextureUrl,
          coordinates: [
            [137.382, -4.634],
            [137.422, -4.634],
            [137.422, -4.664],
            [137.382, -4.664]
          ]
        },
        'topo-contours': {
          type: 'geojson',
          data: TOPO_CONTOURS_GEOJSON
        },
        'weather-vectors': {
          type: 'geojson',
          data: generateWeatherGridGeoJSON(initialHourMtc, initialDustDevilActive)
        },
        'extruded-terrain': {
          type: 'geojson',
          data: EXTRUDED_3D_FEATURES
        },
        'nominal-route': {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: { type: 'LineString', coordinates: NOMINAL_ROUTE_LNGLAT }
          }
        },
        'abort-route': {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: { type: 'LineString', coordinates: ABORT_ROUTE_LNGLAT }
          }
        },
        'spe-shelter-zone': {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                properties: { type: 'SAFE' },
                geometry: {
                  type: 'Polygon',
                  coordinates: [[
                    [137.3895, -4.6440],
                    [137.3945, -4.6440],
                    [137.3945, -4.6480],
                    [137.3895, -4.6480],
                    [137.3895, -4.6440]
                  ]]
                }
              }
            ]
          }
        }
      },
      layers: [
        {
          id: 'mars-albedo-layer',
          type: 'raster',
          source: 'mars-albedo',
          paint: {
            'raster-contrast': 0.28,
            'raster-saturation': -0.08,
            'raster-brightness-max': 0.92
          }
        },
        {
          id: 'mars-ctx-layer',
          type: 'raster',
          source: 'mars-ctx-hd',
          paint: {
            'raster-opacity': 0.72,
            'raster-contrast': 0.42
          }
        },
        {
          id: 'mars-mola-layer',
          type: 'raster',
          source: 'mars-mola',
          layout: { visibility: 'none' },
          paint: { 'raster-opacity': 0.88 }
        },
        // Crisp Micro-Surface Regolith Texture Layer
        {
          id: 'mars-micro-layer',
          type: 'raster',
          source: 'mars-micro-detail',
          paint: {
            'raster-opacity': 0.36,
            'raster-contrast': 0.45
          }
        },
        // Fine Topographic Contour Lines
        {
          id: 'topo-contour-lines',
          type: 'line',
          source: 'topo-contours',
          paint: {
            'line-color': ['case', ['get', 'major'], '#38BDF8', '#A1A1AA'],
            'line-width': ['case', ['get', 'major'], 1.3, 0.7],
            'line-opacity': ['case', ['get', 'major'], 0.35, 0.18],
            'line-dasharray': [3, 2]
          }
        },
        // Live Wind Vector Arrows
        {
          id: 'weather-vector-lines',
          type: 'line',
          source: 'weather-vectors',
          paint: {
            'line-color': '#38BDF8',
            'line-width': 1.6,
            'line-opacity': 0.65
          }
        },
        {
          id: 'spe-safe-fill',
          type: 'fill',
          source: 'spe-shelter-zone',
          layout: { visibility: 'none' },
          paint: {
            'fill-color': '#10B981',
            'fill-opacity': 0.28
          }
        },
        {
          id: 'nominal-route-glow',
          type: 'line',
          source: 'nominal-route',
          paint: {
            'line-color': '#06B6D4',
            'line-width': 8,
            'line-blur': 6,
            'line-opacity': 0.35
          }
        },
        {
          id: 'nominal-route-line',
          type: 'line',
          source: 'nominal-route',
          paint: {
            'line-color': '#06B6D4',
            'line-width': 3,
            'line-opacity': 0.95
          }
        },
        {
          id: 'abort-route-line',
          type: 'line',
          source: 'abort-route',
          layout: { visibility: 'none' },
          paint: {
            'line-color': '#F59E0B',
            'line-width': 4,
            'line-dasharray': [2, 1.5]
          }
        },
        // Multi-Tiered 3D Architectural & Geological Meshes (with true base + height)
        {
          id: '3d-mars-structures',
          type: 'fill-extrusion',
          source: 'extruded-terrain',
          paint: {
            'fill-extrusion-color': ['get', 'color'],
            'fill-extrusion-height': ['get', 'height'],
            'fill-extrusion-base': ['get', 'base'],
            'fill-extrusion-opacity': 0.9
          }
        }
      ]
    };

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: mapStyle,
      center: [137.4015, -4.6490],
      zoom: 14.6,
      pitch: 62,
      bearing: -22,
      maxPitch: 78,
      attributionControl: false
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'bottom-right');

    map.on('mousemove', (e) => {
      const { lng, lat } = e.lngLat;
      const elev = Math.round(-4425 + Math.sin(lat * 900) * 35 + Math.cos(lng * 900) * 28);
      const slope = +(Math.abs(Math.cos(lat * 1200) * 16 + Math.sin(lng * 1100) * 6)).toFixed(1);
      const inertia = Math.round(410 + Math.sin((lat + lng) * 800) * 75);
      setCursorTelemetry({
        lat: +lat.toFixed(5),
        lng: +lng.toFixed(5),
        elev,
        slope,
        inertia
      });
    });

    // Click Anywhere for Instant Curiosity Mastcam Surface Recon
    map.on('click', (e) => {
      const { lng, lat } = e.lngLat;
      const reconData = getSurfaceReconAtLngLat(lng, lat);
      latestPropsRef.current.onSelectTarget(reconData);

      if (clickPinRef.current) {
        clickPinRef.current.remove();
      }

      const pinEl = document.createElement('div');
      pinEl.innerHTML = `
        <div class="flex flex-col items-center pointer-events-none">
          <div class="rounded border border-amber-400 bg-zinc-950/95 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-300 shadow-lg">
            ${reconData.code} [${lat.toFixed(4)}°, ${lng.toFixed(4)}°]
          </div>
          <div class="h-3 w-[1.5px] bg-amber-400"></div>
          <div class="h-3 w-3 rounded-full border-2 border-amber-400 bg-amber-400/30 animate-ping"></div>
        </div>
      `;

      clickPinRef.current = new maplibregl.Marker({ element: pinEl, anchor: 'bottom' })
        .setLngLat([lng, lat])
        .addTo(map);
    });

    // 1. Habitat Compound Label
    const habEl = document.createElement('div');
    habEl.innerHTML = `
      <div class="flex items-center gap-1.5 rounded border border-zinc-200 bg-zinc-950/95 px-2 py-0.5 font-mono text-[10px] font-semibold text-zinc-100 shadow-lg">
        <span class="h-2 w-2 rounded-full bg-cyan-400"></span>
        HAB-01 BASE COMPOUND
      </div>
    `;
    new maplibregl.Marker({ element: habEl, anchor: 'bottom', offset: [0, -28] })
      .setLngLat(HABITAT_LNG_LAT)
      .addTo(map);

    // 2. Science Target Markers
    SCIENCE_TARGETS.forEach((target) => {
      const isShelter = target.id === 'GAMMA';
      const el = document.createElement('div');
      el.className = 'cursor-pointer';
      el.innerHTML = `
        <div class="group flex items-center gap-1.5 rounded border ${
          isShelter ? 'border-amber-400/80' : 'border-cyan-500/60'
        } bg-zinc-950/90 px-2 py-0.5 font-mono text-[10px] font-semibold text-zinc-100 shadow-md transition hover:scale-105">
          <span class="h-2 w-2 rounded-full ${
            isShelter ? 'bg-amber-400' : 'bg-cyan-400'
          }"></span>
          <span>${target.code} // ${target.id}</span>
        </div>
      `;
      el.addEventListener('click', (ev) => {
        ev.stopPropagation();
        latestPropsRef.current.onSelectTarget(target);
        map.flyTo({
          center: target.lngLat,
          zoom: 15.6,
          pitch: 68,
          bearing: isShelter ? 40 : -30,
          duration: 1300
        });
      });

      new maplibregl.Marker({ element: el, anchor: 'bottom', offset: [0, -25] })
        .setLngLat(target.lngLat)
        .addTo(map);
    });

    // 3. MEDA Weather Station Pods on Map
    WEATHER_STATIONS.forEach((ws) => {
      const wsEl = document.createElement('div');
      wsEl.className = 'weather-pod-marker pointer-events-none';
      wsEl.innerHTML = `
        <div class="rounded border border-sky-500/40 bg-zinc-950/85 px-1.5 py-0.5 font-mono text-[9px] text-sky-300 shadow backdrop-blur-sm">
          <div class="font-bold text-sky-400">${ws.id}</div>
          <div class="ws-readout text-[8px] text-zinc-300">618 Pa | 7.4 m/s</div>
        </div>
      `;
      const marker = new maplibregl.Marker({ element: wsEl, anchor: 'center' })
        .setLngLat(ws.lngLat)
        .addTo(map);
      weatherMarkersRef.current.push({ marker, ws, el: wsEl });
    });

    // 4. Live Moving Astronaut Marker (EVA-01)
    const evaEl = document.createElement('div');
    evaEl.innerHTML = `
      <div class="relative flex items-center justify-center">
        <div class="eva-pulse relative flex items-center gap-1.5 rounded-full border border-cyan-300 bg-cyan-950/95 px-2.5 py-0.5 font-mono text-[10px] font-bold text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.8)]">
          <span class="h-2 w-2 rounded-full bg-cyan-300"></span>
          EVA-01
        </div>
      </div>
    `;
    const evaMarker = new maplibregl.Marker({ element: evaEl, anchor: 'center' })
      .setLngLat([initialEvaPos.lng, initialEvaPos.lat])
      .addTo(map);

    evaMarkerRef.current = evaMarker;
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      evaMarkerRef.current = null;
      clickPinRef.current = null;
      weatherMarkersRef.current = [];
    };
  }, []);

  // Update EVA-01 Position + Dynamic Wind Vectors & Weather Pods when Time or Vortex Changes
  useEffect(() => {
    if (evaMarkerRef.current) {
      evaMarkerRef.current.setLngLat([evaPos.lng, evaPos.lat]);
    }

    const map = mapRef.current;
    if (map && map.isStyleLoaded()) {
      const weatherSource = map.getSource('weather-vectors');
      if (weatherSource) {
        weatherSource.setData(generateWeatherGridGeoJSON(hourMtc, dustDevilActive));
      }
      if (map.getLayer('weather-vector-lines')) {
        map.setPaintProperty(
          'weather-vector-lines',
          'line-color',
          dustDevilActive ? '#F59E0B' : '#38BDF8'
        );
      }
    }

    // Update live MEDA Weather Station Pod readouts
    const diurnal = Math.sin(((hourMtc - 6) / 12) * Math.PI);
    weatherMarkersRef.current.forEach(({ ws, el }) => {
      const p = Math.round(638 - diurnal * 34 - ws.elevOffset * 0.5);
      const w = ((3.5 + diurnal * 9.5) * ws.windMultiplier + (dustDevilActive ? 16 : 0)).toFixed(1);
      const t = Math.round(196 + diurnal * 50);
      const readout = el.querySelector('.ws-readout');
      if (readout) {
        readout.textContent = `${p}Pa · ${w}m/s · ${t}K`;
      }
    });
  }, [hourMtc, dustDevilActive, evaPos.lng, evaPos.lat]);

  // Toggle Weather Radar Layer & MEDA Pods
  useEffect(() => {
    const map = mapRef.current;
    if (map && map.isStyleLoaded() && map.getLayer('weather-vector-lines')) {
      map.setLayoutProperty(
        'weather-vector-lines',
        'visibility',
        weatherOverlayOn ? 'visible' : 'none'
      );
    }
    weatherMarkersRef.current.forEach(({ el }) => {
      el.style.display = weatherOverlayOn ? 'block' : 'none';
    });
  }, [weatherOverlayOn]);

  // Switch Base Map Imagery Layers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    map.setLayoutProperty(
      'mars-ctx-layer',
      'visibility',
      layerMode === 'CTX_HD' ? 'visible' : 'none'
    );
    map.setLayoutProperty(
      'mars-mola-layer',
      'visibility',
      layerMode === 'MOLA_RELIEF' ? 'visible' : 'none'
    );
  }, [layerMode]);

  // Emergency Layer Updates
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const applyLayers = () => {
      if (!map.getLayer('abort-route-line')) return;
      map.setLayoutProperty(
        'abort-route-line',
        'visibility',
        dustDevilActive ? 'visible' : 'none'
      );
      map.setPaintProperty(
        'nominal-route-line',
        'line-opacity',
        dustDevilActive ? 0.3 : 0.95
      );
      map.setLayoutProperty(
        'spe-safe-fill',
        'visibility',
        speAlertActive ? 'visible' : 'none'
      );
    };

    if (map.isStyleLoaded()) {
      applyLayers();
    } else {
      map.once('load', applyLayers);
    }
  }, [dustDevilActive, speAlertActive]);

  // 360° Orbit Camera Loop
  useEffect(() => {
    if (!autoOrbit || !mapRef.current) return;
    let animId;
    const rotateCamera = () => {
      if (mapRef.current) {
        mapRef.current.rotateTo((mapRef.current.getBearing() + 0.18) % 360, {
          duration: 0
        });
      }
      animId = requestAnimationFrame(rotateCamera);
    };
    animId = requestAnimationFrame(rotateCamera);
    return () => cancelAnimationFrame(animId);
  }, [autoOrbit]);

  const toggle3DView = () => {
    const map = mapRef.current;
    if (!map) return;
    const next3D = !is3DPitch;
    setIs3DPitch(next3D);
    map.easeTo({
      pitch: next3D ? 62 : 0,
      bearing: next3D ? -22 : 0,
      duration: 800
    });
  };

  return (
    <div className="flex h-full w-full flex-col bg-[#09090B]">
      {/* DEDICATED TOP MAP SUB-TOOLBAR */}
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-zinc-800/90 bg-[#0C0D10] px-3 text-xs">
        <div className="flex items-center gap-3 overflow-x-auto font-mono text-[11px]">
          <div className="flex items-center gap-1.5 text-zinc-200">
            <Crosshair className="h-3.5 w-3.5 text-emerald-400" />
            <span>
              {cursorTelemetry.lat}°S, {cursorTelemetry.lng}°E
            </span>
          </div>
          <span className="text-zinc-700">|</span>
          <span className="text-zinc-400">
            ELEV <strong className="text-cyan-400">{cursorTelemetry.elev}m</strong>
          </span>
          <span className="text-zinc-400">
            SLOPE <strong className="text-zinc-200">{cursorTelemetry.slope}°</strong>
          </span>
          <span className="text-zinc-400">
            INERTIA <strong className="text-zinc-200">{cursorTelemetry.inertia} TIU</strong>
          </span>
          <span className="hidden xl:inline text-zinc-700">|</span>
          <span className="hidden xl:flex items-center gap-1 text-cyan-300">
            <Navigation className="h-3 w-3" />
            EVA-01 ({evaPos.progressPct}%)
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Weather Wind Vector Radar Toggle */}
          <button
            onClick={() => setWeatherOverlayOn((p) => !p)}
            className={`flex items-center gap-1.5 rounded border px-2.5 py-1 font-mono text-[11px] font-medium transition cursor-pointer ${
              weatherOverlayOn
                ? 'border-sky-500/60 bg-sky-950/60 text-sky-300'
                : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <CloudRainWind className="h-3 w-3" />
            Weather Radar
          </button>

          <button
            onClick={toggle3DView}
            className={`flex items-center gap-1.5 rounded border px-2.5 py-1 font-mono text-[11px] font-medium transition cursor-pointer ${
              is3DPitch
                ? 'border-cyan-500/60 bg-cyan-950/60 text-cyan-300'
                : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Eye className="h-3 w-3" />
            {is3DPitch ? '3D Tilt' : '2D Flat'}
          </button>

          <button
            onClick={() => setAutoOrbit((p) => !p)}
            className={`flex items-center gap-1.5 rounded border px-2.5 py-1 font-mono text-[11px] font-medium transition cursor-pointer ${
              autoOrbit
                ? 'border-amber-500/60 bg-amber-950/60 text-amber-300'
                : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <RotateCw className={`h-3 w-3 ${autoOrbit ? 'animate-spin' : ''}`} />
            Orbit
          </button>

          <div className="flex rounded border border-zinc-800 bg-zinc-900 p-0.5 font-mono text-[10px]">
            <button
              onClick={() => setLayerMode('CTX_HD')}
              className={`rounded px-2 py-0.5 transition cursor-pointer ${
                layerMode === 'CTX_HD'
                  ? 'bg-zinc-700 text-zinc-100 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              CTX HD
            </button>
            <button
              onClick={() => setLayerMode('ALBEDO')}
              className={`rounded px-2 py-0.5 transition cursor-pointer ${
                layerMode === 'ALBEDO'
                  ? 'bg-zinc-700 text-zinc-100 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Albedo
            </button>
            <button
              onClick={() => setLayerMode('MOLA_RELIEF')}
              className={`rounded px-2 py-0.5 transition cursor-pointer ${
                layerMode === 'MOLA_RELIEF'
                  ? 'bg-zinc-700 text-zinc-100 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              MOLA DEM
            </button>
          </div>
        </div>
      </div>

      {/* 3D WEBGL MAP CANVAS */}
      <div className="relative flex-1 w-full">
        <div ref={mapContainerRef} className="h-full w-full cursor-crosshair" />

        {/* Live Atmospheric & Weather Telemetry Card (Bottom-Left) */}
        <div className="pointer-events-none absolute bottom-3 left-3 z-[400] flex items-center gap-4 rounded border border-zinc-800/90 bg-zinc-950/90 px-3 py-1.5 font-mono text-[10px] text-zinc-300 backdrop-blur-md">
          <span className="text-sky-400 font-semibold">MEDA METEOROLOGY:</span>
          <span>5m CONTOUR GRID</span>
          <span>•</span>
          <span>WIND VECTORS: {weatherOverlayOn ? 'ACTIVE' : 'OFF'}</span>
          <span>•</span>
          <span className="text-zinc-400">CLICK ANY CRATER/RIDGE FOR MASTCAM RECON</span>
        </div>
      </div>
    </div>
  );
}