var parseRow = d => {
	return {
		"Year" : new Date(+d.Year, 0), // January 1st of that year
		"Athvare" : d.Athvare, // January 1st of that year
		"Time" : timeToMinutes(d.Time)
	}
}

var timeToMinutes = time => {
	var arr = time.split(":")
	return (+arr[0] * 60) + (+arr[1]) + (+arr[2] / 60)
}

// returns slope, intercept and r-square of the line
var leastSquares = (xSeries, ySeries) => {
	var reduceSumFunc = (prev, cur) => prev + cur

	var xBar = xSeries.reduce(reduceSumFunc) / xSeries.length
	var yBar = ySeries.reduce(reduceSumFunc) / ySeries.length

	var ssXX = xSeries.map(d => Math.pow(d - xBar, 2))
		.reduce(reduceSumFunc)

	var ssYY = ySeries.map(d => Math.pow(d - yBar, 2))
		.reduce(reduceSumFunc)

	var ssXY = xSeries.map((d, i) => (d - xBar) * (ySeries[i] - yBar))
		.reduce(reduceSumFunc)

	var slope = ssXY / ssXX
	var intercept = yBar - (xBar * slope)
	var rSquare = Math.pow(ssXY, 2) / (ssXX * ssYY)

	return [slope, intercept, rSquare]
}
