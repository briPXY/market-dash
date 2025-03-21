
import { ALMA } from "./ALMA";
import { EMA } from "./EMA";
import { SMA } from "./SMA";
import { MACD } from "./subs/MACD";
import { Supertrend } from "./supertrend";
import { VWAP } from "./VWAP";

export const indicatorList = {
    SMA: { fn: SMA },
    EMA1: { fn: EMA, period: 5 },
    EMA2: { fn: EMA, period: 5 },
    ALMA: { fn: ALMA, period: 9, offset: 0.85, sigma: 6 },
    Supertrend: { fn: Supertrend, atrPeriod: 10, multiplier: 3 },
    VWAP: { fn: VWAP }
};

export const subIndicatorList = {
    MACD: { fn: MACD }
}