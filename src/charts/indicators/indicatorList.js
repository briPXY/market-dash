
import { ALMA } from "./ALMA";
import { EMA } from "./EMA";
import { SMA } from "./SMA";
import { Supertrend } from "./supertrend";
import { VWAP } from "./VWAP";

export const indicatorList = [
    {
        n: "SMA",
        fn: SMA,
    },
    {
        n: "EMA",
        fn: EMA,
        period: 5,
    },
    {
        n: "ALMA",
        fn: ALMA,
        period: 9,
        offset: 0.85,
        sigma: 6,
    },
    {
        n: "Supertrend",
        fn: Supertrend,
        atrPeriod: 10,
        multiplier: 3,
    },
    {
        n: "VWAP",
        fn: VWAP,
    },
];