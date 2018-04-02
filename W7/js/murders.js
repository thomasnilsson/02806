(function() {
    var w = 800
    var h = 600

    var w2 = 700
    var h2 = 170
    var boundaries = {
        bottom: h2 - 60,
        top: 10,
        left: 60,
        right: w2 - 10
    }

    //Define quantize scale to sort data values into buckets of color
    let color = ['#27586B', '#003549', '#05425A', '#52707C', '#888B8C']

    // Convert date to YYYY/MM/DD
    var convertDate = date => {
        var D = date.split("/")
        return "" + D[2] + "/" + D[0] + "/" + D[1]
    }

    //For converting Dates to strings
    var hourOfDay = time => {
        var values = time.split(":")
        return +values[0]
    }

    var parseRow = row => ({
        "boro": row.BORO_NM,
        "date": convertDate(row.RPT_DT),
        "hour": +row.CMPLNT_FR_TM,
        "lat": parseFloat(row.Latitude),
        "lon": parseFloat(row.Longitude)
    })

    //Define map projection
    // From http://bl.ocks.org/phil-pedruco/6646844
    var projection = d3.geoMercator()
        .center([-73.94, 40.70])
        .translate([w / 2, h / 2])
        .scale(55 * 1000)

    var circleSize = 2
    var circleColor = "#640029"

    //Define path generator
    var path = d3.geoPath()
        .projection(projection)

    //Create SVG element
    var svgLine = d3.select("body").select("#timeLine")
        .append("svg")
        .attr("width", w2)
        .attr("height", h2)

    var svgGeo = d3.select("body").select("#map")
        .append("svg")
        .attr("width", w)
        .attr("height", h)

    //Load in GeoJSON data
    d3.json("data/boroughs.geojson", (error, json) => {
        if (error) console.log("error fetching data")

        //Bind data and create one path per GeoJSON feature
        svgGeo.selectAll("path")
            .data(json.features)
            .enter()
            .append("path")
            .attr("d", path)
            .style("fill", (d, i) => color[i])
            .style("stroke", "gray")


        svgGeo.selectAll("text")
            .data(json.features)
            .enter()
            .append("text")
            .attr("class", "label")
            .attr("x", d => path.centroid(d)[0] - 30)
            .attr("y", d => path.centroid(d)[1])
            .style("fill", "black")
            .text(d => d.properties.BoroName)

        d3.csv("data/all_murder.csv", parseRow, parsedData => {
            var data = parsedData.filter(d => d.boro && d.date && d.hour && d.lat && d.lon)

            var nestedData = d3.nest()
                .key(d => d.date)
                .sortKeys(d3.ascending)
                .entries(data)

            var dates = nestedData.map(d => new Date(d.key))

            var xMin = d3.min(dates)
            var xMax = d3.max(dates)

            x = d3.scaleTime()
                .domain([xMin, xMax])
                .range([boundaries.left, boundaries.right])

            xAxis = d3.axisBottom(x)

            y = d3.scaleLinear()
                .domain([1, d3.max(nestedData, d => d.values.length)])
                .range([boundaries.bottom, boundaries.top])

            yAxis = d3.axisLeft(y)

            svgLine.append("g")
                .attr("transform", "translate(0, " + boundaries.bottom + ")")
                .call(xAxis)

            svgLine.append("g")
                .attr("id", "yAxis")
                .attr("transform", "translate(" + boundaries.left + ", 0)")
                .call(yAxis)

            // Text label for the y axis
            svgLine.append("text")
                .attr("transform", "rotate(-90)")
                .style("text-anchor", "middle")
                .attr("y", boundaries.left / 2 - 10)
                .attr("x", -h2 / 2)
                .text("# Murders Committed")


            // Text label for the y axis
            svgLine.append("text")
                .style("text-anchor", "middle")
                .attr("y", boundaries.bottom + 40)
                .attr("x", w2 / 2)
                .text("Date")


            svgLine.append("path")
                .datum(nestedData)
                // .attr("class", selector + " path")
                .attr("stroke-width", "1px")
                .attr("fill", "none")
                .attr("stroke", "steelblue")
                .attr("d", d3.line()
                    .x(d => +x(new Date(d.key)))
                    .y(d => y(d.values.length))
                )

            // DRAW POINTS ON MAP
            var mapDots = svgGeo.append("g").selectAll("circle")
                .data(data)
                .enter()
                .append("circle")
                .attr("r", circleSize)
                .style("stroke-width", 0.25)
                .style("opacity", 0.75)
                .attr("fill", circleColor)
                .attr("cx", d => projection([d.lon, d.lat])[0])
                .attr("cy", d => projection([d.lon, d.lat])[1])


            function brushing() {
                var coords = d3.brushSelection(this)
                if (coords) {
                    var mapx0 = x.invert(coords[0])
                    var mapx1 = x.invert(coords[1])

                    // Decide which datapoints to display
                    mapDots.style("fill", d => {
                        if (mapx0 <= new Date(d.date) && new Date(d.date) <= mapx1) {
                            return circleColor
                        } else {
                            return "transparent"
                        }
                    })
                }
            }

            var brush = d3.brushX()
                .extent([
                    [boundaries.left, boundaries.top],
                    [boundaries.right, boundaries.bottom]
                ])
                .on("brush", brushing)

            svgLine.append("g").attr("id", "gBrush")
                .call(brush)
                .call(brush.move, // Creates initial Window
                    [boundaries.left, boundaries.left + 100]
                )

            function animate() {
                console.log("ahoods")
                    d3.select("#gBrush")
                    // Move brush to the start of timeline
                    .call(brush.move, // Creates initial Window
                        [boundaries.left, boundaries.left + 100]
                    )
                    // Start moving towards end
                    .transition()
                    .duration(5000)
                    .ease(d3.easeLinear)
                    .call(brush.move, [boundaries.right - 100, boundaries.right])
            }

            d3.select("body").select("#buttons")
                .append("a")
                .attr("class", "btn btn-primary")
                .text("Animate")
                .on("click", () => animate())
        })


    })
})()
