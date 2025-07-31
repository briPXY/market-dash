export function xyScaler(d3, data, xValue, yValue, isLogScale = "LOG", innerWidth, innerHeight, margin) {
    if (!data){
        return;
    }

    let y;
    // console.log( OHLCData.length);
    if (isLogScale == "LOG") { 
        const min = d3.min(data, d => d[yValue]);
        const max = d3.max(data, d => d[yValue]);
        
        y = d3.scaleLinear()
            .domain([min, max])
            .range([innerHeight, margin.top])
            .nice();
    } else {
        const min = d3.min(data, d => d[yValue]);
        const max = d3.max(data, d => d[yValue]);
        y = d3.scaleLinear()
            .domain([min, max])
            .range([innerHeight, margin.top])
            .nice();
    }

    const x = d3.scaleTime()
        .domain([d3.min(data, d => d[xValue]), d3.max(data, d => d[xValue])])
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