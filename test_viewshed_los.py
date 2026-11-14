#!/usr/bin/env python3
"""
test_viewshed_los.py — Unit Tests for Mars Surface Geometric Line-of-Sight & Horizon Skyline Predictor
Validates 4-state uncertainty-aware visibility (VISIBLE, OCCLUDED, UNCERTAIN AT DTM RESOLUTION, INSUFFICIENT COVERAGE),
photogrammetric vertical precision margin, planetary curvature drop, nested terrain sampling, and HiRISE DTM ray-tracing.
"""

import os
import math
import unittest
import numpy as np
from viewshed_los import MarsTerrainViewshed, MARS_RADIUS_M

ROOT = os.path.dirname(os.path.abspath(__file__))

class TestMarsTerrainViewshed(unittest.TestCase):

    def test_flat_terrain_unobstructed(self):
        """Flat 20x20 grid with zero slope. Ray with 2.0m camera height is clearly visible."""
        grid = np.zeros((20, 20), dtype=np.float32)
        vs = MarsTerrainViewshed(grid, cell_size_m=5.0, vertical_uncertainty_m=0.25, enable_regional_stack=False)
        res = vs.compute_line_of_sight((2, 2), (2, 18), h_cam=2.0, h_target=1.0)
        self.assertEqual(res["coverage_status"], "VALID")
        self.assertEqual(res["visibility_status"], "VISIBLE IN TERRAIN MODEL")
        self.assertTrue(res["visible"])
        self.assertFalse(res["uncertain"])
        self.assertAlmostEqual(res["ground_distance_m"], 80.0, places=1)
        self.assertGreater(res["min_clearance_m"], 0.5)

    def test_ridge_barrier_definitive_occlusion(self):
        """Grid with an elevated ridge at column 10 blocking line of sight well beyond uncertainty."""
        grid = np.zeros((20, 20), dtype=np.float32)
        grid[:, 10] = 15.0  # 15-meter tall ridge
        vs = MarsTerrainViewshed(grid, cell_size_m=5.0, vertical_uncertainty_m=0.25, enable_regional_stack=False)
        res = vs.compute_line_of_sight((5, 2), (5, 18), h_cam=2.0, h_target=1.0)
        self.assertEqual(res["coverage_status"], "VALID")
        self.assertEqual(res["visibility_status"], "OCCLUDED IN TERRAIN MODEL")
        self.assertFalse(res["visible"])
        self.assertFalse(res["uncertain"])
        self.assertIsNotNone(res["first_obstruction"])
        self.assertEqual(res["first_obstruction"]["obstacle_type"], "TERRAIN_SCARP")

    def test_uncertain_at_dtm_resolution_grazing_ray(self):
        """
        When ray clearance falls within local photogrammetric vertical uncertainty (e.g. |clearance| <= 0.25m),
        engine must return UNCERTAIN AT DTM RESOLUTION rather than forcing false certainty.
        """
        grid = np.zeros((20, 20), dtype=np.float32)
        # Place small bump at column 10 that grazes ray: cam at 1.0m, target at 1.0m -> ray is at 1.0m
        # Bump at 0.90m -> clearance is +0.10m, which is <= 0.25m uncertainty!
        grid[:, 10] = 0.90
        vs = MarsTerrainViewshed(grid, cell_size_m=5.0, vertical_uncertainty_m=0.25, enable_regional_stack=False)
        res = vs.compute_line_of_sight((5, 2), (5, 18), h_cam=1.0, h_target=1.0)
        self.assertEqual(res["coverage_status"], "VALID")
        self.assertEqual(res["visibility_status"], "UNCERTAIN AT DTM RESOLUTION")
        self.assertTrue(res["uncertain"])
        self.assertFalse(res["visible"])
        self.assertLessEqual(abs(res["min_clearance_m"]), 0.25)

    def test_mars_planetary_curvature_horizon_drop(self):
        """
        Over flat Mars sphere with h_cam = 2.0m:
        - Near target at D = 2000m (h_tgt = 1.0m) is VISIBLE IN TERRAIN MODEL.
        - Horizon grazing target at D = 4000m (near 3682m horizon) is UNCERTAIN AT DTM RESOLUTION.
        - Distant target at D = 6000m is definitively OCCLUDED IN TERRAIN MODEL by curvature.
        """
        cols = 130  # 6500m total
        grid = np.zeros((3, cols), dtype=np.float32)
        vs = MarsTerrainViewshed(grid, cell_size_m=50.0, vertical_uncertainty_m=0.25, enable_regional_stack=False)
        
        # Near target (2000m, h_target=1.0m)
        res_near = vs.compute_line_of_sight((1, 0), (1, 40), h_cam=2.0, h_target=1.0)
        self.assertEqual(res_near["coverage_status"], "VALID")
        self.assertEqual(res_near["visibility_status"], "VISIBLE IN TERRAIN MODEL")
        self.assertTrue(res_near["visible"])

        # Horizon grazing target (4000m, h_target=0.0m)
        res_grazing = vs.compute_line_of_sight((1, 0), (1, 80), h_cam=2.0, h_target=0.0)
        self.assertEqual(res_grazing["coverage_status"], "VALID")
        self.assertEqual(res_grazing["visibility_status"], "UNCERTAIN AT DTM RESOLUTION")
        self.assertTrue(res_grazing["uncertain"])

        # Distant target beyond curvature horizon (6000m, h_target=0.0m)
        res_far = vs.compute_line_of_sight((1, 0), (1, 120), h_cam=2.0, h_target=0.0)
        self.assertEqual(res_far["coverage_status"], "VALID")
        self.assertEqual(res_far["visibility_status"], "OCCLUDED IN TERRAIN MODEL")
        self.assertFalse(res_far["visible"])
        self.assertGreater(res_far["curvature_drop_m"], 2.0)

    def test_insufficient_coverage_boundary_handling(self):
        """Coordinates outside supported terrain coverage must return INSUFFICIENT COVERAGE."""
        grid = np.zeros((10, 10), dtype=np.float32)
        vs = MarsTerrainViewshed(grid, cell_size_m=5.0, enable_regional_stack=False)
        
        res_oob_cam = vs.compute_line_of_sight((-1, 5), (5, 5))
        self.assertEqual(res_oob_cam["coverage_status"], "INSUFFICIENT_COVERAGE")
        self.assertEqual(res_oob_cam["visibility_status"], "INSUFFICIENT COVERAGE")
        self.assertFalse(res_oob_cam["visible"])

    def test_nested_multi_resolution_terrain_stack(self):
        """Verify seamless transition between inner fine DTM and outer regional terrain context."""
        grid = np.full((10, 10), -3700.0, dtype=np.float32)
        vs = MarsTerrainViewshed(grid, cell_size_m=10.0, enable_regional_stack=True)
        
        # Inner fine DTM point
        z_in, src_in, unc_in = vs.sample_elevation_nested(5, 5)
        self.assertEqual(src_in, "HIRISE_1M_STEREO_DTM")
        self.assertEqual(unc_in, 0.25)

        # Outer regional point (e.g. 50 cells away = 500m)
        z_out, src_out, unc_out = vs.sample_elevation_nested(55, 5)
        self.assertEqual(src_out, "GALE_REGIONAL_DTM")
        self.assertEqual(unc_out, 2.0)
        self.assertIsNotNone(z_out)

    def test_nodata_void_obstacle(self):
        """Nodata cell along ray must be treated as obstruction/void barrier."""
        grid = np.zeros((15, 15), dtype=np.float32)
        grid[:, 7] = -9999.0  # Nodata chasm in column 7
        vs = MarsTerrainViewshed(grid, cell_size_m=2.0, nodata_val=-9990.0, enable_regional_stack=False)
        res = vs.compute_line_of_sight((5, 1), (5, 12), h_cam=2.0, h_target=1.0)
        self.assertEqual(res["visibility_status"], "INSUFFICIENT COVERAGE")
        self.assertFalse(res["visible"])

    def test_real_hirise_dtm_viewshed(self):
        """Ray-trace line-of-sight on actual Gediz Vallis HiRISE DTM GeoTIFF."""
        tif_path = os.path.join(ROOT, "data", "hirise_dtm_gale.tif")
        self.assertTrue(os.path.exists(tif_path))
        
        try:
            import tifffile
            dtm = tifffile.imread(tif_path)
        except ImportError:
            import rasterio
            with rasterio.open(tif_path) as src:
                dtm = src.read(1)

        vs = MarsTerrainViewshed(dtm, cell_size_m=1.0116, vertical_uncertainty_m=0.25)
        cam_rc = (657, 753)
        tgt_rc = (1162, 484)
        res = vs.compute_line_of_sight(cam_rc, tgt_rc, h_cam=2.0, h_target=1.0)
        self.assertEqual(res["coverage_status"], "VALID")
        self.assertIn(res["visibility_status"], ["VISIBLE IN TERRAIN MODEL", "OCCLUDED IN TERRAIN MODEL", "UNCERTAIN AT DTM RESOLUTION"])
        self.assertGreater(res["ground_distance_m"], 400.0)
        self.assertEqual(res["vertical_uncertainty_m"], 0.25)

if __name__ == "__main__":
    unittest.main()
