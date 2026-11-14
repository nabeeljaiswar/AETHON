#!/usr/bin/env python3
"""
test_routing_engine.py — Reference A* Pathfinding Engine and Verification Suite for AETHON
Implements a reproducible, unit-checked graph search on elevation and slope grids.

Mathematical Formulation:
- Traversal Cost:
    J(P) = sum_{i} d_i * [ 1.0 + lambda * (theta_i / theta_0)^p ]
    where:
      d_i: horizontal distance in meters (cell_size for orthogonal, cell_size*sqrt(2) for diagonal)
      theta_i = max(slope(start), slope(end)) in degrees
      lambda = 1.0 (dimensionless slope penalty scale)
      theta_0 = 10.0 degrees (reference slope angle)
      p = 2.0 (quadratic slope penalty exponent)
- Trafficability Cutoff:
    Cells or transitions with slope > theta_max (default 20.0°) have cost = inf (impassable).
- Nodata Treatment:
    Cells with elevation <= nodata_val (-9990.0) or NaN have cost = inf (impassable).
- Admissible Heuristic:
    h(r, c) = EuclideanDistance(r, c, goal_r, goal_c) * cell_size_m * 1.0
    Since min step penalty >= 1.0 (at slope = 0°), h(n) <= g*(n) for all nodes (strictly admissible).
- Termination:
    Exact goal match only: terminates when curr == goal.
- Failure Handling:
    If queue is exhausted without reaching goal, returns (None, inf). Never inserts a fallback line.

Scope:
This is a terrain-cost ranking model for research and scenario planning.
It does not represent flight-certified navigation or validated human EVA metabolic expenditure.
"""

import math
import heapq
import unittest
import numpy as np

class AStarTerrainRouter:
    """Terrain-aware A* pathfinding engine with admissible Euclidean heuristic and exact goal termination."""

    def __init__(self, elevation_grid, slope_grid, cell_size_m=5.058, theta_0_deg=10.0, penalty_exp=2.0,
                 lambda_scale=1.0, theta_max_deg=20.0, nodata_val=-9990.0):
        self.elev = np.array(elevation_grid, dtype=float)
        self.slope = np.array(slope_grid, dtype=float)
        self.rows, self.cols = self.elev.shape
        self.cell_size_m = float(cell_size_m)
        self.theta_0 = float(theta_0_deg)
        self.p = float(penalty_exp)
        self.lam = float(lambda_scale)
        self.theta_max = float(theta_max_deg)
        self.nodata = float(nodata_val)

    def is_valid_cell(self, r, c):
        """Check whether cell is within raster bounds, has valid elevation, and trafficable slope."""
        if not (0 <= r < self.rows and 0 <= c < self.cols):
            return False
        z = self.elev[r, c]
        if np.isnan(z) or z <= self.nodata:
            return False
        s = self.slope[r, c]
        if np.isnan(s) or s > self.theta_max:
            return False
        return True

    def step_cost(self, r1, c1, r2, c2):
        """Compute traversal cost for one step between adjacent cells."""
        if not self.is_valid_cell(r2, c2):
            return float('inf')
        dist_m = math.hypot(r2 - r1, c2 - c1) * self.cell_size_m
        s = max(self.slope[r1, c1], self.slope[r2, c2])
        penalty = 1.0 + self.lam * ((s / self.theta_0) ** self.p)
        return dist_m * penalty

    def heuristic(self, r, c, gr, gc):
        """Admissible Euclidean distance heuristic scaled by minimum flat-ground step penalty (1.0)."""
        return math.hypot(gr - r, gc - c) * self.cell_size_m * 1.0

    def solve(self, start, goal):
        """
        Execute A* search from start to goal.
        
        Returns:
            (path, cost): path is list of (r, c) tuples, cost is accumulated float cost.
            Returns (None, inf) if goal is unreachable.
        """
        sr, sc = start
        gr, gc = goal

        if not self.is_valid_cell(sr, sc) or not self.is_valid_cell(gr, gc):
            return None, float('inf')

        # Priority queue stores tuples: (f, g, (r, c), path)
        h0 = self.heuristic(sr, sc, gr, gc)
        heap = [(h0, 0.0, (sr, sc), [(sr, sc)])]
        best_g = {(sr, sc): 0.0}

        while heap:
            f, g, curr, path = heapq.heappop(heap)

            # Exact goal termination
            if curr == (gr, gc):
                return path, g

            if g > best_g.get(curr, float('inf')):
                continue

            r, c = curr
            # 8-connected neighborhood
            for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1), (-1, -1), (-1, 1), (1, -1), (1, 1)]:
                nr, nc = r + dr, c + dc
                if self.is_valid_cell(nr, nc):
                    c_step = self.step_cost(r, c, nr, nc)
                    if c_step < float('inf'):
                        new_g = g + c_step
                        if new_g < best_g.get((nr, nc), float('inf')):
                            best_g[(nr, nc)] = new_g
                            new_f = new_g + self.heuristic(nr, nc, gr, gc)
                            heapq.heappush(heap, (new_f, new_g, (nr, nc), path + [(nr, nc)]))

        # Queue exhausted without reaching goal — return failure, never insert fallback line
        return None, float('inf')

class TestRoutingEngineVerification(unittest.TestCase):

    def test_hand_checkable_3x3_flat_grid(self):
        """Case 1: 3x3 flat grid with zero slope. Hand-checked cost = 2 * sqrt(2) * cell_size."""
        elev = np.zeros((3, 3))
        slope = np.zeros((3, 3))
        cell_size = 5.0
        router = AStarTerrainRouter(elev, slope, cell_size_m=cell_size)
        path, cost = router.solve((0, 0), (2, 2))

        self.assertIsNotNone(path)
        self.assertEqual(path, [(0, 0), (1, 1), (2, 2)])
        expected_cost = 2.0 * math.sqrt(2.0) * cell_size
        self.assertAlmostEqual(cost, expected_cost, places=4)

    def test_nodata_obstacle_avoidance(self):
        """Case 2: 5x5 grid with vertical nodata wall at column 2 (except top row). Must route around."""
        elev = np.zeros((5, 5))
        slope = np.zeros((5, 5))
        elev[1:, 2] = -9999.0  # Vertical nodata barrier

        router = AStarTerrainRouter(elev, slope, cell_size_m=1.0)
        path, cost = router.solve((2, 0), (2, 4))

        self.assertIsNotNone(path)
        for r, c in path:
            self.assertFalse(r >= 1 and c == 2, f"Path stepped on nodata cell at ({r}, {c})")
        rows_traversed = [r for r, c in path]
        self.assertIn(0, rows_traversed, "Path must detour via top gap at row 0")

    def test_boundary_limits_and_corner_safety(self):
        """Case 3: Verify start and goal at boundaries and corners without out-of-bounds error."""
        elev = np.zeros((4, 4))
        slope = np.zeros((4, 4))
        router = AStarTerrainRouter(elev, slope, cell_size_m=2.0)

        # Diagonal from corner to corner
        path, cost = router.solve((0, 0), (3, 3))
        self.assertIsNotNone(path)
        self.assertEqual(len(path), 4)
        self.assertEqual(path[-1], (3, 3))

        # Along right border
        path_border, cost_b = router.solve((0, 3), (3, 3))
        self.assertIsNotNone(path_border)
        self.assertEqual(path_border, [(0, 3), (1, 3), (2, 3), (3, 3)])

    def test_slope_penalty_scaling_prefers_gentle_detour(self):
        """Case 4: Path over steep ridge (18° slope) vs flat detour (0° slope). Router must pick lower-cost path."""
        elev = np.zeros((3, 5))
        slope = np.zeros((3, 5))
        slope[1, 1:4] = 18.0

        router = AStarTerrainRouter(elev, slope, cell_size_m=1.0, theta_0_deg=10.0, theta_max_deg=20.0)
        path, cost = router.solve((1, 0), (1, 4))

        self.assertIsNotNone(path)
        # Direct path cost = 4 * (1 + (18/10)^2) = 4 * (1 + 3.24) = 16.96
        # Detour via row 0 cost = sqrt(2) + 2 + sqrt(2) = 4.828 < 16.96
        self.assertLess(cost, 10.0)
        self.assertIn((0, 1), path)

    def test_unreachable_barrier_returns_none(self):
        """Case 5: Solid scarp wall (>20°) completely blocking destination. Must return None, never fallback line."""
        elev = np.zeros((5, 5))
        slope = np.zeros((5, 5))
        slope[:, 2] = 25.0  # Impassable 25° cliff wall across entire column 2

        router = AStarTerrainRouter(elev, slope, cell_size_m=1.0, theta_max_deg=20.0)
        path, cost = router.solve((2, 0), (2, 4))

        self.assertIsNone(path, "Unreachable destination must return None, not a straight line")
        self.assertEqual(cost, float('inf'))

if __name__ == "__main__":
    unittest.main()
