var express = require("express");
var cors = require('cors');
var bodyParser = require('body-parser');
var u = require('./lib/d/u.js');

var app = express();

app.use(cors())

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));

app.post("/textp", (req, res) => {
	const sourceHtml = req.body.html;

	if (!sourceHtml || sourceHtml.trim().length === 0) {
		res.send({
			result: 'Content for translate is not given or is empty'
		});
		res.status(500).end();
		return;
	}
	try {
		const processedText = u.tet(sourceHtml);
		res.send({ result: processedText });
	} catch (error) {
		console.error(error);
		res.send({
			result: error.message
		});
		res.status(500).end();
	}
	// res.send(processedText);

});

app.listen(process.env.PORT || 8000, function () {
	console.log("Node.js app is listening on port " + (process.env.PORT || 8000));
});

