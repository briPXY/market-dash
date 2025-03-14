
import { useEffect, useState } from "react";
import usePriceStore from "../stores/stores";

const LivePriceOverlay = ({ yScale }) => {
    const [width, setWidth] = useState(window.innerWidth * 0.96);
    const labelWidth = 55; // 8vw for label width
    const livePrice = usePriceStore((state) => state.trade);

    const priceY = yScale(livePrice);

    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth * 0.96);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <svg width={width} height="100%" style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}>
            {/* Live Price Line */}
            <line x1={0} x2={width} y1={priceY} y2={priceY} stroke="#0cb085" strokeWidth={1.5} strokeDasharray="4,4" />

            {/* Background Rectangle for Label (Right Side) */}
            <rect x={width - labelWidth} y={priceY - 10} width={labelWidth} height={20} fill="#0cb085" rx={4} />

            {/* Live Price Text (Right Side) */}
            <text x={width - labelWidth + 5} y={priceY + 5} fill="black" fontSize="13px" fontWeight="bold">
                {livePrice.toFixed(2)}
            </text>
        </svg>
    );
};

export default LivePriceOverlay;
