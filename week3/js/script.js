let h = 200
let w = 500
let padding = 25
let height = h - padding
let width = w - padding
let animationTime = 2000
let histogramDiv = d3.select("body").select("#histogramDiv")

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

let DATA_INDEX = 0
let COLORS = ["rgb(40,40,40)", "rgb(66, 134, 244)", "rgb(89, 165, 94)", "rgb(214, 79, 64)"]
let TITLES = ["Fresh Fruit", "Storage Fruit", "Fresh Vegetable", "Storage Vegetale"]
let MONTHS, ALL_DATA = []
let x, y, xAxis, yAxis

d3.csv("data/nyDATA.csv", csvData => {

  histogramDiv.append("h4").text(TITLES[DATA_INDEX])
  // parse data
  ALL_DATA = csvData.map(d => parseRow(d))

  // Filter out irrelevant data
  data = ALL_DATA.filter(d => d.Index == DATA_INDEX)

  let yMax = d3.max(data, d => d.Count)
  MONTHS = data.map(d => d.Month)

  x = d3.scaleBand()
    .domain(MONTHS)
    .rangeRound([padding, width])
    .paddingInner(0.5)

  xAxis = d3.axisBottom(x)

  y = d3.scaleLinear()
    .domain([0, yMax])
    .range([height, padding])

  yAxis = d3.axisLeft(y).ticks(5)

  // Bars
  svg.selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", (d,i) => x(d.Month))
    .attr("y", d =>  y(d.Count))
    .attr("width", x.bandwidth())
    .attr("height", d => height - y(d.Count))
    .attr("fill", d => COLORS[DATA_INDEX])

    // Axes
    svg.append("g")
      .attr("transform", "translate(0, " + (h - padding) + ")")
      .call(xAxis)

    svg.append("g")
      .attr("id", "yAxis")
      .attr("transform", "translate(" + padding + ", 0)")
      .call(yAxis)

})

let updateChart = () => {
  // Which category to display?
  DATA_INDEX = (DATA_INDEX + 1) % 4
  histogramDiv.selectAll("h4").text(TITLES[DATA_INDEX])

  // Filter out irrelevant data
  data = ALL_DATA.filter(d => d.Index == DATA_INDEX)

  let yMax = d3.max(data, d => d.Count)
  y.domain([0, yMax])

  yAxis = d3.axisLeft(y).ticks(5)

  // Redraw histogram bars
  svg.selectAll("rect")
    .data(data)
    .transition()
    .duration(animationTime)
    .attr("x", (d,i) => x(d.Month))
    .attr("y", d =>  y(d.Count))
    .attr("height", d => height - y(d.Count))
    .attr("fill", d => COLORS[DATA_INDEX])

    // Update y axis only
    svg.selectAll("#yAxis").call(yAxis)
}
