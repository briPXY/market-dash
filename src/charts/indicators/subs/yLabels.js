//import * as d3 from "d3";

export function drawLineMiddle(subYLabelSvg, width, height, scaleY) {
    // Convert data value into pixel position
    const yPos = scaleY(50);

    // Remove any existing line first (optional, to prevent duplicates)
    subYLabelSvg.selectAll(".horizontal-line").remove();

    // Append a new horizontal line
    subYLabelSvg
        .append("line")
        .attr("class", "horizontal-line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", yPos)
        .attr("y2", yPos)
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 1)
        .attr("shape-rendering", "crispEdges");
}
