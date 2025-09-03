import * as d3 from "d3";

export function createSubIndicatorYScale(indicatorData, dim) {
    const middle = d3.mean(indicatorData, d => (d.MACD + d.signal) / 2) || 0;
    const maxDistance = d3.max(indicatorData, d => Math.max(
        Math.abs(d.MACD - middle),
        Math.abs(d.signal - middle),
        Math.abs(d.histogram)
    ));
    const padding = maxDistance * 0.2;
    const svgHeight = dim.h;
    return d3.scaleLinear()
        .domain([middle - maxDistance - padding, middle + maxDistance + padding])
        .range([svgHeight - dim.m.bottom, dim.m.top]);
}
