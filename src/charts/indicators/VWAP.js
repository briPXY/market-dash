import { singleLine } from "./draw/line";

export const VWAP = (data) => {
    let cumulativeVolume = 0;
    let cumulativeVolumePrice = 0;

    const vwapData = data.map(d => {
        const typicalPrice = (d.high + d.low + d.close) / 3;
        const volume = d.volume;
        const volumePrice = typicalPrice * volume;

        cumulativeVolume += volume;
        cumulativeVolumePrice += volumePrice;

        const vwap = cumulativeVolumePrice / cumulativeVolume;

        return { date: d.date, value: vwap };
    });

    return vwapData;
};

VWAP.draw = singleLine;
VWAP.defaultCol = "#FF00FF";