#!/usr/bin/env python3
"""Fetch and mosaic actual Mars Trek/Caltech MRO CTX tiles for the Phase 1 AOI."""
from pathlib import Path
from urllib.request import Request, urlopen
from PIL import Image
import json, math, hashlib, shutil
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parent
DATA = ROOT / 'data'
DATA.mkdir(exist_ok=True)
# Build a regional service-grid crop around the selected Gale study coordinates; external coordinate overlays remain withheld.
BOUNDS = {'lon_min': 137.22, 'lon_max': 137.42, 'lat_min': -4.93, 'lat_max': -4.75}
Z = 12
MATRIX_W = 64 * (2 ** (Z - 5))
MATRIX_H = 32 * (2 ** (Z - 5))
span_lon = 360 / MATRIX_W
span_lat = 180 / MATRIX_H
pix_deg = span_lon / 512

def col(lon): return math.floor((lon + 180) / span_lon)
def row(lat): return math.floor((90 - lat) / span_lat)

c0, c1 = col(BOUNDS['lon_min']), col(BOUNDS['lon_max'] - 1e-12)
r0, r1 = row(BOUNDS['lat_max']), row(BOUNDS['lat_min'] + 1e-12)
records = []
for r in range(r0, r1 + 1):
    for c in range(c0, c1 + 1):
        url = f'https://astro.arcgis.com/arcgis/rest/services/OnMars/CTX/MapServer/tile/{Z}/{r}/{c}'
        path = DATA / f'ctx_z{Z}_{r}_{c}.png'
        request = Request(url, headers={'User-Agent': 'AETHON-Phase1-NASA-CTX/1.0'})
        with urlopen(request, timeout=25) as response:
            payload = response.read()
            status = response.status
            content_type = response.headers.get('Content-Type', '')
        path.write_bytes(payload)
        with Image.open(path) as image:
            image.load()
            assert image.format == 'PNG' and image.size == (512, 512), (path, image.format, image.size)
            extrema = image.getextrema()
        records.append({
            'zoom': Z, 'row': r, 'col': c, 'url': url,
            'http_status': status, 'content_type': content_type,
            'file': str(path.relative_to(ROOT)), 'bytes': len(payload),
            'sha256': hashlib.sha256(payload).hexdigest(), 'dimensions_px': [512,512],
            'mode': 'L', 'pixel_extrema': list(extrema),
        })

width = (c1 - c0 + 1) * 512
height = (r1 - r0 + 1) * 512
mosaic = Image.new('L', (width, height))
for item in records:
    image = Image.open(ROOT / item['file']).convert('L')
    mosaic.paste(image, ((item['col'] - c0) * 512, (item['row'] - r0) * 512))

# Tile matrix origin is (-180, 90), equirectangular, east-positive.
lon_left = -180 + c0 * span_lon
lat_top = 90 - r0 * span_lat
x0 = round((BOUNDS['lon_min'] - lon_left) / pix_deg)
x1 = round((BOUNDS['lon_max'] - lon_left) / pix_deg)
y0 = round((lat_top - BOUNDS['lat_max']) / pix_deg)
y1 = round((lat_top - BOUNDS['lat_min']) / pix_deg)
aoi_image = mosaic.crop((x0, y0, x1, y1))
aoi_image.save(DATA / 'gale_ctx_extended_z12.png', optimize=True)

# Save the project AOI raster separately for the map panel, exact to the selected bounds.
aoi = {'lon_min': 137.24, 'lon_max': 137.36, 'lat_min': -4.90, 'lat_max': -4.78}
xa0 = round((aoi['lon_min'] - BOUNDS['lon_min']) / pix_deg)
xa1 = round((aoi['lon_max'] - BOUNDS['lon_min']) / pix_deg)
ya0 = round((BOUNDS['lat_max'] - aoi['lat_max']) / pix_deg)
ya1 = round((BOUNDS['lat_max'] - aoi['lat_min']) / pix_deg)
aoi_crop = aoi_image.crop((xa0, ya0, xa1, ya1))
aoi_crop.save(DATA / 'gale_ctx_aoi_z12.png', optimize=True)
# Keep the two assets referenced by the standalone HTML adjacent to index.html.
shutil.copy2(DATA / 'gale_ctx_extended_z12.png', ROOT / 'gale_ctx_extended_z12.png')
if (DATA / 'gale_mola_tile_level5.jpg').is_file():
    shutil.copy2(DATA / 'gale_mola_tile_level5.jpg', ROOT / 'gale_mola_tile_level5.jpg')

manifest = {
  'retrieved_utc': datetime.now(timezone.utc).isoformat(),
  'data_policy': 'NASA mission data only; all raster pixels are fetched from NASA Mars Trek-linked MRO CTX MapServer tiles; no synthetic raster or modeled measurements.',
  'source': 'NASA Mars Reconnaissance Orbiter Context Camera (CTX) uncontrolled mosaic, Bruce Murray Laboratory/Caltech service exposed by NASA Mars Trek WMTS ResourceURL',
  'service': 'https://astro.arcgis.com/arcgis/rest/services/OnMars/CTX/MapServer',
  'matrix_set': 'ArcGIS REST MapServer tile grid, east-positive geographic degrees; see spatial_reference_audit',
  'zoom': Z, 'matrix_width': MATRIX_W, 'matrix_height': MATRIX_H,
  'tile_span_deg': {'longitude': span_lon, 'latitude': span_lat},
  'pixel_size_deg': pix_deg,
  'effective_resolution_m_per_pixel_at_gale': pix_deg * math.pi / 180 * 3389.5 * 1000,
  'map_bounds': BOUNDS,
  'mosaic_dimensions_px': list(mosaic.size),
  'extended_crop_dimensions_px': list(aoi_image.size),
  'aoi_bounds': aoi,
  'aoi_crop_dimensions_px': list(aoi_crop.size),
  'tiles_expected': len(records), 'tiles_fetched_and_image_checked': len(records),
  'tile_records': records,
  'spatial_reference_audit': {
    'nasa_mars_trek_wmts_supported_crs': 'ESRI:104905 — Mars 2000 (oblate Mars 2000 ellipsoid)',
    'arcgis_mapserver_declared_wkid': 104971,
    'arcgis_mapserver_crs': 'Mars 2000 (Sphere)',
    'status': 'unresolved_mismatch',
    'external_coordinate_overlays_drawn': False,
    'consequence': 'AOI, HiRISE-center, and MSL waypoint coordinates are not overlaid on the CTX raster until service CRS/datum and transformations are reconciled and registration is validated.'
  },
  'caveats': [
    'This is actual orbital CTX imagery, not a DEM.',
    'At this zoom it supports regional geology/context, not meter-scale boxwork ridges, terrain slopes, or trafficability.',
    'Mars Trek WMTS advertises ESRI:104905 while the linked ArcGIS REST MapServer reports WKID 104971; no external coordinate annotations are drawn pending reconciliation.',
    'The PIA26559 panorama remains unplaced metadata and is not geolocated by this product.',
    'The displayed mosaic may contain visible source seams.'
  ]
}
(DATA / 'ctx_tile_manifest.json').write_text(json.dumps(manifest, indent=2))
shutil.copy2(DATA / 'ctx_tile_manifest.json', ROOT / 'ctx_tile_manifest.json')
print(f'z={Z}, rows={r0}..{r1}, cols={c0}..{c1}, tiles={len(records)}')
print('tile pixels checked:', all(x['http_status']==200 and x['content_type'].startswith('image/png') for x in records))
print('extended crop:', aoi_image.size, 'AOI crop:', aoi_crop.size)
print('effective m/px:', round(manifest['effective_resolution_m_per_pixel_at_gale'], 3))
print('files:', DATA/'gale_ctx_extended_z12.png', DATA/'gale_ctx_aoi_z12.png')
