let body = d3.select("body")
let content = body.selectAll()
let svgContainer = body.append("svg")
	.attr("width", 300)
	.attr("height", 300)

// Set global font to 24px, sans-serif, bold
body.style("font", "bold 24px Verdana, Arial, sans-serif")

//Make an SVG Container


// Rectangle function
let addRect = (pos, color, opacity) => svgContainer.append("rect")
	.attr("x", pos)
	.attr("y", pos)
	.attr("width", 80)
	.attr("height", 80)
	.attr("fill", color)
	.attr("stroke", "gray")
	.attr("stroke-width", "2px")
	.attr("opacity", opacity)

// Paragraph function
let addParagraph = x => body
	.append("p")
	.text("I can count to " + x)
	.style("color", x < 15 ? "red" : "black")

let dataset = [5, 10, 15, 20, 25]
let colors = ["purple", "blue", "green", "yellow", "red"]

for (i = 0; i < dataset.length; i++) {
	let x = dataset[i]
	let color = colors[i]
	let opacity = 1 / (i + 1)
	let position = x * 5

	addParagraph(x)
	addRect(position, color, opacity) 
}






