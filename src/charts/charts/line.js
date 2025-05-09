import { showToolTip } from "../tooltip";

export function line(d3, svg, scale, tooltipRef, historicalData, innerHeight, innerWidth, lineColor="#2fb59c", fillColor = "#2fb59c26") {
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
        .attr("class", "main")
        .attr("fill", fillColor)
        .attr("d", area)
        .attr("class", "main");

    // Draw line
    svg.append("path")
        .datum(historicalData)
        .attr("class", "main")
        .attr("fill", "none")
        .attr("stroke", lineColor)
        .attr("stroke-width", 2)
        .attr("d", line)
        .attr("class", "main");

    const tooltip = d3.select(tooltipRef.current); // Select tooltip inside the component 

    svg.selectAll(".main")
        .data(historicalData)
        .enter()
        .append("circle") 
        .attr("class", "main")
        .attr("cx", d => scale.x(d.date))
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