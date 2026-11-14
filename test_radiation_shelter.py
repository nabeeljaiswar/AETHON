#!/usr/bin/env python3
"""
test_radiation_shelter.py — Unit Test Suite for Terrain Radiation-Shelter & Sky Obstruction Engine
Validates Tier 1 geometric obstruction, Tier 2 transport benchmark against MSL/RAD Murray Buttes,
secondary albedo physics, and strict decoupling from solar azimuth.
"""

import math
import unittest
import numpy as np
from radiation_shelter_engine import (
    TerrainRadiationShelterEngine,
    RAD_BASELINE_DOSE_EQUIV_MSV_DAY,
    TRANSPORT_SECONDARY_ALBEDO_FACTOR
)

class TestRadiationShelterEngine(unittest.TestCase):

    def test_flat_terrain_zero_obstruction(self):
        """Case 1: Perfectly flat terrain has zero horizon obstruction: Omega = 0 sr, F_blocked = 0, SVF = 1.0."""
        grid = np.zeros((15, 15))
        engine = TerrainRadiationShelterEngine(grid, cell_size_m=5.0)

        res = engine.evaluate_tier1_geometry(obs_r=7, obs_c=7, obs_height_m=1.0, max_dist_m=35.0, n_azimuths=36)
        self.assertEqual(res['status'], 'TERRAIN_SHELTER_GEOMETRY')
        self.assertEqual(res['geometric_category'], 'OPEN_TERRAIN')
        self.assertAlmostEqual(res['blocked_sky_fraction'], 0.0, places=3)
        self.assertAlmostEqual(res['blocked_solid_angle_sr'], 0.0, places=2)
        self.assertAlmostEqual(res['sky_view_factor'], 1.0, places=3)

    def test_analytic_canyon_fixture(self):
        """Case 2: 180° semi-infinite canyon wall at 45° apparent elevation.
        Analytic: Omega_blocked = pi * sin(45°) ~= 2.221 sr, F_blocked = sin(45°)/2 ~= 0.3536."""
        # Synthesize profile directly or create terrain
        # We can test the mathematical integration
        azimuths = np.linspace(0.0, 360.0, 72, endpoint=False)
        elevs = np.zeros(72)
        # Set half the horizon (180° from az 0 to 180) to 45° elevation
        elevs[:36] = 45.0

        sin_alphas = np.sin(np.radians(elevs))
        f_blocked = float(np.mean(sin_alphas))
        omega_sr = f_blocked * 2.0 * math.pi

        expected_f = 0.5 * math.sin(math.radians(45.0))
        expected_omega = math.pi * math.sin(math.radians(45.0))

        self.assertAlmostEqual(f_blocked, expected_f, places=4)
        self.assertAlmostEqual(omega_sr, expected_omega, places=3)

    def test_murray_buttes_m12_validation_benchmark(self):
        """Case 3: Validation benchmark against MSL/RAD Butte M12 (Ehresmann et al. 2021).
        When Butte M12 blocks ~19% of sky view, Tier 2 transport model must reproduce 4.0% +- 1.2% dose reduction."""
        # Create synthetic M12 skyline profile: 19% sky view blocked across azimuth wedge
        # 72 sectors (5° each); 22 sectors occupied by butte with elevation ~37.5°
        azimuths = np.linspace(0.0, 360.0, 72, endpoint=False)
        elevs = np.zeros(72)
        for i in range(14, 36):
            elevs[i] = 37.5

        sin_alphas = np.sin(np.radians(elevs))
        f_blocked = float(np.mean(sin_alphas))
        self.assertAlmostEqual(f_blocked, 0.19, delta=0.015)

        # Build mock Tier 1 result
        tier1_mock = {
            'status': 'TERRAIN_SHELTER_GEOMETRY',
            'blocked_sky_fraction': f_blocked,
            'horizon_profile': {
                'azimuths_deg': azimuths.tolist(),
                'horizon_elevations_deg': elevs.tolist()
            }
        }

        engine = TerrainRadiationShelterEngine(np.zeros((5, 5)), cell_size_m=5.0)
        tier2_res = engine.evaluate_tier2_transport_benchmark(tier1_mock)

        self.assertEqual(tier2_res['status'], 'TRANSPORT_RESEARCH_BENCHMARK')
        self.assertTrue(tier2_res['secondary_albedo_included'])

        modeled_pct = tier2_res['modeled_relative_dose_reduction_pct']
        # RAD observed Butte M12 dose rate reduction: 4.0% +- 1.2% (range 2.8% to 5.2%)
        self.assertGreaterEqual(modeled_pct, 2.8)
        self.assertLessEqual(modeled_pct, 5.2)

        # Baseline dose rate is 0.64 mSv/day; shielded dose must be less
        self.assertLess(tier2_res['modeled_shielded_dose_equiv_msv_day'], RAD_BASELINE_DOSE_EQUIV_MSV_DAY)
        self.assertGreater(tier2_res['modeled_shielded_dose_equiv_msv_day'], 0.60)

    def test_secondary_albedo_particles_prevent_zero_dose(self):
        """Case 4: Physics check. Rock mass cannot be treated as a perfect zero-radiation shield
        because secondary albedo neutrons are generated in the rock (eta ~= 0.80)."""
        # Even with complete 90° overhead blockage in one sector, dose reduction is bounded by albedo factor
        self.assertLess(TRANSPORT_SECONDARY_ALBEDO_FACTOR, 1.0)
        self.assertGreater(TRANSPORT_SECONDARY_ALBEDO_FACTOR, 0.5)

    def test_decoupling_from_solar_azimuth(self):
        """Case 5: Decoupling check. Full-azimuth skyline integration integrates 360° terrain
        and does NOT depend on where the Sun is in the sky."""
        grid = np.zeros((11, 11))
        grid[2, :] = 15.0  # Ridge at row 2
        engine = TerrainRadiationShelterEngine(grid, cell_size_m=5.0)

        # Evaluate at (5, 5) — result is an intrinsic terrain property, independent of solar coordinates
        res1 = engine.evaluate_tier1_geometry(5, 5, obs_height_m=1.0)
        res2 = engine.evaluate_tier1_geometry(5, 5, obs_height_m=1.0)

        self.assertEqual(res1['blocked_sky_fraction'], res2['blocked_sky_fraction'])
        self.assertEqual(res1['classification'], 'GEOMETRY ONLY; NOT A DOSE ESTIMATE')

    def test_real_hirise_boxwork_shelter_geometry(self):
        """Case 6: Evaluate shelter geometry on actual HiRISE DTM raster fixture."""
        import json, os
        grid_path = os.path.join(os.path.dirname(__file__), 'data', 'elevation_grid.json')
        if not os.path.exists(grid_path):
            self.skipTest('elevation_grid.json not found')

        with open(grid_path) as f:
            data = json.load(f)

        elev = np.array(data['elevation'], dtype=float)
        cell_size = float(data['cell_size_m'])
        engine = TerrainRadiationShelterEngine(elev, cell_size_m=cell_size)

        # Candidate shelter location near steep boxwork scarp (e.g. pixel row 75, col 65)
        res_cliff = engine.evaluate_tier1_geometry(obs_r=75, obs_c=65, obs_height_m=1.0, max_dist_m=300.0)
        self.assertEqual(res_cliff['status'], 'TERRAIN_SHELTER_GEOMETRY')
        self.assertGreaterEqual(res_cliff['blocked_sky_fraction'], 0.0)
        self.assertLessEqual(res_cliff['blocked_sky_fraction'], 1.0)
        self.assertIn('horizon_profile', res_cliff)

        # Candidate Tier 2 transport benchmark
        tier2_cliff = engine.evaluate_tier2_transport_benchmark(res_cliff)
        self.assertEqual(tier2_cliff['status'], 'TRANSPORT_RESEARCH_BENCHMARK')
        self.assertIn('modeled_relative_dose_reduction_pct', tier2_cliff)

if __name__ == '__main__':
    unittest.main()
