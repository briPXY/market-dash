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

export function drawRSI(svg, data, yScale, bandXScale, color, id, dim) {
    // data: numeric array (may contain nulls)
    const barWidth = typeof bandXScale.bandwidth === "function" ? bandXScale.bandwidth() : 0;
    yScale.domain([0, 100]);
    // Clear previous RSI elements
    svg.selectAll(`.${id}-line`).remove();
    svg.selectAll(`.${id}-overlay`).remove();
    svg.selectAll(`.${id}-level-line`).remove(); 

    if (!data || data.length === 0) return;

    // If all values are null/NaN, nothing to draw
    const hasAnyNumber = data.some(d => d != null && !Number.isNaN(d));
    if (!hasAnyNumber) return;

    const svgWidth = dim.w - dim.m.left - dim.m.right;

    // Prepare indexed data so x accessor always has an index even when value is null
    const indexed = data.map((v, i) => ({
        v,
        t: bandXScale.domain()[i]   // use matching timestamp for each RSI value
      }));

    // RSI levels (can be adjusted)
    const levels = [70, 50, 30];
    
    svg.selectAll(`.${id}-line`).raise();
    
    // === overlay between 70 and 30 ===
    // guard yScale outputs exist (yScale might expect domain within 0..100)
    svg.append("rect")
        .attr("class", `${id}-overlay`)
        .attr("x", dim.m.left)
        .attr("width", svgWidth)
        .attr("y", yScale(levels[0]))
        .attr("height", yScale(levels[2]) - yScale(levels[0]))
        .attr("fill", color || "#a17bf7")
        .attr("opacity", 0.08);

    // Build points with concrete x,y values
    const points = indexed.map(d => {
        const rawX = bandXScale(d.t);         // may be undefined if scale domain isn't numeric
        const x = (rawX == null) ? null : rawX + barWidth / 2;
        const y = (d.v == null || Number.isNaN(d.v)) ? null : yScale(d.v);
        return { x, y, i: d.i, v: d.v };
    });

    // Keep only points with finite x & y
    const validPoints = points.filter(p =>
        p.x != null && Number.isFinite(p.x) &&
        p.y != null && Number.isFinite(p.y)
    );

    if (validPoints.length > 0) {
        const rsiLine = d3.line()
            .x(d => d.x)
            .y(d => d.y);

        svg.append("path")
            .datum(validPoints)
            .attr("class", `${id}-line`)
            .attr("fill", "none")
            .attr("stroke", color || "#a17bf7")
            .attr("stroke-width", 1.5)
            .attr("d", rsiLine);
    }

    // === dotted horizontal level lines ===
    levels.forEach((level) => {
        svg.append("line")
            .attr("class", `${id}-level-line`)
            .attr("x1", dim.m.left)
            .attr("x2", dim.w - dim.m.right)
            .attr("y1", yScale(level))
            .attr("y2", yScale(level))
            .attr("stroke", color || "#a17bf7")
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "3,3")
            .attr("opacity", 0.5);
    });
}