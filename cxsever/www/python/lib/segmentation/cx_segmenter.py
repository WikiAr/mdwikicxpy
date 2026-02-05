"""
CXSegmenter - Sentence segmentation for Content Translation.
"""

import pysbd


class CXSegmenter:
    """Segmenter for CX documents."""

    def segment(self, parsed_doc, language):
        """
        Segment the given parsed linear document object.
        
        Args:
            parsed_doc: Parsed Doc object
            language: Language code
            
        Returns:
            Segmented Doc object
        """
        return parsed_doc.segment(self.get_segmenter(language))

    def get_segmenter(self, language):
        """
        Get the segmenter for the given language.
        
        Args:
            language: Language code
            
        Returns:
            Function that returns sentence boundary offsets
        """
        def segmenter(text):
            """Segment text into sentences."""
            seg = pysbd.Segmenter(language=language, clean=False)
            sentences = seg.segment(text)
            boundaries = []
            
            for sentence in sentences:
                if sentence.strip():
                    idx = text.find(sentence)
                    if idx != -1:
                        boundaries.append(idx)
            
            return boundaries
        
        return segmenter
