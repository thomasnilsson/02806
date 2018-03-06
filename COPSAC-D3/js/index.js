let h = 300, w = 800,
	margins = {bottom: h - 20, top: 40, left: 50, right: w - 200},
	animationTime = 2500,
	svg = d3.select("body").select("#div").append("svg")
		.attr("width", w)
		.attr("height", h),
	title = svg.append("text")
		.attr("x", margins.right / 2 + margins.left)
		.attr("y", margins.top - 20)
		.attr("font-weight", "bold")

let titles = ["Akut Astmaedicin", "Forebyggende Astmamedicin", "Steroid Creme", "Antihistamin", "Næsespray/Øjendråber"]
let answers = ["a1", "a2", "a3", "a4", "a5"]
let colors = ["rgb(15,125,236)", "rgb(15,125,236)", "rgb(230,104,38)", "rgb(130,201,63)", "rgb(130,201,63)"]
let index = 0

let getX = d => d.week, getY = d => d[answers[index]],
	mapX = d => x(getX(d)), mapY = d => y(getY(d))

let yearweekToDate = (yearweek) => {
	let year = yearweek.week.substr(0,4),
		week = yearweek.week.substr(3,2)
	return new Date(year, 0, 7 * week)
}

let parseRow = row => {
  return {
    "week" : parseInt(row.week),
    "a1" : parseInt(row.a1),
	"a2" : parseInt(row.a2),
	"a3" : parseInt(row.a3),
	"a4" : parseInt(row.a4),
	"a5" : parseInt(row.a5)
  }
}

let innerPadding = 0.1, x, y, xAxis, yAxis, weeks, dataset

d3.csv("data/user_data.csv", parseRow, csvData => {
	console.log(csvData)
	title.text(titles[index])
	dataset = csvData
	// Find the x domain
	weeks = dataset.map(getX)

	// x Scale
	x = d3.scaleBand()
		.domain(weeks)
		.rangeRound([margins.left, margins.right])
		.paddingInner(innerPadding)

	xAxis = d3.axisBottom(x)

	// y Scale
	y = d3.scaleLinear()
		.domain([0, 7])
		.range([margins.bottom, margins.top])

	yAxis = d3.axisLeft(y).ticks(7)

	// Bars
	svg.selectAll("rect")
	.data(dataset)
	.enter()
	.append("rect")
	.attr("x", mapX)
	.attr("y", mapY)
	.attr("width", x.bandwidth())
	.attr("height", d => margins.bottom - mapY(d))
	.attr("fill", colors[index])
		// .on("mouseover", function(d) {
		// 	handleMouseOver(this, d)
		// })
		// .on("mouseout", function() {
		// 	handleMouseOut(this)
		// })
	//
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
		.text("Dage med medicin om ugen")
})

var updateChart = (i) => {
	// Update index of category
	// index = i
	index = i
	title.text(titles[index])


	// Set appropriate plot title
	// title.text(titles[index])
	// 	.attr("stroke", colours[index])

	// Redraw histogram bars with new y values
	svg.selectAll("rect")
	.data(dataset)
	.transition()
	.duration(animationTime)
	.attr("y", mapY)
	.attr("height", d => margins.bottom - mapY(d))
	.attr("fill", colors[index])
}

svg.append("text")
	.text(titles[0])
	.attr("fill", colors[0])
	.attr("x", margins.right + 10)
	.attr("y", margins.bottom / 2)
	.on("click", function() {updateChart(0)})

svg.append("text")
	.text(titles[1])
	.attr("fill", colors[1])
	.attr("x", margins.right + 10)
	.attr("y", 20 + margins.bottom / 2)
	.on("click", function() {updateChart(1)})

svg.append("text")
	.text(titles[2])
	.attr("fill", colors[2])
	.attr("x", margins.right + 10)
	.attr("y", 40 + margins.bottom / 2)
	.on("click", function() {updateChart(2)})

svg.append("text")
	.text(titles[3])
	.attr("fill", colors[3])
	.attr("x", margins.right + 10)
	.attr("y", 60 + margins.bottom / 2)
	.on("click", function() {updateChart(3)})

svg.append("text")
	.text(titles[4])
	.attr("fill", colors[4])
	.attr("x", margins.right + 10)
	.attr("y", 80 + margins.bottom / 2)
	.on("click", function() {updateChart(4)})
