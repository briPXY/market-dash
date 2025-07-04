import { useMemo } from "react";
import usePriceStore from "../stores/stores";

const LivePriceText = ({ OHLCData }) => { 
    const livePrice = usePriceStore((state) => state.trade); 
    const lastPrice = useMemo(() => OHLCData[OHLCData.length - 1].close, [OHLCData]); 
 
    return (
        <div className={`${livePrice >= lastPrice ? "bg-accent" : "bg-negative-accent"} rounded-md p-1 absolute right-0`}>

        </div>
    );
};

export default LivePriceText;