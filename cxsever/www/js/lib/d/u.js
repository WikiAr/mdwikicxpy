'use strict';

const LinearDoc = require('../lineardoc')

const fs = require('fs'),
	yaml = require('js-yaml'),
	CXSegmenter = require('../segmentation/CXSegmenter');

const pageloaderConfig = yaml.load(fs.readFileSync(__dirname + '/MWPageLoader.yaml'));

const removableSections = pageloaderConfig.removableSections;

function normalize(html) {
	const normalizer = new LinearDoc.Normalizer();
	normalizer.init();
	normalizer.write(html.replace(/[\t\r\n]+/g, ''));
	return normalizer.getHtml();
}

function tet(source_HTML) {

	const parser = new LinearDoc.Parser(new LinearDoc.mw_contextualizer(
		{ removableSections: removableSections }
	), {
		wrapSections: true
	});

	parser.init();
	parser.write(source_HTML);
	let parsedDoc = parser.builder.doc;
	parsedDoc = parsedDoc.wrapSections();

	const segmentedDoc = new CXSegmenter().segment(parsedDoc, "en");

	const result = segmentedDoc.getHtml();

	return result;
}

module.exports = {
	tet
};
