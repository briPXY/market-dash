import * as d3 from "d3";

export function createSubIndicatorYScale_MACD(indicatorData, dim) {
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

export function createSubIndicatorYScale_AnyArray(indicatorData, dim) {
    if (!indicatorData || indicatorData.length === 0) {
        // fallback if array is empty
        return d3.scaleLinear()
            .domain([0, 1])
            .range([dim.h - dim.m.bottom, dim.m.top]);
    }

    const min = d3.min(indicatorData);
    const max = d3.max(indicatorData);
    const padding = (max - min) * 0.1; // add 10% visual padding
    const svgHeight = dim.h;

    return d3.scaleLinear()
        .domain([min - padding, max + padding])
        .range([svgHeight - dim.m.bottom, dim.m.top]);
}
