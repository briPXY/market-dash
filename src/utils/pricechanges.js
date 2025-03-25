export function calculateHistoricalChange(data) {
    if (!data || data.length < 2) {
        return { change: 0, high: 0, low: 0, percent: 0, volume: 0, trades: 0 }; // Need at least two data points
    }

    const first = data[0];  // Oldest price in range
    const last = data[data.length - 1]; // Latest price in range

    let highest = first.close;
    let lowest = first.close;

    for (let i = 1; i < data.length; i++) {
        if (data[i].close > highest) highest = data[i].close;
        if (data[i].close < lowest) lowest = data[i].close;
    }

    const priceChange = last.close - first.close;
    const priceChangePercent = (priceChange / first.close) * 100;

    return {
        change: priceChange.toFixed(2),
        percent: priceChangePercent.toFixed(2),
        high: highest,
        low: lowest,
        volume: data.reduce((sum, e) => sum + e.volume, 0),
        trades: data.reduce((sum, e) => sum + e.trades, 0),
    };
}