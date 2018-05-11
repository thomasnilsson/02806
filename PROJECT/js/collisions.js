(function () {
	var w = 500
	var h = 300
	var boundaries = {
		bottom: h - 60,
		top: 20,
		left: 60,
		right: w - 20
	}
	var innerPadding = 0.1

	var svgNested = d3.select("body").select("#container3")
		.append("svg")
		.attr("width", w)
		.attr("height", h)

	var svgAgg = d3.select("body").select("#containerHistogram")
		.append("svg")
		.attr("width", w)
		.attr("height", h)

	let parseHistogramRow = row => ({
		"ym": row.ym,
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

	let parseRow = row => ({
		"hour": row.hour,
		"total": +row.total_injured + (+row.total_killed),
		"pedestrians": +row.pedestrians_injured + (+row.pedestrians_killed),
		"cyclists": +row.cyclists_injured + (+row.cyclists_killed),
		"motorists": +row.motorists_injured + (+row.motorists_killed)
	})

	let drawNestedHistogram = histogramData => {
		let yMax = d3.max(histogramData, d => d.values.length)

		// x Scale
		let xScale = d3.scaleBand()
			.domain(histogramData.map(d => d.key))
			.rangeRound([boundaries.left, boundaries.right])
			.paddingInner(innerPadding)

		let xAxis = d3.axisBottom(xScale)

		// y Scale
		let yScale = d3.scaleLinear()
			.domain([0, yMax])
			.range([boundaries.bottom, boundaries.top])

		let yAxis = d3.axisLeft(yScale).ticks(5)

		// Bars
		svgNested.selectAll(".counts")
			.data(histogramData)
			.enter()
			.append("rect").attr("class", "counts")
			.attr("x", d => xScale(d.key))
			.attr("y", d => yScale(d.values.length))
			.attr("width", xScale.bandwidth())
			.attr("height", d => {
				console.log(d)
				return boundaries.bottom - yScale(d.values.length)
			})
			.attr("fill", "steelblue")

		// Make x axis with a g-element
		svgNested.append("g")
			.attr("transform", "translate(0, " + (boundaries.bottom) + ")")
			.call(xAxis)

		// Make y axis with another g-element
		svgNested.append("g")
			.attr("id", "yAxis")
			.attr("transform", "translate(" + boundaries.left + ", 0)")
			.call(yAxis)

		// Text label for the Y axis
		svgNested.append("text")
			.attr("transform", "rotate(-90)")
			.style("text-anchor", "middle")
			.attr("y", boundaries.left / 2 - 10)
			.attr("x", -h / 2)
			.text("# Of Incidents")

		// Text label for the X axis
		svgNested.append("text")
			// .attr("transform", "rotate(-90)")
			.style("text-anchor", "middle")
			.attr("y", boundaries.bottom + 40)
			.attr("x", w / 2)
			.text("Hour of the Day")
	}

	let drawAggregateHistogram = histogramData => {
		let pMax = d3.max(histogramData, d => d.pedestrians)
		let cMax = d3.max(histogramData, d => d.cyclists)
		let mMax = d3.max(histogramData, d => d.motorists)
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
		svgAgg.selectAll(".pedestrian")
			.data(histogramData)
			.enter()
			.append("rect").attr("class", "pedestrian")
			.attr("x", d => xScale(d.hour))
			.attr("y", d => yScale(d.motorists))
			.attr("width", xScale.bandwidth())
			.attr("height", d => boundaries.bottom - yScale(d.motorists))
			.attr("fill", "green")

		svgAgg.selectAll(".bike")
			.data(histogramData)
			.enter()
			.append("rect").attr("class", "bike")
			.attr("x", d => xScale(d.hour) + xScale.bandwidth() / 4)
			.attr("y", d => yScale(d.pedestrians))
			.attr("width", xScale.bandwidth() / 2)
			.attr("height", d => boundaries.bottom - yScale(d.pedestrians))
			.attr("fill", "orange")

		svgAgg.selectAll(".car")
			.data(histogramData)
			.enter()
			.append("rect").attr("class", "car")
			.attr("x", d => xScale(d.hour) + (xScale.bandwidth() / 2.6))
			.attr("y", d => yScale(d.cyclists))
			.attr("width", xScale.bandwidth() / 4)
			.attr("height", d => boundaries.bottom - yScale(d.cyclists))
			.attr("fill", "red")

		// Make x axis with a g-element
		svgAgg.append("g")
			.attr("transform", "translate(0, " + (boundaries.bottom) + ")")
			.call(xAxis)

		// Make y axis with another g-element
		svgAgg.append("g")
			.attr("id", "yAxis")
			.attr("transform", "translate(" + boundaries.left + ", 0)")
			.call(yAxis)

		// Text label for the Y axis
		svgAgg.append("text")
			.attr("transform", "rotate(-90)")
			.style("text-anchor", "middle")
			.attr("y", boundaries.left / 2 - 10)
			.attr("x", -h / 2)
			.text("Injured or Killed")

		// Text label for the X axis
		svgAgg.append("text")
			// .attr("transform", "rotate(-90)")
			.style("text-anchor", "middle")
			.attr("y", boundaries.bottom + 40)
			.attr("x", w / 2)
			.text("Hour of the Day")
	}


	d3.csv("data/histogram_data.csv", parseHistogramRow, data => {
		let nested = d3.nest()
			.key(d => d.hour)
			.sortKeys(d3.ascending)
			.entries(data)
		console.log(nested)

		drawNestedHistogram(nested)
	})

	d3.csv("data/histogram_data_aggregated.csv", parseRow, data => {
		drawAggregateHistogram(data)
	})

})()