export var hoveredDate = "";

export function addToolTipHandleOverlay(nodes, width, tooltipRef, bandXScale, d3, innerHeight) {
    if (!nodes || nodes.empty()) return;
    const svg = d3.select(nodes.node().ownerSVGElement);
    const data = nodes.data();

    // Bind overlay rects to data so they are updated/removed instead of appended repeatedly
svg.selectAll('.tooltip-overlay')
    .data(data)
    .join('rect')
    .attr('class', 'tooltip-overlay')
    .attr('x', d => bandXScale(d.date))
    .attr('y', 0)
    .attr('width', width)
    .attr('height', innerHeight)
    .attr('fill', 'transparent')
    .on('mouseover', (event, d) => {
        // assign formatted date to global var
        hoveredDate = d3.timeFormat("%H:%M:%S")(d.date);
        // update tooltip without the date line
        const tooltip = d3.select(tooltipRef.current);
        tooltip.style('opacity', 1)
            .html(
                `<div> O:${d.open.toFixed(6)} </div>
                 <div class="text-accent"> H:${d.high.toFixed(6)} </div>
                 <div class="text-negative-accent"> L:${d.low.toFixed(6)} </div>
                 <div> C:${d.close.toFixed(6)} </div>
                 <div> VOL:${d.volume.toFixed(2)} </div>`
            )
            .style('text-align', 'left')
    })
    .on('mouseout', () => {
        d3.select(tooltipRef.current).style('opacity', 0);
    });

}