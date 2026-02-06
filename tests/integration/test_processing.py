"""
Test the HTML processing pipeline.
"""

from pathlib import Path
from python.lib.lineardoc.utils import esc_attr
from python.lib.processor import process_html
from bs4 import BeautifulSoup


def normalize_html_attributes(html: str) -> str:
    """
    Normalize HTML by sorting attributes alphabetically for each tag.
    The structure and content are preserved.
    """
    soup = BeautifulSoup(html, "lxml")

    for tag in soup.find_all(True):
        if tag.attrs:
            # Sort attributes alphabetically
            new_attrs = {
                k: v  # esc_attr(v) if k == "data-parsoid" else v
                for k, v in tag.attrs.items()
            }
            tag.attrs = dict(sorted(new_attrs.items()))

    # Return HTML without pretty-printing to avoid structural changes
    return soup.decode(formatter="html")


def html_work(html):
    """Normalize HTML for comparison."""
    html = normalize_html_attributes(html)
    html = "".join(" ".join(x.split()) for x in html.split("\n"))
    html = html.strip()
    return html


def run_processing_test(num):
    """Test HTML processing with a specific fixture file number."""
    fixtures_dir = Path(__file__).resolve().parent.parent / "fixtures"
    input_path = fixtures_dir / f"input_{num}.html"
    output_path = fixtures_dir / f"output_{num}.html"
    expected_path = fixtures_dir / f"expected_{num}.html"

    with open(expected_path, "r", encoding="utf-8") as f:
        expected_html = f.read()

    with open(input_path, "r", encoding="utf-8") as f:
        input_html = f.read()

    # Process the input
    result = process_html(input_html)

    # Save result for inspection
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(result)

    # Validation
    assert html_work(result) == html_work(expected_html), f"Processed HTML does not match expected for test {num}"
    assert "<section" in result, f"Result {num} should contain section tags"
    assert "cx-segment" in result, f"Result {num} should contain cx-segment spans"
    assert "data-segmentid" in result, f"Result {num} should contain segment IDs"
    assert len(result) > len(input_html) * 0.5, f"Result {num} should have reasonable size"


def test_processing_1():
    run_processing_test(1)


def test_processing_2():
    run_processing_test(2)


def test_processing_3():
    run_processing_test(3)
