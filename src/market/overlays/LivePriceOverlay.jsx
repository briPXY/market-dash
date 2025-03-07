const LivePriceOverlay = ({ livePrice, width, height, yScale }) => {
    if (!livePrice) return null;

    const priceY = yScale(livePrice);
    const labelWidth = 50; // Width of the label rect

    return (
        <svg width={width} height={height} style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}>
            {/* Live Price Line */}
            <line
                x1={0}
                x2={width}
                y1={priceY}
                y2={priceY}
                stroke="#0cb085"
                strokeWidth={1.5}
                strokeDasharray="4,4"
            />

            {/* Background Rectangle for Label (RIGHT SIDE) */}
            <rect
                x={width - labelWidth} // Position at the right edge
                y={priceY - 10} // Center vertically
                width={labelWidth}
                height={20}
                fill="#0cb085"
                rx={4} // Rounded corners
            />

            {/* Live Price Text (RIGHT SIDE) */}
            <text
                x={width - labelWidth} // Padding inside the rectangle
                y={priceY + 5} // Center text vertically
                fill="black"
                fontSize="13px"
                fontWeight="bold"
            >
                {livePrice.toFixed(2)}
            </text>
        </svg>
    );
};

export default LivePriceOverlay;
