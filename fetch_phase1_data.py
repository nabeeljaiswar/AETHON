#!/usr/bin/env python3
"""Compatibility entry point for the checked Phase 1 CTX downloader.

The previous loader displayed a level-5 CTX tile and asserted an unverified
HiRISE swath. Current Phase 1 uses the auditable level-12 CTX mosaic builder.
Run this file beside build_real_data.py; MOLA remains context-only.
"""
from pathlib import Path
import runpy

builder = Path(__file__).with_name("build_real_data.py")
if not builder.is_file():
    raise SystemExit("build_real_data.py must be beside this compatibility script")
runpy.run_path(str(builder), run_name="__main__")
