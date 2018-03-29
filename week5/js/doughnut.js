(function() {
    let w = 500, h = 300
    let outerRadius = 150
    let innerRadius = 100

    let arc = d3.arc()
                .innerRadius(innerRadius)
                .outerRadius(outerRadius)

    //Easy colors accessible via a 10-step ordinal scale
    let color = d3.scaleOrdinal(d3.schemeCategory10)

    //Create SVG element
    let svg = d3.select("body").select("#chart")
                .append("svg")
                .attr("width", w)
                .attr("height", h)

    let pie = d3.pie().sort(null).value(d => d.Fraction)

    let dataset

    let rowParser = row => ({
    	"Borough" : row.Borough,
    	"Fraction" : parseFloat(row.Fraction)
    })

    let boroDict = {
    	"MANHATTAN": "MN",
    	"QUEENS": "QS",
    	"STATEN ISLAND": "SI",
    	"BRONX": "BX",
    	"BROOKLYN": "BN",
    }

    let boroDict2 = [
    	{Borough: "MANHATTAN", Code: "MN"},
    	{Borough: "QUEENS", Code: "QS"},
    	{Borough: "STATEN ISLAND", Code: "SI"},
    	{Borough: "BRONX", Code: "BX"},
    	{Borough: "BROOKLYN", Code: "BN"}
    ]

    svg.selectAll("text")
    	.data(boroDict2)
    	.enter()
    	.append("text")
    	.text(d => d.Code + ": " + d.Borough)
    	.attr("x", "350")
    	.attr("y", (d,i) =>  200 + i * 15)

    let fracToPercent = frac => (frac * 100).toFixed(1)
    let makeString = (d) => boroDict[d.data.Borough] + " (" + fracToPercent(d.data.Fraction) + "%)"


    // for (var key in boroDict) {
    // 	let value = boroDict[key]
    // 	svg.append("text").text(key + ": " + value).attr("x", "350").attr("y", 300)
    //
    // }

    d3.csv("data/crime_fractions.csv", rowParser, csvData => {
    	console.log(csvData)
    	dataset = csvData

    	//Set up groups
    	let arcs = svg.selectAll("g.arc")
    	              .data(pie(dataset))
    	              .enter()
    	              .append("g")
    	              .attr("class", "arc")
    	              .attr("transform", "translate(" + outerRadius + "," + outerRadius + ")")

    	//Draw arc paths
    	arcs.append("path")
    	    .attr("fill", (d, i) => color(i))
    	    .attr("d", arc)

    	arcs.append("text")
    		.text(makeString)
    		.attr("text-anchor", "middle")
    		.attr("transform", d => "translate(" + arc.centroid(d) + ")")
    		.attr("font-size", "10")
    		.attr("fill", "white")



    })

})()
