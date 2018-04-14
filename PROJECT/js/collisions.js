(function () {
	var w = 800
	var h = 500

	var w2 = 500
	var h2 = 300
	var boundaries = {
		bottom: h2 - 60,
		top: 20,
		left: 60,
		right: w2 - 20
	}
	var innerPadding = 0.1

	//Define quantize scale to sort data values into buckets of color
    let color = ['#27586B', '#003549', '#05425A', '#52707C', '#888B8C']

	//For converting Dates to strings
	var hourOfDay = time => {
		var values = time.split(":")
		return +values[0]
	}

	var parseRow = row => ({
		"date": row.DATE,
		"lat": parseFloat(row.LATITUDE),
		"lon": parseFloat(row.LONGITUDE)
	})

	//Define map projection
	// From http://bl.ocks.org/phil-pedruco/6646844
	var projection = d3.geoMercator()
		.center([-73.94, 40.70])
		.translate([w / 2, h / 2])
		.scale(55 * 1000)

	//Define path generator
	var path = d3.geoPath()
		.projection(projection)

	//Create SVG element
	var svgGeo = d3.select("body").select("#container")
		.append("svg")
		.attr("width", w)
		.attr("height", h)

	//Load in GeoJSON data
	d3.json("data/boroughs.geojson", (error, json) => {
		if (error) console.log("error fetching data")

		//Bind data and create one path per GeoJSON feature
		svgGeo.selectAll("path")
			.data(json.features)
			.enter()
			.append("path")
			.attr("d", path)
			.style("fill", (d, i) => color[i])
			.style("stroke", "black")

		svgGeo.selectAll("text")
			.data(json.features)
			.enter()
			.append("text")
			.attr("class", "label")
			.attr("x", d => path.centroid(d)[0] - 30)
			.attr("y", d => path.centroid(d)[1])
			.style("fill", "black")
			.text(d => d.properties.BoroName)

		d3.csv("data/nyc_collisions.csv", parseRow, data => {


			let goodData = data.filter(d => d.date && d.lat && d.lon)
			let chunk = goodData.filter((d, i) => i < 10000)

			console.log(chunk)

			// var data2018 = data.filter(d => new Date(d.date).getFullYear() == 2018)

			// console.log(data2018)

			var circles = svgGeo.append("g")
				.selectAll("circle")
				.data(chunk)
				.enter()
				.append("circle")
				.attr("cx", d => projection([d.lon, d.lat])[0])
				.attr("cy", d => projection([d.lon, d.lat])[1])
				.attr("r", 1)
				.style("stroke-width", 0.25)
				.style("opacity", 0.75)
				.style("fill", "red")
		})

	})
})()
