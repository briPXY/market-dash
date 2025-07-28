import { useMemo } from "react";
import usePriceStore from "../../stores/stores";
import { PriceText } from "../../generic_components/PriceText";

export const LivePriceText = ({ OHLCData }) => {
    const tradePrice = usePriceStore((state) => state.trade);

    const lastClosePrice = useMemo(() => {
        if (!OHLCData || OHLCData.length === 0) return 0; // Prevent errors
        return OHLCData[OHLCData.length - 1].close;
    }, [OHLCData]);


    const textColor = useMemo(() => Number(tradePrice) >= lastClosePrice ? "text-accent" : "text-negative-accent", [lastClosePrice, tradePrice]);

    return (
        <PriceText input={tradePrice.toString()} className={textColor} />
    );
}