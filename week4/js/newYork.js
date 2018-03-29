(function() {
	let h = 350
	let w = 600
	let padding = 50
	let height = h - padding
	let width = w - padding
	let animationTime = 1000
	let body = d3.select("body")
	let histogramDiv = body.select("#newYork")
	let title = histogramDiv.append("h4")
	let svg = histogramDiv
		.append("svg")
		.attr("width", w)
		.attr("height", h)

	let parseRow = row => {
	  return {
	    "Index" : parseInt(row.Index),
	    "Month" : row.Month,
	    "Count" : parseInt(row.Count)
	  }
	}

	let innerPadding = 0.1
	let categoryIndex = 0
	let colours = ["#fb0d16", "#fc8c8c", "#117e11", "#d8e35a"]
	let titles = ["Fresh Fruit", "Storage Fruit", "Fresh Vegetable", "Storage Vegetale"]
	let x, y, xAxis, yAxis, months, dataset

	let handleMouseOver = (rect, d) => {
		// Use mouse coordinates for tooltip position
		let xPos = d3.event.pageX
		let yPos = d3.event.pageY

		// Update the tooltip position
	  d3.select("#tooltip")
			.style("left", xPos + "px")
	    .style("top", yPos + "px")

		// Update the tooltip information
		d3.select("#count").text(d.Count)
	  d3.select("#month").text(d.Month)

		// Show the tooltip
		d3.select("#tooltip").classed("hidden", false)

		// Highlight the current bar
		d3.select(rect).attr("fill", "steelblue")
	}

	let handleMouseOut = rect => {
		//Hide the tooltip again
		d3.select("#tooltip").classed("hidden", true)

		// Remove highlight from the current bar
		d3.select(rect)
			.transition()
			.duration(250)
			.attr("fill", colours[categoryIndex])
	}

	d3.csv("data/nydata.csv", csvData => {
		// Set appropriate plot title
	  title.text(titles[categoryIndex])

		// Parse all CSV data with helper function
	  dataset = csvData.map(d => parseRow(d))

	  // Filter out irrelevant categories by index
	  data = dataset.filter(d => d.Index == categoryIndex)

		// Find highest y value
	  let yMax = d3.max(data, d => d.Count)

		// Find the x domain, the result here is: [Jan, Feb, Mar... Dec]
	  months = data.map(d => d.Month)

		// x Scale
	  x = d3.scaleBand()
	    .domain(months)
	    .rangeRound([padding, width])
	    .paddingInner(innerPadding)

	  xAxis = d3.axisBottom(x)

		// y Scale
	  y = d3.scaleLinear()
	    .domain([0, yMax])
	    .range([height, padding])

	  yAxis = d3.axisLeft(y).ticks(5)

	  // Bars
	  svg.selectAll("rect")
	    .data(data)
	    .enter()
	    .append("rect")
	    .attr("x", d => x(d.Month))
	    .attr("y", d =>  y(d.Count))
	    .attr("width", x.bandwidth())
	    .attr("height", d => height - y(d.Count))
	    .attr("fill", colours[categoryIndex])
			.on("mouseover", function(d) {
				handleMouseOver(this, d)
			})
			.on("mouseout", function() {
				handleMouseOut(this)
			})

	    // Make x axis with a g-element
	    svg.append("g")
	      .attr("transform", "translate(0, " + (h - padding) + ")")
	      .call(xAxis)

			// Make y axis with another g-element
	    svg.append("g")
	      .attr("id", "yAxis")
	      .attr("transform", "translate(" + padding + ", 0)")
	      .call(yAxis)

			// Text label for the y axis
		  svg.append("text")
	      .attr("transform", "rotate(-90)")
				.style("text-anchor", "middle")
				.attr("y", padding / 2)
	      .attr("x", 0 - 10 - (h / 2))
				.style("font-weight", "bold")
				.text("# of Unique Kinds of Produce")

	})

	let updateChart = () => {
	  // Find out what category to display (0 - 3)
	  categoryIndex = (categoryIndex + 1) % 4

		// Set appropriate plot title
	  title.text(titles[categoryIndex])

	  // Filter out irrelevant categories by index
	  data = dataset.filter(d => d.Index == categoryIndex)

		// Find highest y value
	  let yMax = d3.max(data, d => d.Count)


	  y.domain([0, yMax])

	  yAxis = d3.axisLeft(y).ticks(5)

	  // Redraw histogram bars with new y values
	  svg.selectAll("rect")
	    .data(data)
	    .transition()
	    .duration(animationTime)
	    .attr("x", d => x(d.Month))
	    .attr("y", d =>  y(d.Count))
	    .attr("height", d => height - y(d.Count))
	    .attr("fill", colours[categoryIndex])

	    // Update y axis only (x hasn't changed)
	    svg.selectAll("#yAxis").call(yAxis)
	}

})()
