import { drawMACD, drawRSI } from "./draw/specials";
 
// Improved EMA function with a stable initial seed
function EMA(prices, period) {
    const k = 2 / (period + 1);
    let emaArray = [];

    // Initialize the first EMA value as the SMA (Simple Moving Average)
    const initialSMA = prices.slice(0, period).reduce((sum, price) => sum + price, 0) / period;
    emaArray[0] = initialSMA;

    // Compute EMA for the rest of the dataset
    for (let i = 1; i < prices.length; i++) {
        emaArray[i] = (prices[i] * k) + (emaArray[i - 1] * (1 - k));
    }
    return emaArray;
}
// Function to calculate MACD values
export function MACD(data, fast = 12, slow = 26, signal = 9) {
    // Calculate the EMAs  
    const closingPrices = data.map(d => d.close);
    const emaFast = EMA(closingPrices, fast);
    const emaSlow = EMA(closingPrices, slow);

    // Calculate the MACD line 
    const macdLine = emaFast.map((fast, index) => fast - emaSlow[index]);

    // Calculate the Signal line
    const signalLine = EMA(macdLine.slice(slow - 1), signal); // Start at the first valid MACD value
    const signalLineFull = Array(slow - 1).fill(null).concat(signalLine);

    // Calculate the MACD Histogram
    const histogram = macdLine.map((macd, index) => macd - (signalLine[index] || 0));

    // Combine the results into an array of objects
    const macdData = data.map((d, index) => ({
        date: d.date,
        MACD: macdLine[index],
        signal: signalLineFull[index] ?? 0,
        histogram: histogram[index] //macdLine[index] - (signalLineFull[index] ?? 0)
    }));

    return macdData;
}

MACD.draw = drawMACD;
MACD.defaultCol = "#FF4444";

export function RSI(ohlcData, period = 14) { 
    if (!Array.isArray(ohlcData) || ohlcData.length <= period) {
        throw new Error("Not enough data to calculate RSI");
    }

    const rsiValues = [];

    let gains = 0;
    let losses = 0;

    // First average gain/loss from the first `period`
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

    // Subsequent RSI values
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

    // Fill first values with null for alignment
    for (let i = 0; i < period; i++) {
        rsiValues[i] = null;
    }

    return rsiValues;
}

RSI.draw = drawRSI;
RSI.defaultCol = "#a17bf7";