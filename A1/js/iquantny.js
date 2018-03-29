(function() {
	var h = 300, w = 800,
		margins = {bottom: h - 20, top: 20, left: 50, right: w - 150},
		animationTime = 1000,
		body = d3.select("body"),
		div = body.select("#newYork"),
		tooltip = d3.select("#tooltipNY").classed("hidden", true),
		title = div.append("h4"),
		svg = div.append("svg")
			.attr("width", w)
			.attr("height", h)

	var parseRow = row => {
	  return {
	    "Index" : parseInt(row.Index),
	    "Month" : row.Month,
	    "Count" : parseInt(row.Count)
	  }
	}

	var innerPadding = 0.1, categoryIndex = 0,
		colours = ["#fb0d16", "#fc8c8c", "#117e11", "#d8e35a"],
		titles = ["Fresh Fruit", "Storage Fruit", "Fresh Vegetable", "Storage Vegetable"],
		x, y, xAxis, yAxis, months, dataset

	// Add labels with on click methods for updating the chart
	var buttons = d3.select("body").select("#nyButtons")
	for (i in titles) {
		buttons.append("a")
			.attr("class", "btn btn-primary")
			.attr("id", "btn" + i)
			.style("width", "20%")
			.style("margin", "5px")
			.style("border", "none")
			.style("background", colours[i])
			.text(titles[i])
	}

	d3.select("#btn0").on("click", () => updateChart(0))
	d3.select("#btn1").on("click", () => updateChart(1))
	d3.select("#btn2").on("click", () => updateChart(2))
	d3.select("#btn3").on("click", () => updateChart(3))


	var handleMouseOver = (rect, d) => {
		// Use mouse coordinates for tooltip position
		var xPos = d3.event.pageX
		var yPos = d3.event.pageY

		// Update the tooltip position
		tooltip.style("left", xPos + "px").style("top", yPos + "px")

		// Update the tooltip information
		d3.select("#count")
			.text(d.Count)

		d3.select("#month")
			.text(d.Month)

		// Show the tooltip
		tooltip.classed("hidden", false)

		// Highlight the current bar
		d3.select(rect).attr("fill", "steelblue")
	}

	var handleMouseOut = rect => {
		//Hide the tooltip again
		tooltip.classed("hidden", true)

		// Remove highlight from the current bar
		d3.select(rect)
			.transition()
			.duration(250)
			.attr("fill", colours[categoryIndex])
	}

	d3.csv("data/nydata.csv", csvData => {
		// Set appropriate plot title
		title.text(titles[categoryIndex])
			.attr("stroke", colours[categoryIndex])

		// Parse all CSV data with helper function
		dataset = csvData.map(d => parseRow(d))

		// Filter out irrelevant categories by index
		data = dataset.filter(d => d.Index == categoryIndex)

		// Find highest y value
		var yMax = d3.max(data, d => d.Count)

		// Find the x domain, the result here is: [Jan, Feb, Mar... Dec]
		months = data.map(d => d.Month)

		// x Scale
		x = d3.scaleBand()
		.domain(months)
		.rangeRound([margins.left, margins.right])
		.paddingInner(innerPadding)

		xAxis = d3.axisBottom(x)

		// y Scale
		y = d3.scaleLinear()
		.domain([0, yMax])
		.range([margins.bottom, margins.top])

		yAxis = d3.axisLeft(y).ticks(5)

		// Bars
		svg.selectAll("rect")
		.data(data)
		.enter()
		.append("rect")
		.attr("x", d => x(d.Month))
		.attr("y", d =>  y(d.Count))
		.attr("width", x.bandwidth())
		.attr("height", d => margins.bottom - y(d.Count))
		.attr("fill", colours[categoryIndex])
			.on("mouseover", function(d) {
				handleMouseOver(this, d)
			})
			.on("mouseout", function() {
				handleMouseOut(this)
			})

		// Make x axis with a g-element
		svg.append("g")
		  .attr("transform", "translate(0, " + (margins.bottom) + ")")
		  .call(xAxis)

		// Make y axis with another g-element
		svg.append("g")
		  .attr("id", "yAxis")
		  .attr("transform", "translate(" + margins.left + ", 0)")
		  .call(yAxis)

		// Text label for the y axis
		svg.append("text")
			.attr("transform", "rotate(-90)")
			.style("text-anchor", "middle")
			.attr("y", margins.left/2 - 10)
			.attr("x", -h/2)
			.text("# of Unique Kinds of Produce")

	})

	var updateChart = (i) => {
		// Update index of category
		categoryIndex = i

		// Set appropriate plot title
		title.text(titles[categoryIndex])
			.attr("stroke", colours[categoryIndex])

		// Filter out irrelevant categories by index
		data = dataset.filter(d => d.Index == categoryIndex)

		// Find highest y value
		var yMax = d3.max(data, d => d.Count)
		y.domain([0, yMax])
		yAxis = d3.axisLeft(y).ticks(5)

		// Redraw histogram bars with new y values
		svg.selectAll("rect")
		.data(data)
		.transition()
		.duration(animationTime)
		.attr("x", d => x(d.Month))
		.attr("y", d =>  y(d.Count))
		.attr("height", d => margins.bottom - y(d.Count))
		.attr("fill", colours[categoryIndex])

		// Update y axis only (x hasn't changed)
		svg.selectAll("#yAxis")
			.transition()
			.duration(animationTime)
			.call(yAxis)
	}

})()
