import { showToolTip } from "../tooltip";

export function drawVolumeBars(d3, svg, scale, historicalData, innerHeight, tooltipRef, volumeColor = "rgba(255, 255, 255, 0.1)") {
    const barWidth = Math.max(3, scale.x(historicalData[1]?.date) - scale.x(historicalData[0]?.date) - 2); // Dynamic width
    svg.selectAll(".volume-bar").remove();
    const tooltip = d3.select(tooltipRef.current);
    // Append a group for volume bars (ensure it's below candlesticks)
    const volumeGroup = svg.append("g").attr("class", "volume-bars");

    // Find the max volume to scale bars correctly
    const maxVolume = d3.max(historicalData, d => d.volume);

    // Create a separate y-scale for volume
    const yVolume = d3.scaleLinear()
        .domain([0, maxVolume])
        .range([innerHeight, innerHeight * 0.7]); // Scale volume bars to be smaller

    // Draw volume bars
    volumeGroup.selectAll(".volume-bar")
        .data(historicalData)
        .enter()
        .append("rect")
        .attr("class", "volume-bar")
        .attr("x", d => scale.x(d.date) - barWidth / 2) // Center bars
        .attr("y", d => yVolume(d.volume)) // Use new Y scale
        .attr("width", barWidth)
        .attr("height", d => innerHeight - yVolume(d.volume)) // Adjust height
        .attr("fill", volumeColor).on("mouseover", (event, d) => {
            showToolTip(d3, event, tooltip, d);
        })
        .on("mouseout", () => {
            tooltip.style("opacity", 0);
        });
}
