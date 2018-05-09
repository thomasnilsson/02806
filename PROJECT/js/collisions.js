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

	var svg = d3.select("body").select("#container2")
		.append("svg")
		.attr("width", w2)
		.attr("height", h2)


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

		// console.log(json)

		//Bind data and create one path per GeoJSON feature
		svgGeo.selectAll("path")
			.data(json.features)
			.enter()
			.append("path")
			.attr("d", path)
			.style("fill", d => colorFunc(d.id))
			.style("stroke", "black")
	})

	let parseHistogramRow = row => ({
		"hour": row.hour,
		"total_injured": +row.total_injured,
		"total_killed": +row.total_killed,
		"pedestrians_injured": +row.pedestrians_injured,
		"pedestrians_killed": +row.pedestrians_killed,
		"cyclists_injured": +row.cyclists_injured,
		"cyclists_killed": +row.cyclists_killed,
		"motorists_injured": +row.motorists_injured,
		"motorists_killed": +row.motorists_killed
	})

	d3.csv("data/histogram_data.csv", parseHistogramRow, histogramData => {
		console.log(histogramData)


		let pMax = d3.max(histogramData, d => d.pedestrians_injured)
		let cMax = d3.max(histogramData, d => d.cyclists_injured)
		let mMax = d3.max(histogramData, d => d.motorists_injured)
		let yMax = d3.max([pMax, cMax, mMax])

		// x Scale
		let xScale = d3.scaleBand()
			.domain(histogramData.map(d => d.hour))
			.rangeRound([boundaries.left, boundaries.right])
			.paddingInner(innerPadding)

		let xAxis = d3.axisBottom(xScale)
		
		// y Scale
		let yScale = d3.scaleLinear()
			.domain([0, yMax])
			.range([boundaries.bottom, boundaries.top])

		let yAxis = d3.axisLeft(yScale).ticks(5)

		// Bars
		svg.selectAll(".pedestrian")
			.data(histogramData)
			.enter()
			.append("rect").attr("class", "pedestrian")
			.attr("x", d => xScale(d.hour))
			.attr("y", d => yScale(d.motorists_injured))
			.attr("width", xScale.bandwidth())
			.attr("height", d => boundaries.bottom - yScale(d.motorists_injured))
			.attr("fill", "green")

		svg.selectAll(".bike")
			.data(histogramData)
			.enter()
			.append("rect").attr("class", "bike")
			.attr("x", d => xScale(d.hour) + xScale.bandwidth() / 4)
			.attr("y", d => yScale(d.pedestrians_injured))
			.attr("width", xScale.bandwidth() / 2)
			.attr("height", d => boundaries.bottom - yScale(d.pedestrians_injured))
			.attr("fill", "orange")

		svg.selectAll(".car")
			.data(histogramData)
			.enter()
			.append("rect").attr("class", "car")
			.attr("x", d => xScale(d.hour) + (xScale.bandwidth() / 2.6))
			.attr("y", d => yScale(d.cyclists_injured))
			.attr("width", xScale.bandwidth() / 4)
			.attr("height", d => boundaries.bottom - yScale(d.cyclists_injured))
			.attr("fill", "red")

		// Make x axis with a g-element
		svg.append("g")
			.attr("transform", "translate(0, " + (boundaries.bottom) + ")")
			.call(xAxis)

		// Make y axis with another g-element
		svg.append("g")
			.attr("id", "yAxis")
			.attr("transform", "translate(" + boundaries.left + ", 0)")
			.call(yAxis)

		// Text label for the Y axis
		svg.append("text")
			.attr("transform", "rotate(-90)")
			.style("text-anchor", "middle")
			.attr("y", boundaries.left / 2 - 10)
			.attr("x", -h / 4)
			.text("Injured or killed")

		// Text label for the X axis
		svg.append("text")
			// .attr("transform", "rotate(-90)")
			.style("text-anchor", "middle")
			.attr("y", boundaries.bottom + 40)
			.attr("x", w / 3)
			.text("Hour of the Day")
	})



})()


// var histogramData = []

	// for (var i = 1; i < 24; i++) {
	// 	var obj = {
	// 		"x": i,
	// 		"a": 6 * i,
	// 		"b": 3 * i,
	// 		"c": 2 * i
	// 	}
	// 	histogramData.push(obj)
	// }

	// let yMax = d3.max(histogramData, d => d.a)

	

	// // x Scale
	// x = d3.scaleBand()
	// 	.domain(histogramData.map(d => d.x))
	// 	.rangeRound([boundaries.left, boundaries.right])
	// 	.paddingInner(innerPadding)

	// xAxis = d3.axisBottom(x).ticks(7)
	// // y Scale
	// y = d3.scaleLinear()
	// 	.domain([0, yMax])
	// 	.range([boundaries.bottom, boundaries.top])

	// yAxis = d3.axisLeft(y).ticks(5)

	// // Bars
	// svg.selectAll(".pedestrian")
	// 	.data(histogramData)
	// 	.enter()
	// 	.append("rect").attr("class", "pedestrian")
	// 	.attr("x", d => x(d.x))
	// 	.attr("y", d => y(d.a))
	// 	.attr("width", x.bandwidth())
	// 	.attr("height", d => boundaries.bottom - y(d.a))
	// 	.attr("fill", "#555")

	// svg.selectAll(".bike")
	// 	.data(histogramData)
	// 	.enter()
	// 	.append("rect").attr("class", "bike")
	// 	.attr("x", d => x(d.x) + x.bandwidth() / 4)
	// 	.attr("y", d => y(d.b))
	// 	.attr("width", x.bandwidth() / 2)
	// 	.attr("height", d => boundaries.bottom - y(d.b))
	// 	.attr("fill", "#888")

	// svg.selectAll(".car")
	// 	.data(histogramData)
	// 	.enter()
	// 	.append("rect").attr("class", "car")
	// 	.attr("x", d => x(d.x) + (x.bandwidth() / 2.6))
	// 	.attr("y", d => y(d.c))
	// 	.attr("width", x.bandwidth() / 4)
	// 	.attr("height", d => boundaries.bottom - y(d.c))
	// 	.attr("fill", "#EEE")

	// // Make x axis with a g-element
	// svg.append("g")
	// 	.attr("transform", "translate(0, " + (boundaries.bottom) + ")")
	// 	.call(xAxis)

	// // Make y axis with another g-element
	// svg.append("g")
	// 	.attr("id", "yAxis")
	// 	.attr("transform", "translate(" + boundaries.left + ", 0)")
	// 	.call(yAxis)

	// // Text label for the y axis
	// svg.append("text")
	// 	.attr("transform", "rotate(-90)")
	// 	.style("text-anchor", "middle")
	// 	.attr("y", boundaries.left / 2 - 10)
	// 	.attr("x", -h / 4)
	// 	.text("Injured or killed")

	// // Text label for the y axis
	// svg.append("text")
	// 	// .attr("transform", "rotate(-90)")
	// 	.style("text-anchor", "middle")
	// 	.attr("y", boundaries.bottom + 40)
	// 	.attr("x", w / 3)
	// 	.text("Hour of the Day")