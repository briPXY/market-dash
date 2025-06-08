import { showToolTip } from "../tooltip";

export function candlestick(d3, svg, scale, tooltipRef, historicalData, innerHeight, innerWidth, bullishColor = "#2fb59c", bearishColor = "#e74c3c") {
    const xScale = d3.scaleBand()
        .domain(historicalData.map(d => d.date))
        .range([0, innerWidth])
        .padding(0.2); // Adjust padding

        console.log( historicalData.length )
    const candleWidth = xScale.bandwidth(); // Ensures even spacing
    const tooltip = d3.select(tooltipRef.current);

    svg.selectAll(".main").remove();

    const candles = svg.selectAll(".main")
        .data(historicalData)
        .enter()
        .append("g")
        .attr("class", "main")
        .attr("transform", d => `translate(${scale.x(d.date)},0)`);

    // Draw wicks
    candles.append("line")
        .attr("y1", d => scale.y(d.high))
        .attr("y2", d => scale.y(d.low))
        .attr("x1", candleWidth / 2)
        .attr("x2", candleWidth / 2)
        .attr("stroke", d => d.close >= d.open ? bullishColor : bearishColor)
        .attr("stroke-width", 1.5);

    // Draw candle bodies
    candles.append("rect")
        .attr("x", 0)
        .attr("y", d => scale.y(Math.max(d.open, d.close)))
        .attr("width", candleWidth)
        .attr("height", d => Math.abs(scale.y(d.open) - scale.y(d.close)))
        .attr("fill", d => d.close >= d.open ? bullishColor : bearishColor)
        .attr("stroke", d => d.close >= d.open ? bullishColor : bearishColor)
        .on("mouseover", (event, d) => {
            showToolTip(d3, event, tooltip, d);
        })
        .on("mouseout", () => {
            tooltip.style("opacity", 0);
        });
}
