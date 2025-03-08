export function calculateHistoricalChange(data) {
    if (data.length < 2) return null; // Need at least two data points

    const first = data[0];  // Oldest price in range
    const last = data[data.length - 1]; // Latest price in range

    let highest = first.y;
    let lowest = first.y;

    for (let i = 1; i < data.length; i++) {
        if (data[i].y > highest) highest = data[i].y;
        if (data[i].y < lowest) lowest = data[i].y;
    }

    const priceChange = last.y - first.y;
    const priceChangePercent = (priceChange / first.y) * 100;

    return {
        change: priceChange.toFixed(2),
        percent: priceChangePercent.toFixed(2) + "%",
        high: highest,
        low: lowest,
    };
}