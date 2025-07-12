export const singleLine = (d3, svg, data, scale, bandXScale, color = "white", id) => {
    try {
        const line = d3.line().x(d => scale.x(new Date(d.date))).y(d => scale.y(d.value));

        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", `${color}`)
            .attr("stroke-width", 1)
            .attr("d", line)
            .attr("id", id);
    }
    catch (e) {
        console.error("error on id:", id, e);
    }
};
