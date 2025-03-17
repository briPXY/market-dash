import { singleLine } from "./draw";

export const Supertrend = (d3, data, atrPeriod = 10, multiplier = 3) => {
    // Calculate ATR
    const atr = [];
    for (let i = 0; i < data.length; i++) {
        if (i === 0) {
            atr.push(0); // ATR is not defined for the first data point
        } else {
            const tr = Math.max(
                data[i].high - data[i].low,
                Math.abs(data[i].high - data[i - 1].close),
                Math.abs(data[i].low - data[i - 1].close)
            );
            atr.push(tr);
        }
    }

    // Smooth ATR with a simple moving average
    const smoothedAtr = [];
    for (let i = 0; i < data.length; i++) {
        if (i < atrPeriod) {
            smoothedAtr.push(null); // Not enough data to calculate ATR
        } else {
            const atrSlice = atr.slice(i - atrPeriod + 1, i + 1);
            const atrAvg = d3.mean(atrSlice);
            smoothedAtr.push(atrAvg);
        }
    }

    // Calculate Supertrend
    const supertrend = [];
    let trend = 1; // 1 for uptrend, -1 for downtrend
    let upperBand = 0;
    let lowerBand = 0;
    let supertrendValue = 0;

    for (let i = 0; i < data.length; i++) {
        const medianPrice = (data[i].high + data[i].low) / 2;
        const atrValue = smoothedAtr[i] || 0;

        upperBand = medianPrice + multiplier * atrValue;
        lowerBand = medianPrice - multiplier * atrValue;

        if (i === 0) {
            supertrendValue = upperBand;
        } else {
            if (data[i].close > supertrendValue) {
                supertrendValue = Math.min(upperBand, supertrendValue);
            } else {
                supertrendValue = Math.max(lowerBand, supertrendValue);
            }

            // Determine trend direction
            if (data[i].close > supertrendValue) {
                trend = 1;
            } else {
                trend = -1;
            }
        }

        supertrend.push({ date: data[i].date, value: supertrendValue, trend });
    }

    return supertrend;
};

Supertrend.draw = singleLine;
Supertrend.defaultCol = "#00FFFF";