"""
Lineardoc module - Linear document representation for HTML.

This module provides classes for representing and manipulating HTML documents
in a linear format, matching the API of the JavaScript implementation from
mediawiki-services-cxserver.
"""

from .doc import Doc
from .text_block import TextBlock
from .text_chunk import TextChunk
from .builder import Builder
from .parser import Parser
from .contextualizer import Contextualizer
from .mw_contextualizer import MwContextualizer
from .normalizer import Normalizer

__all__ = [
    'Doc',
    'TextBlock',
    'TextChunk',
    'Builder',
    'Parser',
    'Contextualizer',
    'MwContextualizer',
    'Normalizer'
]
