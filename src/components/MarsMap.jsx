import { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import {
  HABITAT_LNG_LAT,
  SCIENCE_TARGETS,
  NOMINAL_ROUTE_LNGLAT,
  ABORT_ROUTE_LNGLAT,
  EXTRUDED_3D_FEATURES,
  TOPO_CONTOURS_GEOJSON,
  getAstronautPosition,
  getSurfaceReconAtLngLat
} from '../data/marsData';
import { RotateCw, Eye, Navigation, Crosshair } from 'lucide-react';

maplibregl.setWorkerUrl(maplibreWorkerUrl);

export default function MarsMap({
  hourMtc,
  dustDevilActive,
  speAlertActive,
  selectedTarget,
  onSelectTarget
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const evaMarkerRef = useRef(null);
  const clickPinRef = useRef(null);

  const [layerMode, setLayerMode] = useState('CTX_HD');
  const [is3DPitch, setIs3DPitch] = useState(true);
  const [autoOrbit, setAutoOrbit] = useState(false);

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
        'topo-contours': {
          type: 'geojson',
          data: TOPO_CONTOURS_GEOJSON
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
            'raster-contrast': 0.22,
            'raster-saturation': -0.1,
            'raster-brightness-max': 0.95
          }
        },
        {
          id: 'mars-ctx-layer',
          type: 'raster',
          source: 'mars-ctx-hd',
          paint: {
            'raster-opacity': 0.65,
            'raster-contrast': 0.35
          }
        },
        {
          id: 'mars-mola-layer',
          type: 'raster',
          source: 'mars-mola',
          layout: { visibility: 'none' },
          paint: { 'raster-opacity': 0.88 }
        },
        {
          id: 'topo-contour-lines',
          type: 'line',
          source: 'topo-contours',
          paint: {
            'line-color': '#38BDF8',
            'line-width': 1,
            'line-opacity': 0.22,
            'line-dasharray': [3, 3]
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
        {
          id: '3d-mars-structures',
          type: 'fill-extrusion',
          source: 'extruded-terrain',
          paint: {
            'fill-extrusion-color': ['get', 'color'],
            'fill-extrusion-height': ['get', 'height'],
            'fill-extrusion-base': 0,
            'fill-extrusion-opacity': 0.8
          }
        }
      ]
    };

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: mapStyle,
      center: [137.4020, -4.6490],
      zoom: 14.3,
      pitch: 58,
      bearing: -18,
      maxPitch: 75,
      attributionControl: false
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'bottom-right');

    map.on('mousemove', (e) => {
      const { lng, lat } = e.lngLat;
      const elev = Math.round(-4425 + Math.sin(lat * 900) * 35 + Math.cos(lng * 900) * 28);
      const slope = +(
        Math.abs(Math.cos(lat * 1200) * 16 + Math.sin(lng * 1100) * 6)
      ).toFixed(1);
      const inertia = Math.round(410 + Math.sin((lat + lng) * 800) * 75);
      setCursorTelemetry({
        lat: +lat.toFixed(5),
        lng: +lng.toFixed(5),
        elev,
        slope,
        inertia
      });
    });

    map.on('click', (e) => {
      const { lng, lat } = e.lngLat;
      const reconData = getSurfaceReconAtLngLat(lng, lat);
      onSelectTarget(reconData);

      if (clickPinRef.current) {
        clickPinRef.current.remove();
      }

      const pinEl = document.createElement('div');
      pinEl.innerHTML = `
        <div class="pointer-events-none flex flex-col items-center">
          <div class="rounded border border-amber-400 bg-zinc-950/95 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-300 shadow-lg">
            ${reconData.code} [${lat.toFixed(4)}°, ${lng.toFixed(4)}°]
          </div>
          <div class="h-3 w-[1.5px] bg-amber-400"></div>
          <div class="h-3 w-3 animate-ping rounded-full border-2 border-amber-400 bg-amber-400/30"></div>
        </div>
      `;

      clickPinRef.current = new maplibregl.Marker({ element: pinEl, anchor: 'bottom' })
        .setLngLat([lng, lat])
        .addTo(map);
    });

    const habEl = document.createElement('div');
    habEl.innerHTML = `
      <div class="flex items-center gap-1.5 rounded border border-zinc-200 bg-zinc-950/95 px-2 py-1 font-mono text-[10px] font-semibold text-zinc-100 shadow-lg">
        <span class="h-2 w-2 rounded-full bg-cyan-400"></span>
        HAB-01 [3D DOME]
      </div>
    `;
    new maplibregl.Marker({ element: habEl, anchor: 'bottom' })
      .setLngLat(HABITAT_LNG_LAT)
      .addTo(map);

    SCIENCE_TARGETS.forEach((target) => {
      const isShelter = target.id === 'GAMMA';
      const el = document.createElement('div');
      el.className = 'cursor-pointer';
      el.innerHTML = `
        <div class="group flex items-center gap-1.5 rounded border ${
          isShelter ? 'border-emerald-500/70' : 'border-cyan-500/60'
        } bg-zinc-950/90 px-2 py-1 font-mono text-[10px] font-semibold text-zinc-100 shadow-md transition hover:scale-105">
          <span class="h-2 w-2 ${
            isShelter ? 'bg-emerald-400' : 'bg-cyan-400'
          } rounded-full"></span>
          <span>${target.code} // ${target.id}</span>
        </div>
      `;
      el.addEventListener('click', (ev) => {
        ev.stopPropagation();
        onSelectTarget(target);
        map.flyTo({
          center: target.lngLat,
          zoom: 15.1,
          pitch: 64,
          bearing: isShelter ? 35 : -25,
          duration: 1200
        });
      });

      new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat(target.lngLat)
        .addTo(map);
    });

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
      .setLngLat([evaPos.lng, evaPos.lat])
      .addTo(map);

    evaMarkerRef.current = evaMarker;
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (evaMarkerRef.current) {
      evaMarkerRef.current.setLngLat([evaPos.lng, evaPos.lat]);
    }
  }, [evaPos.lng, evaPos.lat]);

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
      pitch: next3D ? 60 : 0,
      bearing: next3D ? -20 : 0,
      duration: 800
    });
  };

  return (
    <div className="flex h-full w-full flex-col bg-[#09090B]">
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-zinc-800/90 bg-[#0C0D10] px-3 text-xs">
        <div className="flex items-center gap-4 overflow-x-auto font-mono text-[11px]">
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
          <span className="hidden text-zinc-700 xl:inline">|</span>
          <span className="hidden items-center gap-1 text-cyan-300 xl:flex">
            <Navigation className="h-3 w-3" />
            EVA-01 ({evaPos.progressPct}%)
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={toggle3DView}
            className={`flex cursor-pointer items-center gap-1.5 rounded border px-2.5 py-1 font-mono text-[11px] font-medium transition ${
              is3DPitch
                ? 'border-cyan-500/60 bg-cyan-950/60 text-cyan-300'
                : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Eye className="h-3 w-3" />
            {is3DPitch ? '3D Tilt (60°)' : '2D Flat'}
          </button>

          <button
            onClick={() => setAutoOrbit((p) => !p)}
            className={`flex cursor-pointer items-center gap-1.5 rounded border px-2.5 py-1 font-mono text-[11px] font-medium transition ${
              autoOrbit
                ? 'border-amber-500/60 bg-amber-950/60 text-amber-300'
                : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <RotateCw className={`h-3 w-3 ${autoOrbit ? 'animate-spin' : ''}`} />
            360° Orbit
          </button>

          <div className="flex rounded border border-zinc-800 bg-zinc-900 p-0.5 font-mono text-[10px]">
            <button
              onClick={() => setLayerMode('CTX_HD')}
              className={`cursor-pointer rounded px-2 py-0.5 transition ${
                layerMode === 'CTX_HD'
                  ? 'bg-zinc-700 font-semibold text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              CTX 5m HD
            </button>
            <button
              onClick={() => setLayerMode('ALBEDO')}
              className={`cursor-pointer rounded px-2 py-0.5 transition ${
                layerMode === 'ALBEDO'
                  ? 'bg-zinc-700 font-semibold text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Albedo
            </button>
            <button
              onClick={() => setLayerMode('MOLA_RELIEF')}
              className={`cursor-pointer rounded px-2 py-0.5 transition ${
                layerMode === 'MOLA_RELIEF'
                  ? 'bg-zinc-700 font-semibold text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              MOLA DEM
            </button>
          </div>
        </div>
      </div>

      <div className="relative w-full flex-1">
        <div ref={mapContainerRef} className="h-full w-full cursor-crosshair" />
        <div className="pointer-events-none absolute bottom-3 left-3 z-[400] rounded border border-zinc-800/90 bg-zinc-950/85 px-2.5 py-1 font-mono text-[10px] text-zinc-400 backdrop-blur-md">
          CLICK ANYWHERE ON SURFACE TO CAPTURE CURIOSITY MASTCAM RECON • RIGHT-CLICK DRAG TO ORBIT 3D
        </div>
      </div>
    </div>
  );
}
