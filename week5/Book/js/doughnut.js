var w = 300, h = 300

var dataset = [5, 10, 20, 45, 6, 25]

var outerRadius = w / 2
var innerRadius = w / 6

var arc = d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius)

//Easy colors accessible via a 10-step ordinal scale
var color = d3.scaleOrdinal(d3.schemeCategory10)

//Create SVG element
var svg = d3.select("body")
            .append("svg")
            .attr("width", w)
            .attr("height", h)

var pie = d3.pie()

//Set up groups
var arcs = svg.selectAll("g.arc")
              .data(pie(dataset))
              .enter()
              .append("g")
              .attr("class", "arc")
              .attr("transform", "translate(" + outerRadius + "," + outerRadius + ")")

//Draw arc paths
arcs.append("path")
    .attr("fill", (d, i) => color(i))
    .attr("d", arc)

//Labels
arcs.append("text")
    .attr("transform", d => "translate(" + arc.centroid(d) + ")")
    .attr("text-anchor", "middle")
    .text(d => d.value)
