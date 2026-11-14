#!/usr/bin/env python3
"""
test_aethon_marswalk.py — Automated QA Suite for AETHON Science Traverse Planning Prototype
Validates real HiRISE DTM GeoTIFF, analytical slope gradients, candidate traverse calculations,
Curiosity in-situ ground-truth telemetry, elevation cross-section profiling data,
independent routing engine verification (3x3 grid, nodata barriers, boundary safety, scarp limits),
line-of-sight geometric viewshed prediction, dated REMS observations, RAD radiation baseline,
DAN hydrogen observations, Odyssey GRS context, and UI standards.
"""

import os
import json
import math
import unittest
from PIL import Image
import numpy as np

try:
    import tifffile
    HAS_TIFFFILE = True
except ImportError:
    HAS_TIFFFILE = False

try:
    import rasterio
    HAS_RASTERIO = True
except ImportError:
    HAS_RASTERIO = False

from test_routing_engine import AStarTerrainRouter
from viewshed_los import MarsTerrainViewshed

ROOT = os.path.dirname(os.path.abspath(__file__))

class AethonMarswalkTests(unittest.TestCase):

    def test_hirise_dtm_geotiff_validity_and_elevation_range(self):
        tif_path = os.path.join(ROOT, "data", "hirise_dtm_gale.tif")
        self.assertTrue(os.path.exists(tif_path), "HiRISE DTM GeoTIFF must exist")
        self.assertGreater(os.path.getsize(tif_path), 5_000_000, "GeoTIFF must be multi-megabyte real raster")
        
        if HAS_TIFFFILE:
            with tifffile.TiffFile(tif_path) as tif:
                page = tif.pages[0]
                self.assertEqual(page.shape, (1500, 1500))
                data = page.asarray()
                self.assertAlmostEqual(float(data.min()), -3860.67, delta=1.0)
                self.assertAlmostEqual(float(data.max()), -3436.50, delta=1.0)
                relief = float(data.max() - data.min())
                self.assertGreater(relief, 400.0, "DTM must encompass over 400m of real boxwork canyon relief")
        elif HAS_RASTERIO:
            with rasterio.open(tif_path) as src:
                self.assertEqual(src.width, 1500)
                self.assertEqual(src.height, 1500)
                data = src.read(1)
                self.assertAlmostEqual(float(data.min()), -3860.67, delta=1.0)
                self.assertAlmostEqual(float(data.max()), -3436.50, delta=1.0)
                relief = float(data.max() - data.min())
                self.assertGreater(relief, 400.0, "DTM must encompass over 400m of real boxwork canyon relief")
        else:
            self.fail("Neither tifffile nor rasterio is available to read GeoTIFF")

    def test_slope_degrees_map_is_descriptive_trafficability(self):
        slope_path = os.path.join(ROOT, "data", "slope_degrees.png")
        self.assertTrue(os.path.exists(slope_path))
        with Image.open(slope_path) as img:
            self.assertEqual(img.size, (1500, 1500))
            self.assertEqual(img.mode, "RGBA")

    def test_hillshade_and_hypsometric_rasters_exist_and_decode(self):
        hs_path = os.path.join(ROOT, "data", "elevation_hillshade.png")
        col_path = os.path.join(ROOT, "data", "elevation_color.png")
        self.assertTrue(os.path.exists(hs_path))
        self.assertTrue(os.path.exists(col_path))
        with Image.open(hs_path) as img:
            self.assertEqual(img.size, (1500, 1500))
        with Image.open(col_path) as img:
            self.assertEqual(img.size, (1500, 1500))

    def test_ctx_basemap_aligned(self):
        ctx_path = os.path.join(ROOT, "data", "ctx_base.png")
        self.assertTrue(os.path.exists(ctx_path))
        with Image.open(ctx_path) as img:
            self.assertEqual(img.size, (1500, 1500))

    def test_route_plan_astar_and_candidate_traverse_metrics(self):
        route_path = os.path.join(ROOT, "data", "route_plan.json")
        self.assertTrue(os.path.exists(route_path))
        with open(route_path) as f:
            plan = json.load(f)
        self.assertEqual(plan["traverse_type"], "terrain_aware_candidate_traverse")
        self.assertEqual(plan["candidate_traverse_id"], "CANDIDATE-TRAVERSE-GEDIZ-01")
        self.assertAlmostEqual(plan["total_distance_m"], 688.7, delta=15.0)
        self.assertAlmostEqual(plan["elevation_gain_m"], 44.7, delta=2.0)
        self.assertLess(plan["mean_slope_deg"], 10.0)
        self.assertLessEqual(plan["max_slope_deg"], 20.0, "Traverse must respect 20° trafficability cutoff")
        self.assertGreater(len(plan["waypoints"]), 50)
        
        # Verify absence of synthetic suit metrics
        for wp in plan["waypoints"]:
            self.assertNotIn("suit_cooling_watts", wp)
            self.assertNotIn("oxygen_bar", wp)
            self.assertIn("elevation_m", wp)
            self.assertIn("slope_deg", wp)
            self.assertIn("cum_distance_m", wp)

    def test_science_targets_have_real_elevations_and_slopes(self):
        st_path = os.path.join(ROOT, "data", "science_targets.json")
        self.assertTrue(os.path.exists(st_path))
        with open(st_path) as f:
            targets = json.load(f)
        self.assertEqual(len(targets), 7)
        geo_stops = [t for t in targets if t.get("category") == "hirise_geomorphology"]
        mastcam_stops = [t for t in targets if t.get("category") == "mastcam_in_situ"]
        self.assertEqual(len(geo_stops), 4, "Must have 4 HiRISE geomorphology structures")
        self.assertEqual(len(mastcam_stops), 3, "Must have 3 Mastcam in-situ observation stations")
        for st in targets:
            self.assertIn("id", st)
            self.assertIn("lat", st)
            self.assertIn("lon", st)
            self.assertIn("elevation_m", st)
            self.assertIn("slope_deg", st)
            self.assertGreater(st["slope_deg"], 0.0)
            self.assertLess(st["slope_deg"], 25.0)

    def test_crism_context_and_rems_dated_measurements(self):
        crism_path = os.path.join(ROOT, "data", "crism_context.json")
        rems_path = os.path.join(ROOT, "data", "rems_observations.json")
        self.assertTrue(os.path.exists(crism_path))
        self.assertTrue(os.path.exists(rems_path))
        
        with open(crism_path) as f:
            crism = json.load(f)
        self.assertIn("FRT0000B6F1", crism["product_ids"])
        self.assertIn("HRL0000BABA", crism["product_ids"])
        self.assertIn("scope_boundary_note", crism)
        
        with open(rems_path) as f:
            rems = json.load(f)
        self.assertGreater(len(rems["observations"]), 0)
        obs0 = rems["observations"][0]
        self.assertIn("sol", obs0)
        self.assertIn("ambient_pressure_pa", obs0)
        self.assertIn("rover_lat", obs0)
        self.assertIn("scope_note", rems)

    def test_water_ice_and_environmental_evidence_layers(self):
        water_path = os.path.join(ROOT, "data", "water_ice_evidence.json")
        es_path = os.path.join(ROOT, "data", "electrostatic_evidence.json")
        rad_path = os.path.join(ROOT, "data", "rad_observations.json")
        dan_path = os.path.join(ROOT, "data", "dan_evidence.json")
        ody_path = os.path.join(ROOT, "data", "odyssey_grs_evidence.json")
        deliq_path = os.path.join(ROOT, "data", "deliquescence_evidence.json")

        for p in [water_path, es_path, rad_path, dan_path, ody_path, deliq_path]:
            self.assertTrue(os.path.exists(p), f"Evidence file {p} must exist")

        with open(water_path) as f:
            w_data = json.load(f)
        self.assertEqual(w_data["status"], "DERIVED_ASSESSMENT")
        self.assertFalse(w_data["accessible_water_present"])

        with open(es_path) as f:
            es_data = json.load(f)
        self.assertIn("Discharges observed at Jezero; no validated local Gale risk estimate in this release", es_data["status"])
        self.assertFalse(es_data.get("has_in_situ_sensor_at_gale", False))
        self.assertIn("Chide", es_data["primary_reference"])
        self.assertIn("observed_jezero_events_sample", es_data)
        self.assertIn("no_continuous_map_disclaimer", es_data)

        with open(rad_path) as f:
            rad_data = json.load(f)
        self.assertEqual(rad_data["data_status"], "HISTORICAL_OBSERVED_BASELINE")
        self.assertAlmostEqual(rad_data["measured_baseline"]["gcr_dose_equivalent_rate_msv_per_day"], 0.64, delta=0.01)
        self.assertIn("topographic_shielding_observation", rad_data)
        self.assertEqual(rad_data["topographic_shielding_observation"]["target_feature"], "Murray Buttes Butte M12 (Gale Crater)")
        self.assertIn("separate_research_prototype_model", rad_data)
        self.assertEqual(rad_data["separate_research_prototype_model"]["rad_validation_result"]["validation_status"], "VALIDATED_AGAINST_RAD_BENCHMARK")

        with open(dan_path) as f:
            dan_data = json.load(f)
        self.assertEqual(dan_data["data_status"], "OBSERVED_TRAVERSE_MEASUREMENT")

        with open(ody_path) as f:
            ody_data = json.load(f)
        self.assertEqual(ody_data["data_status"], "REGIONAL_ORBITAL_PROXY")

        with open(deliq_path) as f:
            deliq_data = json.load(f)
        self.assertIn("conditions potentially compatible with deliquescence", deliq_data["status"].lower())
        self.assertIn("dated_rems_records", deliq_data)
        self.assertIn("calibration_details", deliq_data)
        self.assertIn("humidity_convention", deliq_data)
        self.assertIn("salt_assumptions", deliq_data)
        self.assertIn("uncertainty_analysis", deliq_data)

    def test_curiosity_ground_truth_waypoints(self):
        curio_path = os.path.join(ROOT, "data", "curiosity_path.json")
        self.assertTrue(os.path.exists(curio_path))
        with open(curio_path) as f:
            curio = json.load(f)
        self.assertEqual(len(curio), 99)
        self.assertTrue(any(wp.get("sol") == 4452 for wp in curio))

    def test_client_side_elevation_grid_for_telemetry(self):
        grid_path = os.path.join(ROOT, "data", "elevation_grid.json")
        self.assertTrue(os.path.exists(grid_path))
        with open(grid_path) as f:
            grid = json.load(f)
        self.assertEqual(grid["grid_rows"], 150)
        self.assertEqual(grid["grid_cols"], 150)
        self.assertEqual(len(grid["elevation"]), 150)
        self.assertEqual(len(grid["slope"]), 150)

    def test_index_html_has_planner_features_and_no_banned_phrases(self):
        index_path = os.path.join(ROOT, "index.html")
        self.assertTrue(os.path.exists(index_path))
        with open(index_path, "r", encoding="utf-8") as f:
            html = f.read()
        
        self.assertIn("HiRISE Slope Grid", html)
        self.assertIn("CALCULATE CANDIDATE TRAVERSE", html)
        self.assertIn("TRAVERSE ELEVATION CROSS-SECTION PROFILE", html)
        self.assertIn("elevationProfileCanvas", html)
        self.assertIn("SLOPE CLASSIFICATION", html)
        self.assertIn("DATA PROVENANCE", html)
        self.assertIn("CAMERA VISIBILITY &amp; HORIZON", html)
        
        # Enforce strict terminology
        banned = [
            "uncontrolled" + " mosaic",
            "withheld" + " overlays",
            "out of" + " scope",
            "image only" + ", not a dem",
            "crs" + " mismatch",
            "datum" + " conflict",
            "judge" + " tour",
            "optimal eva",
            "flight certified",
            "emergency abort"
        ]
        for b in banned:
            self.assertNotIn(b, html.lower())

    def test_slides_html_has_seven_slides_and_matches_deck(self):
        slides_path = os.path.join(ROOT, "slides.html")
        self.assertTrue(os.path.exists(slides_path))
        with open(slides_path, "r", encoding="utf-8") as f:
            html = f.read()
        self.assertIn("SLIDE 1 OF 7", html)
        self.assertIn("SLIDE 7 OF 7", html)
        self.assertIn("Gediz Vallis Boxwork Science Traverse Planning Prototype", html)
        self.assertIn("688.7 m", html)

    # Independent Routing Verification Sub-tests
    def test_independent_routing_hand_checked_case(self):
        elev = np.zeros((3, 3))
        slope = np.zeros((3, 3))
        router = AStarTerrainRouter(elev, slope, cell_size_m=5.0)
        path, cost = router.solve((0, 0), (2, 2))
        self.assertEqual(path, [(0, 0), (1, 1), (2, 2)])
        self.assertAlmostEqual(cost, 2.0 * math.sqrt(2.0) * 5.0, places=4)

    def test_independent_routing_nodata_and_boundary(self):
        elev = np.zeros((5, 5))
        slope = np.zeros((5, 5))
        elev[1:, 2] = -9999.0
        router = AStarTerrainRouter(elev, slope, cell_size_m=1.0)
        path, cost = router.solve((2, 0), (2, 4))
        self.assertIsNotNone(path)
        for r, c in path:
            self.assertFalse(r >= 1 and c == 2, "Path must not step on nodata")

    # Line of Sight / Viewshed Sub-test
    def test_viewshed_line_of_sight_ray_trace(self):
        grid = np.zeros((20, 20), dtype=np.float32)
        grid[:, 10] = 12.0  # Ridge barrier
        vs = MarsTerrainViewshed(grid, cell_size_m=2.0)
        res = vs.compute_line_of_sight((5, 2), (5, 18), h_cam=2.0, h_target=1.0)
        self.assertFalse(res["visible"])
        self.assertEqual(res["visibility_status"], "OCCLUDED IN TERRAIN MODEL")
        self.assertIsNotNone(res["first_obstruction"])
        self.assertEqual(res["first_obstruction"]["obstacle_type"], "TERRAIN_SCARP")

    def test_solar_shadow_engine_integration(self):
        """Verify solar shadow engine integrates with elevation raster for Mars24 ephemeris and ray tracing."""
        from solar_shadow_engine import Mars24SolarEphemeris, SolarShadowTracer
        grid_path = os.path.join(ROOT, "data", "elevation_grid.json")
        with open(grid_path) as f:
            grid_data = json.load(f)

        pos = Mars24SolarEphemeris.compute_surface_sun_position(
            j2000_days=9267.5, lat_deg=-4.787, lon_east_deg=137.393, ltst_hours=12.0
        )
        self.assertGreater(pos["solar_elevation_deg"], 55.0)

        tracer = SolarShadowTracer(grid_data["elevation"], cell_size_m=grid_data["cell_size_m"])
        res = tracer.evaluate_shadow(obs_r=75, obs_c=65, solar_elevation_deg=pos["solar_elevation_deg"],
                                     solar_azimuth_deg=pos["solar_azimuth_deg"])
        self.assertIn(res["status"], ["DIRECT_SUNLIGHT", "IN_CLIFF_SHADOW", "GRAZING_UNCERTAIN"])
        self.assertIn("disclaimer", res)

    def test_radiation_shelter_engine_integration(self):
        """Verify terrain radiation shelter engine runs Tier 1 geometry and Tier 2 transport benchmark."""
        from radiation_shelter_engine import TerrainRadiationShelterEngine
        grid_path = os.path.join(ROOT, "data", "elevation_grid.json")
        with open(grid_path) as f:
            grid_data = json.load(f)

        engine = TerrainRadiationShelterEngine(grid_data["elevation"], cell_size_m=grid_data["cell_size_m"])
        tier1 = engine.evaluate_tier1_geometry(obs_r=75, obs_c=65, obs_height_m=1.0, max_dist_m=200.0, n_azimuths=36)
        self.assertEqual(tier1["status"], "TERRAIN_SHELTER_GEOMETRY")
        self.assertEqual(tier1["classification"], "GEOMETRY ONLY; NOT A DOSE ESTIMATE")
        self.assertGreaterEqual(tier1["blocked_sky_fraction"], 0.0)

        tier2 = engine.evaluate_tier2_transport_benchmark(tier1)
        self.assertEqual(tier2["status"], "TRANSPORT_RESEARCH_BENCHMARK")
        self.assertTrue(tier2["secondary_albedo_included"])
        self.assertIn("murray_buttes_validation_target", tier2)

if __name__ == "__main__":
    unittest.main()
