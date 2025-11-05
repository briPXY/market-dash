import { ALMA } from "./ALMA";
import { EMA } from "./EMA";
import { SMA } from "./SMA";
import { MACD, RSI } from "./subindicators";
import { drawMacdYAxisLabel } from "./yLabels";
import { Supertrend } from "./supertrend";
import { VWAP } from "./VWAP";

export const indicatorList = {
    SMA: { fn: SMA, name: "Simple Moving Average" },
    EMA1: { fn: EMA, period: 5, name: "Exponential Moving Average" },
    EMA2: { fn: EMA, period: 5, name: "Exponential Moving Average" },
    ALMA: { fn: ALMA, period: 9, offset: 0.85, sigma: 6, name: "Arnaud Legoux Moving Average" },
    Supertrend: { fn: Supertrend, atrPeriod: 10, multiplier: 3, name: "Supertrend" },
    VWAP: { fn: VWAP, name: "Volume Weighted Average Price" }
};

export const subIndicatorList = {
    MACD: {
        fn: MACD,
        name: "Moving Average Convergence Divergence",
        yLabelDrawFn: drawMacdYAxisLabel,
    },
    // RSI: {
    //     fn: RSI,
    //     name: "Relative Strength Index",
    //     yLabelDrawFn: drawMacdYAxisLabel,
    // }
};