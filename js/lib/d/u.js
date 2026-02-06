'use strict';

const LinearDoc = require('../lineardoc')
const CXSegmenter = require('../segmentation/CXSegmenter')

// const fs = require('fs')
// const yaml = require('js-yaml')
// const pageloaderConfig = yaml.load(fs.readFileSync(__dirname + '/MWPageLoader.yaml'));
// const removableSections_old = pageloaderConfig.removableSections;

const removableSections = {
	"classes": [
		"ambox",
		"hatnote",
		"metadata",
		"navbar",
		"navbox",
		"sisterproject",
		"sistersitebox",
		"vertical-navbox"
	],
	"rdfa": [
		"mw:Extension/indicator",
		"mw:Extension/templatestyles"
	],
	"templates": [
		"/^pp(-.*)?$/",
		"/^Articles (for|with|needing|containing).*$/",
		"/^Engvar[AB]$/",
		"/^Use[\\sa-z]+(English|spelling|referencing)$/",
		"/^Use [DMY]+ dates$/",
		"/^Wikipedia articles (for|with|needing|containing).*$/",
		"Anchor",
		"DEFAULTSORT",
		"Esborrany",
		"Featured article",
		"FR",
		"Mdwiki revid",
		"mdwiki revid",
		"/^[Mm]dwiki[ _]revid$",
		"good article",
		"/^(.*-)?Stub$/",
		"Short description",
		"Void",
		"Italic title",
		"About",
		"See also",
		"Redirect",
		"Distinguish",
		"TOC limit",
		"/^#unlinkedwikibase:id=Q\\d+$/",
		"Other uses",
		"redirect"
	]
};

function tet(source_HTML) {

	const parser = new LinearDoc.Parser(new LinearDoc.MwContextualizer(
		{ removableSections: removableSections }
	), {
		wrapSections: true
	});

	parser.init();
	parser.write(source_HTML);
	let parsedDoc = parser.builder.doc;
	parsedDoc = parsedDoc.wrapSections();

	const segmentedDoc = new CXSegmenter().segment(parsedDoc, "en");

	const result = segmentedDoc.get_html();

	return result;
}

module.exports = {
	tet
};
