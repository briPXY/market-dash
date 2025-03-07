// drawAxesAndLabels.js
import * as d3 from "d3";

export function drawAxesAndLabels(svg, scales, innerWidth, innerHeight, margin) {
    const yTicks = scales.y.ticks(12);

    const xAxis = d3.axisBottom(scales.x)
        .tickSize(-innerHeight)
        .tickPadding(10);

    const yAxis = d3.axisLeft(scales.y)
        .tickValues(yTicks)
        .tickSize(-innerWidth)
        .tickPadding(10);

    // Add X axis
    svg.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-0.8em")
        .attr("dy", "0.15em")
        .attr("transform", "rotate(-65)")
        .style("fill", "#ffffff1a");

    // Add Y axis
    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(yAxis)
        .selectAll("text")
        .style("fill", "#ffffff1a");

    // Style axes lines and ticks
    svg.selectAll(".domain")
        .style("stroke", "#ffffff1a")
        .style("stroke-width", 1);

    svg.selectAll(".tick line")
        .style("stroke", "#ffffff1a")
        .style("stroke-width", 1);

    svg.selectAll(".tick text")
        .style("font-size", "12px")
        .style("fill", "#ffffff1a");

    // Add X axis label
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", innerWidth)
        .attr("y", innerHeight + margin.bottom)
        .text("Time")
        .style("fill", "#ffffff1a");

    // Add Y axis label
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", -margin.top)
        .attr("y", margin.left - 40)
        .attr("transform", "rotate(-90)")
        .text("Value")
        .style("fill", "#ffffff1a");
}
