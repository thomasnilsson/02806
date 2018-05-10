(function () {
  //GENERAL VARIABLE INITIALIZATION
  let w = 800
  let h = w * 0.80
  let paddingPercentage = 0.10
  let boundaries = {
    left: paddingPercentage * w,
    right: w - (paddingPercentage / 2) * w,
    top: paddingPercentage * h,
    bottom: h - paddingPercentage * h
  }

  //Create SVG elements
  var svgTimeline = d3.select("#containerTimeline")
    .append("svg")
    .attr("width", w)
    .attr("height", h / 2)

  var svgGeo = d3.select("#containerGeo")
    .append("svg")
    .attr("width", w)
    .attr("height", h)


  //Load in GeoJSON data
  d3.json("data/zipcodes.geojson", (error, json) => {
    if (error) {
      console.log("error fetching data")
    }

    // Create projection
    let offset = [w / 2, h / 2] //Center projection in the middle of SVG
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
    let boundWidth = (bounds[1][0] - bounds[0][0]) / w
    let boundHeight = (bounds[1][1] - bounds[0][1]) / h
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
        .range([boundaries.left, boundaries.right])

      // Timeline y-scale
      let yMinTimeline = 0
      let yMaxTimeline = d3.max(nestData, d => d.value.ymIncidents)
      console.log("Max y-value: " + yMaxTimeline)
      let yScaleTimeline = d3.scaleLinear()
        .domain([yMinTimeline, yMaxTimeline])
        .range([(boundaries.bottom / 2), boundaries.top])

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
        .attr("transform", "translate(" + 0 + "," + boundaries.bottom / 2 + ")")
        .attr("class", "axis")
        .call(xAxis)

      let yAxis = d3.axisLeft()

      yAxis.scale(yScaleTimeline)

      svgTimeline.append("g")
        .attr("transform", "translate(" + boundaries.left + "," + 0 + ")")
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

      //Create brush
      let brush = d3.brushX()
        .extent([
          [boundaries.left, 0],
          [boundaries.right, boundaries.bottom / 2]
        ])
        .on("end", updateChoropleth)

      svgTimeline.append("g")
        .call(brush)

    }) //End of d3.csv for collision data
  }) //End of D3.csv for geodata
})() //End of anonymous function call