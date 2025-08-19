import { useMemo } from "react";
import usePriceStore, { usePriceInvertStore } from "../../stores/stores";
import { PriceText } from "../../generic_components/PriceText";
import { svg } from "../../Layout/svg";

export const LivePriceText = ({ OHLCData }) => {
    const setInverted = usePriceInvertStore((fn) => fn.setPriceInvert);
    const invertedStatus = usePriceInvertStore((state) => state.priceInvert);
    const tradePrice = usePriceStore((state) => state.trade);

    const lastClosePrice = useMemo(() => {
        if (!OHLCData || OHLCData.length === 0) return 0; // Prevent errors
        return OHLCData[OHLCData.length - 1].close;
    }, [OHLCData]);

    const textColor = useMemo(() => Number(tradePrice) >= lastClosePrice ? "text-accent" : "text-negative-accent", [lastClosePrice, tradePrice]);

    return (
        <div className="flex gap-0.5">
            <PriceText input={tradePrice.toString()} className={`text-base ${textColor}`} />
            <button title="Inverse Price" onClick={() => setInverted(!invertedStatus)}>
                <svg.Swap className="rotate-90 w-3" color={invertedStatus ? "#ffffff" : "#ffffff65"} />
            </button>
        </div>
    );
}