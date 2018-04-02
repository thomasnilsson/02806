let h = 400
let w = 1000
let padding = 25
let body = d3.select("body")
let content = body.selectAll()
let barChartDiv = body.select("#barChartDiv")

let barSvg = barChartDiv
	.append("svg")
	.attr("width", w)
	.attr("height", h)

let addParagraph = (c,t) => c
	.append("p")
	.text(t)

let randomValuesX = function(l) {
	let numbers = []
	for (i = 1; i <= l; i++){
		let x = Math.round(Math.random() * h)
		let obj = { "x" : x }
		numbers.push(obj)
	}
	return numbers
}

let animateChart = function(jsonData) {
	// Remove old graphics
	barSvg.selectAll("rect").remove()
	barSvg.selectAll("text").remove()

	let N = jsonData.length

	let xScale = d3.scaleBand()
		.domain(d3.range(N))
		.rangeRound([padding, w - padding])
		.paddingInner(0.05)

	let xAxis = d3.axisBottom(xScale)

	let yScale = d3.scaleLinear()
		.domain([0, h])
		.range([h - padding, padding])

	let yAxis = d3.axisLeft(yScale).ticks(5)

	// Bars
	barSvg.selectAll("rect")
		.data(jsonData)
		.enter()
		.append("rect")
		.attr("x", (d,i) => xScale(i))
		.attr("y", d => yScale(h - d.x) - padding)
		.attr("width", xScale.bandwidth())
		.attr("height", d => yScale(d.x))
		.attr("fill", d => "rgb(40,40," + Math.round(d.x * 5) + ")")

		// Text
		barSvg.selectAll("text")
			.data(jsonData)
			.enter()
			.append("text")
			.text(d => d.x)
			.attr("fill", "white")
			.attr("font-size", "12")
			.attr("x", (d,i) => xScale(i) + xScale.bandwidth() / 3)
			.attr("y", (d,i) => h - yScale(d.x) - 8)

		// Axes
		barSvg.append("g")
			.attr("transform", "translate(0, " + (h - padding) + ")")
			.call(xAxis)

		barSvg.append("g")
			.attr("transform", "translate(" + padding + ", 0)")
			.call(yAxis)
}

let drawChart = function() {
	let length = 20
	// let dataset = randomArray(length, h)
	let dataset = randomValuesX(length)
	animateChart(dataset)
}

let drawChartCSV = function() {
	d3.csv('data/x_data.csv', function(jsonData) {
		animateChart(jsonData)
	})
}

drawChart()

addParagraph(barChartDiv, "Figure: A bar chart")
