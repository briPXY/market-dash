
import { useEffect, useState, useMemo } from "react";
import usePriceStore from "../stores/stores"; 

const LivePriceOverlay = ({  OHLCData, scale }) => {
    const [width, setWidth] = useState(window.innerWidth * 0.96);
    const labelWidth = 55; // 8vw for label width
    const livePrice = usePriceStore((state) => state.trade);
    const lastPrice = useMemo(() => OHLCData[OHLCData.length - 1].close, [OHLCData])
    const color = livePrice >= lastPrice ? "#0cb085" : "#ef3f3f";

    // const yScale = useMemo(() => {
    //     if (isLogScale) {
    //         // Ensure the lower bound is > 0 for log scale.
    //         const minClose = d3.min(OHLCData, d => d.close);
    //         const maxClose = d3.max(OHLCData, d => d.close);
    //         return d3.scaleLinear()
    //             .domain([minClose, maxClose])  // Use min & max close price instead of 0
    //             .range([innerHeight, margin.current.top])
    //             .nice();
    //     } else {
    //         return d3.scaleLinear()
    //             .domain([0, d3.max(OHLCData, d => d.close) * 1.05])
    //             .range([innerHeight, margin.current.top])
    //             .nice(12);
    //     }
    // }, [OHLCData, innerHeight, isLogScale, margin]);

    const updatedPrice = scale.y(livePrice); //yScale(livePrice);
    const priceY = isNaN(updatedPrice) ? 0 : updatedPrice;

    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth * 0.96);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <svg width={width} height={"100%"} style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}>
            {/* Live Price Line */}
            <line x1={0} x2={width} y1={priceY} y2={priceY} stroke={color} strokeWidth={1} strokeDasharray="4,4" />

            {/* Background Rectangle for Label (Right Side) */}
            <rect x={width - labelWidth - 10} y={priceY - 10} width={labelWidth + 10} height={20} fill={color} rx={4} />

            {/* Live Price Text (Right Side) */}
            <text x={width - labelWidth - 5} y={priceY + 5} fill="black" fontSize="13px" fontWeight="bold">
                {livePrice}
            </text>
        </svg>
    );
};

export default LivePriceOverlay;
