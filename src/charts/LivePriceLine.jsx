
import { useMemo, useRef } from "react";
import usePriceStore from "../stores/stores";

const LivePriceLine = ({ OHLCData, scale }) => {
    const ref = useRef(null);
    const livePrice = usePriceStore((state) => state.trade);
    const lastPrice = useMemo(() => OHLCData[OHLCData.length - 1].close, [OHLCData])
    const color = livePrice >= lastPrice ? "#0cb085" : "#ef3f3f";

    const updatedPrice = scale.y(livePrice); //yScale(livePrice);
    const priceY = isNaN(updatedPrice) ? 0 : updatedPrice;

    return (
        <>
            <svg ref={ref} width={"100%"} height={"100%"} style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}>
                {/* Live Price Line */}
                <line x1={0} x2={"100%"} y1={priceY} y2={priceY} stroke={color} strokeWidth={1} strokeDasharray="4,4" />
            </svg>
            <div
                style={{ position: "absolute", top: priceY - 12, right: 0, pointerEvents: "none" }}
                className={`${livePrice >= lastPrice ? "bg-accent" : "bg-negative-accent"} w-fit rounded-sm p-1 right-0 text-[12px] text-secondary font-bold`}>
                {livePrice.toFixed(2)}
            </div>
        </>
    );
};

export default LivePriceLine;
