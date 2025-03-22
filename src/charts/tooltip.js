export function showToolTip(d3, event, tooltip, d) {
    tooltip.style("opacity", 1)
        .html(`${d3.timeFormat("%H:%M:%S")(d.date)} <br/> open: ${d.open} <br/> high: ${d.high} <br/> low: ${d.low} <br/> close: ${d.close} <br/> volume: ${d.volume.toFixed(2)}`)
        .style("left", `45vw`)
        .style("text-align", "left")
        .style("font-size", "13px") 
        .style("top", `0`);
}