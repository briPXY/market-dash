export function xyScaler(d3, OHLCData, xValue, yValue, isLogScale = "LOG", innerWidth, innerHeight, margin) {
    let y;
    if (isLogScale == "LOG") {
        // Ensure the lower bound is > 0 for log scale.
        const min = d3.min(OHLCData, d => d[yValue]);
        const max = d3.max(OHLCData, d => d[yValue]);
        y = d3.scaleLinear()
            .domain([min, max])  // Use min & max close price instead of 0
            .range([innerHeight, margin.top])
            .nice();
    } else {
        y = d3.scaleLinear()
            .domain([0, d3.max(OHLCData, d => d[yValue]) * 1.05])
            .range([innerHeight, margin.top])
            .nice(12);
    }

    const x = d3.scaleTime()
        .domain([d3.min(OHLCData, d => d[xValue]), d3.max(OHLCData, d => d[xValue])])
        .range([margin.left, innerWidth]);

    return { x: x, y: y }
}