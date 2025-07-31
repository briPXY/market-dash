// drawAxesAndLabels.js
import * as d3 from "d3";
import { timeFormat } from "d3-time-format";

export function formatXAxis(bandXScale, maxTicks = 8, dateFormat = d => d) {
    const domain = bandXScale.domain();

    const step = Math.ceil(domain.length / maxTicks);
    const visibleTicks = domain.filter((d, i) => i % step === 0);

    return d3.axisBottom(bandXScale)
        .tickValues(visibleTicks)
        .tickFormat(dateFormat); // Optional date formatting function
}

const timeFormats = {
    "1m": "%H:%M",      // 12:30
    "5m": "%H:%M",
    "15m": "%H:%M",
    "30m": "%H:%M",
    "1h": "%b-%d %H:%M",  // Mar 07 12:00 (Shows Date + Time)
    "4h": "%b-%d %H:%M",  // Mar 07 12:00 (Shows Date + Time)
    "1d": "%b %d",      // Mar 07
    "1w": "%b %Y",      // Mar 2025
    "1M": "%b %Y",      // Mar 2025
};

export function drawAxesAndLabels(svg, ySvg, scales, bandXScale, innerHeight, range) {
    const yTicks = scales.y.ticks(12);

    // You may need to modify formatXAxis if it's not compatible with band scales
    const xAxis = formatXAxis(bandXScale, 8, timeFormat(timeFormats[range]))

    const yAxis = d3.axisRight(scales.y)
        .tickValues(yTicks)
        .tickSize(0)
        .tickPadding(10);

    // Clean previous axes
    svg.selectAll(".xaxis").remove();
    svg.selectAll(".yaxis").remove();

    // Draw X Axis
    svg.append("g")
        .attr("class", "xaxis")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "2em")
        .attr("dy", "0.8em")
        .style("fill", "rgb(255,255,255,0.4)");

    d3.selectAll(".domain").each(function () {
        this.setAttribute("stroke", "#ffffff1a");
    });

    // Draw Y Axis
    ySvg.append("g")
        .attr("class", "yaxis")
        .call(yAxis)
        .selectAll("text")
        .style("fill", "rgb(255,255,255,0.4)")
        .style("font-size", "12px")
        .style("text-anchor", "start")
        .attr("dx", "5px");

    // Style ticks
    svg.selectAll(".tick line")
        .style("stroke", "rgb(255,255,255,0.0)")
        .style("stroke-width", 0.3);

    svg.selectAll(".tick text")
        .style("font-size", "14px")
        .style("fill", "rgb(255,255,255,0.4)");
}
