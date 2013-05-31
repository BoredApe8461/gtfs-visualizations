var express = require('express');
var http = require('http');
//var parser = require('parser');
var path = require('path');
var crypto = require('crypto');
var jquery = require('jquery');
var Gtfs = require(path.join(__dirname, ".", "parser", "loader"));

var dead = 306;
//var dead = 49100;

var dir = "./gtfs/ulm/";
var stops;
var shapes;
var trips;
var gtfs = Gtfs(dir, function(data) {
	//console.log(data);
	//console.log(data.getStops());
	//console.log(data.getShapes());
	stops = data.getStops();
	shapes = data.getShapes();
	trips = data.getTrips();

	foobar();

	server.listen(process.env.PORT || 3000, function() {
		console.log('Listening on port ' + server.address().port);
	});
});

var app = express();
app.use(express.static(__dirname + '/static'));
app.use(express.bodyParser());

var server = require('http').createServer(app);


var lines = []
app.get('/lines/', function(req, res){
	res.send(lines);
});

app.get('/stops/', function(req, res){
	console.log(stops);
	res.send(stops);
	//res.send("foo\n");
});

app.get('/shapes/', function(req, res){
	res.send(shapes);
});

app.get('/trips/', function(req, res){
	res.send(trips);
});

var max;
var min;

function foobar() {
	var trips_count = []
	for (var i in trips) {
		var trip = trips[i];
		if (trips_count[ trip.shape_id ] == undefined)
			trips_count[ trip.shape_id ] = 1;
		else
			trips_count[ trip.shape_id ]++;
	}

	/*
	we have to break the shapes in chunks of predecessor/successor,
	cause there might be overlapping segments of different shapes.
	[
		{ {x:.., y:..}, {x:.., y:..} }: {
			trips: 3 	// 3 trips along this segment
			, shape_ids: []
		}
	]
	*/

	// ensure that the points are in the correct order!
	var segments = []
	var sequences = []
	for (var i in shapes) {
		var shape = shapes[i];
		if (sequences[shape.shape_id] == undefined)
			sequences[shape.shape_id] = []

		sequences[shape.shape_id][shape.shape_pt_sequence] = shape;
	}
	//console.log(sequences["87007R0-0712"][0]);

	var a = 0
	for (var i in sequences) {
		var A = undefined;
		var B = undefined;

		for (var n in sequences[i]) {
			a++;
			var shape = sequences[i][n];
			var shape_id = shape.shape_id

			if (A == undefined) {
				A = {"lat": shape.shape_pt_lat, "lng": shape.shape_pt_lon};
				continue;
			} else {
				B = {"lat": shape.shape_pt_lat, "lng": shape.shape_pt_lon};
				var foo = hash([A, B]);

				// maybe shape from different direction, but on this segment
				var foo2 = hash([B, A]);

				if (segments[foo] == undefined) {
					segments[foo] = {
						"trips": 0
						, "shape_ids": [shape_id]
						, "from": A
						, "to": B
					}
				} else {
					if (jquery.inArray(shape_id, segments[foo].shape_ids) === -1) 
						segments[foo].shape_ids.push(shape_id)
				}
				segments[foo].trips += trips_count[shape_id];

				// check if {B, A} in arr
				if (foo != foo2 && segments[foo2] != undefined) {
					segments[foo2].trips = segments[foo].trips
					// ggf shape_ids.push(shape_id)
				}

				if (segments[foo].trips > max || max == undefined)
					max = segments[foo].trips;

				if (segments[foo].trips < min || min == undefined)
					min = segments[foo].trips;

				//A = B;
				A = {"lat": shape.shape_pt_lat, "lng": shape.shape_pt_lon};
			}

			
			if (a == dead-1) {
				console.log("")
				console.log(segments[foo])
				console.log(foo)
			}

			if (a == dead) {
				console.log("")
				console.log(segments[foo])
				console.log(foo)
				console.log("tada")
				//console.log(segments);
				break;
			}
		
		}

		if (a == dead) break;
	}
	console.log(segments.length);
	console.log(a);
	console.log("max " + max);
	console.log("min " + min);

	// now generate svg paths from segments array!
	var a = 0;
	/*
		lines = [ {from: [x, y], to: [x, y], trips: 0} , ... ]
	*/
	for (var i in segments) {
		// draw a line for each segment
		var px_from = coord2px(segments[i].from.lat, segments[i].from.lng);
		var px_to = coord2px(segments[i].to.lat, segments[i].to.lng);
		var obj = { "from": {"x": px_from.x, "y": px_from.y}
			    , "to":   {"x": px_to.x, "y": px_to.y}
			    , "trips": segments[i].trips
		};
		//console.log(obj)
		//console.log(typeof(parseInt(segments[i].to.lat)))
		//break
		lines.push(obj);

		//console.log(i)
		//console.log(obj)
		//if (i == segments.length - 1)
			//console.log(segments[i])

		//console.log(segments[i])
		//console.log(segments[i])
		//console.log(segments[i].trips)
		//if (++a == 10) break;
	}
	//console.log(lines)
	console.log(lines.length + " lines");
}

var imgWidth = 1400;
var imgHeight = 1400;

function coord2px(lat, lng) {
	var center_coord = {lat: 48.40783887047417, lng: 9.987516403198242};
	var center_px = {x: imgWidth/2, y: imgHeight/2};
	//var coord2px_factor = 11000;
	//var coord2px_factor = 8400;
	var coord2px_factor = -19000;
	//var coord2px_factor = -8000;
	//var coord2px_factor = 3400;

	var offsetX = 0;
	var offsetY = 0;
	var offsetY = -500;
	var offsetX = -500;

	var _lat = (lat)*1
	var _lng = (lng)*1
	//console.log(_lat)

	return {
		  x: center_px.x + ((_lat - center_coord.lat) * coord2px_factor) + offsetX
		, y: center_px.y + ((_lng - center_coord.lng) * coord2px_factor) + offsetY
	};
}

function hash(foo) {
	var md5 = crypto.createHash('sha1');
	md5.update(JSON.stringify(foo), "ascii")

	return md5.digest("hex")
}

