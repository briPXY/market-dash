export const drawIndicator = (funcName, fn, indicatorData, color = "white", svg, yScaler, bandXScale, dimension) => {
    svg.select(`#${funcName}`).remove();
    svg.selectAll(`.${funcName}`).remove();
    fn.draw(svg, indicatorData, yScaler, bandXScale, color, funcName, dimension);
};