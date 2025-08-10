import { showToolTip } from "../tooltip";

export function line(d3, svg, scale, tooltipRef, historicalData, bandXScale, innerHeight, lineColor="#2fb59c", fillColor = "#2fb59c26") {
    const barWidth = bandXScale.bandwidth(); // Get the bandwidth for centering

    // IMPORTANT: Clearing logic relies on the ".main" class, as per your request.
    // Ensure all elements intended for this chart are given the ".main" class.
    svg.selectAll(".main").remove(); // Clears all elements with class "main" from previous charts/renderings
    svg.selectAll(".line-chart-path-specific").remove();

    const lineGenerator = d3.line()
        .x(d => bandXScale(d.date) + barWidth / 2) // Center the line on the band
        .y(d => scale.y(d.close)) // Use scale.y for vertical positioning
        .curve(d3.curveMonotoneX);

    const areaGenerator = d3.area()
        .x(d => bandXScale(d.date) + barWidth / 2) // Center the area points on the band
        .y0(innerHeight) // Assuming innerHeight is the base of your chart area
        .y1(d => scale.y(d.close)) // Use scale.y for vertical positioning
        .curve(d3.curveMonotoneX);


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

    const tooltip = d3.select(tooltipRef.current); // Select tooltip inside the component

    // Draw circles for interaction/tooltips
    svg.selectAll(".line-chart-circle-specific") // Selects only circles already belonging to this chart
        .data(historicalData)
        .enter()
        .append("circle")
        .attr("class", "main line-chart-circle-specific") // Added "main" for clearing, "line-chart-circle-specific" for internal selection
        .attr("cx", d => bandXScale(d.date) + barWidth / 2) // Center the circle on the band
        .attr("cy", d => scale.y(d.close))
        .attr("r", 3)
        .attr("fill", lineColor)
        .on("mouseover", (event, d) => {
            showToolTip(d3, event, tooltip, d);
        })
        .on("mouseout", () => {
            tooltip.style("opacity", 0);
        });
}