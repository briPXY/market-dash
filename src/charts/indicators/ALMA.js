import { singleLine } from "./draw/line";

export const ALMA = (d3, data, period = 9, offset = 0.85, sigma = 6) => {
    const m = Math.floor(offset * (period - 1));
    const s = period / sigma;
    const w = [];

    // Calculate weights using Gaussian distribution
    let sum_w = 0;
    for (let i = 0; i < period; i++) {
        w[i] = Math.exp(-Math.pow(i - m, 2) / (2 * Math.pow(s, 2)));
        sum_w += w[i];
    }

    // Normalize weights
    for (let i = 0; i < period; i++) {
        w[i] /= sum_w;
    }

    // Calculate ALMA
    const alma = data.map((d, i) => {
        if (i < period - 1) return { date: d.date, value: null };

        let sum = 0;
        for (let j = 0; j < period; j++) {
            sum += data[i - period + 1 + j].close * w[j];
        }

        return { date: d.date, value: sum };
    });

    return alma.filter(d => d.value !== null);
};

ALMA.draw = singleLine;
ALMA.defaultCol = "#FFD700";