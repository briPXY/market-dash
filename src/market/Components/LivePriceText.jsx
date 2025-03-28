import { useMemo } from "react";
import { NumberSign } from "../../Layout/elements"
import usePriceStore from "../../stores/stores";

export const LivePriceText = ({ OHLCData }) => {
    const tradePrice = usePriceStore((state) => state.trade);

    const lastClosePrice = useMemo(() => {
        if (!OHLCData || OHLCData.length === 0) return 0; // Prevent errors
        return OHLCData[OHLCData.length - 1].close;
    }, [OHLCData]);

    return (<NumberSign num={tradePrice} baseNum={lastClosePrice} >{tradePrice}</NumberSign>)
}