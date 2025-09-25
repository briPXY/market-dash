import { chartSvgCleanup } from "../helper";

export function line(d3, svg, scale, tooltipRef, historicalData, bandXScale, innerHeight, lineColor = "#2fb59c", fillColor = "#2fb59c26") {
    const barWidth = bandXScale.bandwidth(); // Get the bandwidth for centering

    // IMPORTANT: Clearing logic relies on the ".main" class, as per your request.
    // Ensure all elements intended for this chart are given the ".main" class.
    chartSvgCleanup(svg);

    const lineGenerator = d3.line()
        .x(d => bandXScale(d.date) + barWidth / 2) // Center the line on the band
        .y(d => scale.y(d.close)) // Use scale.y for vertical positioning
        .curve(d3.curveMonotoneX);

    const areaGenerator = d3.area()
        .x(d => bandXScale(d.date) + barWidth / 2) // Center the area points on the band
        .y0(innerHeight) // Assuming innerHeight is the base of your chart area
        .y1(d => scale.y(d.close)) // Use scale.y for vertical positioning
        .curve(d3.curveMonotoneX);

    // Draw circles for interaction/tooltips
    svg.selectAll("circle.line-chart-circle-specific")
        .data(historicalData)
        .join("circle")
        .attr("class", "line-chart-circle-specific")
        .attr("cx", d => bandXScale(d.date) + barWidth / 2)
        .attr("cy", d => scale.y(d.close))
        .attr("r", 3)
        .attr("fill", lineColor);

    // Draw area
    svg.append("path")
        .datum(historicalData)
        .attr("class", "main line-chart-area-specific") // Added "main" for clearing, "line-chart-area-specific" for potential internal use
        .attr("fill", fillColor)
        .attr("d", areaGenerator);

    // Draw line
    svg.append("path")
        .datum(historicalData)
        .attr("class", "main line-chart-path-specific") // Added "main" for clearing, "line-chart-path-specific" for potential internal use
        .attr("fill", "none")
        .attr("stroke", lineColor)
        .attr("stroke-width", 2)
        .attr("d", lineGenerator);
}