export function xyScaler(d3, OHLCData, xValue, yValue, isLogScale = "LOG", innerWidth, innerHeight, margin, visibleOHLCData) {
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

    OHLCData.forEach((d, i) => {
        const xVal = d.date;
        const yVal = d[yValue];
        if (xVal < x.domain()[0] || xVal > x.domain()[1] || yVal < y.domain()[0] || yVal > y.domain()[1]) {
            console.warn(`Out-of-Bounds Data at Index ${i}:`, d);
        }
    });

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