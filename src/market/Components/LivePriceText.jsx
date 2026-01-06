import { useMemo } from "react";
import usePriceStore, { usePriceInvertStore } from "../../stores/stores";
import { PriceText } from "../../generic_components/PriceText";
import { SwapIcon } from "../../Layout/svg";
import { SvgMemo } from "../../Layout/Layout";
import { CurrentRateFiatView } from "../../generic_components/CurrentRateFiatView";

export const LivePriceText = ({ OHLCData }) => {
    const setInverted = usePriceInvertStore((fn) => fn.setPriceInvert);
    const invertedStatus = usePriceInvertStore((state) => state.priceInvert);
    const tradePrice = usePriceStore((state) => state.trade);

    const lastClosePrice = useMemo(() => {
        if (!OHLCData || OHLCData.length === 0) return 0; // Prevent errors
        return OHLCData[OHLCData.length - 1].close;
    }, [OHLCData]);

    const textColor = useMemo(() => Number(tradePrice) >= lastClosePrice ? "text-accent" : "text-accent-negative", [lastClosePrice, tradePrice]);

    return (
        <div className="flex gap-2">
            <button title="Inverse Price" onClick={() => setInverted(!invertedStatus)} className="p-0">
                <SvgMemo>
                    <SwapIcon className={`rotate-90 border border-primary-100 w-5 h-5 p-1 text-${invertedStatus ? "primary-900" : "washed"} rounded-sm bg-${invertedStatus ? "washed" : "primary-900"}`} />
                </SvgMemo>
            </button>
            <div className="flex flex-col gap-0 items-start">
                <PriceText input={tradePrice} className={`leading-5 text-base font-semibold ${textColor}`} />
                <CurrentRateFiatView className="flex text-xxs text-washed font-normal" />
            </div>
        </div>
    );
}