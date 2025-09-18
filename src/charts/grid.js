import * as d3 from "d3";
import { d3TimeFormats } from "../constants/constants";
import { formatXAxis } from "./axis";
import { Grid } from "./config";
import { timeFormat } from "d3-time-format";

export function drawXAxisGrid(svg, bandXScale, innerHeight, range) {
    const xAxis = formatXAxis(bandXScale, 12, timeFormat(d3TimeFormats[range]));

    // Clean previous grid lines
    svg.selectAll(".chart-x-grid").remove();
    svg.selectAll(".x-vert-line").remove();

    const xAxisGroup = svg.append("g")
        .attr("class", "chart-x-grid")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(xAxis);

    // Add vertical lines only for ticks that *have a text element*
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
        .attr("y2", -innerHeight)
        .attr("stroke", Grid.color)
        .attr("stroke-width", Grid.thickness)
        .attr("stroke-dasharray", Grid.dashes);

    // 🔹 Now remove the default axis artifacts
    xAxisGroup.selectAll(".tick line:not(.x-vert-line)").remove();
    xAxisGroup.selectAll(".tick text").remove();
}


export function drawSubIndicatorGrid(svg, xScaleBand, chartDim, subIndicators,) {
    if (subIndicators === 0) {
        svg.selectAll(".subGrid").remove();
        svg.selectAll(".subxaxis").remove();
        svg.selectAll(".sub-vert-line").remove();
        svg.selectAll(".tick").remove();
        return;
    }

    const yIndicator = d3.scaleLinear()
        .domain([0, 100]) // <== Set fixed range here
        .range([chartDim.subIndicatorHeight, 0])
        .nice();


    svg.selectAll(".sub-vert-line").remove();
    svg.selectAll(".subxaxis").remove();
    svg.selectAll(".subGrid").remove();
    svg.selectAll(".tick").remove();

    // Get the Y-axis domain for indicators (e.g., MACD)
    const yDomain = yIndicator.domain();
    const middleValue = 50;

    // Y grid lines (for indicators)
    svg.append("g")
        .attr("class", "subGrid")
        .attr("transform", `translate(${chartDim.margin.left},0)`)
        .call(d3.axisLeft(yIndicator)
            .tickValues([yDomain[0], middleValue, yDomain[1]])
            .tickSize(-innerWidth - 110)
            .tickFormat("")
        )
        .selectAll("line")
        .style("stroke", Grid.color)
        .style("stroke-width", Grid.thickness)
        .attr("class", "subGrid");

    const xAxis = formatXAxis(xScaleBand, 12, d3.timeFormat(d3TimeFormats["1h"]));

    const xAxisGroup = svg.append("g")
        .attr("class", "subxaxis")
        .attr("transform", `translate(0,${chartDim.subIndicatorHeight})`)
        .call(xAxis);

    // Apply same class to both tick line & tick text
    xAxisGroup.selectAll(".tick")
        .each(function () {
            d3.select(this).select("line").classed("tick-labeled", true);
            d3.select(this).select("text").classed("tick-labeled", true);
        });

    // Add custom long grid lines only for labeled ticks
    xAxisGroup.selectAll(".tick")
        .filter(d => xAxis._showLabel.has(d))
        .append("line")
        .attr("class", "sub-vert-line")
        .attr("x1", 0)
        .attr("x2", 0)
        .attr("y1", 0)
        .attr("y2", -chartDim.subIndicatorHeight)
        .attr("stroke", Grid.color)
        .attr("stroke-width", Grid.thickness)
        .attr("stroke-dasharray", Grid.dashes);
    // Middle line in the sub-indicator panel
    // svg.append("line")
    // .attr("class", "subGrid")
    // .attr("x1", 0)
    // .attr("x2", innerWidth)
    // .attr("y1", yIndicator(middleValue))  
    // .attr("y2", yIndicator(middleValue))
    // .style("stroke", "#ffffff80")
    // .style("stroke-width", 0.5);
}
