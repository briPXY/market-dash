export function showToolTip(d3, event, tooltip, d) {
    tooltip.style("opacity", 1)
        .html(`<div> ${d3.timeFormat("%H:%M:%S")(d.date)} </div><div> open:${d.open.toFixed(2)} </div><div class="text-accent"> high:${d.high.toFixed(2)} </div><div class="text-negative-accent"> low:${d.low.toFixed(2)} </div><div> close:${d.close.toFixed(2)} </div><div> volume:${d.volume.toFixed(2)} </div>`) 
        .style("text-align", "left")
        .style("font-size", "13px")
}