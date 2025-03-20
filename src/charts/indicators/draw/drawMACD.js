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

export function drawMACD(d3, svg, data, scale, color, id, dim) {
    // Calculate xScale dynamically
    const xScale = d3.scaleTime()
        .domain([d3.min(data, d => new Date(d.date)), d3.max(data, d => new Date(d.date))])
        .range([dim.m.left, dim.w - dim.m.right]); // Respect margins

    // Calculate yScale dynamically
    // const yMin = Math.min(0, d3.min(data, d => Math.min(d.MACD, d.signal, d.histogram)));
    // const yMax = Math.max(0, d3.max(data, d => Math.max(d.MACD, d.signal, d.histogram)));

    const middle = d3.mean(data, d => (d.MACD + d.signal) / 2) || 0; // Fallback to 0 if undefined

    const maxDistance = d3.max(data, d => Math.max(
        Math.abs(d.MACD - middle),
        Math.abs(d.signal - middle),
        Math.abs(d.histogram) // Ensure histograms fit too
    ));
    
    const padding = maxDistance * 0.2; // 20% extra padding
    
    const yScale = d3.scaleLinear()
        .domain([middle - maxDistance - padding, middle + maxDistance + padding])
        .range([dim.h - dim.m.bottom, dim.m.top]);

    // Prepare data with previous histogram values
    const processedData = data.map((d, i) => ({
        ...d,
        prevHistogram: i > 0 ? data[i - 1].histogram : 0
    }));

    // Line generators
    const macdLine = d3.line()
        .x(d => xScale(new Date(d.date)))
        .y(d => yScale(d.MACD));

    // const signalLine = d3.line()
    //     .x(d => xScale(new Date(d.date)))
    //     .y(d => yScale(d.signal)); 

    // Draw MACD Line
    svg.append("path")
        .datum(data)
        .attr("class", `${id}`)
        .attr("fill", "none")
        .attr("stroke", "#00ff00")
        .attr("stroke-width", 1)
        .attr("d", macdLine);

    // // Draw Signal Line
    // svg.append("path")
    //     .datum(data)
    //     .attr("class", `${id}`)
    //     .attr("fill", "none")
    //     .attr("stroke", "#ff9900")
    //     .attr("stroke-width", 1)
    //     .attr("d", signalLine);

    // Draw Histogram Bars with Saturation Adjustment
    svg.selectAll(`.${id}`)
        .data(processedData)
        .enter().append("rect")
        .attr("class", `${id}`)
        .attr("x", d => xScale(new Date(d.date)) - 2)
        .attr("y", d => yScale(Math.max(0, d.histogram)))
        .attr("width", 6)
        .attr("height", d => Math.abs(yScale(d.histogram) - yScale(0)))
        .attr("fill", d => {
            if (d.histogram >= 0) {
                return d.histogram >= d.prevHistogram ? "#208a76" : "#93b5ab"; // Bright green when rising, faded green when falling
            } else {
                return d.histogram <= d.prevHistogram ? "#ff6347" : "#ff9999"; // Bright red when falling, faded red when rising
            }
        });
}