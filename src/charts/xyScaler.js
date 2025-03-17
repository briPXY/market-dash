export function xyScaler(d3, OHLCData, isLogScale, innerWidth, innerHeight, margin) {
    let y;
    if (isLogScale == "LOG") {
        // Ensure the lower bound is > 0 for log scale.
        const minClose = d3.min(OHLCData, d => d.close);
        const maxClose = d3.max(OHLCData, d => d.close);
        y = d3.scaleLinear()
            .domain([minClose, maxClose])  // Use min & max close price instead of 0
            .range([innerHeight, margin.top])
            .nice();
    } else {
        y = d3.scaleLinear()
            .domain([0, d3.max(OHLCData, d => d.close) * 1.05])
            .range([innerHeight, margin.top])
            .nice(12);
    }

    const x = d3.scaleTime()
        .domain([d3.min(OHLCData, d => d.date), d3.max(OHLCData, d => d.date)])
        .range([margin.left, innerWidth]);

    return { x: x, y: y }
}