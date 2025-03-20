import { singleLine } from "./draw/line";

export const EMA = (d3, data, period = 5) => {
    const multiplier = 2 / (period + 1);
    let ema = [];
    
    data.forEach((d, i) => {
        if (i < period - 1) {
            ema.push({ date: d.date, value: null });
        } else if (i === period - 1) {
            // First EMA value is just a simple moving average
            const slice = data.slice(i - period + 1, i + 1);
            const sma = d3.mean(slice, (p) => p.close);
            ema.push({ date: d.date, value: sma });
        } else {
            // EMA = (Current Price - Previous EMA) * Multiplier + Previous EMA 
            const prevEMA = ema[i - 1].value;
            const currentEMA = (d.close - prevEMA) * multiplier + prevEMA;
            ema.push({ date: d.date, value: currentEMA });
        }
    });

    return ema.filter(d => d.value !== null);
};

EMA.draw = singleLine;
EMA.defaultCol = "#5252FF";