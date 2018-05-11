(function () {

    var w = 600
    var h = 200
    var boundaries = {
        bottom: h - 60,
        top: 20,
        left: 60,
        right: w - 20
    }
    var innerPadding = 0.1

    var svgAgg = d3.select("body").select("#containerHistogram")
        .append("svg")
        .attr("width", w)
        .attr("height", h)

    let HIST_DATA;

    let drawAggregateHistogram = (histogramData) => {
        let pMax = d3.max(histogramData, d => d.value.pedestrians)
        let cMax = d3.max(histogramData, d => d.value.cyclists)
        let mMax = d3.max(histogramData, d => d.value.motorists)
        let yMax = d3.max([pMax, cMax, mMax])

        // x Scale
        let xScale = d3.scaleBand()
            .domain(histogramData.map(d => d.key))
            .rangeRound([boundaries.left, boundaries.right])
            .paddingInner(innerPadding)

        let xAxis = d3.axisBottom(xScale)

        // y Scale
        let yScale = d3.scaleLinear()
            .domain([0, yMax])
            .range([boundaries.bottom, boundaries.top])

        let yAxis = d3.axisLeft(yScale).ticks(5)

        // Bars
        svgAgg.selectAll(".motorist")
            .data(histogramData)
            .enter()
            .append("rect").attr("class", "motorist")
            .attr("x", d => xScale(d.key))
            .attr("y", d => yScale(d.value.motorists))
            .attr("width", xScale.bandwidth())
            .attr("height", d => boundaries.bottom - yScale(d.value.motorists))
            .attr("fill", "green")

        svgAgg.selectAll(".pedestrian")
            .data(histogramData)
            .enter()
            .append("rect").attr("class", "pedestrian")
            .attr("x", d => xScale(d.key) + xScale.bandwidth() / 4)
            .attr("y", d => yScale(d.value.pedestrians))
            .attr("width", xScale.bandwidth() / 2)
            .attr("height", d => boundaries.bottom - yScale(d.value.pedestrians))
            .attr("fill", "orange")

        svgAgg.selectAll(".bike")
            .data(histogramData)
            .enter()
            .append("rect").attr("class", "bike")
            .attr("x", d => xScale(d.key) + (xScale.bandwidth() / 2.6))
            .attr("y", d => yScale(d.value.cyclists))
            .attr("width", xScale.bandwidth() / 4)
            .attr("height", d => boundaries.bottom - yScale(d.value.cyclists))
            .attr("fill", "red")

        // Make x axis with a g-element
        svgAgg.append("g")
            .attr("transform", "translate(0, " + (boundaries.bottom) + ")")
            .call(xAxis)

        // Make y axis with another g-element
        svgAgg.append("g")
            .attr("id", "yAxis")
            .attr("transform", "translate(" + boundaries.left + ", 0)")
            .call(yAxis)

        // Text label for the Y axis
        svgAgg.append("text")
            .attr("transform", "rotate(-90)")
            .style("text-anchor", "middle")
            .attr("y", boundaries.left / 2 - 10)
            .attr("x", -h / 2)
            .text("Injured or Killed")

        // Text label for the X axis
        svgAgg.append("text")
            // .attr("transform", "rotate(-90)")
            .style("text-anchor", "middle")
            .attr("y", boundaries.bottom + 40)
            .attr("x", w / 2)
            .text("Hour of the Day")
    }

    let parseHistogramRow = row => ({
        "hour": row.hour,
        "ymDate": new Date(20 + row.ym.slice(0, 2), +row.ym.slice(3, 5) - 1),
        "total_injured": +row.total_injured,
        "total_killed": +row.total_killed,
        "pedestrians_injured": +row.pedestrians_injured,
        "pedestrians_killed": +row.pedestrians_killed,
        "cyclists_injured": +row.cyclists_injured,
        "cyclists_killed": +row.cyclists_killed,
        "motorists_injured": +row.motorists_injured,
        "motorists_killed": +row.motorists_killed
    })

    d3.csv("data/histogram_data.csv", parseHistogramRow, data => {
        HIST_DATA = data
        console.log(data)

        nested = d3.nest()
            .key(d => d.hour)
            .sortKeys((a, b) => a - b) // Sort the hour key numerically, instead of lexicographically
            .rollup(leaves => ({
                "pedestrians": d3.sum(leaves, d => d.pedestrians_injured + d.pedestrians_killed),
                "cyclists": d3.sum(leaves, d => d.cyclists_injured + d.cyclists_killed),
                "motorists": d3.sum(leaves, d => d.motorists_injured + d.motorists_killed)
            }))
            .entries(data)

        drawAggregateHistogram(nested)
    })




    // _____________CHOROPLETH________________
    let choroWidth = 700
    let choroHeight = 700

    //GENERAL VARIABLE INITIALIZATION
    let timelineWidth = 600
    let timelineHeight = 200
    let timelineBoundaries = {
        bottom: timelineHeight - 60,
        top: 20,
        left: 60,
        right: timelineWidth - 20
    }

    //Create SVG elements
    var svgTimeline = d3.select("#containerTimeline")
        .append("svg")
        .attr("width", timelineWidth)
        .attr("height", timelineHeight)

    var svgGeo = d3.select("#containerGeo")
        .append("svg")
        .attr("width", choroWidth)
        .attr("height", choroHeight)


    //Load in GeoJSON data
    d3.json("data/zipcodes.geojson", (error, json) => {
        if (error) {
            console.log("error fetching data")
        }

        // Create projection
        let offset = [choroWidth / 2, choroHeight / 2] //Center projection in the middle of SVG
        let scale = 70 * 1000
        let center = d3.geoCentroid(json)
        let projection = d3.geoMercator()
            .scale(scale) // scaling is changed later with scaling factor s
            .center(center)
            .translate(offset)

        // Define path generator and calculate scaling factor, s
        let path = d3.geoPath()
            .projection(projection)

        let bounds = path.bounds(json)
        let boundWidth = (bounds[1][0] - bounds[0][0]) / choroWidth
        let boundHeight = (bounds[1][1] - bounds[0][1]) / choroHeight
        let s = .85 / Math.max(boundWidth, boundHeight)
        projection.scale(s * scale)

        // ______Loading collision data______
        let rowConverterCollisions = d => ({
            ym: +d.ym.slice(0, 2) + d.ym.slice(3, 5), // Removing '-' and parseInt
            ymDate: new Date(20 + d.ym.slice(0, 2), +d.ym.slice(3, 5) - 1), // Needed for filtering after brushing
            zip: +d.zip_code,
            incidentCount: +d.incident_count // Total number of registered collisions for ym
        })

        d3.csv("data/cleanedCollisionDataGrouped.csv", rowConverterCollisions, collisionData => {
            // Nest collisionData on ym summing up number of incidents - needed for timeline
            let nestData = d3.nest()
                .key(d => d.ym)
                .sortKeys(d3.ascending)
                .rollup(leaves => ({
                    "ymIncidents": d3.sum(leaves, d => d.incidentCount)
                }))
                .entries(collisionData)

            // Nest collisionData on zip code summing up number of incidents - needed for choropleth coloring
            let nestDataZip = d3.nest()
                .key(d => d.zip)
                .rollup(leaves => ({
                    "zipIncidentsInit": d3.sum(leaves, d => d.incidentCount)
                }))
                .entries(collisionData)

            // _____Timeline_________

            // Timeline x-scale
            let xMinTimeline = d3.min(collisionData, d => d.ymDate) //Perhaps compute in advance?
            let xMaxTimeline = d3.max(collisionData, d => d.ymDate) //Perhaps compute in advance?
            let xScaleTimeline = d3.scaleTime()
                .domain([xMinTimeline, xMaxTimeline])
                .range([timelineBoundaries.left, timelineBoundaries.right])

            // Timeline y-scale
            let yMinTimeline = 0
            let yMaxTimeline = d3.max(nestData, d => d.value.ymIncidents)
            console.log("Max y-value: " + yMaxTimeline)
            let yScaleTimeline = d3.scaleLinear()
                .domain([yMinTimeline, yMaxTimeline])
                .range([timelineBoundaries.bottom, timelineBoundaries.top])

            // Draw timeline
            let area = d3.area()
                .x(d => xScaleTimeline(new Date(20 + d.key.slice(0, 2), parseInt(d.key.slice(2, 4)) - 1)))
                .y0(d => yScaleTimeline.range()[0])
                .y1(d => yScaleTimeline(d.value.ymIncidents))

            let timelinePath = svgTimeline.append("path")
                .datum(nestData)
                .attr("class", "area")
                .attr("fill", "#A00")
                .attr("d", area)

            //Timeline axes
            let xAxis = d3.axisBottom()

            xAxis.scale(xScaleTimeline)

            svgTimeline.append("g")
                .attr("transform", "translate(" + 0 + "," + timelineBoundaries.bottom + ")")
                .attr("class", "axis")
                .call(xAxis)

            let yAxis = d3.axisLeft()

            yAxis.scale(yScaleTimeline)

            svgTimeline.append("g")
                .attr("transform", "translate(" + timelineBoundaries.left + "," + 0 + ")")
                .attr("class", "axis")
                .call(yAxis)

            // Choropleth function definitions

            // Prepare paths variable
            let paths = svgGeo.selectAll("path")
                .data(json.features)
                .enter()
                .append("path")
                .attr("d", path)

            let initChoropleth = () => {
                // Color scale for coloring zip codes
                let colorScaleInit = d3.scaleLinear()
                    .domain([0, yMaxTimeline])
                    .range(['white', '#A00'])

                // set styling of zip codes
                paths.style("fill", (d, i) => {
                        // If statement handles zip codes that are not present in nestDatachoro - find a better solution
                        if (nestDataZip.find(x => x.key == d.properties.postalCode)) {
                            // Cross link zip code in geoJSON file with zip codes in the filtered data and get number of incidents
                            let incidents = nestDataZip
                                .find(x => x.key == d.properties.postalCode)
                                .value.zipIncidentsInit
                            return colorScaleInit(incidents)
                        }
                    })
                    .style("stroke", "black")
            }

            initChoropleth()

            let updateChoropleth = () => {
                if (!d3.event.selection) {
                    return
                }

                // Reverse engineer the time interval based on brush coordinates
                let startInterval = xScaleTimeline.invert(d3.event.selection[0])
                let endInterval = xScaleTimeline.invert(d3.event.selection[1])

                // Get collisionData in selected time interval
                let tempDataChoro = collisionData.filter(d => (d.ymDate >= startInterval) && (d.ymDate <= endInterval))

                // Nest tempDataChoro on zip code
                let nestDataChoro = d3.nest()
                    .key(d => d.zip)
                    .rollup(leaves => ({
                        "zipIncidents": d3.sum(leaves, d => d.incidentCount)
                    }))
                    .entries(tempDataChoro)

                // Dynamic color scale
                let choroMax = d3.max(nestDataChoro, d => d.value.zipIncidents)

                let colorScale = d3.scaleLinear()
                    .domain([0, choroMax])
                    .range(['white', '#A00'])

                // Update choropleth colors
                paths.style("fill", (d, i) => {
                        if (nestDataChoro.find(x => x.key == d.properties.postalCode)) {
                            // Cross link zip code in geoJSON file with zip codes in the filtered data and get number of incidents
                            let incidents = nestDataChoro
                                .find(x => x.key == d.properties.postalCode)
                                .value.zipIncidents
                            return colorScale(incidents)
                        }
                    })
                    .style("stroke", "black")
            }

            let drawHist = (histogramData) => {
                let pMax = d3.max(histogramData, d => d.value.pedestrians)
                let cMax = d3.max(histogramData, d => d.value.cyclists)
                let mMax = d3.max(histogramData, d => d.value.motorists)
                let yMax = d3.max([pMax, cMax, mMax])

                // x Scale
                let xScale = d3.scaleBand()
                    .domain(histogramData.map(d => d.key))
                    .rangeRound([boundaries.left, boundaries.right])
                    .paddingInner(innerPadding)

                let xAxis = d3.axisBottom(xScale)

                // y Scale
                let yScale = d3.scaleLinear()
                    .domain([0, yMax])
                    .range([boundaries.bottom, boundaries.top])

                let yAxis = d3.axisLeft(yScale).ticks(5)

                // Bars
                svgAgg.selectAll(".motorist")
                    .data(histogramData)
                    .transition()
                    .attr("x", d => xScale(d.key))
                    .attr("y", d => yScale(d.value.motorists))
                    .attr("width", xScale.bandwidth())
                    .attr("height", d => boundaries.bottom - yScale(d.value.motorists))

                svgAgg.selectAll(".pedestrian")
                    .data(histogramData)
                    .transition()
                    .attr("x", d => xScale(d.key) + xScale.bandwidth() / 4)
                    .attr("y", d => yScale(d.value.pedestrians))
                    .attr("width", xScale.bandwidth() / 2)
                    .attr("height", d => boundaries.bottom - yScale(d.value.pedestrians))

                svgAgg.selectAll(".bike")
                    .data(histogramData)
                    .transition()
                    .attr("x", d => xScale(d.key) + (xScale.bandwidth() / 2.6))
                    .attr("y", d => yScale(d.value.cyclists))
                    .attr("width", xScale.bandwidth() / 4)
                    .attr("height", d => boundaries.bottom - yScale(d.value.cyclists))

                // Make y axis with another g-element
                svgAgg.select("#yAxis")
                    .transition()
                    .call(yAxis)
            }

            let updateHistogram = () => {
                if (!d3.event.selection) {
                    return
                }

                // Reverse engineer the time interval based on brush coordinates
                let startInterval = xScaleTimeline.invert(d3.event.selection[0])
                let endInterval = xScaleTimeline.invert(d3.event.selection[1])

                console.log(HIST_DATA)
                // filter out non-selected points
                let filteredData = HIST_DATA.filter(d => (d.ymDate >= startInterval) && (d.ymDate <= endInterval))


                let nested = d3.nest()
                    .key(d => d.hour)
                    .sortKeys((a, b) => a - b) // Sort the hour key numerically, instead of lexicographically
                    .rollup(leaves => ({
                        "pedestrians": d3.sum(leaves, d => d.pedestrians_injured + d.pedestrians_killed),
                        "cyclists": d3.sum(leaves, d => d.cyclists_injured + d.cyclists_killed),
                        "motorists": d3.sum(leaves, d => d.motorists_injured + d.motorists_killed)
                    }))
                    .entries(filteredData)


                console.log(nested)
                drawHist(nested)

            }

            //Create brush
            let brush = d3.brushX()
                .extent([
                    [timelineBoundaries.left, 0],
                    [timelineBoundaries.right, timelineBoundaries.bottom]
                ])
                .on("end", function () {
                    updateChoropleth()
                    updateHistogram()
                })


            svgTimeline.append("g")
                .call(brush)

        }) //End of d3.csv for collision data
    }) //End of D3.csv for geodata
})() //End of anonymous function call