export const singleLine = (d3, svg, data, xScale, yScale, color = "white", id) => {
    const line = d3.line().x(d => xScale(new Date(d.date))).y(d => yScale(d.value));

    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", `${color}`)
        .attr("stroke-width", 1)
        .attr("d", line)
        .attr("id", id);
};
