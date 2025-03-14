export function drawLineChart(d3, svg, scalesRef, tooltipRef, historicalData, innerHeight, lineColor, fillColor) {

    // Generate exactly 12 ticks for the Y axis. 

    const line = d3.line()
        .x(d => scalesRef.current.x(d.x))
        .y(d => scalesRef.current.y(d.y))
        .curve(d3.curveMonotoneX);

    const area = d3.area()
        .x(d => scalesRef.current.x(d.x))
        .y0(innerHeight)
        .y1(d => scalesRef.current.y(d.y))
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
        .attr("cx", d => scalesRef.current.x(d.x))
        .attr("cy", d => scalesRef.current.y(d.y))
        .attr("r", 3)
        .attr("fill", lineColor)
        .on("mouseover", (event, d) => {
            tooltip.style("opacity", 1)
                .html(`time: ${d3.timeFormat("%H:%M:%S")(d.x)}<br/>price: ${d.y}`)
                .style("left", `${event.offsetX}px`)
                .style("top", `${event.offsetY}px`);
        })
        .on("mouseout", () => {
            tooltip.style("opacity", 0);
        });
}