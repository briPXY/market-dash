export function getBandXScale(d3, historicalData, innerWidth) {
    return d3.scaleBand()
        .domain(historicalData.map(d => d.date))
        .range([0, innerWidth])
        .paddingInner(0.35) // 20% of band width is space between candles 
}