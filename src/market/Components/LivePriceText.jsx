import { useMemo } from "react";
import usePriceStore, { usePriceInvertStore } from "../../stores/stores";
import { PriceText } from "../../generic_components/PriceText";
import { SwapIcon } from "../../Layout/svg";
import { SvgMemo } from "../../Layout/Layout";

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
        <div className="flex gap-0.5">
            <PriceText input={tradePrice?.toString()} className={`text-lg ${textColor}`} />
            <button title="Inverse Price" onClick={() => setInverted(!invertedStatus)} className="p-0">
                <SvgMemo>
                    <SwapIcon className={`rotate-90 w-5 h-5 p-1 ml-${invertedStatus ? "1" : "0"} text-${invertedStatus ? "primary-900" : "washed"} rounded-sm bg-${invertedStatus ? "washed" : "transparent"}`} />
                </SvgMemo>
            </button>
        </div>
    );
}