import * as d3 from "d3";
import { d3TimeFormats } from "../constants/constants";
import { formatXAxis } from "./axis";
import { Grid } from "./config";

export function drawGrid(svg, scales, innerWidth, innerHeight, bandX) {
    // Remove previous grid lines
    svg.selectAll(".chart-grid").remove();

    // X-axis grid using band scale
    const xAxis = d3.axisBottom(bandX)
        .tickSize(-innerHeight)
        .tickFormat("")
        .tickValues(bandX.domain().filter((d, i) => {
            const total = bandX.domain().length;
            const step = Math.ceil(total / 10);
            return i % step === 0;
        }))
        .tickFormat("") // no label for grid
        .tickSize(-innerHeight)

    svg.insert("g", ":first-child")
        .attr("class", "chart-grid")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(xAxis)
        .call(g => g.selectAll(".tick")
            .attr("transform", d => `translate(${bandX(d) + bandX.bandwidth() / 2},0)`))
        .selectAll("line")
        .attr("stroke", Grid.color)
        .attr("stroke-width", Grid.thickness);

    // Y-axis grid remains unchanged
    svg.append("g")
        .attr("class", "chart-grid")
        .call(d3.axisLeft(scales.y)
            .tickSize(-innerWidth - 110)
            .tickFormat("")
        )
        .selectAll("line")
        .style("stroke", Grid.color)
        .style("stroke-width", Grid.thickness); console.log("grid")
}

export function drawSubIndicatorGrid(svg, innerWidth, xScaleBand, innerIndicatorHeight, margin, subIndicators,) {
    if (subIndicators === 0) {
        svg.selectAll(".subGrid").remove();
        svg.selectAll(".subxaxis").remove();
        svg.selectAll(".x-tick-line").remove();
        return;
    }

    const yIndicator = d3.scaleLinear()
        .domain([0, 100]) // <== Set fixed range here
        .range([innerIndicatorHeight, 0])
        .nice();


    svg.selectAll(".x-tick-line").remove();
    svg.selectAll(".subxaxis").remove();
    svg.selectAll(".subGrid").remove();

    // Get the Y-axis domain for indicators (e.g., MACD)
    const yDomain = yIndicator.domain();
    const middleValue = 50;

    // Y grid lines (for indicators)
    svg.append("g")
        .attr("class", "subGrid")
        .attr("transform", `translate(${margin.left},0)`)
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
        .attr("transform", `translate(0,${innerIndicatorHeight})`)
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
        .attr("class", "x-tick-line")
        .attr("x1", 0)
        .attr("x2", 0)
        .attr("y1", 0)
        .attr("y2", -innerIndicatorHeight)
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
