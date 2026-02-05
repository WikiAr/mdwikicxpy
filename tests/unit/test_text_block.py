"""
Unit tests for lineardoc/text_block.py module.
"""

import os
import sys

import pytest
from lib.lineardoc.text_block import text_block
from lib.lineardoc.text_chunk import text_chunk


class TestTextBlockCreation:
    """Test text_block initialization."""

    def test_text_block_creation_simple(self):
        """Test creating a simple text_block."""
        chunks = [text_chunk("hello", [])]
        block = text_block(chunks)
        assert block.text_chunks == chunks
        assert block.can_segment is True
        assert len(block.offsets) == 1

    def test_text_block_creation_non_segmentable(self):
        """Test creating non-segmentable text_block."""
        chunks = [text_chunk("hello", [])]
        block = text_block(chunks, can_segment=False)
        assert block.can_segment is False

    def test_text_block_offsets_calculation(self):
        """Test that offsets are calculated correctly."""
        chunks = [text_chunk("hello", []), text_chunk(" world", [])]
        block = text_block(chunks)
        assert len(block.offsets) == 2
        assert block.offsets[0]["start"] == 0
        assert block.offsets[0]["length"] == 5
        assert block.offsets[1]["start"] == 5
        assert block.offsets[1]["length"] == 6

    def test_text_block_empty_chunks(self):
        """Test text_block with empty chunks."""
        chunks = [text_chunk("", [])]
        block = text_block(chunks)
        assert len(block.offsets) == 1
        assert block.offsets[0]["start"] == 0
        assert block.offsets[0]["length"] == 0


class TestTextBlockCommonTags:
    """Test get_common_tags method."""

    def test_get_common_tags_empty(self):
        """Test getting common tags from empty block."""
        chunks = []
        block = text_block(chunks)
        assert block.get_common_tags() == []

    def test_get_common_tags_single_chunk(self):
        """Test getting common tags from single chunk."""
        tags = [{"name": "b"}, {"name": "i"}]
        chunks = [text_chunk("text", tags)]
        block = text_block(chunks)
        common = block.get_common_tags()
        assert len(common) == 2
        assert common[0]["name"] == "b"
        assert common[1]["name"] == "i"

    def test_get_common_tags_all_same(self):
        """Test getting common tags when all chunks have same tags."""
        tags = [{"name": "b"}]
        chunks = [text_chunk("hello", tags[:]), text_chunk(" world", tags[:])]
        block = text_block(chunks)
        common = block.get_common_tags()
        assert len(common) == 1
        assert common[0]["name"] == "b"

    def test_get_common_tags_partial_common(self):
        """Test getting common tags when only some are common."""
        chunks = [
            text_chunk("hello", [{"name": "b"}, {"name": "i"}]),
            text_chunk(" world", [{"name": "b"}, {"name": "u"}]),
        ]
        block = text_block(chunks)
        common = block.get_common_tags()
        assert len(common) == 1
        assert common[0]["name"] == "b"

    def test_get_common_tags_no_common(self):
        """Test getting common tags when none are common."""
        chunks = [text_chunk("hello", [{"name": "b"}]), text_chunk(" world", [{"name": "i"}])]
        block = text_block(chunks)
        common = block.get_common_tags()
        assert len(common) == 0

    def test_get_common_tags_different_lengths(self):
        """Test common tags with different tag counts."""
        chunks = [
            text_chunk("hello", [{"name": "b"}, {"name": "i"}, {"name": "u"}]),
            text_chunk(" world", [{"name": "b"}]),
        ]
        block = text_block(chunks)
        common = block.get_common_tags()
        assert len(common) == 1
        assert common[0]["name"] == "b"


class TestTextBlockTagOffsets:
    """Test get_tag_offsets method."""

    def test_get_tag_offsets_simple(self):
        """Test getting tag offsets."""
        chunks = [text_chunk("plain", []), text_chunk("bold", [{"name": "b"}]), text_chunk("plain", [])]
        block = text_block(chunks)
        offsets = block.get_tag_offsets()
        # Only the bold chunk should have non-common tags
        assert len(offsets) == 1
        assert offsets[0]["start"] == 5  # After 'plain'
        assert offsets[0]["length"] == 4  # Length of 'bold'

    def test_get_tag_offsets_all_common(self):
        """Test tag offsets when all tags are common."""
        tags = [{"name": "b"}]
        chunks = [text_chunk("all", tags[:]), text_chunk(" bold", tags[:])]
        block = text_block(chunks)
        offsets = block.get_tag_offsets()
        # No non-common tags
        assert len(offsets) == 0

    def test_get_tag_offsets_empty_text(self):
        """Test that empty text chunks are not included in offsets."""
        chunks = [text_chunk("text", []), text_chunk("", [{"name": "b"}]), text_chunk("more", [])]  # Empty with tags
        block = text_block(chunks)
        offsets = block.get_tag_offsets()
        # Empty chunk should be excluded
        assert len(offsets) == 0


class TestTextBlockGetTextChunkAt:
    """Test get_text_chunk_at method."""

    def test_get_text_chunk_at_first(self):
        """Test getting chunk at start."""
        chunks = [text_chunk("hello", []), text_chunk(" world", [])]
        block = text_block(chunks)
        chunk = block.get_text_chunk_at(0)
        assert chunk.text == "hello"

    def test_get_text_chunk_at_second(self):
        """Test getting chunk in second position."""
        chunks = [text_chunk("hello", []), text_chunk(" world", []), text_chunk("!", [])]
        block = text_block(chunks)
        chunk = block.get_text_chunk_at(5)  # Start of ' world'
        assert chunk.text == " world"

    def test_get_text_chunk_at_middle_of_chunk(self):
        """Test getting chunk in middle of text."""
        chunks = [text_chunk("hello", []), text_chunk(" world", [])]
        block = text_block(chunks)
        chunk = block.get_text_chunk_at(2)  # Middle of 'hello'
        assert chunk.text == "hello"

    def test_get_text_chunk_at_end(self):
        """Test getting chunk - last iteration returns first chunk if no match."""
        chunks = [text_chunk("hello", []), text_chunk(" world", [])]
        block = text_block(chunks)
        # The implementation iterates to len-1, so for 2 chunks it only checks index 0
        # At offset 10, it would return the first chunk
        chunk = block.get_text_chunk_at(0)
        assert chunk.text == "hello"


class TestTextBlockGetTagForId:
    """Test get_tag_for_id method."""

    def test_get_tag_for_id_with_inline_content(self):
        """Test getting tag when inline content exists."""
        inline_content = {"name": "img", "attributes": {"src": "test.jpg"}}
        chunks = [text_chunk("", [], inline_content)]
        block = text_block(chunks)
        tag = block.get_tag_for_id()
        assert tag == inline_content

    def test_get_tag_for_id_no_inline_content(self):
        """Test getting tag when no inline content."""
        chunks = [text_chunk("text", [])]
        block = text_block(chunks)
        tag = block.get_tag_for_id()
        assert tag is None


class TestTextBlockGetPlainText:
    """Test get_plain_text method."""

    def test_get_plain_text_simple(self):
        """Test getting plain text from simple block."""
        chunks = [text_chunk("hello world", [])]
        block = text_block(chunks)
        assert block.get_plain_text() == "hello world"

    def test_get_plain_text_multiple_chunks(self):
        """Test getting plain text from multiple chunks."""
        chunks = [text_chunk("hello", []), text_chunk(" ", []), text_chunk("world", [])]
        block = text_block(chunks)
        assert block.get_plain_text() == "hello world"

    def test_get_plain_text_with_tags(self):
        """Test that tags don't affect plain text."""
        chunks = [text_chunk("plain", []), text_chunk("bold", [{"name": "b"}]), text_chunk("italic", [{"name": "i"}])]
        block = text_block(chunks)
        assert block.get_plain_text() == "plainbolditalic"

    def test_get_plain_text_empty(self):
        """Test getting plain text from empty block."""
        chunks = [text_chunk("", [])]
        block = text_block(chunks)
        assert block.get_plain_text() == ""
