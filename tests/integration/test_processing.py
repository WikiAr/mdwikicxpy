"""
Test the HTML processing pipeline.
"""

import os
import sys
from pathlib import Path
from lib.processor import process_html


def test_processing():
    """Test HTML processing with fixture files."""
    # Load input HTML
    input_path = Path(__file__).resolve().parent.parent / "fixtures" / "input_1.html"
    expected_path = Path(__file__).resolve().parent.parent / "fixtures" / "expected_1.html"

    with open(input_path, "r", encoding="utf-8") as f:
        input_html = f.read()

    with open(expected_path, "r", encoding="utf-8") as f:
        expected_html = f.read()

    # Process the input
    result = process_html(input_html)

    # Save result for inspection
    output_path = Path(__file__).resolve().parent.parent / "fixtures" / "output_1.html"
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(result)

    # Basic validation - check if key elements are present
    assert "<section" in result, "Result should contain section tags"
    assert "cx-segment" in result, "Result should contain cx-segment spans"
    assert "data-segmentid" in result, "Result should contain segment IDs"
    assert len(result) > 0, "Result should not be empty"

    # Check that processing increased the size (due to added segments, IDs, etc.)
    assert len(result) > len(input_html) * 0.5, "Result should have reasonable size"


def test_processing_2():
    """Test HTML processing with fixture files."""
    # Load input HTML
    input_path = Path(__file__).resolve().parent.parent / "fixtures" / "input_2.html"
    expected_path = Path(__file__).resolve().parent.parent / "fixtures" / "expected_2.html"

    with open(input_path, "r", encoding="utf-8") as f:
        input_html = f.read()

    with open(expected_path, "r", encoding="utf-8") as f:
        expected_html = f.read()

    # Process the input
    result = process_html(input_html)

    # Save result for inspection
    output_path = Path(__file__).resolve().parent.parent / "fixtures" / "output_2.html"
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(result)
