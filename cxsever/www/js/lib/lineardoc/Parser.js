/**
 * @external Contextualizer
 */

import sax from 'sax';
import Builder from './Builder.js';
import { isTransclusion as _isTransclusion, is_inline_empty_tag, isMath, is_reference, isSegment } from './utils.js';

const BLOCK_TAGS = [
	'html', 'head', 'body', 'script',
	// head tags
	// In HTML5+RDFa, link/meta are actually allowed anywhere in the body, and are to be
	// treated as void flow content (like <br> and <img>).
	'title', 'style', 'meta', 'link', 'noscript', 'base',
	// non-visual content
	'audio', 'data', 'datagrid', 'datalist', 'dialog', 'eventsource', 'form',
	'iframe', 'main', 'menu', 'menuitem', 'optgroup', 'option',
	// paragraph
	'div', 'p',
	// tables
	'table', 'tbody', 'thead', 'tfoot', 'caption', 'th', 'tr', 'td',
	// lists
	'ul', 'ol', 'li', 'dl', 'dt', 'dd',
	// HTML5 heading content
	'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hgroup',
	// HTML5 sectioning content
	'article', 'aside', 'body', 'nav', 'section', 'footer', 'header', 'figure',
	'figcaption', 'fieldset', 'details', 'blockquote',
	// other
	'hr', 'button', 'canvas', 'center', 'col', 'colgroup', 'embed',
	'map', 'object', 'pre', 'progress', 'video',
	// non-annotation inline tags
	'img', 'br',
	'wiki-chart'
];

/**
 * Parser to read an HTML stream into a Doc
 *
 * @class
 */
class Parser extends sax.SAXParser {
	/**
	 * @param {Contextualizer} contextualizer Tag contextualizer
	 * @param {Object} options Options
	 */
	constructor(contextualizer, options) {
		super(false, {
			lowercase: true
		});
		this.contextualizer = contextualizer;
		this.options = options || {};
	}

	init() {
		this.rootBuilder = new Builder();
		this.builder = this.rootBuilder;
		// Stack of tags currently open
		this.allTags = [];
	}

	on_open_tag(tag) {
		if (
			// Check if this tag is a child tag of a removable tag
			this.contextualizer.get_context() === 'removable' ||
			// Check if the tag is removable. Note that it is not added to contextualizer yet.
			this.contextualizer.isRemovable(tag)
		) {
			this.allTags.push(tag);
			this.contextualizer.on_open_tag(tag);
			return;
		}

		if (this.options.isolateSegments && isSegment(tag)) {
			this.builder.pushBlockTag({
				name: 'div',
				attributes: {
					class: 'cx-segment-block'
				}
			});
		}

		if (is_reference(tag) || isMath(tag)) {
			// Start a reference: create a child builder, and move into it
			this.builder = this.builder.createChildBuilder(tag);
		} else if (is_inline_empty_tag(tag.name)) {
			this.builder.addInlineContent(
				tag, this.contextualizer.can_segment()
			);
		} else if (this.is_inline_annotation_tag(tag.name, _isTransclusion(tag))) {
			this.builder.pushInlineAnnotationTag(tag);
		} else {
			this.builder.pushBlockTag(tag);
		}

		this.allTags.push(tag);
		this.contextualizer.on_open_tag(tag);
	}

	on_close_tag(tagName) {
		const tag = this.allTags.pop(),
			is_ann = this.is_inline_annotation_tag(tagName, _isTransclusion(tag));

		if (this.contextualizer.isRemovable(tag) || this.contextualizer.get_context() === 'removable') {
			this.contextualizer.on_close_tag(tag);
			return;
		}

		this.contextualizer.on_close_tag(tag);

		if (is_inline_empty_tag(tagName)) {
			return;
		} else if (is_ann && this.builder.inlineAnnotationTags.length > 0) {
			this.builder.popInlineAnnotationTag(tagName);
			if (this.options.isolateSegments && isSegment(tag)) {
				this.builder.pop_block_tag('div');
			}
		} else if (is_ann && this.builder.parent !== null) {
			// In a sub document: should be a span or sup that closes a reference
			if (tagName !== 'span' && tagName !== 'sup') {
				throw new Error('Expected close reference - span or sup tags, got "' + tagName + '"');
			}
			this.builder.finishTextBlock();
			this.builder.parent.addInlineContent(
				this.builder.doc, this.contextualizer.can_segment()
			);
			// Finished with child now. Move back to the parent builder
			this.builder = this.builder.parent;
		} else if (!is_ann) {
			// Block level tag close
			if (tagName === 'p' && this.contextualizer.can_segment()) {
				// Add an empty textchunk before the closing block tag to flush segmentation contexts
				// For example, transclusion based references at the end of paragraphs
				this.builder.addTextChunk('', this.contextualizer.can_segment());
			}
			this.builder.pop_block_tag(tagName);
		} else {
			throw new Error('Unexpected close tag: ' + tagName);
		}
	}

	ontext(text) {
		if (this.contextualizer.get_context() === 'removable') {
			return;
		}
		this.builder.addTextChunk(text, this.contextualizer.can_segment());
	}

	onscript(text) {
		this.builder.addTextChunk(text, this.contextualizer.can_segment());
	}

	/**
	 * Determine whether a tag is an inline annotation or not
	 *
	 * @param {string} tagName Tag name in lowercase
	 * @param {boolean} isTransclusion If the tag is transclusion
	 * @return {boolean} Whether the tag is an inline annotation
	 */
	is_inline_annotation_tag(tagName, isTransclusion) {
		const context = this.contextualizer.get_context();
		// <span> inside a media context acts like a block tag wrapping another block tag <video>
		// See https://www.mediawiki.org/wiki/Specs/HTML/1.7.0#Audio/Video
		if (tagName === 'span' && context === 'media') {
			return false;
		}

		// Audio or Video are block tags. But in a media-inline context they are inline.
		if ((tagName === 'audio' || tagName === 'video') && context === 'media-inline') {
			return true;
		}

		// Styles are usually block tags, but sometimes style tags are used as transclusions
		// Example: T217585. In such cases treat styles as inline to avoid wrong segmentations.
		if (tagName === 'style' && isTransclusion) {
			return true;
		}
		// All tags that are not block tags are inline annotation tags.
		return !BLOCK_TAGS.includes(tagName);
	}
}

export default Parser;
