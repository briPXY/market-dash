export const drawIndicator = (funcName, fn, indicatorData, color = "white", svg, yScaler, bandXScale, outDimension) => {
    svg.select(`#${funcName}`).remove();
    svg.selectAll(`.${funcName}`).remove();
    fn.draw(svg, indicatorData, yScaler, bandXScale, color, funcName, outDimension);
};