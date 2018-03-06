let h = 300
let w = 600
let padding = 40
let body = d3.select("body")
let div = body.select("#chart")
let title = div.append("h4")
let svg = div
	.append("svg")
	.attr("width", w)
	.attr("height", h)

let parseRow = d => {
	return {
		"date" : new Date(+d.year, (+d.month - 1)),
		"average" : parseFloat(d.average)
	}
}

let x, y, xAxis, yAxis, dataset, line, dangerLine


d3.csv("data/co2.csv", parseRow, csvData => {
	dataset = csvData
	// console.table(dataset, ["date", "average"])

	let dateMin = d3.min(dataset, d => d.date)
	let dateMax = d3.max(dataset, d => d.date)
	let avgMax = d3.max(dataset, d => d.average)
	let avgMin = d3.min(dataset, d => d.average)

	console.log(dateMin, dateMax)

	x = d3.scaleTime()
		.domain([dateMin, dateMax])
		.range([padding, w])

	y = d3.scaleLinear()
		.domain([avgMin - 10, avgMax]) // Adjusted domain with avgMin instead of 0!
		.range([h - padding, 0])

	xAxis = d3.axisBottom(x)
	yAxis = d3.axisLeft(y)

	//Define line generator
	line = d3.line()
		.defined(d => d.average <= 350)
		.x(d =>  x(d.date))
		.y(d => y(d.average))

	//Define danger line generator
	dangerLine = d3.line()
		.defined(d => d.average > 350)
		.x(d =>  x(d.date))
		.y(d => y(d.average))

	 //Create line
	 svg.append("path")
		.datum(dataset)
		.attr("class", "line")
		.attr("d", line)

	//Create line
	svg.append("path")
		 .datum(dataset)
		 .attr("class", "dangerLine")
		 .attr("d", dangerLine)

	//Draw 350 ppm line
	svg.append("line")
		.attr("class", "line safeLevel")
		.attr("x1", padding)
		.attr("x2", w)
		.attr("y1", y(350))
		.attr("y2", y(350))

	//Create warning label
	svg.append("text")
		.attr("x", padding + 10)
		.attr("y", y(350) - 7)
		.attr("class", "dangerLabel")
		.text("350 ppm safe level")

	// Make x axis with a g-element
	svg.append("g")
		.attr("transform", "translate(0, " + (h - padding) + ")")
		.call(xAxis)

	// Make y axis with another g-element
	svg.append("g")
		.attr("id", "yAxis")
		.attr("transform", "translate(" + padding + ", 0)")
		.call(yAxis)

})

let updateChart = () => {

}
