export function RSI(ohlcData, period = 14) {
    if (!Array.isArray(ohlcData) || ohlcData.length < period) {
        throw new Error("Not enough data to calculate RSI");
    }

    const rsiValues = [];

    let gains = 0;
    let losses = 0;

    // 1️⃣ First average gain/loss from the first `period`
    for (let i = 1; i <= period; i++) {
        const diff = ohlcData[i].close - ohlcData[i - 1].close;
        if (diff >= 0) {
            gains += diff;
        } else {
            losses -= diff; // make it positive
        }
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;
    let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsiValues[period] = 100 - (100 / (1 + rs));

    // 2️⃣ Subsequent RSI values
    for (let i = period + 1; i < ohlcData.length; i++) {
        const diff = ohlcData[i].close - ohlcData[i - 1].close;
        let gain = diff > 0 ? diff : 0;
        let loss = diff < 0 ? -diff : 0;

        // Wilder's smoothing
        avgGain = (avgGain * (period - 1) + gain) / period;
        avgLoss = (avgLoss * (period - 1) + loss) / period;

        rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        rsiValues[i] = 100 - (100 / (1 + rs));
    }

    // 3️⃣ Fill first values with null for alignment
    for (let i = 0; i < period; i++) {
        rsiValues[i] = null;
    }

    return rsiValues;
}