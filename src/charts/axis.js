// drawAxesAndLabels.js
import * as d3 from "d3";
import { timeFormat } from "d3-time-format";
import { d3TimeFormats } from "../constants/constants";
import { Grid } from "./config";

export function formatXAxis(
    bandXScale,
    maxTicks = 8,
    dateFormat = d => d
) {
    const domain = bandXScale.domain();

    const step = Math.ceil(domain.length / maxTicks);
    const visibleTicks = domain.filter((d, i) => i % step === 0);

    const showLabel = new Set(visibleTicks);

    const axis = d3.axisBottom(bandXScale)
        .tickValues(domain) // always pass full domain
        .tickFormat(d => showLabel.has(d) ? dateFormat(new Date(d)) : "");

    axis._showLabel = showLabel;
    return axis;
}

export function drawXGridAxisLabel(svg, bandXScale, svgHeight, range) {
    const xAxis = formatXAxis(bandXScale, 12, timeFormat(d3TimeFormats[range]));

    // Clear previous
    svg.selectAll(".chart-x-grid").remove();
    svg.selectAll(".x-vert-line").remove();

    // Place axis at bottom, just above the padding
    const xAxisGroup = svg.append("g")
        .attr("class", "chart-x-grid")
        .attr("transform", `translate(0,${svgHeight - 36})`) // shifted up
        .call(xAxis);

    // Style tick labels
    xAxisGroup.selectAll("text")
        .attr("fill", Grid.text)
        .style("fill", Grid.text)
        .style("text-anchor", "middle")
        .style("font-size", "1.2em")
        .attr("y", 0)
        .attr("dy", "1em")
        .attr("dominant-baseline", "hanging");

    // Add vertical grid lines
    xAxisGroup.selectAll(".tick")
        .filter(function () {
            const textNode = d3.select(this).select("text").node();
            return textNode && textNode.textContent.trim() !== "";
        })
        .append("line")
        .attr("class", "x-vert-line")
        .attr("x1", 0)
        .attr("x2", 0)
        .attr("y1", 0)
        .attr("y2", -(svgHeight)) // stop at chart top + extend 40px
        .attr("stroke", Grid.color)
        .attr("stroke-width", Grid.thickness)
        .attr("stroke-dasharray", Grid.dashes);

    // Remove default tiny ticks
    xAxisGroup.selectAll(".tick line:not(.x-vert-line)").remove();
    // Remove axis line on bottom
    xAxisGroup.selectAll(".domain").remove();
    // Remove ticks with no vertical line
    xAxisGroup.selectAll(".tick")
        .filter(function () {
            return d3.select(this).select("line.x-vert-line").empty();
        }).remove();
}

export function drawYAxis(ySvg, scales, mainSvg) {
    ySvg.selectAll(".yaxis").remove();

    const yTicks = scales.y.ticks(12);
    const yAxis = d3.axisRight(scales.y)
        .tickValues(yTicks)
        .tickSize(0)
        .tickPadding(10);

    // Draw Y Axis
    const yAxisGroup = ySvg.append("g")
        .attr("class", "yaxis")
        .call(yAxis);

    // Style the tick labels
    yAxisGroup.selectAll("text")
        .style("fill", Grid.text)
        .style("font-size", "12px")
        .style("text-anchor", "start")
        .attr("dx", "5px");

    // Get the width of mainSvg
    const svgWidth = parseFloat(mainSvg.node().getBoundingClientRect().width);

    // Add horizontal lines for each tick on mainSvg at full width
    mainSvg.selectAll(".y-tick-line").remove(); // Clear previous lines
    mainSvg.selectAll(".y-tick-line")
        .data(yTicks)
        .enter()
        .append("line")
        .attr("class", "y-tick-line")
        .attr("x1", 0)
        .attr("x2", svgWidth) // Full width of mainSvg
        .attr("y1", d => scales.y(d))
        .attr("y2", d => scales.y(d))
        .attr("stroke", Grid.color)
        .attr("stroke-width", Grid.thickness)
        .attr("stroke-dasharray", Grid.dashes);

    // Add top line for border
    mainSvg.append("line")
        .attr("class", "y-tick-line")
        .attr("x1", 0)
        .attr("x2", parseFloat(mainSvg.attr("width")))
        .attr("y1", 0)
        .attr("y2", 0)
        .attr("stroke", Grid.color)
        .attr("stroke-width", Grid.thickness);
}
