var hBoston = 500, wBoston = 800,
	marginsBoston = {bottom: hBoston - 60, top: 20, left: 60, right: wBoston - 180},
	divBoston = d3.select("body").select("#chartBoston"),
	tooltipBoston = d3.select("#tooltipBoston").classed("hidden", true),
	titleBoston = divBoston.append("h4").text("Boston Marathon Times"),
	menCSV = "data/boston_men_open.csv", womenCSV = "data/boston_women_open.csv",
	menColor = "green", womenColor = "red",
	animationTimeBoston = 2500,
	manClass = "manElement", womanClass = "womanElement",
	svgBoston = divBoston.append("svg").attr("width", wBoston).attr("height", hBoston),
	xBoston, yBoston, xMinBoston, xMaxBoston, yMinBoston, yMaxBoston,
	xAxisBoston, yAxisBoston, xAxisTopBoston, yAxisRight, line,
	womenDataset, menDataset


// Functions for finding x and y variables of datasets
var getX = d => d.Year, mapX = d => xBoston(d.Year)
	getY = d => d.Time, mapY = d => yBoston(d.Time)

let parseRowBoston = d => {
	return {
		"Year" : new Date(+d.Year, 0),
		"Athlete" : d.Athlete,
		"Time" : timeToMinutes(d.Time)
	}
}

let timeToMinutes = time => {
	let arr = time.split(":")
	return (+arr[0] * 60) + (+arr[1]) + (+arr[2] / 60)
}

// returns slope, intercept and r-square of the line
let leastSquares = (xSeries, ySeries) => {
	let reduceSumFunc = (prev, cur) => prev + cur

	let xBar = xSeries.reduce(reduceSumFunc) / xSeries.length
	let yBar = ySeries.reduce(reduceSumFunc) / ySeries.length

	let ssXX = xSeries.map(d => Math.pow(d - xBar, 2))
		.reduce(reduceSumFunc)

	let ssYY = ySeries.map(d => Math.pow(d - yBar, 2))
		.reduce(reduceSumFunc)

	let ssXY = xSeries.map((d, i) => (d - xBar) * (ySeries[i] - yBar))
		.reduce(reduceSumFunc)

	let slope = ssXY / ssXX
	let intercept = yBar - (xBar * slope)
	let rSquare = Math.pow(ssXY, 2) / (ssXX * ssYY)

	return [slope, intercept, rSquare]
}

var handleMouseOverBoston = (dot, d) => {
	// Use mouse coordinates for tooltip position
	var xPos = d3.event.pageX +10
	var yPos = d3.event.pageY

	// Update the tooltip information
	var year = d.Year.getFullYear()
	d3.select("#year").text(year)
  	d3.select("#winner").text(d.Athlete)
	d3.select("#time").text(parseInt(d.Time) + " minutes")

	// Show the tooltip
	tooltipBoston.classed("hidden", false)
		.style("left", xPos + "px")
		.style("top", yPos + "px")

	// Highlight the current bar
	d3.select(dot).attr("fill", "steelblue")
}

var handleMouseOutBoston = dot => {
	//Hide the tooltip again
	tooltipBoston.classed("hidden", true)

	// Remove highlight from the current bar
	d3.select(dot)
		.transition()
		.duration(250)
		.attr("fill", "none")
}

var plotTrendLine = (dataset, color, selector) => {
	var reducedData = dataset.filter(d => d.Year.getFullYear() < 1990)
	var xLabels = reducedData.map(getX)
	var xSeries = d3.range(1, xLabels.length + 1)
	var ySeries = reducedData.map(getY)

	var leastSquaresCoeff = leastSquares(xSeries, ySeries)
	var x1 = xLabels[0],
		x2 = xLabels[xLabels.length - 1]

	var y1 = leastSquaresCoeff[0] + leastSquaresCoeff[1],
		y2 = leastSquaresCoeff[0] * xSeries.length + leastSquaresCoeff[1]

	var lineData = [{"x1" : x1, "y1" : y1, "x2" : x2, "y2" : y2}]

	var trendline = svgBoston.selectAll(selector)
		.append(".trendline")
		.data(lineData)
		.enter()
		.append("line")
		.attr("class", selector + " trendLine")
		.attr("x1", d => xBoston(d.x1))
		.attr("y1", d => yBoston(d.y1))
		.attr("x2", d => xBoston(d.x2))
		.attr("y2", d => yBoston(d.y2))
		.attr("stroke", color)
		.attr("stroke-dasharray", "2, 3")
		.attr("stroke-width", 1)
}

var plotLegend = () => {
	svgBoston.append("rect")
		.attr("stroke", menColor)
		.attr("x", marginsBoston.right + 50)
		.attr("y", marginsBoston.bottom / 2 - 10)
		.attr("width", 10)
		.attr("height", 10)
		.attr("fill", "none")

	svgBoston.append("text")
		.text("Men's Open")
		.attr("fill", menColor)
		.attr("x", marginsBoston.right + 65)
		.attr("y", marginsBoston.bottom / 2)

	svgBoston.append("text")
		.text("Women's Open")
		.attr("fill", womenColor)
		.attr("x", marginsBoston.right + 65)
		.attr("y", marginsBoston.bottom / 2 + 25)

	svgBoston.append("circle")
		.attr("stroke", womenColor)
		.attr("cx", marginsBoston.right + 55)
		.attr("cy", marginsBoston.bottom / 2 + 20)
		.attr("r", 6)
		.attr("fill", "none")
}

var plotPath = (dataset, color, selector) => {
	// Plot path using line generator
	svgBoston.append("path")
	   .datum(dataset)
	   .attr("class", selector + " path")
	   .attr("stroke-width", "1px")
	   .attr("fill", "none")
	   .attr("stroke", color)
	   .attr("d", d3.line().x(mapX).y(mapY))
}

var scatterPlotRect = (dataset, color, selector) => {
	svgBoston.selectAll(selector)
 	  .data(dataset)
 	  .enter()
 	  .append("rect")
 	  .attr("class", selector + " square")
	  .attr("x", mapX)
	  .attr("y", mapY)
	  .attr("width", 4)
	  .attr("height", 4)
	  .attr("transform", "translate(-2,-2)")
 	  .attr("fill", "none")
 	  .attr("stroke", color)
	  .on("mouseover", function(d) {
		  handleMouseOverBoston(this, d)
	  })
	  .on("mouseout", function(d) {
		  handleMouseOutBoston(this)
	  })

}

var scatterPlotCircle = (dataset, color, selector) => {
	svgBoston.selectAll(selector)
 	  .data(dataset)
 	  .enter()
	  .append("circle")
 	  .attr("class", selector + " dot")
 	  .attr("cx", mapX)
 	  .attr("cy", mapY)
 	  .attr("r", 2.5)
 	  .attr("fill", "none")
 	  .attr("stroke", color)
	  .on("mouseover", function(d) {
		  handleMouseOverBoston(this, d)
	  })
	  .on("mouseout", function(d) {
		  handleMouseOutBoston(this)
	  })
}

var plotAxes = () => {
	// Make x axis with a g-element
	svgBoston.append("g")
		.attr("id", "xAxis")
		.attr("transform", "translate(0, " + marginsBoston.bottom + ")")
		.call(xAxisBoston)

	// Mirror x axis and reverse tick directions
	svgBoston.append("g")
		.attr("id", "xAxisTop")
		.attr("transform", "translate(0, " + marginsBoston.top + ")")
		.call(xAxisTopBoston)
		.selectAll(".tick line")
		.attr("transform", "translate(0,6)")

	// Make y axis with another g-element
	svgBoston.append("g")
		.attr("id", "yAxis")
		.attr("transform", "translate(" + marginsBoston.left + ", 0)")
		.call(yAxisBoston)

	// Mirror y axis and reverse tick directions
	svgBoston.append("g")
		.attr("id", "yAxisRight")
		.attr("transform", "translate(" + marginsBoston.right+ ", 0)")
		.call(yAxisRight)
		.selectAll(".tick line")
		.attr("transform", "translate(-6,0)")

	// Label for the y axis
	svgBoston.append("text")
		.attr("transform", "rotate(-90)")
		.style("text-anchor", "middle")
		.attr("y", marginsBoston.left/2 - 15)
		.attr("x", -hBoston / 2)
		.text("Winning Time (Minutes)")

	// Label for the x axis
	svgBoston.append("text")
		.style("text-anchor", "middle")
		.attr("y", marginsBoston.bottom + 40)
		.attr("x", (marginsBoston.right  + 60)/ 2)
		.text("Year")
}

var setScales = () => {
	// Define Scales
	xBoston = d3.scaleTime()
		.domain([
			new Date(xMinBoston.getFullYear() - 10,0),
			new Date(xMaxBoston.getFullYear() + 10,0)])
		.range([marginsBoston.left, marginsBoston.right])

	yBoston = d3.scaleLinear()
		.domain([yMinBoston - 10, yMaxBoston + 10])
		.range([marginsBoston.bottom, marginsBoston.top])
}

var setAxes = () => {
	// Define Axes
	xAxisBoston = d3.axisBottom(xBoston).ticks(6)
	xAxisTopBoston = d3.axisTop(xBoston).ticks(6)

	yAxisBoston = d3.axisLeft(yBoston).ticks(6)
	yAxisRight = d3.axisRight(yBoston).ticks(6)
}

var setRanges = (data) => {
	if (data.length > 1){
		xMinBoston = d3.min([d3.min(data[0], getX), d3.min(data[1], getX)])
		xMaxBoston = d3.max([d3.max(data[0], getX), d3.max(data[1], getX)])
		yMinBoston = d3.min([d3.min(data[0], getY), d3.min(data[1], getY)])
		yMaxBoston = d3.max([d3.max(data[0], getY), d3.max(data[1], getY)])
	}
	else {
		xMinBoston = d3.min(data[0], getX)
		xMaxBoston = d3.max(data[0], getX)
		yMinBoston = d3.min(data[0], getY)
		yMaxBoston = d3.max(data[0], getY)
	}
}

// Plot
var drawInitialChart = () => {
	setRanges([womenDataset, menDataset])
	setScales()
	setAxes()
	plotAxes()
	plotLegend()

	// Plot Mens data
	plotPath(menDataset, menColor, manClass)
	plotTrendLine(menDataset, menColor, manClass)
	scatterPlotRect(menDataset, menColor, manClass)

	// Plot Womens data
	plotPath(womenDataset, womenColor, womanClass)
	plotTrendLine(womenDataset, womenColor, womanClass)
	scatterPlotCircle(womenDataset, womenColor, womanClass)
}

var loadDataset = () => {
	// Read CSV data
	d3.csv(menCSV, parseRowBoston, mensData => {
		d3.csv(womenCSV, parseRowBoston, womensData => {
			menDataset = mensData
			womenDataset = womensData
			drawInitialChart()
		})
	})
}

var hideElements = selector => {
	svgBoston.selectAll("." + selector)
		.transition()
		.duration(animationTimeBoston)
		.style("opacity", 0.0) // Fade out
		.on("end", function() { // Make uninteractable when transition ends
			d3.select(this).classed("hidden", true)
		})
}

var transitionAxes = () => {
	svgBoston.select("#yAxis").transition().duration(animationTimeBoston).call(yAxisBoston)
	svgBoston.select("#yAxisRight").transition().duration(animationTimeBoston).call(yAxisRight)
	svgBoston.select("#xAxis").transition().duration(animationTimeBoston).call(xAxisBoston)
	svgBoston.select("#xAxisTop").transition().duration(animationTimeBoston).call(xAxisTopBoston)
}

var transitionGraph = (selector, dataset) => {
	setScales()
	setAxes()
	transitionAxes()


	svgBoston.selectAll("." + selector + ".square")
		.classed("hidden", false)
		.transition()
		.duration(animationTimeBoston)
		.attr("x", mapX)
		.attr("y", mapY)
		.style("opacity", 1.0)

	svgBoston.selectAll("." + selector + ".dot")
		.classed("hidden", false)
		.transition()
		.duration(animationTimeBoston)
		.attr("cx", mapX)
		.attr("cy", mapY)
		.style("opacity", 1.0)

	svgBoston.selectAll("." + selector + ".path")
		.classed("hidden", false)
		.transition()
		.duration(animationTimeBoston)
		.attr("fill", "none")
		.attr("d", d3.line().x(mapX).y(mapY))
		.style("opacity", 1.0)

	svgBoston.selectAll("." + selector + ".trendLine")
		.classed("hidden", false)
		.transition()
		.duration(animationTimeBoston)
		.attr("x1", d => xBoston(d.x1))
		.attr("y1", d => yBoston(d.y1))
		.attr("x2", d => xBoston(d.x2))
		.attr("y2", d => yBoston(d.y2))
		.style("opacity", 1.0)
}

var onlyMen = () => {
	hideElements(womanClass, 0.0)
	setRanges([menDataset])
	transitionGraph(manClass, menDataset)
}

var onlyWomen = () => {
	hideElements(manClass, 0.0)
	setRanges([womenDataset])
	transitionGraph(womanClass, womenDataset)
}

var showBoth = () => {
	setRanges([womenDataset, menDataset])
	transitionGraph(womanClass, womenDataset)
	transitionGraph(manClass, menDataset)
}

loadDataset()
