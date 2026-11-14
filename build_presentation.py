#!/usr/bin/env python3
"""Build the official 7-slide Space Apps presentation for AETHON using python-pptx."""

from pathlib import Path
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor

ROOT = Path(__file__).resolve().parent

prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)

BG_COLOR = RGBColor(17, 26, 22)       # #111a16
CARD_COLOR = RGBColor(24, 38, 32)     # #182620
BORDER_COLOR = RGBColor(38, 60, 51)   # #263c33
TEXT_WHITE = RGBColor(255, 255, 255)
TEXT_MUTED = RGBColor(143, 168, 155)  # #8fa89b
TEXT_GREEN = RGBColor(82, 168, 122)   # #52a87a
TEXT_AMBER = RGBColor(227, 166, 83)   # #e3a653
TEXT_ORANGE = RGBColor(207, 102, 62)  # #cf663e

blank_layout = prs.slide_layouts[6]

def set_slide_background(slide):
    background = slide.background
    fill = background.fill
    fill.solid()
    fill.fore_color.rgb = BG_COLOR

def add_header(slide, slide_num, title_text, sub_text):
    tb = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.7), Inches(1.1))
    tf = tb.text_frame
    tf.word_wrap = True
    
    p0 = tf.paragraphs[0]
    p0.text = "NASA INTERNATIONAL SPACE APPS CHALLENGE 2026 · INTERPLANETARY SURVIVAL GUIDE: MARTIAN MAP"
    p0.font.size = Pt(10)
    p0.font.bold = True
    p0.font.color.rgb = TEXT_GREEN
    
    p1 = tf.add_paragraph()
    p1.text = title_text
    p1.font.size = Pt(24)
    p1.font.bold = True
    p1.font.color.rgb = TEXT_WHITE
    
    p2 = tf.add_paragraph()
    p2.text = sub_text
    p2.font.size = Pt(12)
    p2.font.color.rgb = TEXT_MUTED

    snb = slide.shapes.add_textbox(Inches(10.5), Inches(0.4), Inches(2.0), Inches(0.35))
    snp = snb.text_frame.paragraphs[0]
    snp.alignment = PP_ALIGN.RIGHT
    snp.text = f"SLIDE {slide_num} OF 7"
    snp.font.size = Pt(11)
    snp.font.bold = True
    snp.font.color.rgb = RGBColor(90, 122, 109)

    fb = slide.shapes.add_textbox(Inches(0.8), Inches(6.9), Inches(11.7), Inches(0.4))
    fp = fb.text_frame.paragraphs[0]
    fp.text = "AETHON Phase 1 · Gale Crater Regional Field Atlas · Real NASA Mission Data Only · Audited Spatial Datums"
    fp.font.size = Pt(10)
    fp.font.color.rgb = RGBColor(100, 125, 114)

def add_card(slide, left, top, width, height, title="", border_color=BORDER_COLOR):
    shape = slide.shapes.add_shape(1, left, top, width, height)
    shape.fill.solid()
    shape.fill.fore_color.rgb = CARD_COLOR
    shape.line.color.rgb = border_color
    shape.line.width = Pt(1)
    
    if title:
        tb = slide.shapes.add_textbox(left + Inches(0.2), top + Inches(0.15), width - Inches(0.4), Inches(0.45))
        p = tb.text_frame.paragraphs[0]
        p.text = title
        p.font.size = Pt(14)
        p.font.bold = True
        p.font.color.rgb = TEXT_GREEN
    return shape

# ==========================================
# SLIDE 1: TITLE & TEAM
# ==========================================
s1 = prs.slides.add_slide(blank_layout)
set_slide_background(s1)

pill = s1.shapes.add_textbox(Inches(0.8), Inches(0.8), Inches(4.5), Inches(0.4))
pp = pill.text_frame.paragraphs[0]
pp.text = "NASA SOURCED · PHASE 1"
pp.font.size = Pt(11)
pp.font.bold = True
pp.font.color.rgb = TEXT_GREEN

tb1 = s1.shapes.add_textbox(Inches(0.8), Inches(1.3), Inches(11.7), Inches(2.2))
tf1 = tb1.text_frame
tf1.word_wrap = True
p = tf1.paragraphs[0]
p.text = "AETHON: Martian Field Atlas"
p.font.size = Pt(40)
p.font.bold = True
p.font.color.rgb = TEXT_WHITE

p2 = tf1.add_paragraph()
p2.text = "Regional Orbital Context, Audited Geodesy, & Data Provenance Foundation for Mars EVA"
p2.font.size = Pt(18)
p2.font.color.rgb = TEXT_GREEN

add_card(s1, Inches(0.8), Inches(3.6), Inches(11.7), Inches(2.3), "Executive Summary & Core Thesis")
summary_box = s1.shapes.add_textbox(Inches(1.0), Inches(4.15), Inches(11.3), Inches(1.6))
stf = summary_box.text_frame
stf.word_wrap = True

p = stf.paragraphs[0]
p.text = "• Controlling Challenge: Create a map or interface for Mars surface exploration integrating NASA mission data for safe movement and science planning."
p.font.size = Pt(13)
p.font.color.rgb = TEXT_WHITE

p = stf.add_paragraph()
p.text = "• The Scientific Reality: Naive planetary GIS blends often misalign orbital rasters across conflicting datums and treat rendered relief as elevation models. AETHON replaces guesswork with auditable geodesy."
p.font.size = Pt(13)
p.font.color.rgb = TEXT_MUTED

p = stf.add_paragraph()
p.text = "• Delivered Foundation: Real ~5.08 m/px MRO CTX mosaic of Gale Crater, audited CRS discrepancy withholding unverified vector overlays, zero synthetic metrics, and 15/15 passed automated QA tests."
p.font.size = Pt(13)
p.font.color.rgb = TEXT_MUTED

mb = s1.shapes.add_textbox(Inches(0.8), Inches(6.1), Inches(11.7), Inches(0.5))
mp = mb.text_frame.paragraphs[0]
mp.text = "Team: AETHON Exploration Systems  |  Track: Human Exploration / Martian Map  |  Local Event: Bengaluru (Asia/Calcutta)"
mp.font.size = Pt(11)
mp.font.color.rgb = TEXT_GREEN

snb = s1.shapes.add_textbox(Inches(10.5), Inches(0.4), Inches(2.0), Inches(0.35))
snp = snb.text_frame.paragraphs[0]
snp.alignment = PP_ALIGN.RIGHT
snp.text = "SLIDE 1 OF 7"
snp.font.size = Pt(11)
snp.font.bold = True
snp.font.color.rgb = RGBColor(90, 122, 109)

# ==========================================
# SLIDE 2: THE CHALLENGE & THE REAL PROBLEM
# ==========================================
s2 = prs.slides.add_slide(blank_layout)
set_slide_background(s2)
add_header(s2, 2, "The Challenge & The Hidden Pitfalls of Planetary GIS", "Why Astronaut Safety Demands Audited Datums Over Cosmetic Feature Dials")

add_card(s2, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.9), "1. The Space Apps Challenge Goal")
c1 = s2.shapes.add_textbox(Inches(1.0), Inches(2.35), Inches(5.2), Inches(4.1))
c1f = c1.text_frame
c1f.word_wrap = True

challenge_points = [
    ("Challenge Objective", "Create a map, tool, or interface for a Mars surface explorer that integrates NASA mission data for a location or route, contextualizes safe movement, and supports science along the way."),
    ("Target Study Area", "Gale Crater lower Mount Sharp boxwork ridges (4.843°S, 137.298°E). Candidate human exploration corridor rich in sulfate/clay mineralogy and Curiosity rover ground truth."),
    ("Judging Criteria Alignment", "Evaluated on Impact, Creativity, Validity, Relevance, and Presentation. AETHON optimizes for validity and defensible science over unverified feature count.")
]
for title, text in challenge_points:
    p = c1f.add_paragraph() if c1f.paragraphs[0].text else c1f.paragraphs[0]
    p.text = f"• {title}: "
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = TEXT_GREEN
    r = p.add_run()
    r.text = text
    r.font.bold = False
    r.font.color.rgb = TEXT_WHITE

add_card(s2, Inches(6.8), Inches(1.8), Inches(5.7), Inches(4.9), "2. Two Fatal Pitfalls in Mars Mapping", border_color=TEXT_ORANGE)
c2 = s2.shapes.add_textbox(Inches(7.0), Inches(2.35), Inches(5.3), Inches(4.1))
c2f = c2.text_frame
c2f.word_wrap = True

pitfalls = [
    ("Trap A — Confusing Shaded Relief with DEMs", "Rendered 8-bit color JPEGs (e.g. MOLA Level 5) depict artificial illumination and color lookup tables, NOT elevation samples. Deriving slopes or 0m datum contours from color pixels is mathematically invalid and hazardous."),
    ("Trap B — Naive Cross-Source Layer Stacking", "Planetary web services frequently advertise ellipsoidal datums (ESRI:104905) while serving spherical matrices (WKID 104971). Stacking without control-point validation creates multi-kilometer misregistrations."),
    ("The Hackathon Reality", "Most prototypes invent synthetic paths and fake dials. AETHON proves what NASA data genuinely supports before risking human lives.")
]
for title, text in pitfalls:
    p = c2f.add_paragraph() if c2f.paragraphs[0].text else c2f.paragraphs[0]
    p.text = f"• {title}: "
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = TEXT_ORANGE
    r = p.add_run()
    r.text = text
    r.font.bold = False
    r.font.color.rgb = TEXT_WHITE

# ==========================================
# SLIDE 3: WHAT WE BUILT (DELIVERABLE PROTOTYPE)
# ==========================================
s3 = prs.slides.add_slide(blank_layout)
set_slide_background(s3)
add_header(s3, 3, "What We Built: The AETHON Responsive Field Atlas", "A Lightweight, Zero-Dependency Viewer for Lower Mount Sharp Boxwork Ridges")

aoi_img_path = ROOT / "gale_ctx_aoi_z12.png"
if aoi_img_path.is_file():
    s3.shapes.add_picture(str(aoi_img_path), Inches(0.8), Inches(1.8), Inches(4.9), Inches(4.9))

add_card(s3, Inches(6.0), Inches(1.8), Inches(6.5), Inches(4.9), "Verified Capabilities (Runnable & Audited)")
c3 = s3.shapes.add_textbox(Inches(6.2), Inches(2.35), Inches(6.1), Inches(4.1))
c3f = c3.text_frame
c3f.word_wrap = True

features = [
    ("Real CTX Orbital Mosaic (~5.08 m/px)", "30 Level-12 PNG tiles (512x512) fetched from Caltech Murray Lab OnMars service. Assembled into regional (2330x2097) and study box (1398x1398) crops."),
    ("Dynamic Service Grid Coordinates", "Interactive pointer tracking displays real-time coordinates across the CTX service grid."),
    ("Crop View Switcher", "Instant toggling between regional mosaic and nominal study box crops."),
    ("In-App 4-Step Judge Tour", "Guided walkthrough detailing real imagery pixels, the geodetic discrepancy, MOLA relief limitations, and Phase 2 requirements."),
    ("Calibrated 1,000 m Scalebar", "Dynamically calibrated to displayed pixel density across all viewports and crop modes."),
    ("Zero CDNs or Cloud Lock-in", "Runs 100% offline from local workspace assets in any modern web browser.")
]
for title, text in features:
    p = c3f.add_paragraph() if c3f.paragraphs[0].text else c3f.paragraphs[0]
    p.text = f"✓ {title}: "
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = TEXT_GREEN
    r = p.add_run()
    r.text = text
    r.font.bold = False
    r.font.color.rgb = TEXT_WHITE

# ==========================================
# SLIDE 4: THE GEODETIC AUDIT
# ==========================================
s4 = prs.slides.add_slide(blank_layout)
set_slide_background(s4)
add_header(s4, 4, "The Geodetic Audit: Potential ~3.35 km Shift", "Why Coordinate Overlays Are Responsibly Withheld Pending Ground-Control Tie Points")

add_card(s4, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.9), "The Spatial Reference Conflict", border_color=TEXT_AMBER)
c4a = s4.shapes.add_textbox(Inches(1.0), Inches(2.35), Inches(5.2), Inches(4.1))
c4af = c4a.text_frame
c4af.word_wrap = True

conflict_points = [
    ("Mars Trek WMTS Capabilities (caps.dat)", "Advertises ESRI:104905 (GCS_Mars_2000 oblate ellipsoid: a=3,396,190 m, b=3,376,200 m, 1/f=169.89445). Under planetographic latitude interpretation."),
    ("Linked ArcGIS REST MapServer (arcgis.dat)", "Declares WKID 104971 (GCS_Mars_2000_Sphere: R=3,396,190 m, f=0). Under spherical planetocentric latitude interpretation."),
    ("Mathematical Latitude Shift", "At Gale Crater target latitude (-4.843°S):\n  tan(φ_c) = (b/a)² · tan(φ_g) = 0.9882655 · tan(-4.843°)\n  φ_c ≈ -4.786422°  ==>  Δφ = 0.056578°\n  North-South Arc Displacement ≈ 3,353.7 meters (~3.35 km)")
]
for title, text in conflict_points:
    p = c4af.add_paragraph() if c4af.paragraphs[0].text else c4af.paragraphs[0]
    p.text = f"• {title}:\n"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = TEXT_AMBER
    r = p.add_run()
    r.text = text
    r.font.bold = False
    r.font.color.rgb = TEXT_WHITE

add_card(s4, Inches(6.8), Inches(1.8), Inches(5.7), Inches(4.9), "Cartographic Decision & Responsible Action")
c4b = s4.shapes.add_textbox(Inches(7.0), Inches(2.35), Inches(5.3), Inches(4.1))
c4bf = c4b.text_frame
c4bf.word_wrap = True

decision_points = [
    ("Uncontrolled Mosaic Context", "Caltech Murray Lab explicitly documents that Beta01 is an uncontrolled mosaic referenced only by SPICE spacecraft orbital pointing, without bundle adjustment or ground-control registration."),
    ("The Scale of Ambiguity", "Across a 7.10 km study area, an unverified ~3.35 km spatial ambiguity accounts for nearly half the map window. Plotting vector overlays without resolving this would place features miles from reality."),
    ("The AETHON Standard", "We do NOT claim the raster is empirically shifted by 3.35 km, nor do we eyeball alignment. Instead, we acknowledge this theoretical ambiguity and deliberately withhold external vector overlays."),
    ("Transparent Reference Cards", "AOI boundary, HiRISE catalog, and Curiosity Sol 4452 waypoints are displayed as unplaced coordinate reference cards.")
]
for title, text in decision_points:
    p = c4bf.add_paragraph() if c4bf.paragraphs[0].text else c4bf.paragraphs[0]
    p.text = f"• {title}: "
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = TEXT_GREEN
    r = p.add_run()
    r.text = text
    r.font.bold = False
    r.font.color.rgb = TEXT_WHITE

# ==========================================
# SLIDE 5: SCIENTIFIC BOUNDARIES & HONEST LIMITS
# ==========================================
s5 = prs.slides.add_slide(blank_layout)
set_slide_background(s5)
add_header(s5, 5, "Scientific Integrity: Strict Data Boundaries", "Why MOLA Relief Is Not a DEM and Why Synthetic Metrics Are Purged")

add_card(s5, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.9), "MOLA Color Shaded Relief vs. Numeric DEM")
mola_img_path = ROOT / "gale_mola_tile_level5.jpg"
if mola_img_path.is_file():
    s5.shapes.add_picture(str(mola_img_path), Inches(1.0), Inches(2.4), Inches(1.5), Inches(1.5))

c5a = s5.shapes.add_textbox(Inches(2.7), Inches(2.35), Inches(3.5), Inches(1.6))
c5af = c5a.text_frame
c5af.word_wrap = True
p = c5af.paragraphs[0]
p.text = "USGS Mars MGS MOLA ClrShade (Level 5)\n256x256 px RGB JPEG (~1.3 km/px)"
p.font.size = Pt(11)
p.font.bold = True
p.font.color.rgb = TEXT_WHITE

c5b = s5.shapes.add_textbox(Inches(1.0), Inches(4.1), Inches(5.2), Inches(2.4))
c5bf = c5b.text_frame
c5bf.word_wrap = True
mola_facts = [
    ("Visualization, Not Elevation", "Color shaded relief represents artificial sun illumination angles and false-color lookup tables, NOT floating-point surface elevation."),
    ("Derivation Prohibited", "Computing walking slopes, contours, or trafficability costs from 8-bit JPEG color brightness is mathematically invalid and dangerous."),
    ("Phase 1 Treatment", "Retained strictly as an unaligned regional physiographic thumbnail card.")
]
for title, text in mola_facts:
    p = c5bf.add_paragraph() if c5bf.paragraphs[0].text else c5bf.paragraphs[0]
    p.text = f"• {title}: "
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = TEXT_GREEN
    r = p.add_run()
    r.text = text
    r.font.bold = False
    r.font.color.rgb = TEXT_WHITE

add_card(s5, Inches(6.8), Inches(1.8), Inches(5.7), Inches(4.9), "Strict Omission of Unsupported Metrics", border_color=TEXT_ORANGE)
c5c = s5.shapes.add_textbox(Inches(7.0), Inches(2.35), Inches(5.3), Inches(4.1))
c5cf = c5c.text_frame
c5cf.word_wrap = True
omissions = [
    ("Walking-Scale Slopes: Unavailable", "Optical CTX imagery shows surface albedo, not elevation. Slopes cannot be computed without a co-registered sub-meter floating-point DTM."),
    ("Traverse Routes & Hazards: Omitted", "Pathfinding without true slope/roughness cost surfaces creates fictitious routes. No A* or Dijkstra paths are simulated."),
    ("Local Pressure: Unavailable", "The MOLA 0m areoid is a geodetic datum, NOT a constant 610.5 Pa isobar. Atmospheric pressure swings diurnally by >25%."),
    ("Radiation & Life Support: Unavailable", "No in-situ telemetry is simulated. Unsupported operational gauges are cleanly omitted from the user interface.")
]
for title, text in omissions:
    p = c5cf.add_paragraph() if c5cf.paragraphs[0].text else c5cf.paragraphs[0]
    p.text = f"✗ {title}:\n"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = TEXT_ORANGE
    r = p.add_run()
    r.text = text
    r.font.bold = False
    r.font.color.rgb = TEXT_WHITE

# ==========================================
# SLIDE 6: AUTOMATED QA & INTEGRITY
# ==========================================
s6 = prs.slides.add_slide(blank_layout)
set_slide_background(s6)
add_header(s6, 6, "Automated Quality Assurance & Reproducibility", "15 Independent Unit Tests Guaranteeing Data Provenance and Integrity")

add_card(s6, Inches(0.8), Inches(1.8), Inches(6.0), Inches(4.9), "15-Test Automated Integrity Suite")
c6a = s6.shapes.add_textbox(Inches(1.0), Inches(2.35), Inches(5.6), Inches(4.1))
c6af = c6a.text_frame
c6af.word_wrap = True
tests_list = [
    ("Tile Retrieval & Hashes", "Validates all 30 Level-12 CTX tiles returned HTTP 200, match declared bytes, and have unique SHA-256 digests."),
    ("Tile Decodability", "Enforces that all 30 tiles decode as 512x512 grayscale PNGs with non-zero pixel standard deviation."),
    ("Service Lineage", "Verifies Mars Trek capabilities XML links to Caltech MapServer and records WKID 104971."),
    ("CRS Discrepancy Arithmetic", "Validates mathematical calculation of ellipsoidal vs spherical divergence (~0.0566° / ~3,353.7 m) and withholding rationale."),
    ("AOI & Distance Geometry", "Validates AOI dimensions (7.10 km x 7.07 km = 50.2 km²) and Curiosity Sol 4452 distance (6.48 km NE) on R=3,389.5 km."),
    ("Official Presentation Exists", "Confirms existence and valid size of AETHON_7Slide_Presentation.pptx and 7 slide sections in slides.html."),
    ("Banned Terms & Clean UI", "Guarantees absence of '0m Areoid Contour', Bezier curves, hazard scores, and external script dependencies.")
]
for title, text in tests_list:
    p = c6af.add_paragraph() if c6af.paragraphs[0].text else c6af.paragraphs[0]
    p.text = f"✓ {title}: "
    p.font.size = Pt(9.5)
    p.font.bold = True
    p.font.color.rgb = TEXT_GREEN
    r = p.add_run()
    r.text = text
    r.font.bold = False
    r.font.color.rgb = TEXT_WHITE

add_card(s6, Inches(7.3), Inches(1.8), Inches(5.2), Inches(4.9), "Execution Output (Isolated Test Runner)")
c6b = s6.shapes.add_textbox(Inches(7.5), Inches(2.35), Inches(4.8), Inches(4.1))
c6bf = c6b.text_frame
c6bf.word_wrap = True
terminal_text = (
    "COMMAND:\n"
    "python3 -m unittest -v test_phase1_quality.py\n\n"
    "test_all_source_tiles_are_decodable ... ok\n"
    "test_aoi_geometry_and_distance ... ok\n"
    "test_crs_discrepancy_magnitude ... ok\n"
    "test_display_raster_declared_extent ... ok\n"
    "test_external_coords_withheld ... ok\n"
    "test_judge_walkthrough_implemented ... ok\n"
    "test_manifest_thirty_tiles ... ok\n"
    "test_map_local_assets ... ok\n"
    "test_mola_asset_rendered_jpeg ... ok\n"
    "test_nasa_wmts_capabilities ... ok\n"
    "test_official_presentation_and_slides ... ok\n"
    "test_public_layer_registry ... ok\n"
    "test_unverified_shapes_absent ... ok\n"
    "test_verified_sample_schema ... ok\n"
    "test_viewer_mobile_responsive ... ok\n\n"
    "Ran 15 tests in 0.34s  |  OK"
)
p = c6bf.paragraphs[0]
p.text = terminal_text
p.font.size = Pt(9.5)
p.font.name = "Courier New"
p.font.color.rgb = RGBColor(180, 230, 200)

# ==========================================
# SLIDE 7: IMPACT & PHASE 2 ROADMAP
# ==========================================
s7 = prs.slides.add_slide(blank_layout)
set_slide_background(s7)
add_header(s7, 7, "Impact, Space Apps Alignment, & Phase 2 Roadmap", "Setting the Gold Standard for Scientific Rigor in Space Exploration Hackathons")

add_card(s7, Inches(0.8), Inches(1.8), Inches(5.6), Inches(4.9), "Alignment with Space Apps Judging Rubric")
c7a = s7.shapes.add_textbox(Inches(1.0), Inches(2.35), Inches(5.2), Inches(4.1))
c7af = c7a.text_frame
c7af.word_wrap = True
rubric = [
    ("Impact", "Demonstrates the vital necessity of auditing planetary datums before human EVAs, preventing multi-kilometer navigation errors."),
    ("Creativity", "Introduces a source-first, limitation-transparent UI paradigm with built-in geodetic inspection tools instead of cosmetic dials."),
    ("Validity", "Zero synthetic data, first-principles mathematics, verifiable SHA-256 hashes, and 15/15 automated integrity checks."),
    ("Relevance", "Directly tackles the Martian Map challenge by creating a real multi-instrument data baseline for Gale Crater."),
    ("Presentation", "Sleek, responsive viewer, clean typography, 7-slide official presentation, and complete reproducible documentation.")
]
for title, text in rubric:
    p = c7af.add_paragraph() if c7af.paragraphs[0].text else c7af.paragraphs[0]
    p.text = f"★ {title}: "
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = TEXT_GREEN
    r = p.add_run()
    r.text = text
    r.font.bold = False
    r.font.color.rgb = TEXT_WHITE

add_card(s7, Inches(6.8), Inches(1.8), Inches(5.7), Inches(4.9), "Phase 2 Prerequisites & Roadmap", border_color=TEXT_AMBER)
c7b = s7.shapes.add_textbox(Inches(7.0), Inches(2.35), Inches(5.3), Inches(4.1))
c7bf = c7b.text_frame
c7bf.word_wrap = True
roadmap = [
    ("Gate 1: Geodetic Harmonization", "Coordinate with USGS/Caltech cartographers to confirm tile matrix coordinate semantics and tie prominent crater rims to an authoritative frame."),
    ("Gate 2: Numeric DTM Acquisition", "Acquire a true 32-bit floating-point numeric DEM (e.g. HiRISE Stereo DTM at 1 m/px or HRSC/MOLA 200m) with vertical elevation in meters."),
    ("Gate 3: Slope & Trafficability Modeling", "Derive directional terrain slopes and trafficability cost surfaces from numeric elevation cells, not optical imagery."),
    ("Gate 4: Contextual EVA Pathfinding", "Integrate metabolic work rates and rover constraints to generate genuine, science-led traverse routes.")
]
for title, text in roadmap:
    p = c7b.text_frame.add_paragraph() if c7b.text_frame.paragraphs[0].text else c7b.text_frame.paragraphs[0]
    p.text = f"→ {title}:\n"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = TEXT_AMBER
    r = p.add_run()
    r.text = text
    r.font.bold = False
    r.font.color.rgb = TEXT_WHITE

out_path = ROOT / "AETHON_7Slide_Presentation.pptx"
prs.save(str(out_path))
print(f"Successfully generated {out_path} ({out_path.stat().st_size} bytes)")
