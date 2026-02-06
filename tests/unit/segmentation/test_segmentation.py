"""
Unit tests for lineardoc/utils.py module.
"""
import pytest
import json
from pathlib import Path
from python.lib.segmentation import CXSegmenterNew
from python.lib.lineardoc import MwContextualizer, Parser
cx_segmenter_tests_path = Path(__file__).parent / "SegmentationTests.json"

alltests = {}
with open(cx_segmenter_tests_path, "r", encoding="utf-8") as f:
    alltests = json.load(f)


def get_parsed_doc(content):
    parser = Parser(MwContextualizer())

    parser.init()
    parser.write(content.strip())
    parsed_doc = parser.builder.doc
    return parsed_doc


def normalize(html):
    return "\n".join([line.strip() for line in html.strip().splitlines() if line.strip()])


test_params = [
    (lang, test_case)
    for lang, cases in alltests.items()
    for test_case in cases
]


@pytest.mark.parametrize("lang, test_case", test_params)
def test_cx_segmenter(lang, test_case):
    date_path = Path(__file__).parent / "data"

    with open(date_path / test_case["source"], "r", encoding="utf-8") as f:
        test_data = f.read()

    parsed_doc = get_parsed_doc(test_data)
    segmenter = CXSegmenterNew()
    segmented_linear_doc = segmenter.segment(parsed_doc, lang)
    result = normalize(segmented_linear_doc.get_html())

    with open(date_path / test_case["result"], "r", encoding="utf-8") as f:
        expected_result_data = normalize(f.read())

    assert result == expected_result_data, f"{test_case['source']}: {test_case['desc'] or ''}"
