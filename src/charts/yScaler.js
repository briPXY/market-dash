export function yScaler(d3, OHLCData, isLogScale, innerHeight, margin) {
    if (isLogScale == "LOG") {
        // Ensure the lower bound is > 0 for log scale.
        const minClose = d3.min(OHLCData, d => d.close);
        const maxClose = d3.max(OHLCData, d => d.close);
        return d3.scaleLinear()
            .domain([minClose, maxClose])  // Use min & max close price instead of 0
            .range([innerHeight, margin.current.top])
            .nice();
    } else {
        return d3.scaleLinear()
            .domain([0, d3.max(OHLCData, d => d.close) * 1.05])
            .range([innerHeight, margin.current.top])
            .nice(12);
    }
}