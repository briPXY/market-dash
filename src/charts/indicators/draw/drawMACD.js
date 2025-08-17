// function xyScaler(d3, OHLCData, xValue, yValue, isLogScale, innerWidth, innerHeight, margin) {
//     let y = d3.scaleLinear()
//         .domain([
//             d3.min(OHLCData, d => d[yValue]) * 1.1,
//             d3.max(OHLCData, d => d[yValue]) * 1.1
//         ])
//         .range([innerHeight, margin.top])
//         .nice();

//     const x = d3.scaleTime()
//         .domain([d3.min(OHLCData, d => d[xValue]), d3.max(OHLCData, d => d[xValue])])
//         .range([margin.left, innerWidth]);

//     return { x: x, y: y };
// } 

export function drawMACD(d3, svg, data, scale, bandXScale, color, id, dim) {
    const barWidth = bandXScale.bandwidth();
    const middle = d3.mean(data, d => (d.MACD + d.signal) / 2) || 0;
    const maxDistance = d3.max(data, d => Math.max(
        Math.abs(d.MACD - middle),
        Math.abs(d.signal - middle),
        Math.abs(d.histogram)
    ));
    const padding = maxDistance * 0.2;
    
    // Use actual svg element height if available
    const svgHeight = +svg.attr("height") || dim.h;
    const macdYScale = d3.scaleLinear()
        .domain([middle - maxDistance - padding, middle + maxDistance + padding])
        .range([svgHeight - dim.m.bottom, dim.m.top]);

    const processedData = data.map((d, i) => ({
        ...d,
        prevHistogram: i > 0 ? data[i - 1].histogram : 0
    }));

    // Line generator for the MACD Line
    const macdLine = d3.line()
        .x(d => bandXScale(d.date) + barWidth / 2)
        .y(d => macdYScale(d.MACD)); // This line will be the MACD line itself

    // Clear previous elements within this SVG
    svg.selectAll(`.${id}-line`).remove();
    svg.selectAll(`.${id}-histogram-bar`).remove();
    svg.selectAll(`.${id}-zero-line`).remove();

    // Draw MACD Line (only one line)
    svg.append("path")
        .datum(data)
        .attr("class", `${id}-line`)
        .attr("fill", "none")
        .attr("stroke", "#dddddd") // This will be MACD line
        .attr("stroke-width", 1)
        .attr("d", macdLine);

    // Draw Histogram Bars with Saturation Adjustment
    svg.selectAll(`.${id}-histogram-bar`)
        .data(processedData)
        .enter().append("rect")
        .attr("class", `${id}-histogram-bar`)
        .attr("x", d => bandXScale(d.date))
        .attr("y", d => macdYScale(Math.max(0, d.histogram)))
        .attr("width", barWidth)
        .attr("height", d => Math.abs(macdYScale(d.histogram) - macdYScale(0)))
        .attr("fill", d => {
            if (d.histogram >= 0) {
                return d.histogram >= d.prevHistogram ? "#208a76" : "#93b5ab";
            } else {
                return d.histogram <= d.prevHistogram ? "#ff6347" : "#ff9999";
            }
        });

    // Draw Zero Line
    svg.append("line")
        .attr("class", `${id}-zero-line`)
        .attr("x1", dim.m.left)
        .attr("x2", dim.w - dim.m.right)
        .attr("y1", macdYScale(0))
        .attr("y2", macdYScale(0))
        .attr("stroke", "gray")
        .attr("stroke-dasharray", "2,2");
}