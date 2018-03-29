let content = d3.select("body").select("#buttons")

let addWeekButton = (w) => content.append("a")
	.text("Week " + w)
	.attr("href", "week" + w)
	.append("p")

let addAssignmentButton = (a) => content.append("a")
	.text("Assignment " + a)
	.attr("href", "A" + a)
	.append("p")

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
