export function showToolTip(d3, event, tooltip, d) {
    tooltip.style("opacity", 1)
        .html(`${d3.timeFormat("%H:%M:%S")(d.date)} <br/> open: ${d.open.toFixed(2)} <br/> high: ${d.high.toFixed(2)} <br/> low: ${d.low.toFixed(2)} <br/> close: ${d.close.toFixed(2)} <br/> volume: ${d.volume.toFixed(2)}`)
        .style("left", `45vw`)
        .style("text-align", "left")
        .style("font-size", "13px") 
        .style("top", `0`);
}