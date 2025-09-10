export function drawVolumeBars(d3, svg, bandXScale, historicalData, innerHeight, tooltipRef, volumeColor = "rgba(255, 255, 255, 0.1)") { 

    const barWidth = bandXScale.bandwidth();

    svg.selectAll(".volume-bar-rect").remove(); 

    // Append a group for volume bars if it doesn't exist, or select it
    // Using a specific class for the rects themselves is better than for the group if you're appending directly
    const volumeGroup = svg.select(".volume-group"); // Select existing group
    if (volumeGroup.empty()) { // If not found, create it
        svg.append("g").attr("class", "volume-group");
    }

    // Find the max volume to scale bars correctly
    const maxVolume = d3.max(historicalData, d => d.volume);

    // Create a separate y-scale for volume
    const yVolume = d3.scaleLinear()
        .domain([0, maxVolume])
        .range([innerHeight, innerHeight * 0.6]); // Scale volume bars to be smaller

    // Draw volume bars
    volumeGroup.selectAll(".volume-bar-rect")
        .data(historicalData)
        .enter()
        .append("rect")
        .attr("class", "volume-bar-rect")
        .attr("x", d => bandXScale(d.date)) // Center bars
        .attr("y", d => yVolume(d.volume)) // Use new Y scale
        .attr("width", barWidth + 1)
        .attr("height", d => innerHeight - yVolume(d.volume)) // Adjust height
        .attr("fill", volumeColor);
}
