# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

mdwikicxpy is a Python port of the MediaWiki Content Translation (CX) Server HTML processing pipeline. It converts MediaWiki HTML (Parsoid format) into translation-ready segmented HTML with proper IDs and metadata.

## Common Commands

### Testing
```bash
# Run all tests
pytest tests/ -v

# Run specific test categories
pytest tests/unit/ -v          # Unit tests only
pytest tests/integration/ -v   # Integration tests only

# Run with coverage
pytest tests/ --cov=python/lib --cov-report=term-missing

# Run specific test file
pytest tests/unit/test_parser.py -v
pytest tests/unit/test_doc.py::TestDocCreation -v
```

### Linting and Formatting
```bash
black python/ tests/ --line-length 120
ruff check python/ tests/
isort python/ tests/
mypy python/
```

### Running the Application
```bash
# Development server
cd python && python app.py

# Production server
gunicorn -w 4 -b 0.0.0.0:8000 app:app
```

## Architecture

### Processing Pipeline

The system processes MediaWiki HTML through a 5-stage pipeline:

```
Input HTML → Parse → Contextualize → Wrap Sections → Segment → Output HTML
```

1. **Parse**: SAX-style HTML parsing using lxml into a linear document structure
2. **Contextualize**: Apply MediaWiki rules via `MwContextualizer`, remove unwanted sections per `config/MWPageLoader.yaml`
3. **Wrap Sections**: Add `<section>` tags with metadata
4. **Segment**: Split text into sentence-level translation units using `CXSegmenter` (pysbd) or `CXSegmenterNew` (sentencex)
5. **Output**: Serialize to HTML with tracking IDs

### Core Data Classes

| Class | File | Description |
|-------|------|-------------|
| `Doc` | `python/lib/lineardoc/doc.py` | Linear document as array of items (open/close tags, textblocks, blockspaces) |
| `text_block` | `python/lib/lineardoc/text_block.py` | Block of annotated text with segmentation support |
| `text_chunk` | `python/lib/lineardoc/text_chunk.py` | Uniformly-annotated inline text chunk |

### Key Modules

- `processor.py` - Main entry point with `process_html()` and `process_html_new()` functions
- `parser.py` - SAX-style HTML parser using lxml
- `builder.py` - Document builder for creating linear documents
- `mw_contextualizer.py` - MediaWiki-specific contextualizer (removable sections, transclusions)
- `cx_segmenter.py` - Two segmenter implementations: `CXSegmenter` (pysbd) and `CXSegmenterNew` (sentencex)

### Dual Segmentation Implementations

- `process_html()` uses `CXSegmenter` with pysbd
- `process_html_new()` uses `CXSegmenterNew` with sentencex

Segment counts may differ between implementations due to different boundary detection algorithms.

## Configuration

- `config/MWPageLoader.yaml` defines removable sections (classes, RDFa types, templates) for MediaWiki content filtering
- Line length is 120 characters (Black, Ruff, isort)
- Target Python version: 3.13
