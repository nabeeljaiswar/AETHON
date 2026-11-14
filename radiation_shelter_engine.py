#!/usr/bin/env python3
"""
radiation_shelter_engine.py — Terrain Radiation-Shelter & Sky Obstruction Engine for AETHON

Implements:
1. Tier 1: Full-Azimuth Geometry-Only Terrain Shelter Potential (Required in UI)
   - Ray-marches 360° horizon elevation profile alpha_max(phi) across N_az azimuth sectors.
   - Calculates blocked sky solid angle Omega_blocked (sr) and blocked sky fraction F_blocked:
       Omega_blocked = int_0^{2pi} sin(alpha_max(phi)) dphi ~= (2*pi / N) * sum(sin(alpha_max))
       F_blocked = Omega_blocked / (2*pi) = (1 / N) * sum(sin(alpha_max))
       Sky View Factor (SVF) = 1.0 - F_blocked
   - PROMINENT CLASSIFICATION: "GEOMETRY ONLY; NOT A DOSE ESTIMATE."
   - Distinguishes optical solar shade from omnidirectional cosmic radiation.

2. Tier 2: Particle-Transport Research Benchmark (Decoupled Research Prototype)
   - Calibrated against MSL/RAD Murray Buttes Butte M12 observations (Ehresmann et al. 2021, JGR Planets):
       * Butte M12 blocked ~19% of sky view (sols 1456–1467).
       * RAD recorded a 4.0% +- 1.2% reduction in overall dose rate and ~7.5% reduction in neutral particles.
   - Zenith-angle downward radiation weighting (Khaksari et al. 2022, JGR Planets):
       * Atmospheric slant depth X(theta) = X_0 / sin(alpha) creates strongly zenith-peaked downward GCR flux.
       * Differential dose rate dD/dOmega ~ sin^n(alpha) with n ~= 2.55.
       * Integral yield: sector dose yield = sin^{n+1}(alpha_max) ~= sin^{3.55}(alpha_max).
   - Secondary particle production in rock mass:
       * High-energy hadron collisions generate albedo neutrons and backscatter, providing an offset factor
         eta_sec ~= 0.80 (i.e. ~20% of primary blockage benefit is cancelled by rock albedo).
   - Sourced MSL/RAD PDS baseline:
       * Baseline GCR dose equivalent rate: 0.64 +- 0.12 mSv/day (Hassler et al. 2014; Zeitlin et al. 2019).
       * Baseline absorbed dose rate: 210 microGy/day.
   - PROMINENT DISCLAIMER:
       "Research Prototype: Directional shelter geometry only — not a certified astronaut shelter
       instruction or live dosimeter. Never label a route or shelter 'safe'."
"""

import math
import numpy as np

MARS_RADIUS_M = 3389500.0
DEFAULT_SIGMA_Z_M = 0.25

# Baseline MSL/RAD PDS observations in Gale Crater (Hassler et al. 2014, Zeitlin et al. 2019)
RAD_BASELINE_DOSE_EQUIV_MSV_DAY = 0.64
RAD_BASELINE_UNCERTAINTY_MSV_DAY = 0.12
RAD_BASELINE_ABSORBED_DOSE_UGY_DAY = 210.0

# Transport model constants calibrated to Khaksari et al. 2022 & Ehresmann et al. 2021
TRANSPORT_ZENITH_POWER = 3.55
TRANSPORT_SECONDARY_ALBEDO_FACTOR = 0.80  # ~20% secondary albedo neutron backscatter from rock


class TerrainRadiationShelterEngine:
    """Computes full-azimuth sky obstruction geometry (Tier 1) and transport benchmark dose estimates (Tier 2)."""

    def __init__(self, elevation_grid, cell_size_m=10.116, sigma_z_m=DEFAULT_SIGMA_Z_M, nodata_val=-9990.0):
        self.elev = np.array(elevation_grid, dtype=float)
        self.rows, self.cols = self.elev.shape
        self.cell_size_m = float(cell_size_m)
        self.sigma_z = float(sigma_z_m)
        self.nodata = float(nodata_val)

    def is_valid_cell(self, r, c):
        if not (0 <= r < self.rows and 0 <= c < self.cols):
            return False
        z = self.elev[r, c]
        return not (np.isnan(z) or z <= self.nodata)

    def compute_skyline_profile(self, obs_r, obs_c, obs_height_m=1.0, max_dist_m=750.0, n_azimuths=72):
        """
        Ray-march in 360 degrees to find the maximum terrain elevation angle in each azimuth sector.

        Parameters:
            obs_r, obs_c: Observer grid coordinates
            obs_height_m: Sensor/observer height above ground
            max_dist_m: Maximum horizontal ray search radius (meters)
            n_azimuths: Number of azimuthal sectors (e.g. 72 = 5° increments)

        Returns:
            dict containing azimuths_deg, horizon_elevations_deg, max_horizon_deg, coverage_flag
        """
        if not self.is_valid_cell(obs_r, obs_c):
            return None

        z_obs = self.elev[obs_r, obs_c] + obs_height_m
        azimuths = np.linspace(0.0, 360.0, n_azimuths, endpoint=False)
        horizon_elevations = np.zeros(n_azimuths, dtype=float)

        step_dist = self.cell_size_m * 0.75
        n_steps = max(2, int(max_dist_m / step_dist))

        for k, az in enumerate(azimuths):
            az_rad = math.radians(az)
            dr_m = -math.cos(az_rad)
            dc_m = math.sin(az_rad)

            max_elev_angle = 0.0

            for step in range(1, n_steps + 1):
                s = step * step_dist
                r_f = obs_r + (dr_m * s) / self.cell_size_m
                c_f = obs_c + (dc_m * s) / self.cell_size_m

                ir = int(round(r_f))
                ic = int(round(c_f))

                if not self.is_valid_cell(ir, ic):
                    # Reached boundary of terrain model
                    break

                z_terrain = self.elev[ir, ic]
                # Mars planetary curvature drop
                curv_drop = (s * s) / (2.0 * MARS_RADIUS_M)
                effective_terrain = z_terrain - curv_drop

                # Apparent elevation angle from observer to terrain point
                dz = effective_terrain - z_obs
                angle_rad = math.atan2(dz, s)
                angle_deg = math.degrees(angle_rad)

                if angle_deg > max_elev_angle:
                    max_elev_angle = angle_deg

            horizon_elevations[k] = max(0.0, min(90.0, max_elev_angle))

        return {
            'azimuths_deg': azimuths.tolist(),
            'horizon_elevations_deg': horizon_elevations.tolist(),
            'max_horizon_deg': float(np.max(horizon_elevations)),
            'mean_horizon_deg': float(np.mean(horizon_elevations))
        }

    def evaluate_tier1_geometry(self, obs_r, obs_c, obs_height_m=1.0, max_dist_m=750.0, n_azimuths=72):
        """
        Tier 1 — Full-azimuth terrain shelter potential (Geometry only).

        Computes:
            - Blocked sky solid angle Omega_blocked (steradians)
            - Blocked sky fraction F_blocked (0.0 to 1.0)
            - Sky View Factor (SVF = 1 - F_blocked)
            - Directional obstruction profile
        """
        profile = self.compute_skyline_profile(obs_r, obs_c, obs_height_m, max_dist_m, n_azimuths)
        if profile is None:
            return {
                'status': 'INSUFFICIENT_COVERAGE',
                'disclaimer': 'Observer cell is nodata or outside terrain model.'
            }

        elevs = np.array(profile['horizon_elevations_deg'])
        sin_alphas = np.sin(np.radians(elevs))

        # Blocked solid angle Omega = 2*pi * mean(sin(alpha))
        f_blocked = float(np.mean(sin_alphas))
        omega_blocked_sr = float(f_blocked * 2.0 * math.pi)
        sky_view_factor = float(1.0 - f_blocked)

        # Categorize qualitative terrain shelter geometry
        if f_blocked >= 0.15:
            geometric_category = 'HIGH_TERRAIN_OBSTRUCTION'
            desc = 'Significant terrain mass overhead (e.g., adjacent cliff or boxwork rib base).'
        elif f_blocked >= 0.08:
            geometric_category = 'MODERATE_TERRAIN_OBSTRUCTION'
            desc = 'Partial horizon obstruction from flanking valley slopes.'
        else:
            geometric_category = 'OPEN_TERRAIN'
            desc = 'Broad open plain with minimal skyline obstruction.'

        return {
            'status': 'TERRAIN_SHELTER_GEOMETRY',
            'classification': 'GEOMETRY ONLY; NOT A DOSE ESTIMATE',
            'geometric_category': geometric_category,
            'blocked_sky_fraction': round(f_blocked, 4),
            'blocked_sky_fraction_pct': round(f_blocked * 100.0, 2),
            'blocked_solid_angle_sr': round(omega_blocked_sr, 3),
            'sky_view_factor': round(sky_view_factor, 4),
            'max_horizon_elevation_deg': round(profile['max_horizon_deg'], 2),
            'mean_horizon_elevation_deg': round(profile['mean_horizon_deg'], 2),
            'azimuth_sectors_sampled': n_azimuths,
            'horizon_profile': profile,
            'description': desc,
            'disclaimer': 'Geometry only; not a dose estimate. Terrain blocking varies with azimuth. Real GCR dose reduction depends on particle transport, incident zenith distribution, and secondary albedo particles in the rock mass.'
        }

    def evaluate_tier2_transport_benchmark(self, tier1_result):
        """
        Tier 2 — Decoupled Particle-Transport Research Benchmark.

        Uses directional response weighting calibrated to MSL/RAD Murray Buttes Butte M12 observation
        and GEANT4 downward zenith-angle radiation distributions (Khaksari et al. 2022; Ehresmann et al. 2021).
        """
        if tier1_result.get('status') != 'TERRAIN_SHELTER_GEOMETRY':
            return {
                'status': 'UNAVAILABLE',
                'disclaimer': 'Tier 1 geometry profile required for transport benchmark calculation.'
            }

        elevs = np.array(tier1_result['horizon_profile']['horizon_elevations_deg'])
        sin_alphas = np.sin(np.radians(elevs))

        # Zenith-weighted dose reduction yield per sector:
        # primary flux yield ~ sin^{n+1}(alpha) with n+1 = 3.55
        # secondary albedo offset eta = 0.80
        sector_yields = (sin_alphas ** TRANSPORT_ZENITH_POWER) * TRANSPORT_SECONDARY_ALBEDO_FACTOR
        rel_dose_reduction = float(np.mean(sector_yields))

        # Shielded dose rate estimates relative to MSL/RAD Gale baseline
        baseline_dose_equiv = RAD_BASELINE_DOSE_EQUIV_MSV_DAY
        shielded_dose_equiv = baseline_dose_equiv * (1.0 - rel_dose_reduction)

        baseline_absorbed = RAD_BASELINE_ABSORBED_DOSE_UGY_DAY
        shielded_absorbed = baseline_absorbed * (1.0 - rel_dose_reduction)

        return {
            'status': 'TRANSPORT_RESEARCH_BENCHMARK',
            'classification': 'RESEARCH PROTOTYPE; NOT A CERTIFIED DOSIMETER',
            'model_basis': 'GEANT4 Zenith-Angle Model (Khaksari et al. 2022) calibrated to MSL/RAD Murray Buttes Butte M12 (Ehresmann et al. 2021)',
            'secondary_albedo_included': True,
            'secondary_particle_treatment': 'Rock mass interaction generates secondary albedo neutrons and backscatter (eta ~= 0.80)',
            'modeled_relative_dose_reduction_pct': round(rel_dose_reduction * 100.0, 2),
            'baseline_gcr_dose_equiv_msv_day': RAD_BASELINE_DOSE_EQUIV_MSV_DAY,
            'baseline_gcr_absorbed_dose_ugy_day': RAD_BASELINE_ABSORBED_DOSE_UGY_DAY,
            'modeled_shielded_dose_equiv_msv_day': round(shielded_dose_equiv, 4),
            'modeled_shielded_absorbed_ugy_day': round(shielded_absorbed, 2),
            'murray_buttes_validation_target': {
                'target_site': 'Murray Buttes Butte M12 (Curiosity Sols 1456–1467)',
                'measured_sky_view_blocked_pct': 19.0,
                'measured_rad_dose_reduction_pct': 4.0,
                'measured_rad_uncertainty_pct': 1.2,
                'measured_neutral_particle_reduction_pct': 7.5
            },
            'disclaimer': 'Candidate terrain may reduce some radiation components; modeled/observed dose benefit depends on particle field and material transport. Never tell an astronaut that a particular shadow or cliff is safe.'
        }
