import * as d3 from "d3";

export function drawGrid(svg, scales, innerWidth, innerHeight, margin) {
    // X grid lines with darker grid color (#ffffff1a)
    svg.append("g")
        .attr("class", "grid")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(scales.x)
            .ticks(5)
            .tickSize(-innerHeight)
            .tickFormat("")
        )
        .selectAll("line")
        .style("stroke", "#ffffff1a")
        .style("stroke-width", 0.5);
 
    svg.append("g")
        .attr("class", "grid")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(scales.y)
            .tickSize(-innerWidth - 100)
            .tickFormat("")
        )
        .selectAll("line")
        .style("stroke", "#ffffff1a")
        .style("stroke-width", 0.5);
}
