import Doc from './Doc.js';
import { isExternalLink, is_reference, isTransclusion } from './utils.js';
import text_block from './text_block.js';
import text_chunk from './text_chunk.js';

/**
 * A document builder
 *
 * @class
 */
class Builder {
	/**
	 * @param {Builder} [parent] Parent document builder
	 * @param {Object} [wrapper_tag] tag that wraps document (if there is a parent)
	 */
	constructor(parent, wrapper_tag) {
		this.BLOCK_TAGS = [];
		// Stack of annotation tags
		this.inlineAnnotationTags = [];
		// The height of the annotation tags that have been used, minus one
		this.inlineAnnotationTagsUsed = 0;
		this.doc = new Doc(wrapper_tag || null);
		this.text_chunks = [];
		this.isBlockSegmentable = true;
		this.parent = parent || null;
	}

	createChildBuilder(wrapper_tag) {
		return new Builder(this, wrapper_tag);
	}

	pushBlockTag(tag) {
		this.finishTextBlock();
		this.BLOCK_TAGS.push(tag);
		if (this.isIgnoredTag(tag)) {
			return;
		}
		if (tag.name === 'figure') {
			tag.attributes.rel = 'cx:Figure';
		}
		this.doc.add_item('open', tag);
	}

	isSection(tag) {
		return tag.name === 'section' && tag.attributes['data-mw-section-id'];
	}

	isIgnoredTag(tag) {
		return this.isSection(tag) || this.isCategory(tag);
	}

	isCategory(tag) {
		return tag.name === 'link' && tag.attributes.rel &&
			// We add the spaces before and after to ensure matching on the "word" mw:PageProp/Category
			// without additional content. This is technically not necessary (we don't generate
			// mw:PageProp/Category/SomethingElse) nor entirely correct (attributes values could be separated by other
			// characters than 0x20), but provides a bit of future-proofing.
			(' ' + tag.attributes.rel + ' ').includes(' mw:PageProp/Category ') && !tag.attributes.about;
	}

	pop_block_tag(tagName) {
		const tag = this.BLOCK_TAGS.pop();
		if (!tag || tag.name !== tagName) {
			throw new Error(
				'Mismatched block tags: open=' + (tag && tag.name) + ', close=' + tagName
			);
		}
		this.finishTextBlock();

		if (!this.isIgnoredTag(tag)) {
			this.doc.add_item('close', tag);
		}

		return tag;
	}

	pushInlineAnnotationTag(tag) {
		this.inlineAnnotationTags.push(tag);
	}

	popInlineAnnotationTag(tagName) {
		let i;
		const tag = this.inlineAnnotationTags.pop();
		if (this.inlineAnnotationTagsUsed === this.inlineAnnotationTags.length) {
			this.inlineAnnotationTagsUsed--;
		}
		if (!tag || tag.name !== tagName) {
			throw new Error(
				'Mismatched inline tags: open=' + (tag && tag.name) + ', close=' + tagName
			);
		}

		if (!Object.keys(tag.attributes).length) {
			// Skip tags which have attributes, content or both from further check to
			// see if we want to keep inline content. Else we assume that, if this tag has
			// whitespace or empty content, it is ok to remove it from resulting document.
			// But if it has attributes, we make sure that there are inline content blocks to
			// avoid them missing in resulting document.
			// See T104539
			return;
		}
		// Check for empty/whitespace-only data tags. Replace as inline content
		let replace = true;
		const whitespace = [];
		for (i = this.text_chunks.length - 1; i >= 0; i--) {
			const textChunk = this.text_chunks[i];
			const chunkTag = textChunk.tags[textChunk.tags.length - 1];
			if (!chunkTag) {
				break;
			}
			if (textChunk.text.match(/\S/) || textChunk.inline_content || chunkTag !== tag) {
				// textChunk has non whitespace content, Or it has child tags.
				replace = false;
				break;
			}
			whitespace.push(textChunk.text);
		}

		// Allow empty external links because REST API v1 can output links with
		// no link text (which then get a CSS generated content numbered reference).
		if (replace && (is_reference(tag) || isExternalLink(tag) || isTransclusion(tag))) {
			// truncate list and add data span as new sub-Doc.
			this.text_chunks.length = i + 1;
			whitespace.reverse();
			this.addInlineContent(
				new Doc()
					.add_item('open', tag)
					.add_item('textblock', new text_block(
						[new text_chunk(whitespace.join(''), [])]
					))
					.add_item('close', tag)
			);
		}
		return;
	}

	addTextChunk(text, can_segment) {
		this.text_chunks.push(new text_chunk(text, this.inlineAnnotationTags.slice()));
		this.inlineAnnotationTagsUsed = this.inlineAnnotationTags.length;
		// Inside a textblock, if a textchunk becomes segmentable, unlike inline tags,
		// the textblock becomes segmentable. See T195768
		this.isBlockSegmentable = can_segment;
	}

	/**
	 * Add content that doesn't need linearizing, to appear inline
	 *
	 * @method
	 * @param {Object} content Sub-document or empty SAX tag
	 * @param {boolean} can_segment
	 */
	addInlineContent(content, can_segment) {
		// If the content is a category tag, capture it separately and don't add to doc.
		if (this.isCategory(content)) {
			this.doc.categories.push(content);
			return;
		}
		this.text_chunks.push(new text_chunk('', this.inlineAnnotationTags.slice(), content));
		if (!can_segment) {
			this.isBlockSegmentable = false;
		}
		this.inlineAnnotationTagsUsed = this.inlineAnnotationTags.length;
	}

	finishTextBlock() {
		let whitespace = [], whitespaceOnly = true;

		if (this.text_chunks.length === 0) {
			return;
		}
		for (let i = 0, len = this.text_chunks.length; i < len; i++) {
			const textChunk = this.text_chunks[i];
			if (textChunk.inline_content || textChunk.text.match(/\S/)) {
				whitespaceOnly = false;
				whitespace = undefined;
				break;
			} else {
				whitespace.push(this.text_chunks[i].text);
			}
		}
		if (whitespaceOnly) {
			this.doc.add_item('blockspace', whitespace.join(''));
		} else {
			this.doc.add_item('textblock', new text_block(this.text_chunks, this.isBlockSegmentable));
		}
		this.text_chunks = [];
		this.isBlockSegmentable = true;
	}

}

export default Builder;
