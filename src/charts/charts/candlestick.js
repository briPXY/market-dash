import { chartSvgCleanup } from "../helper";
import { addToolTipHandleOverlay } from "../tooltip";

export function candlestick(d3, svg, scale, tooltipRef, historicalData, bandXScale, innerHeight, bullishColor = "#2fb59c", bearishColor = "#e74c3c") {

    const candleWidth = bandXScale.bandwidth(); // Use this consistent bandwidth

    // Clear previous drawings from other chart types too
    chartSvgCleanup(svg); 

    const candles = svg.selectAll(".main")
        .data(historicalData)
        .enter()
        .append("g")
        .attr("class", "main")
        // Apply transform to center the 'g' element for each candle
        // The d.date maps to the start of the band, so add half the bandwidth to center the g.
        .attr("transform", d => `translate(${bandXScale(d.date) + candleWidth / 2}, 0)`);

    const colorMap = {
        "-1": bearishColor,
        "0": "#999999",
        "1": bullishColor
    };

    // Draw wicks
    candles.append("line")
        .attr("y1", d => scale.y(d.high)) // Use the external scale.y
        .attr("y2", d => scale.y(d.low)) // Use the external scale.y
        .attr("x1", 0) // Centered within the transformed 'g'
        .attr("x2", 0) // Centered within the transformed 'g'
        .attr("stroke", d => colorMap[(d.close > d.open) - (d.close < d.open)])
        .attr("stroke-width", 1.5);

    // Draw candle bodies
    candles.append("rect")
        .attr("x", -candleWidth / 2) // Position relative to the *centered* 'g'
        .attr("y", d => scale.y(Math.max(d.open, d.close))) // Use external scale.y
        .attr("width", candleWidth)
        .attr("height", d => {
            const h = Math.abs(scale.y(d.open) - scale.y(d.close));
            return h < 1 ? 1 : h;
        })
        .attr("fill", d => colorMap[(d.close > d.open) - (d.close < d.open)])
        .attr("stroke", d => colorMap[(d.close > d.open) - (d.close < d.open)])

    // Transparent box for tooltip mouseover
    svg.selectAll('.tooltip-overlay').remove();
    addToolTipHandleOverlay(candles, candleWidth, tooltipRef, bandXScale, d3, innerHeight);
}
