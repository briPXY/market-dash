// drawAxesAndLabels.js
import * as d3 from "d3";
import { timeFormat } from "d3-time-format";
import { chartGridColor, chartGridThickness, d3TimeFormats } from "../constants/constants";

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
        .tickFormat(d => showLabel.has(d) ? dateFormat(d) : "");

    axis._showLabel = showLabel;
    return axis;
}

export function drawXAxis(svg, bandXScale, innerHeight, range) {
    // Need to modify formatXAxis if it's not compatible with band scales
    const xAxis = formatXAxis(bandXScale, 12, timeFormat(d3TimeFormats[range]));

    // Clean previous axes and lines
    svg.selectAll(".xaxis").remove();
    svg.selectAll(".x-tick-line").remove(); // Clear previous vertical lines
    svg.selectAll("text").remove();
    svg.selectAll(".tick").remove();

    // Draw X Axis
    const xAxisGroup = svg.append("g")
        .attr("class", "xaxis")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(xAxis);

    // Delete tick lines
    xAxisGroup.selectAll(".tick")
        .each(function () {
            d3.select(this).select("line").classed("tick-labeled", true);
        });

    // Style the tick labels
    xAxisGroup.selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "2em")
        .attr("dy", "0.8em")
        .style("font-size", "13px")
        .style("fill", "rgb(255,255,255,0.4)");

    // Style the axis domain
    d3.selectAll(".domain").each(function () {
        this.setAttribute("stroke", "#ffffff1a");
    });

    // Add vertical lines only for labeled ticks
    xAxisGroup.selectAll(".tick")
        .filter(function () { return d3.select(this).select("text").text() !== ""; }) // Only ticks with text
        .append("line")
        .attr("class", "x-tick-line")
        .attr("x1", 0) // Relative to tick position
        .attr("x2", 0)
        .attr("y1", 0)
        .attr("y2", -innerHeight) // Full height upward
        .attr("stroke", chartGridColor)
        .attr("stroke-width", chartGridThickness);
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
        .style("fill", "rgb(255,255,255,0.4)")
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
        .attr("stroke", chartGridColor)
        .attr("stroke-width", chartGridThickness);

    // Add top line for border
    mainSvg.append("line")
        .attr("class", "y-tick-line")
        .attr("x1", 0)
        .attr("x2", parseFloat(mainSvg.attr("width")))
        .attr("y1", 0)
        .attr("y2", 0)
        .attr("stroke", chartGridColor)
        .attr("stroke-width", chartGridThickness);
}
