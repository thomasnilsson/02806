let chartHeight = 200
let chartWidth = 500
let body = d3.select("body")
let content = body.selectAll()
let barChartDiv = body.select("#barChartDiv")

let barSvg = barChartDiv
	.append("svg")
	.attr("width", chartWidth)
	.attr("height", chartHeight)

let addParagraph = (c,t) => c
	.append("p")
	.text(t)

// let randomArray = function(l, max) {
// 	let numbers = []
// 	for (i = 1; i <= l; i++){
// 		let x = Math.round(Math.random() * max)
// 		numbers.push(x)
// 	}
// 	return numbers
// }

let randomValuesX = function(l, max) {
	let numbers = []
	for (i = 1; i <= l; i++){
		let x = Math.round(Math.random() * max)
		let obj = { "x" : x }
		numbers.push(obj)
	}
	return numbers
}

let randomValuesY = function(l, max) {
	let numbers = []
	for (i = 1; i <= l; i++){
		let x = Math.round(Math.random() * max)
		let obj = { "y" : x }
		numbers.push(obj)
	}
	return numbers
}

let animateChart = function(jsonData) {
	// Remove old graphics
	barSvg.selectAll("rect").remove()
	barSvg.selectAll("text").remove()

	// Set attributes
	let padding = 1
	let barWidth = 20 
	let deltaX = barWidth + padding

	// Draw a vertical rectangle for each datapoint
	barSvg.selectAll("rect")
		.data(jsonData)
		.enter()
		.append("rect")
		.attr("x", (d,i) => i * deltaX)
		.attr("y", d => chartHeight - d.x)
		.attr("width", barWidth)
		.attr("height", d => d.x)
		.attr("fill", d => "rgb(" + Math.round(d.x * 2) + ", 0, 0)")

	// Draw values of each bar as text
	barSvg.selectAll("text")
		.data(jsonData)
		.enter()
		.append("text")
		.text(d => d.x)
		.attr("fill", "white")
		.attr("font-size", "8")
		.attr("x", (d,i) => i * deltaX + 3)
		.attr("y", (d,i) => chartHeight - d.x + 12)

}

let drawChart = function() {
	let length = 25
	// let dataset = randomArray(length, chartHeight)
	let dataset = randomValuesX(length, chartHeight)
	animateChart(dataset)
}

let drawChartCSV = function() {
	d3.csv('data/x_data.csv', function(jsonData) {
		animateChart(jsonData)
	})	
}

drawChart()

addParagraph(barChartDiv, "Figure: A bar chart")

// Scatter Plot
let scatterPlotDiv = body.select("#scatterPlotDiv")

let scatterPlotSvg = scatterPlotDiv
	.append("svg")
	.attr("width", chartWidth)
	.attr("height", chartHeight)

let animateScatterPlot = function(jsonData) {
	// Remove old graphics
	scatterPlotSvg.selectAll("circle").remove()

	scatterPlotSvg.selectAll("circle")
		.data(jsonData)
		.enter()
		.append("circle")
		.attr("cx", (d,i) => d.x)
		.attr("cy", (d,i) => chartHeight - d.y)
		.attr("r", 2)
		.attr("fill", "white")
		.attr("stroke", "black")
}

let drawScatterPlot = function() {
	let length = 25
	let X = randomValuesX(length, chartWidth)
	let Y = randomValuesY(length, chartHeight)
	let dataset = []
	
	for (i in X) {
		let px = X[i].x
		let py = Y[i].y
		let p = {'x' : px, 'y' : py}
		dataset.push(p)
	}
	console.log(dataset)

	animateScatterPlot(dataset)
}

drawScatterPlot()
addParagraph(scatterPlotDiv, "Figure: A scatter plot")

let drawScatterPlotCSV = function() {
	d3.csv('data/xy_data.csv', function(jsonData) {
		console.log(jsonData)
		animateScatterPlot(jsonData)
	})	
}


// PRESIDENTS
let presidentsDiv = body.select("#presidentsDiv")
let presidentsSvg = presidentsDiv.append("svg")
	.attr("width", chartWidth)
	.attr("height", chartHeight)
let labelSvg = presidentsDiv.append("svg")
	.attr("width", chartWidth)
	.attr("height", 20)

let animatePresidentsPlot = function(jsonData, max) {
	// Remove old graphics
	presidentsSvg.selectAll("circle").remove()
	labelSvg.selectAll("text").remove()
	presidentsDiv.selectAll("p").remove()

	let scale = chartWidth / max

	presidentsSvg.selectAll("circle")
		.data(jsonData)
		.enter()
		.append("circle")
		.attr("cx", d => d.months * scale)
		.attr("cy", d => chartHeight * Math.random(100))
		.attr("r", 5)
		.attr("stroke", "black")
		.attr("fill-opacity", 0.0)
	console.log(jsonData)

	// Draw values of each bar as text
	let labels = [0, max/4, max/2, 3*max/4, max]
	labelSvg.selectAll("text")
		.data(labels)
		.enter()
		.append("text")
		.text(label => Math.round(label))
		.attr("fill", "black")
		.attr("font-size", "14")
		.attr("x", label => label * 0.97 * scale)
		.attr("y", 10)

	addParagraph(presidentsDiv, "Figure: US Presidents tenure in months")
}

let drawPresidentsPlotRandom = function() {
	let months = []
	let max = 0
	for (i = 0; i < 43; i++){
		let x = Math.round(Math.random(100) * chartWidth)
		if (x > max) {
			max = x
		}
		let m = {'months' : x}
		months.push(m)
	}
	animatePresidentsPlot(months, max)
}

let drawPresidentsPlotCSV = function() {
	d3.csv('data/presidents.csv', function(jsonData) {
		let max = 0

		for (i in jsonData) {
			let m = jsonData[i].months
			if (m > max) {
				max = m
			}
		}

		animatePresidentsPlot(jsonData, max)
	})	
}

drawPresidentsPlotRandom()


// let barContainer = body.append("div")
// 	.attr("width", 5000)
// 	.attr("height", 500)
// 	.attr("id", "barContainer")

// let addBar = (w,h) => barContainer
// 	.append("div")
// 	.attr("class", "bar")
// 	.style("height", h + "px")
// 	.style("width", w + "px")

// let makeBarDiagram = (data) => body
// 	.selectAll("barContainer")
// 	.data(data)
// 	.enter()
// 	.append("div")
// 	.attr("class", "bar")
// 	.style("width", "5px")
// 	.style("height", d => d + "px")

// let addRectBar = (x,y,w,h) => svg
// 	.append("rect")
// 	.attr("x", x)
// 	.attr("y", y)
// 	.attr("width", w)
// 	.attr("height", h)

// let w = 20
// let max = 150
// let padding = 1
// for (i = 1; i <= 10; i++) {
// 	let v = 50
// 	let x = i * w + padding

// 	addRectBar(x, max, w, v)
// }



// Book method
// let dataset = []
// for (i = 1; i <= 50; i++) {
// 	let x = Math.random() * i * 5
// 	dataset.push(x)
// }
// makeBarDiagram(dataset)

// Better method
// let f = 2
// for (i = 1; i <= 100; i++) {
// 	let x = Math.random() * 200
// 	addBar(f, x)
// }










