export function drawLineChart(d3, svg, scale, tooltipRef, historicalData, innerHeight, lineColor, fillColor) {
 
    const line = d3.line()
        .x(d => scale.x(d.date))
        .y(d => scale.y(d.close))
        .curve(d3.curveMonotoneX);

    const area = d3.area()
        .x(d => scale.x(d.date))
        .y0(innerHeight)
        .y1(d => scale.y(d.close))
        .curve(d3.curveMonotoneX);


    // Draw area
    svg.append("path")
        .datum(historicalData)
        .attr("class", "area")
        .attr("fill", fillColor)
        .attr("d", area);

    // Draw line
    svg.append("path")
        .datum(historicalData)
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", lineColor)
        .attr("stroke-width", 2)
        .attr("d", line);

    const tooltip = d3.select(tooltipRef.current); // Select tooltip inside the component

    svg.selectAll(".circle")
        .data(historicalData)
        .enter()
        .append("circle")
        .attr("class", "circle")
        .attr("cx", d => scale.x(d.date))
        .attr("cy", d => scale.y(d.close))
        .attr("r", 3)
        .attr("fill", lineColor)
        .on("mouseover", (event, d) => {
            tooltip.style("opacity", 1)
                .html(`time: ${d3.timeFormat("%H:%M:%S")(d.date)}<br/>price: ${d.close}`)
                .style("left", `${event.offsetX}px`)
                .style("top", `${event.offsetY}px`);
        })
        .on("mouseout", () => {
            tooltip.style("opacity", 0);
        });
}