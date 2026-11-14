#!/usr/bin/env python3
"""Independent NASA-only UI/data integrity checks for the Phase 1 field atlas."""
import json
import re
import unittest
import xml.etree.ElementTree as ET
from pathlib import Path
from PIL import Image, ImageStat

ROOT = Path(__file__).resolve().parent
DATA = ROOT / 'data'

class Phase1QualityTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.html = (ROOT / 'index.html').read_text(encoding='utf-8')
        cls.manifest = json.loads((DATA / 'ctx_tile_manifest.json').read_text())

    def test_manifest_records_thirty_real_service_tiles(self):
        m = self.manifest
        self.assertEqual(m['tiles_expected'], 30)
        self.assertEqual(m['tiles_fetched_and_image_checked'], 30)
        self.assertEqual(len(m['tile_records']), 30)
        self.assertTrue(all(t['http_status'] == 200 for t in m['tile_records']))
        self.assertTrue(all(t['content_type'].startswith('image/png') for t in m['tile_records']))
        self.assertEqual(len({t['sha256'] for t in m['tile_records']}), 30)

    def test_all_source_tiles_are_decodable_512_pixel_pngs(self):
        for tile in self.manifest['tile_records']:
            p = ROOT / tile['file']
            self.assertTrue(p.is_file(), p)
            self.assertEqual(p.stat().st_size, tile['bytes'])
            with Image.open(p) as image:
                image.load()
                self.assertEqual(image.format, 'PNG')
                self.assertEqual(image.size, (512, 512))
                self.assertGreater(ImageStat.Stat(image).stddev[0], 0)

    def test_display_raster_has_declared_extent_and_real_pixels(self):
        p = DATA / 'gale_ctx_extended_z12.png'
        with Image.open(p) as image:
            image.load()
            self.assertEqual(image.size, tuple(self.manifest['extended_crop_dimensions_px']))
            self.assertGreater(ImageStat.Stat(image).stddev[0], 0)
        self.assertEqual(self.manifest['map_bounds'], {
            'lon_min': 137.22, 'lon_max': 137.42, 'lat_min': -4.93, 'lat_max': -4.75})
        self.assertAlmostEqual(self.manifest['effective_resolution_m_per_pixel_at_gale'], 5.078, places=2)

    def test_nasa_mars_trek_capabilities_points_to_fetched_service(self):
        root = ET.parse(ROOT / 'caps.dat').getroot()
        templates = [node.attrib.get('template', '') for node in root.iter()
                     if node.tag.endswith('ResourceURL')]
        self.assertTrue(any('astro.arcgis.com/arcgis/rest/services/OnMars/CTX/MapServer/tile/' in t
                            for t in templates))
        metadata = json.loads((ROOT / 'arcgis.dat').read_text())
        self.assertEqual(metadata['spatialReference']['wkid'], 104971)
        self.assertIn('CTX', metadata['mapName'])

    def test_map_references_downloaded_local_assets(self):
        for rel in ['gale_ctx_extended_z12.png', 'gale_mola_tile_level5.jpg']:
            self.assertIn(rel, self.html)
            self.assertTrue((ROOT / rel).is_file())
        self.assertIn('ctx_tile_manifest.json', self.html)

    def test_external_coordinates_are_withheld_until_crs_is_reconciled(self):
        audit = self.manifest['spatial_reference_audit']
        self.assertEqual(audit['arcgis_mapserver_declared_wkid'], 104971)
        self.assertIn('104905', audit['nasa_mars_trek_wmts_supported_crs'])
        self.assertEqual(audit['status'], 'unresolved_mismatch')
        self.assertFalse(audit['external_coordinate_overlays_drawn'])
        self.assertIn('not placed', self.html.lower())
        self.assertIn('pending crs check', self.html.lower())
        self.assertNotIn('id="aoiRect"', self.html)
        self.assertNotIn('<circle', self.html)
        self.assertIn('pointermove', self.html)

    def test_public_layer_registry_marks_unplaced_products_and_missing_metrics(self):
        registry = json.loads((ROOT / 'phase1_layers.json').read_text())
        layers = {layer['id']: layer for layer in registry['layers']}
        self.assertEqual(layers['hirise_observation_metadata']['georeferenced_footprint_loaded'], False)
        self.assertEqual(layers['hirise_observation_metadata']['downloaded_image'], False)
        self.assertEqual(layers['mastcam_panorama_metadata']['georeferenced_in_viewer'], False)
        self.assertIn('not numeric elevation', layers['mola_shaded_relief_context']['data_type'].lower())
        self.assertIn('walking_scale_slopes', registry['unsupported_operational_fields'])
        self.assertIn('ctx_tile_manifest.json', self.html)
        self.assertTrue((ROOT / 'ctx_tile_manifest.json').is_file())

    def test_verified_sample_does_not_retain_old_resolution_or_footprint_claims(self):
        sample = json.loads((ROOT / 'phase1_verified_sample.json').read_text())
        self.assertEqual(sample['displayed_ctx']['zoom'], 12)
        self.assertEqual(sample['displayed_ctx']['tiles_fetched_and_decoded'], 30)
        self.assertIn('not a numeric dem', sample['displayed_ctx']['image_type'].lower())
        self.assertFalse(sample['hirise']['georeferenced_footprint_loaded'])
        self.assertFalse(sample['hirise']['coverage_asserted_in_viewer'])
        self.assertIn('not plotted', sample['curiosity_waypoint']['use'].lower())
        self.assertIn('numeric_dem', sample['unavailable_or_omitted'])

    def test_unverified_shapes_and_operational_synthetic_outputs_are_absent(self):
        banned = [
            'Areoid 0m Geodetic Datum Contour',
            'bezierCurveTo',
            'HiRISE PSP_001752_1750 Swath Footprint',
            'Walking-scale slopes:',
            'Surface Footprint:',
            'Regional Elevation:',
        ]
        for phrase in banned:
            self.assertNotIn(phrase, self.html)
        self.assertIn('No substitute values are generated', self.html)
        self.assertIn('verified footprint are not loaded', self.html)
        self.assertIn('Image only', self.html)

    def test_viewer_keeps_assets_local_and_is_mobile_responsive(self):
        self.assertNotRegex(self.html, r'<script[^>]+src=')
        self.assertNotRegex(self.html, r'<link[^>]+stylesheet')
        self.assertIn('@media(max-width:760px)', self.html)
        self.assertIn('ResizeObserver', self.html)
        self.assertIn('pending CRS check', self.html)
        self.assertIn('Mars CRS mismatch', self.html)

    def test_crs_discrepancy_magnitude_and_withholding_rationale(self):
        """Verify the arithmetic of the theoretical latitudinal shift between
        IAU 2000 Mars planetographic (ellipsoid) and planetocentric (sphere)
        datums at Gale Crater (-4.843°), demonstrating a potential ~3.35 km
        geodetic divergence that justifies withholding vector overlays pending
        service semantics confirmation and ground-control point validation."""
        import math
        # ESRI:104905 Mars 2000 oblate ellipsoid: a=3396190 m, b=3376200 m
        # WKID:104971 Mars 2000 sphere: R=3396190 m
        a, b = 3396190.0, 3376200.0
        lat_g_deg = -4.843  # target planetographic latitude
        lat_g_rad = math.radians(lat_g_deg)
        # tan(phi_c) = (b/a)^2 * tan(phi_g)
        lat_c_rad = math.atan(((b / a) ** 2) * math.tan(lat_g_rad))
        lat_c_deg = math.degrees(lat_c_rad)
        delta_deg = abs(lat_g_deg - lat_c_deg)
        displacement_m = delta_deg * (math.pi / 180.0) * a
        # Theoretical divergence at Gale is ~0.0566 deg (~3,353.7 m)
        self.assertAlmostEqual(delta_deg, 0.05658, places=3)
        self.assertGreater(displacement_m, 3300.0)
        self.assertLess(displacement_m, 3400.0)
        self.assertIn('external coordinate overlays withheld', self.html.lower())

    def test_mola_asset_is_rendered_jpeg_not_numeric_dem(self):
        p = ROOT / 'gale_mola_tile_level5.jpg'
        self.assertTrue(p.is_file())
        with Image.open(p) as img:
            self.assertEqual(img.format, 'JPEG')
            self.assertEqual(img.mode, 'RGB')
            self.assertEqual(img.size, (256, 256))
        self.assertIn('not elevation samples', self.html.lower())
        self.assertIn('no contour is derived', self.html.lower())

    def test_aoi_geometry_and_curiosity_distance_calculation(self):
        import math
        r_vol = 3389.5  # Mars volumetric mean radius in km
        lat_min, lat_max = -4.90, -4.78
        lon_min, lon_max = 137.24, 137.36
        lat_center, lon_center = -4.843, 137.298
        ns_km = (lat_max - lat_min) * (math.pi / 180.0) * r_vol
        ew_km = (lon_max - lon_min) * (math.pi / 180.0) * r_vol * math.cos(math.radians(lat_center))
        area_km2 = ns_km * ew_km
        self.assertAlmostEqual(ns_km, 7.10, places=2)
        self.assertAlmostEqual(ew_km, 7.07, places=2)
        self.assertAlmostEqual(area_km2, 50.2, places=1)

        # Distance to Curiosity Sol 4452 (-4.7872261, 137.3926205)
        c_lat, c_lon = -4.7872261, 137.3926205
        phi1, phi2 = math.radians(lat_center), math.radians(c_lat)
        dphi = math.radians(c_lat - lat_center)
        dlam = math.radians(c_lon - lon_center)
        h = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlam/2)**2
        dist_km = r_vol * 2 * math.atan2(math.sqrt(h), math.sqrt(1-h))
        self.assertAlmostEqual(dist_km, 6.48, places=2)

    def test_judge_walkthrough_and_crop_toggle_implemented(self):
        self.assertIn('judgeTourBtn', self.html)
        self.assertIn('cropToggleBtn', self.html)
        self.assertIn('gale_ctx_aoi_z12.png', self.html)
        aoi_file = ROOT / 'gale_ctx_aoi_z12.png'
        self.assertTrue(aoi_file.is_file())
        with Image.open(aoi_file) as img:
            self.assertEqual(img.size, (1398, 1398))
            self.assertEqual(img.format, 'PNG')
            self.assertEqual(img.mode, 'L')
        self.assertIn('Step 1: Real NASA Orbital Pixels', self.html)
        self.assertIn('Step 2: Nominal 7.1 km Study Box Crop', self.html)
        self.assertIn('Step 3: Audited 3.35 km Geodetic Discrepancy', self.html)
        self.assertIn('Step 4: MOLA Shaded Relief vs Numeric DEM', self.html)

    def test_official_presentation_and_slides_exist(self):
        pptx_path = ROOT / 'AETHON_7Slide_Presentation.pptx'
        slides_path = ROOT / 'slides.html'
        self.assertTrue(pptx_path.is_file())
        self.assertGreater(pptx_path.stat().st_size, 500000)
        self.assertTrue(slides_path.is_file())
        slides_html = slides_path.read_text(encoding='utf-8')
        slide_sections = re.findall(r'<section class="slide', slides_html)
        self.assertEqual(len(slide_sections), 7)
        self.assertIn('Slide 1 of 7', slides_html)
        self.assertIn('7 Slides Exactly', slides_html)

if __name__ == '__main__':
    unittest.main(verbosity=2)