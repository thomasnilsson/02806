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


	var histogramData = []

	for (var i = 1; i < 10; i++) {
		var obj = {
			"x": i,
			"a": 6 * i,
			"b": 3 * i,
			"c": 2 * i
		}
		histogramData.push(obj)
	}

	console.log(histogramData)

	let yMax = d3.max(histogramData, d => d.a)

	console.log(yMax)

	let colors = ["red", "orange", "steelblue"]

	var svg = d3.select("body").select("#container2")
		.append("svg")
		.attr("width", w2)
		.attr("height", h2)

	// x Scale
	x = d3.scaleBand()
		.domain(histogramData.map(d => d.x))
		.rangeRound([boundaries.left, boundaries.right])
		.paddingInner(innerPadding)

	xAxis = d3.axisBottom(x).ticks(7)

	// y Scale
	y = d3.scaleLinear()
		.domain([0, yMax])
		.range([boundaries.bottom, boundaries.top])

	yAxis = d3.axisLeft(y).ticks(5)

	// Bars

	svg.selectAll(".pedestrian")
		.data(histogramData)
		.enter()
		.append("rect").attr("class", "pedestrian")
		.attr("x", d => x(d.x))
		.attr("y", d => y(d.a))
		.attr("width", x.bandwidth())
		.attr("height", d => boundaries.bottom - y(d.a))
		.attr("fill", "#555")

	svg.selectAll(".bike")
		.data(histogramData)
		.enter()
		.append("rect").attr("class", "bike")
		.attr("x", d => x(d.x) + x.bandwidth() / 4)
		.attr("y", d => y(d.b))
		.attr("width", x.bandwidth() / 2)
		.attr("height", d => boundaries.bottom - y(d.b))
		.attr("fill", "#888")

	svg.selectAll(".car")
		.data(histogramData)
		.enter()
		.append("rect").attr("class", "car")
		.attr("x", d => x(d.x) + (x.bandwidth() / 2.6))
		.attr("y", d => y(d.c))
		.attr("width", x.bandwidth() / 4)
		.attr("height", d => boundaries.bottom - y(d.c))
		.attr("fill", "#EEE")

	// Make x axis with a g-element
	svg.append("g")
		.attr("transform", "translate(0, " + (boundaries.bottom) + ")")
		.call(xAxis)

	// Make y axis with another g-element
	svg.append("g")
		.attr("id", "yAxis")
		.attr("transform", "translate(" + boundaries.left + ", 0)")
		.call(yAxis)

	// Text label for the y axis
	svg.append("text")
		.attr("transform", "rotate(-90)")
		.style("text-anchor", "middle")
		.attr("y", boundaries.left/2 - 10)
		.attr("x", -h / 4)
		.text("Injured or killed")

	// Text label for the y axis
	svg.append("text")
		// .attr("transform", "rotate(-90)")
		.style("text-anchor", "middle")
		.attr("y", boundaries.bottom + 40)
		.attr("x", w/3)
		.text("Hour of the Day")

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
		.scale(45 * 1000)

	//Define path generator
	var path = d3.geoPath()
		.projection(projection)

	//Create SVG element
	var svgGeo = d3.select("body").select("#container")
		.append("svg")
		.attr("width", w)
		.attr("height", h)

	let colorFunc = x => "rgb(" + x + "," + x + "," + x + ")"

	//Load in GeoJSON data
	d3.json("data/zipcodes.geojson", (error, json) => {
		if (error) console.log("error fetching data")

		console.log(json)

		//Bind data and create one path per GeoJSON feature
		svgGeo.selectAll("path")
			.data(json.features)
			.enter()
			.append("path")
			.attr("d", path)
			.style("fill", d => colorFunc(d.id))
			.style("stroke", "black")

		// d3.csv("data/nyc_collisions.csv", parseRow, data => {

		// 	let goodData = data.filter(d => d.date && d.lat && d.lon)
		// 	let chunk = goodData.filter((d, i) => i < 10000)

		// 	console.log(chunk)

		// 	// var data2018 = data.filter(d => new Date(d.date).getFullYear() == 2018)

		// 	// console.log(data2018)

		// 	var circles = svgGeo.append("g")
		// 		.selectAll("circle")
		// 		.data(chunk)
		// 		.enter()
		// 		.append("circle")
		// 		.attr("cx", d => projection([d.lon, d.lat])[0])
		// 		.attr("cy", d => projection([d.lon, d.lat])[1])
		// 		.attr("r", 1)
		// 		.style("stroke-width", 0.25)
		// 		.style("opacity", 0.75)
		// 		.style("fill", "red")
		// })

	})

})()
