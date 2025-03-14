const drawSMA = (d3, svg, data, xScale, yScale) => {  
    const line = d3.line().x(d => xScale(new Date(d.date))).y(d => yScale(d.value));
 
    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "orange")
        .attr("stroke-width", 2)
        .attr("d", line);
};

const SMA5 = (d3, data) => {
    if (!Array.isArray(data) || data.length < 5) return [];

    // Detect OHLC or Time:Value based on object length
    const isOHLC = Object.keys(data[0]).length === 4;

    return data.map((d, i) => {
        if (i < 5) return { date: d.x, value: null };

        const slice = data.slice(i - 5, i);
        const avg = d3.mean(slice, (p) => (isOHLC ? p.C : p.y)) || 0;

        return { date: d.x, value: avg };
    }).filter(d => d.value !== null);
};


export const drawEMA = (d3, svg, emaData, xScale, yScale) => {
    const line = d3.line().x(d => xScale(new Date(d.date))).y(d => yScale(d.value));

    svg.append("path")
        .datum(emaData)
        .attr("fill", "none")
        .attr("stroke", "green")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5")
        .attr("d", line);
};

export const drawBollingerBands = (d3, svg, bands, xScale, yScale) => {

    svg.append("path")
        .datum(bands)
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 1)
        .attr("d", d3.line().x(d => xScale(new Date(d.date))).y(d => yScale(d.upper)));

    svg.append("path")
        .datum(bands)
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 1)
        .attr("d", d3.line().x(d => xScale(new Date(d.date))).y(d => yScale(d.lower)));
};


export const indicator = { SMA5 }

export const indicatorChart = {
    SMA: drawSMA,
}