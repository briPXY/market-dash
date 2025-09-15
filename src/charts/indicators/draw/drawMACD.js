import * as d3 from "d3";

export function drawMACD(svg, data, yScale, bandXScale, color, id, dim) {
    const barWidth = bandXScale.bandwidth();
    const processedData = data.map((d, i) => ({
        ...d,
        prevHistogram: i > 0 ? data[i - 1].histogram : 0
    }));

    // Clear previous elements within this SVG
    svg.selectAll(`.${id}-line`).remove();
    svg.selectAll(`.${id}-signal-line`).remove();
    svg.selectAll(`.${id}-histogram-bar`).remove();
    svg.selectAll(`.${id}-zero-line`).remove();

    // MACD Line
    const macdLine = d3.line()
        .x(d => bandXScale(d.date) + barWidth / 2)
        .y(d => yScale(d.MACD));

    svg.append("path")
        .datum(processedData)
        .attr("class", `${id}-line`)
        .attr("fill", "none")
        .attr("stroke", "#1c72c2")   // blue-ish for MACD
        .attr("stroke-width", 1.5)
        .attr("d", macdLine);

    // Signal Line
    const signalLine = d3.line()
        .defined(d => d.signal != null)
        .x(d => bandXScale(d.date) + barWidth / 2)
        .y(d => yScale(d.signal));

    svg.append("path")
        .datum(processedData)
        .attr("class", `${id}-signal-line`)
        .attr("fill", "none")
        .attr("stroke", "#ff7f0e")   // orange-ish for Signal
        .attr("stroke-width", 1.5)
        .attr("d", signalLine);

    // Histogram Bars
    svg.selectAll(`.${id}-histogram-bar`)
        .data(processedData)
        .enter().append("rect")
        .attr("class", `${id}-histogram-bar`)
        .attr("x", d => bandXScale(d.date))
        .attr("y", d => yScale(Math.max(0, d.histogram)))
        .attr("width", barWidth)
        .attr("height", d => Math.abs(yScale(d.histogram) - yScale(0)))
        .attr("fill", d => {
            if (d.histogram >= 0) {
                return d.histogram >= d.prevHistogram ? "#208a76" : "#93b5ab";
            } else {
                return d.histogram <= d.prevHistogram ? "#ff6347" : "#ff9999";
            }
        });

    // Zero Line
    svg.append("line")
        .attr("class", `${id}-zero-line`)
        .attr("x1", dim.m.left)
        .attr("x2", dim.w - dim.m.right)
        .attr("y1", yScale(0))
        .attr("y2", yScale(0))
        .attr("stroke", "gray")
        .attr("stroke-dasharray", "2,2");
}
