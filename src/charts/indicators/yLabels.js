// eslint-disable-next-line no-unused-vars
import * as d3 from "d3";

export function drawMacdYAxisLabel(subYLabelSvg, width, height, scaleY, data) {
    // Ensure width has a valid value
    width = width || 100; // Fallback to 100 if width is undefined or invalid

    // Extract the last data point
    const lastDataPoint = data[data.length - 1];
    const { histogram, signal, MACD } = lastDataPoint;

    // Remove any existing labels and borders first (optional, to prevent duplicates)
    subYLabelSvg.selectAll(".macd-label").remove();
    subYLabelSvg.selectAll(".macd-label-border").remove();

    // Helper function to add a label with a border
    const addLabelWithBorder = (yValue, text, fillColor, /*borderColor*/) => {
        const xCenter = width / 2;

        // Append the text label
        subYLabelSvg
            .append("text")
            .attr("class", "macd-label")
            .attr("x", xCenter) // Center horizontally
            .attr("y", scaleY(yValue)) // Position using scaleY
            .attr("fill", fillColor)
            .attr("font-size", "11px")
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle") // Center text vertically
            .text(text);
    };

    // Add labels with borders
    addLabelWithBorder(histogram, `${histogram.toFixed(4)}`, "#ffffff", "#ffffff");
    addLabelWithBorder(signal, `${signal.toFixed(4)}`, "#ff7f0e", "#ff7f0e");
    addLabelWithBorder(MACD, `${MACD.toFixed(4)}`, "#1c72c2", "#1c72c2");
}

export function drawRsiYAxisLabel(subYLabelSvg, width, height, scaleY, data, color) {
    // Fallback for width
    width = width || 100;

    // Remove previous labels
    subYLabelSvg.selectAll(".rsi-label").remove();
    subYLabelSvg.selectAll(".rsi-label-bg").remove();
    subYLabelSvg.selectAll(".rsi-static-label").remove();

    if (!data || data.length === 0) return;

    const lastValue = data[data.length - 1];
    if (lastValue == null || Number.isNaN(lastValue)) return;

    const yPos = scaleY(lastValue);
    const text = `${lastValue.toFixed(2)}`;
    const labelPadding = 4;
    const fontSize = 13;

    // Measure text width (rough estimate)
    const tempText = subYLabelSvg.append("text")
        .attr("font-size", `${fontSize}px`)
        .text(text);
    const textWidth = tempText.node().getBBox().width;
    tempText.remove();

    const rectWidth = textWidth + labelPadding * 2;
    const rectHeight = fontSize + labelPadding * 2;
    const xCenter = width / 2;

    // === Highlighted RSI value box ===
    subYLabelSvg.append("rect")
        .attr("class", "rsi-label-bg")
        .attr("x", xCenter - rectWidth / 2)
        .attr("y", yPos - rectHeight / 2)
        .attr("width", rectWidth)
        .attr("height", rectHeight)
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("fill", color || "#a17bf7"); // purple highlight

    subYLabelSvg.append("text")
        .attr("class", "rsi-label")
        .attr("x", xCenter)
        .attr("y", yPos)
        .attr("fill", "#000000")
        .attr("font-size", `${fontSize}px`)
        .attr("font-weight", "bold") // bold black text
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .text(text);

    // === Static 30 / 70 guide labels ===
    const staticLevels = [70, 30];
    staticLevels.forEach(level => {
        const y = scaleY(level);
        subYLabelSvg.append("text")
            .attr("class", "rsi-static-label")
            .attr("x", xCenter)
            .attr("y", y)
            .attr("fill", "#999999") // light gray
            .attr("font-size", `${fontSize - 1}px`)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .text(level);
    });
}
