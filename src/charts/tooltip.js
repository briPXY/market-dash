export function showToolTip(d3, event, tooltip, d) {
    tooltip.style("opacity", 1)
        .html(`${d3.timeFormat("%H:%M:%S")(d.date)} - open=${d.open}  high=${d.high}  low=${d.low}  close=${d.close}`)
        .style("right", `10`)
        .style("font-size", "13px") 
        .style("top", `0`);
}