(function() {
    //Width and height
    var w = 800
    var h = 500
    var padding = 20

    var dataset, xScale, yScale, xAxis, yAxis, area  //Empty, for now

    let getX = d => d.date

    //For converting strings to Dates
    var parseTime = d3.timeParse("%Y-%m")

    //For converting Dates to strings
    var formatTime = d3.timeFormat("%b %Y")

    var rowConverter = function(d, i, cols) {

        var row = {
            date: parseTime(d.Date),
        }

        for (i in cols) {
            var col = cols[i]

            if (d[col]) {
                row[col] = +d[col]
            } else {
                row[col] = 0
            }
        }

        console.log(row)
        return row
    }

    //Set up stack method
    var stack = d3.stack().order(d3.stackOrderDescending)  // <-- Flipped stacking order

    //Load in data
    d3.csv("data/crime_2016.csv", rowConverter, data => {

        var dataset = data

        //Now that we know the column names in the data…
        var keys = dataset.columns

        keys.shift()  //Remove first column name ('Date')
        stack.keys(keys)  //Stack using what's left (the car names)

        //Data, stacked
        var series = stack(dataset)
        let xMin = d3.min(dataset, getX)
        let xMax = d3.max(dataset, getX)

        //Create scale functions
        xScale = d3.scaleTime()
           .domain([xMin, xMax])
           .range([padding, w - padding * 2])

       let yMax = d3.max(dataset, d => {
           var sum = 0
           for (i in keys) {
               sum += d[keys[i]]
           }
           return sum
       })

        yScale = d3.scaleLinear()
                .domain([0, yMax])
                .range([h - padding, padding / 2])
                .nice()

        //Define axes
        xAxis = d3.axisBottom()
                   .scale(xScale)
                   .ticks(10)
                   .tickFormat(formatTime)

        //Define Y axis
        yAxis = d3.axisRight()
                   .scale(yScale)
                   .ticks(5)

        //Define area generator
        area = d3.area()
                    .x(d => xScale(d.data.date))
                    .y0(d => yScale(d[0]))
                    .y1(d => yScale(d[1]))

        //Create SVG element
        var svg = d3.select("body")
                    .select("#chart")
                    .append("svg")
                    .attr("width", w)
                    .attr("height", h)

        //Create areas
        svg.selectAll("path")
            .data(series)
            .enter()
            .append("path")
            .attr("class", "area")
            .attr("d", area)
            .attr("fill", (d,i) => d3.schemeCategory20[i])
            .append("title")  //Make tooltip
            .text(d => d.key)

        //Create axes
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + (h - padding) + ")")
            .call(xAxis)

        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(" + (w - padding * 2) + ",0)")
            .call(yAxis)

    })

})()
