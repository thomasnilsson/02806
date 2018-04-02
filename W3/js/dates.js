const h = 200
const w = 500
const padding = 20
const body = d3.select("body")


let parseTime = d3.timeParse("%m/%d/%y")
let formatTime = d3.timeFormat("%b %e")

let rowConverter = function(d) {
	return {
		Date: parseTime(d.Date),
		Amount: parseInt(d.Amount)
	}
}

// Scatter Plot
const scatterPlotDiv = body.select("#scatterPlotDiv")

scatterPlotDiv
	.attr("height", h + "px")
	.attr("width", w + "px")

let scatterPlotSvg = scatterPlotDiv
	.append("svg")
	.attr("width", w)
	.attr("height", h)
	// .attr("style", "outline: thin solid black")

let animateScatterPlot = function(jsonData) {
	console.log(jsonData)
	// Remove old graphics
	scatterPlotSvg.selectAll("circle").remove()

	let dateMin = d3.min(jsonData, d => d.Date)
	let dateMax = d3.max(jsonData, d => d.Date)

	let yMax = d3.max(jsonData, d => d.Amount)

	let xScale = d3.scaleTime()
		.domain([dateMin, dateMax])
		.range([padding, w - padding])

	let yScale = d3.scaleLinear()
		.domain([0, yMax])
		.range([h - padding, padding])

	let xAxis = d3.axisBottom(xScale).ticks(5)

	let yAxis = d3.axisLeft(yScale).ticks(5)
	

	scatterPlotSvg.selectAll("circle")
		.data(jsonData)
		.enter()
		.append("circle")
		.attr("cx", d => xScale(d.Date))
		.attr("cy", d => yScale(d.Amount))
		.attr("r", d => 3)
		.attr("stroke", "black")

	scatterPlotSvg.selectAll("text")
		.data(jsonData)
		.enter()
		.append("text")
		.attr("x", d => xScale(d.Date))
		.attr("y", d => yScale(d.Amount))
		.attr("font-size", 10)
		.text(d => formatTime(d.Date))

	scatterPlotSvg.append("g")
		.attr("transform", "translate(0, " + (h - padding) + ")")
		.call(xAxis)

	scatterPlotSvg.append("g")
		.attr("transform", "translate(" + padding + ", 0)")
		.call(yAxis)
}


let drawScatterPlot = function() {
	d3.csv("data/dates.csv", function(csvData){
		let dataset = csvData.map(d => rowConverter(d))
		console.log(dataset)
		animateScatterPlot(dataset)
	})

}

drawScatterPlot()
// addParagraph(scatterPlotDiv, "Figure: A scatter plot")



// xScale = d3.scaleTime()
//                .domain([
// d3.min(dataset, function(d) { return d.Date; }),
// d3.max(dataset, function(d) { return d.Date; }) ])
//                .range([padding, w - padding]);

