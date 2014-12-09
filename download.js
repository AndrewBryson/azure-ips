var request = require('request')
	fs = require('fs')
	xml2js = require('xml2js');

var azureUrl = process.env.azureUrl || 'http://download.microsoft.com/download/0/1/8/018E208D-54F8-44CD-AA26-CD7BC9524A8C/PublicIPs_20141201.xml';
console.log("Request to: " + azureUrl);

var tempOutputFile = 'azureIPs.xml';
var finalOutputFile = 'azureIPs.json';

var parser = new xml2js.Parser();

function downloadFile() {

	var r = request
	  .get(azureUrl)
	  .on('error', function(err) {
		console.log('Error during download from ' + azureUrl + ': ' + err)
	  })
	  .pipe(fs.createWriteStream(tempOutputFile));

	r.on('finish', function () {
	  
		var info = [];
		
		fs.readFile(tempOutputFile, function(err, data) {
			parser.parseString(data, function (err, result) {
				
				console.log(result.AzurePublicIpAddresses);
				result.AzurePublicIpAddresses.Region.forEach(function (element) {
								
					var name = element.$.Name;
					console.log(element.$.Name);
					var dataCentre = {
						name: name,
						subnets: []
					};
					
					element.IpRange.forEach(function (element) {
						var subnet = element.$.Subnet;
						console.log(subnet);
						dataCentre.subnets.push(subnet);
					});
					
					info.push(dataCentre);
				});
								
				fs.writeFile(finalOutputFile, JSON.stringify(info), function (err) {
					if (err) throw err;				
					console.log('azureIPs.json written');
				});
			});
		});
		
	});

	setTimeout(downloadFile, 5 * 1000);
}

downloadFile();