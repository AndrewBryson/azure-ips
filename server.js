var express = require('express')
var app = express();
var fs = require('fs');
var _ = require('underscore');

app.set('view engine', 'jade');

var defaultPort = 3000;
var inputFile = 'azureIPs.json';
var azureData;
var lastUpdatedDate;

function readInputFile() {
	console.log('Reading file');
	
	fs.stat(inputFile, function (err, stats) {
		lastUpdatedDate = stats.ctime;
	});
	
	fs.readFile(inputFile, 'utf8', function (err, data) {
		azureData = JSON.parse(data);
	});
}

app.get('/', function(req, res, next) {
	res.render('index', {
		dataCentres: azureData,
		lastUpdated: lastUpdatedDate
	});
});

app.get('/:name', function(req, res, next) {
	var name = req.params.name.toLowerCase();
	console.log('dc name: ' + name);
	
	var dc = _.find(azureData, function (centre) { return centre.name == name; });
	if (!dc) {
		console.log('dc ' + name + ' is null');
		res.status(404).send('Not found');
		res.end();
	} else {
		res.render('centreData', {
			dataCentre: dc
		});
	}
})

var readInterval = 60 * 1000;
var readFile = setInterval(readInputFile, readInterval);
readInputFile();

var port = process.env.port || defaultPort;
var server = app.listen(port);