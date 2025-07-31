import * as d3 from "d3";
import { chartGridColor } from "../constants/constants";

export function drawGrid(svg, scales, innerWidth, innerHeight, bandX) {
    // Remove previous grid lines
    svg.selectAll(".grid").remove();

    // X-axis grid using band scale
    const xAxis = d3.axisBottom(bandX)
        .tickSize(-innerHeight)
        .tickFormat("")
        .tickValues(bandX.domain().filter((d, i) => {
            // Optional: reduce number of ticks for better spacing
            const total = bandX.domain().length;
            const step = Math.ceil(total / 10); // Max 10 grid lines
            return i % step === 0;
        }));

    svg.insert("g", ":first-child")
        .attr("class", "grid")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(xAxis)
        .selectAll("line")
        .style("stroke", chartGridColor)
        .style("stroke-width", 0.5);

    // Y-axis grid remains unchanged
    svg.append("g")
        .attr("class", "grid")
        .call(d3.axisLeft(scales.y)
            .tickSize(-innerWidth - 110)
            .tickFormat("")
        )
        .selectAll("line")
        .style("stroke", chartGridColor)
        .style("stroke-width", 0.5);
}

export function drawSubIndicatorGrid(svg, innerWidth, data, innerIndicatorHeight, margin, subIndicators) {
    if (subIndicators === 0) {
        svg.selectAll(".subGrid").remove();
        return;
    }
    const xScale = d3.scaleTime()
        .domain(d3.extent(data, d => d.date)) // Auto-adjust based on data
        .range([0, innerWidth]);

    const yIndicator = d3.scaleLinear()
        .domain([0, 100]) // <== Set fixed range here
        .range([innerIndicatorHeight, 0])
        .nice();

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
        .style("stroke", chartGridColor)
        .style("stroke-width", 0.5)
        .attr("class", "subGrid");

    svg.append("g")
        .attr("class", "subGrid")
        .attr("transform", `translate(0,${innerIndicatorHeight})`)
        .call(d3.axisBottom(xScale)
            .ticks(10) // **Double tick count**
            .tickSize(-innerIndicatorHeight)
            .tickFormat("")
        )
        .selectAll("line")
        .style("stroke", chartGridColor)
        .style("stroke-width", 0.5)
        .attr("class", "subGrid");

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
