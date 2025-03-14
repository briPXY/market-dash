// drawAxesAndLabels.js
import * as d3 from "d3";

const formatXAxis = (interval, scalesX, dataLength = 100) => {
    const tickCount = 6; // Ensure evenly spaced ticks (adjust if needed)

    const timeFormats = {
        "1m": "%H:%M",      // 12:30
        "5m": "%H:%M",
        "15m": "%H:%M",
        "30m": "%H:%M",
        "1h": "%b %d %H:%M",  // Mar 07 12:00 (Shows Date + Time)
        "4h": "%b %d %H:%M",  // Mar 07 12:00 (Shows Date + Time)
        "1d": "%b %d",      // Mar 07
        "1w": "%b %Y",      // Mar 2025
        "1M": "%b %Y",      // Mar 2025
    };

    return d3.axisBottom(scalesX)
        .ticks(Math.min(dataLength, tickCount)) // Ensure even spacing
        .tickFormat(d3.timeFormat(timeFormats[interval] || "%H:%M"));
};



export function drawAxesAndLabels(svg, ySvg, scales, innerHeight, innerWidth, range) {
    const yTicks = scales.y.ticks(12);
    const xAxis = formatXAxis(range, scales.x);
    const yAxis = d3.axisRight(scales.y).tickValues(yTicks).tickSize(0).tickPadding(10);
 
    // Add X axis
    svg.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "1em")
        .attr("dy", "0.8em")
        .style("fill", "#ffffff1a");

    d3.selectAll(".domain").each(function () {
        this.setAttribute("stroke", "#ffffff1a");
        this.setAttribute("stroke-opacity", "0.1");
    });

    // Add Y axis
    ySvg.append("g") 
        .call(yAxis)
        .selectAll("text")
        .style("fill", "rgb(255,255,255,0.3)")
        .style("font-size", "12px")
        .style("text-anchor", "start") // Align text properly on the right
        .attr("dx", "5px"); // Move text a bit to the right; 

    svg.selectAll(".tick line")
        .style("stroke", "rgb(255,255,255,0.1)")
        .style("stroke-width", 1);

    svg.selectAll(".tick text")
        .style("font-size", "14px")
        .style("fill", "rgb(255,255,255,0.3)");

}
