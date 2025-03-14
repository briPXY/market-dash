export function convertOHLCtoD3(ohlcData) {
    return ohlcData.map(d => ({
        x: new Date(d.date), // Convert to JS Date object
        y: d.close // Use closing price for line chart
    }));
}