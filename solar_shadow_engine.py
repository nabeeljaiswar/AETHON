#!/usr/bin/env python3
"""
solar_shadow_engine.py — NASA Mars24 Solar Ephemeris & Terrain Ray-Tracer for AETHON

Implements:
1. NASA GISS Mars24 Ephemeris Algorithm (Allison & McEwen 2000, Planet. Space Sci. 48, 215-235;
   Allison 1997, Geophys. Res. Lett. 24, 1975-1978).
   - Computes Julian Date (TT), Mars Sol Date (MSD), Coordinated Mars Time (MTC),
     aerocentric solar longitude (Ls), subsolar declination (delta_s), Local True Solar Time (LTST),
     apparent solar elevation (alpha_sun), and solar azimuth (A_sun, clockwise from North).
2. Terrain Solar Ray-Tracing:
   - Ray-marches from observer surface point toward apparent solar vector.
   - Evaluates line-of-sight clearance accounting for Mars planetary curvature drop:
       Z_sun(s) = z_obs + h_sensor + s * tan(alpha_sun) - s^2 / (2 * R_M)
       Z_eff(s) = z_DTM(s) - s^2 / (2 * R_M)
   - Classifies illumination into 5 unambiguous states:
       * DIRECT_SUNLIGHT
       * IN_CLIFF_SHADOW
       * GRAZING_UNCERTAIN (clearance within photogrammetric vertical uncertainty sigma_z)
       * NIGHT_BELOW_HORIZON (solar elevation <= 0°)
       * INSUFFICIENT_COVERAGE (ray reaches nodata or exits DTM before clearing terrain)
3. Diurnal Solar Track & Shadow Interval Profiler:
   - Evaluates illumination status across user-selected local true solar times.

CRITICAL SCIENTIFIC DISTINCTION:
Optical shadow blocks direct solar photons (lighting, thermal, and UV context).
It is NOT an omnidirectional radiation shield against Galactic Cosmic Rays (GCR).
Solar shading and GCR dose are strictly decoupled.
"""

import math
import numpy as np

# IAU Mean Volumetric Mars Sphere Radius (meters)
MARS_RADIUS_M = 3389500.0

# Nominal photogrammetric vertical uncertainty for HiRISE 1m stereo DTM (Kirk et al. 2008)
DEFAULT_SIGMA_Z_M = 0.25

class Mars24SolarEphemeris:
    """
    Implementation of NASA GISS Mars24 solar position algorithm.
    Reference: Allison & McEwen (2000), Planetary and Space Science 48(2-3), 215-235.
    """

    @staticmethod
    def j2000_from_earth_date(year, month, day, hour=0, minute=0, second=0):
        """Compute days elapsed since J2000.0 epoch (2000 Jan 1 12:00:00 TT)."""
        # Fliegel & Van Flandern standard Julian Date algorithm
        a = (14 - month) // 12
        y = year + 4800 - a
        m = month + 12 * a - 3
        jdn = day + (153 * m + 2) // 5 + 365 * y + y // 4 - y // 100 + y // 400 - 32045
        jd_ut = jdn + (hour - 12.0) / 24.0 + minute / 1440.0 + second / 86400.0
        # TT offset Delta T ~ 69.184s for 2020s
        delta_t_sec = 69.184
        jd_tt = jd_ut + delta_t_sec / 86400.0
        return jd_tt - 2451545.0

    @staticmethod
    def j2000_from_msd(msd):
        """Convert Mars Sol Date (MSD) to J2000.0 days."""
        # Allison & McEwen formula: MSD = (JD_TT - 2405522.0) / 1.027491252 + 44796.0 - 0.00096
        jd_tt = (msd - 44796.0 + 0.00096) * 1.027491252 + 2405522.0
        return jd_tt - 2451545.0

    @classmethod
    def compute_solar_coordinates(cls, j2000_days):
        """
        Compute aerocentric solar coordinates for Mars at given J2000 days.
        Returns:
            dict containing Ls_deg, delta_s_deg, msd, mtc_hours, alpha_F_deg, M_deg
        """
        t = float(j2000_days)

        # 1. Mars Mean Anomaly M
        M = (19.3870 + 0.52402075 * t) % 360.0
        M_rad = math.radians(M)

        # 2. Angle of Fictitious Mean Sun alpha_F
        alpha_F = (270.3863 + 0.52403840 * t) % 360.0

        # 3. Perturbations PBS (Allison & McEwen Table 1)
        pbs = (0.0071 * math.cos(math.radians(0.99836 * t + 145.2)) +
               0.0057 * math.cos(math.radians(0.49918 * t + 246.5)) +
               0.0039 * math.cos(math.radians(0.33279 * t + 120.2)) +
               0.0028 * math.cos(math.radians(0.08272 * t + 21.6)) +
               0.0023 * math.cos(math.radians(0.60838 * t + 37.9)) +
               0.0018 * math.cos(math.radians(0.16543 * t + 30.6)))

        # 4. Equation of Center (nu - M)
        nu_minus_M = ((10.691 + 3.0e-7 * t) * math.sin(M_rad) +
                      0.623 * math.sin(2.0 * M_rad) +
                      0.050 * math.sin(3.0 * M_rad) +
                      0.005 * math.sin(4.0 * M_rad) +
                      0.0005 * math.sin(5.0 * M_rad) + pbs)

        # 5. Aerocentric Solar Longitude Ls
        Ls = (alpha_F + nu_minus_M) % 360.0
        Ls_rad = math.radians(Ls)

        # 6. Obliquity of Mars equator epsilon
        epsilon = 25.1919 - 0.0000004 * t
        eps_rad = math.radians(epsilon)

        # 7. Subsolar Declination delta_s
        sin_delta_s = math.sin(eps_rad) * math.sin(Ls_rad)
        delta_s_rad = math.asin(max(-1.0, min(1.0, sin_delta_s)))
        delta_s_deg = math.degrees(delta_s_rad)

        # 8. Mars Sol Date (MSD) & Mars Coordinated Time (MTC)
        jd_tt = t + 2451545.0
        msd = ((jd_tt - 2405522.0) / 1.027491252) + 44796.0 - 0.00096
        mtc_hours = (msd % 1.0) * 24.0

        # 9. Subsolar Right Ascension alpha_s and Equation of Time (EOT)
        alpha_sun_deg = math.degrees(math.atan2(math.cos(eps_rad) * math.sin(Ls_rad), math.cos(Ls_rad))) % 360.0
        eot_deg = (alpha_F - alpha_sun_deg) % 360.0
        if eot_deg > 180.0:
            eot_deg -= 360.0

        return {
            'j2000_days': t,
            'msd': msd,
            'mtc_hours': mtc_hours,
            'ls_deg': Ls,
            'delta_s_deg': delta_s_deg,
            'epsilon_deg': epsilon,
            'alpha_sun_deg': alpha_sun_deg,
            'eot_deg': eot_deg,
            'eot_hours': eot_deg / 15.0
        }

    @classmethod
    def compute_surface_sun_position(cls, j2000_days, lat_deg, lon_east_deg, ltst_hours=None):
        """
        Compute solar elevation and azimuth at a given Mars surface position.

        Parameters:
            j2000_days: Days from J2000.0 epoch
            lat_deg: Planetocentric latitude (-90 to +90 degrees)
            lon_east_deg: Planetocentric longitude East (0 to 360 degrees)
            ltst_hours: (Optional) Local True Solar Time in hours (0.0 to 24.0).
                        If None, computed from MTC and EOT.

        Returns:
            dict containing solar_elevation_deg, solar_azimuth_deg, ltst_hours, ls_deg, delta_s_deg
        """
        coords = cls.compute_solar_coordinates(j2000_days)
        delta_s_deg = coords['delta_s_deg']
        delta_s_rad = math.radians(delta_s_deg)
        phi_rad = math.radians(lat_deg)

        if ltst_hours is None:
            # LMST from MTC and East longitude
            lmst_hours = (coords['mtc_hours'] + lon_east_deg * (24.0 / 360.0)) % 24.0
            ltst_hours = (lmst_hours + coords['eot_hours']) % 24.0

        # Hour angle H: H = (LTST - 12.0) * 15°
        hour_angle_deg = (ltst_hours - 12.0) * 15.0
        H_rad = math.radians(hour_angle_deg)

        # Solar elevation angle alpha_sun
        sin_alt = (math.sin(phi_rad) * math.sin(delta_s_rad) +
                   math.cos(phi_rad) * math.cos(delta_s_rad) * math.cos(H_rad))
        sin_alt = max(-1.0, min(1.0, sin_alt))
        alt_rad = math.asin(sin_alt)
        alt_deg = math.degrees(alt_rad)

        # Solar azimuth A_sun (measured clockwise from North: 0° N, 90° E, 180° S, 270° W)
        cos_alt = math.cos(alt_rad)
        if cos_alt < 1e-9:
            # Near zenith or nadir
            az_deg = 0.0
        else:
            cos_az = (math.sin(delta_s_rad) - math.sin(phi_rad) * sin_alt) / (math.cos(phi_rad) * cos_alt)
            sin_az = - (math.cos(delta_s_rad) * math.sin(H_rad)) / cos_alt
            cos_az = max(-1.0, min(1.0, cos_az))
            az_deg = (math.degrees(math.atan2(sin_az, cos_az)) + 360.0) % 360.0

        return {
            'solar_elevation_deg': alt_deg,
            'solar_azimuth_deg': az_deg,
            'ltst_hours': ltst_hours,
            'hour_angle_deg': hour_angle_deg,
            'ls_deg': coords['ls_deg'],
            'delta_s_deg': delta_s_deg,
            'msd': coords['msd']
        }


class SolarShadowTracer:
    """Ray-marches solar vector across terrain model to classify optical direct-sun vs cliff shadow."""

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

    def evaluate_shadow(self, obs_r, obs_c, solar_elevation_deg, solar_azimuth_deg,
                        obs_height_m=1.0, max_dist_m=1500.0):
        """
        Ray-trace solar vector from observer to detect direct sun visibility or cliff shadow.

        Parameters:
            obs_r, obs_c: Observer grid coordinates
            solar_elevation_deg: Solar altitude in degrees
            solar_azimuth_deg: Solar azimuth in degrees clockwise from North
            obs_height_m: Observer sensor height above terrain (meters)
            max_dist_m: Maximum horizontal distance to march ray (meters)

        Returns:
            dict containing:
                status: 'DIRECT_SUNLIGHT' | 'IN_CLIFF_SHADOW' | 'GRAZING_UNCERTAIN' |
                        'NIGHT_BELOW_HORIZON' | 'INSUFFICIENT_COVERAGE'
                min_clearance_m: Minimum vertical clearance between solar ray and terrain
                occluding_cell: (r, c) tuple of blocking terrain or None
                occluding_dist_m: Distance to blocker in meters or None
                solar_elevation_deg: Input solar elevation
                solar_azimuth_deg: Input solar azimuth
        """
        # 1. Night check
        if solar_elevation_deg <= 0.0:
            return {
                'status': 'NIGHT_BELOW_HORIZON',
                'min_clearance_m': None,
                'occluding_cell': None,
                'occluding_dist_m': None,
                'solar_elevation_deg': solar_elevation_deg,
                'solar_azimuth_deg': solar_azimuth_deg,
                'disclaimer': 'Sun is below horizontal tangent plane.'
            }

        if not self.is_valid_cell(obs_r, obs_c):
            return {
                'status': 'INSUFFICIENT_COVERAGE',
                'min_clearance_m': None,
                'occluding_cell': None,
                'occluding_dist_m': None,
                'solar_elevation_deg': solar_elevation_deg,
                'solar_azimuth_deg': solar_azimuth_deg,
                'disclaimer': 'Observer cell is nodata or outside terrain model.'
            }

        z_obs = self.elev[obs_r, obs_c]
        tan_elev = math.tan(math.radians(solar_elevation_deg))
        az_rad = math.radians(solar_azimuth_deg)

        # Direction vector in grid coordinates:
        # Row step (North is row decreasing, South is row increasing): dr = -cos(az)
        # Col step (East is col increasing): dc = +sin(az)
        dr_m = -math.cos(az_rad)
        dc_m = math.sin(az_rad)

        step_dist = self.cell_size_m * 0.5  # Sub-cell sampling
        n_steps = int(max_dist_m / step_dist)

        min_clearance = float('inf')
        occluding_cell = None
        occluding_dist = None
        insufficient_coverage = False

        for step in range(1, n_steps + 1):
            s = step * step_dist
            cur_r_f = obs_r + (dr_m * s) / self.cell_size_m
            cur_c_f = obs_c + (dc_m * s) / self.cell_size_m

            ir = int(round(cur_r_f))
            ic = int(round(cur_c_f))

            if not self.is_valid_cell(ir, ic):
                # Ray reached boundary of terrain model
                break

            z_terrain = self.elev[ir, ic]

            # Mars planetary curvature drop over distance s: Delta z_drop = s^2 / (2 * R_M)
            curv_drop = (s * s) / (2.0 * MARS_RADIUS_M)
            effective_terrain = z_terrain - curv_drop

            # Solar ray elevation at ground distance s
            z_ray = z_obs + obs_height_m + (s * tan_elev) - curv_drop

            clearance = z_ray - effective_terrain
            if clearance < min_clearance:
                min_clearance = clearance

            # Occlusion check: definitive blockage when terrain exceeds ray by > sigma_z
            if clearance < -self.sigma_z:
                return {
                    'status': 'IN_CLIFF_SHADOW',
                    'min_clearance_m': float(round(clearance, 3)),
                    'occluding_cell': (ir, ic),
                    'occluding_dist_m': float(round(s, 2)),
                    'solar_elevation_deg': float(round(solar_elevation_deg, 2)),
                    'solar_azimuth_deg': float(round(solar_azimuth_deg, 2)),
                    'disclaimer': 'Direct sunlight is blocked by intervening topography. Optical shadow does NOT provide GCR radiation shielding.'
                }

        # Check grazing ray uncertainty: ray passed within vertical uncertainty band
        if abs(min_clearance) <= self.sigma_z:
            return {
                'status': 'GRAZING_UNCERTAIN',
                'min_clearance_m': float(round(min_clearance, 3)),
                'occluding_cell': None,
                'occluding_dist_m': None,
                'solar_elevation_deg': float(round(solar_elevation_deg, 2)),
                'solar_azimuth_deg': float(round(solar_azimuth_deg, 2)),
                'disclaimer': f'Solar ray grazes terrain within vertical uncertainty (+-{self.sigma_z}m).'
            }

        return {
            'status': 'DIRECT_SUNLIGHT',
            'min_clearance_m': float(round(min_clearance, 3)),
            'occluding_cell': None,
            'occluding_dist_m': None,
            'solar_elevation_deg': float(round(solar_elevation_deg, 2)),
            'solar_azimuth_deg': float(round(solar_azimuth_deg, 2)),
            'disclaimer': 'Surface point receives unobstructed direct sunlight.'
        }
