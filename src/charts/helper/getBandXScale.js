export function getBandXScale(d3, historicalData, innerWidth) {
    return d3.scaleBand()
        .domain(historicalData.map(d => d.date))
        .range([0, innerWidth])
        .padding(0.2); // Keep this consistent
}