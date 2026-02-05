# Test Suite Documentation

## Overview
This project includes a comprehensive pytest test suite with **215 tests** achieving **80% code coverage**.

## Test Structure

The test suite is organized into two main categories:

### Unit Tests (`tests/unit/`)
Tests for individual modules, classes, and functions in isolation (205 tests):

#### Core Utility Tests
- **test_util.py** (14 tests) - Tests for the `get_prop` utility function
- **test_utils.py** (30 tests) - Tests for HTML utility functions including:
  - HTML escape functions (`esc`, `esc_attr`)
  - Tag HTML generation (`get_open_tag_html`, `get_close_tag_html`)
  - Tag cloning (`clone_open_tag`)
  - Tag type detection (`is_inline_empty_tag`, `is_segment`, `is_reference`, etc.)

#### Document Model Tests
- **test_text_chunk.py** (9 tests) - Tests for the `text_chunk` class
  - Text chunk creation with tags and inline content
  - Unicode text handling
  - Special character preservation

- **test_text_block.py** (23 tests) - Tests for the `text_block` class
  - Text block creation and segmentation
  - Common tag detection
  - Tag offset calculation
  - Plain text extraction

- **test_doc.py** (24 tests) - Tests for the `Doc` class
  - Document item management
  - HTML generation
  - Section wrapping
  - Document cloning
  - Segment extraction

#### Parser and Builder Tests
- **test_builder.py** (17 tests) - Tests for the `Builder` class
  - Block and inline tag management
  - Text chunk handling
  - Category and section detection
  - Child builder creation

- **test_parser.py** (17 tests) - Tests for the `Parser` class
  - HTML parsing
  - Tag processing
  - Inline annotation detection
  - Integration with contextualizers

#### Contextualizer Tests
- **test_contextualizer.py** (28 tests) - Tests for contextualizers
  - Base `Contextualizer` class (9 tests)
  - `mw_contextualizer` for MediaWiki HTML (19 tests)
    - Context tracking (removable, verbatim, media, section, contentBranch)
    - Removable section detection (by class, RDFa, template)
    - Transclusion fragment handling

#### Normalizer and Segmentation Tests
- **test_normalizer.py** (11 tests) - Tests for the `Normalizer` class
  - HTML normalization
  - Text escaping
  - Attribute preservation
  - Unicode handling

- **test_segmenter.py** (14 tests) - Tests for the `CXSegmenter` class
  - Sentence boundary detection
  - Multi-language support
  - Document segmentation
  - Special case handling (abbreviations, punctuation)

### Integration Tests (`tests/integration/`)
End-to-end tests for complete processing pipelines (10 tests):

- **test_processor.py** (7 tests) - Tests for the main processor
  - End-to-end HTML processing
  - Section creation
  - Segment generation
  - MediaWiki element handling
  - Complex structure processing

- **test_comprehensive.py** (2 tests) - High-level integration tests
  - Complete pipeline testing
  - MediaWiki element processing

- **test_processing.py** (1 test) - Fixture-based processing test
  - Real-world HTML processing scenarios

## Running the Tests

### Run all tests:
```bash
python3 -m pytest tests/
```

### Run only unit tests:
```bash
python3 -m pytest tests/unit/
```

### Run only integration tests:
```bash
python3 -m pytest tests/integration/
```

### Run with verbose output:
```bash
python3 -m pytest tests/ -v
```

### Run with coverage report:
```bash
python3 -m pytest tests/ --cov=cxsever/www/python/lib --cov-report=term-missing
```

### Run specific test file:
```bash
python3 -m pytest tests/unit/test_parser.py -v
python3 -m pytest tests/integration/test_processor.py -v
```

### Run specific test class or function:
```bash
python3 -m pytest tests/unit/test_doc.py::TestDocCreation -v
python3 -m pytest tests/unit/test_utils.py::TestEscapeFunctions::test_esc_basic -v
```

## Coverage Summary

Current code coverage: **80%**

| Module | Statements | Missing | Coverage |
|--------|-----------|---------|----------|
| lineardoc/contextualizer.py | 19 | 0 | 100% |
| lineardoc/text_chunk.py | 5 | 0 | 100% |
| lineardoc/util.py | 14 | 0 | 100% |
| processor.py | 24 | 0 | 100% |
| segmentation/cx_segmenter.py | 18 | 0 | 100% |
| lineardoc/mw_contextualizer.py | 70 | 1 | 99% |
| lineardoc/normalizer.py | 45 | 3 | 93% |
| lineardoc/builder.py | 98 | 9 | 91% |
| lineardoc/parser.py | 95 | 10 | 89% |
| lineardoc/doc.py | 208 | 44 | 79% |
| lineardoc/utils.py | 158 | 46 | 71% |
| lineardoc/text_block.py | 187 | 74 | 60% |

## Test Categories

### Unit Tests
- Test individual functions and methods in isolation
- Mock dependencies where necessary
- Fast execution (< 1 second total)

### Integration Tests
- Test interaction between multiple components
- Test complete HTML processing pipeline
- Verify end-to-end functionality

### Edge Case Tests
- Empty input handling
- Unicode text processing
- Special character escaping
- Complex nested structures
- Invalid input handling

## Key Features Tested

1. **HTML Parsing**
   - SAX-style parsing
   - Tag attribute handling
   - Nested element processing
   - Unicode content support

2. **Document Structure**
   - Linear document representation
   - Text block and chunk management
   - Tag annotation handling
   - Section wrapping

3. **MediaWiki Support**
   - WikiLink processing
   - Figure and caption handling
   - Removable section detection
   - Transclusion handling

4. **Segmentation**
   - Sentence boundary detection
   - Multi-language support (English, Spanish, Arabic, etc.)
   - Segment ID generation
   - Link tracking

5. **Content Processing**
   - HTML normalization
   - Section creation
   - Reference handling
   - Table and list processing

## Dependencies

Tests require the following packages (from requirements.txt):
- pytest==8.0.0
- pytest-cov==4.1.0
- lxml==5.1.0
- pysbd==0.3.4
- PyYAML==6.0.1

## Contributing

When adding new features:
1. Write tests first (TDD approach)
2. Ensure all existing tests pass
3. Aim for >80% code coverage for new code
4. Include edge case tests
5. Document complex test scenarios

## Continuous Integration

The test suite is designed to run in CI/CD pipelines:
- Fast execution (typically < 1 second)
- No external dependencies
- Deterministic results
- Clear failure messages
