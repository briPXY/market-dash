import { singleLine } from "./draw/line";
import * as d3 from "d3";

export const SMA = (data) => {
    return data.map((d, i) => {
        if (i < 5) return { date: d.date, value: null };

        const slice = data.slice(i - 5, i);
        const avg = d3.mean(slice, (p) => p.close);

        return { date: d.date, value: avg };
    }).filter(d => d.value !== null);
};

SMA.draw = singleLine;
SMA.defaultCol = "#FF4444";