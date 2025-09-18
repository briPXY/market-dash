//import * as d3 from "d3";

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
        //const textWidth = Math.min(100, width - 10); // Constrain width to the parameter
        //const textHeight = 20; // Approximate height of the text
        const xCenter = width / 2;

        // Append the border (rect element)
        // subYLabelSvg
        //     .append("rect")
        //     .attr("class", "macd-label-border")
        //     .attr("x", xCenter - textWidth / 2) // Center horizontally
        //     .attr("y", scaleY(yValue) - textHeight / 2) // Center vertically
        //     .attr("width", textWidth)
        //     .attr("height", textHeight)
        //     .attr("fill", "none")
        //     .attr("stroke", borderColor)
        //     .attr("stroke-width", 1);

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
