export function xyScaler(d3, OHLCData, xValue, yValue, isLogScale = "LOG", innerWidth, innerHeight, margin, visibleOHLCData) {
    if (!OHLCData || !visibleOHLCData){
        return;
    }

    let y;
    // console.log( OHLCData.length);
    if (isLogScale == "LOG") {
        const yData = visibleOHLCData ? visibleOHLCData : OHLCData;
        const min = d3.min(yData, d => d[yValue]);
        const max = d3.max(yData, d => d[yValue]);
        
        y = d3.scaleLinear()
            .domain([min, max])
            .range([innerHeight, margin.top])
            .nice();
    } else {
        const min = d3.min(OHLCData, d => d[yValue]);
        const max = d3.max(OHLCData, d => d[yValue]);
        y = d3.scaleLinear()
            .domain([min, max])
            .range([innerHeight, margin.top])
            .nice();
    }

    const x = d3.scaleTime()
        .domain([d3.min(OHLCData, d => d[xValue]), d3.max(OHLCData, d => d[xValue])])
        .range([margin.left, innerWidth]);

    return { x, y };
}

export function yIndicator(d3, indicatorData, innerIndicatorHeight, valueTarget) {

    // Separate Y scale for indicators (e.g., MACD)
    let yIndicator = d3.scaleLinear()
        .domain([
            d3.min(indicatorData, d => d[valueTarget]),
            d3.max(indicatorData, d => d[valueTarget])
        ])
        .range([innerIndicatorHeight, 0])
        .nice();

    return yIndicator

}