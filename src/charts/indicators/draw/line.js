export const singleLine = (d3, svg, data, scale, bandXScale, color = "white", id) => {
    try {
        // The line generator uses the bandXScale to position points at the center of each band
        const line = d3.line()
            .x(d => bandXScale(d.date) + bandXScale.bandwidth() / 2) // Get the start of the band and add half its width
            .y(d => scale.y(d.value));

        svg.append("path")
            .datum(data) // Bind the entire dataset to the path
            .attr("fill", "none")
            .attr("stroke", `${color}`)
            .attr("stroke-width", 1) // Increased stroke-width for better visibility
            .attr("d", line) // Apply the line generator to the data
            .attr("id", id);
    }
    catch (e) {
        console.error("Error drawing line with id:", id, e);
    }
};
