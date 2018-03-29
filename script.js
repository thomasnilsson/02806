let body = d3.select("body")
let content = body.select("#panelDiv")

let addWeekButton = (w) => content.append("a")
	.attr("class", "btn btn-primary btn-block")
	.text("Week " + w)
	.attr("href", "week" + w)

let addAssignmentButton = (a) => content.append("a")
	.attr("class", "btn btn-success btn-block")
	.text("Assignment " + a)
	.attr("href", "A" + a)

let assignments = [1,2,3]
let weeks = [1,2,3,4,5,6,7,8,9,10]

for (i in assignments) {
	let a = assignments[i]
	addAssignmentButton(a)
}

for (i in weeks) {
	let w = weeks[i]
	addWeekButton(w)
}
