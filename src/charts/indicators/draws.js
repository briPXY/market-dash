export const drawIndicator = (funcName, fn, indicatorData, color = "white", svg, yScaler, bandXScale, dimension) => {
    svg.select(`#${funcName}`).remove();
    svg.selectAll(`.${funcName}`).remove();
    fn.draw(svg, indicatorData, yScaler, bandXScale, color, funcName, dimension);
};

export function drawIndicatorError(svg, data, yScale, bandXScale, color, id, dim, message) {
    // Remove previous rendered elements for this indicator
    svg.selectAll(`.${id}-error`).remove();
    svg.selectAll(`.${id}-line`).remove();
    svg.selectAll(`.${id}-overlay`).remove();
    svg.selectAll(`.${id}-level-line`).remove();
    svg.selectAll(`.${id}-histogram-bar`).remove();
    svg.selectAll(`.${id}-zero-line`).remove();

    // Draw centered error text
    svg.append("text")
        .attr("class", `${id}-error`)
        .attr("x", dim.w / 2)                      // horizontal center
        .attr("y", dim.h / 2)                      // vertical center
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .attr("fill", color || "#ff4444")
        .style("font-size", "12px")
        .text(message || "Not enough data");
}
