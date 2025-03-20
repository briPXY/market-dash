import { singleLine } from "./draw/line";

export const SMA = (d3, data) => {
    return data.map((d, i) => {
        if (i < 5) return { date: d.date, value: null };

        const slice = data.slice(i - 5, i);
        const avg = d3.mean(slice, (p) => p.close);

        return { date: d.date, value: avg };
    }).filter(d => d.value !== null);
};

SMA.draw = singleLine;
SMA.defaultCol = "#FF4444";