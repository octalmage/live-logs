#!/usr/bin/env node

var blessed = require("blessed");
var contrib = require("blessed-contrib");
var Client = require("ssh2").Client;
var geoip = require("geoip-lite");
var program = require("commander");

//The command line options!
program
	.version('0.0.1')
	.description('Display live traffic on a map.')
	.option('-s, --host <host>', 'hostname or IP address')
	.option('-u, --username <username>', 'ssh username')
	.option('-k, --key <key>', 'private key path')
	.option('-l, --log <log>', 'access log path on server')
	.option('-r, --regex [regex]', 'regex for matching the IP address')
	.parse(process.argv);


if (typeof program.host === "undefined") 
{
   program.help();
}

//Match IP address from nginx logs.
var ipRegex = /v1\|(.*?)\|/;
var markers = [];

//Get ready for the ssh connection.
var conn = new Client();

//Create our screen for displaying widgets.
var screen = blessed.screen();

screen.title = "Live Logs";

//Create our map.
var map = contrib.map(
{
	label: "Live Logs"
});

//Add the map to the screen.
screen.append(map)

//RENDER.
screen.render()

conn.on("ready", function()
{
	conn.exec("tail -f " + program.log, function(err, stream)
	{
		if (err) throw err;
		stream.on("close", function(code, signal)
		{
			//console.log("Stream :: close :: code: " + code + ", signal: " + signal);
			conn.end();
		}).on("data", function(data)
		{
			//Extract the IP.
			var match = ipRegex.exec(data);
			var ip = match[1];

			//No localhost.
			if (ip === "127.0.0.1")
				return;

			var geo = geoip.lookup(match[1]);

			geo.ip = ip;

			//Make sure the IP doesn't already exist on the map.
			for (var i in markers)
			{
				if (markers[i].ip === ip)
					return;
			}

			markers.push(geo);

			updateMap();

			//Remove the marker after 5 seconds.
			setTimeout(function()
			{
				markers.shift();
				updateMap();
			}, 5000);

		}).stderr.on("data", function(data)
		{
			//console.log("STDERR: " + data);
		});
	});
}).connect(
{
	host: program.host,
	port: 22,
	username: program.username,
	privateKey: require("fs").readFileSync(program.key)
});

//Updates the map using the markers array.
function updateMap()
{
	map.clearMarkers();

	for (var i in markers)
	{
		map.addMarker(
		{
			"lon": markers[i].ll[1],
			"lat": markers[i].ll[0],
			color: "red",
			char: "X"
		})
	}
	screen.render();
}