import { useEffect, useRef, useState } from "react";
import { hoveredDate } from "./tooltip";

export default function CrosshairXYLabels({ parentRef, yScaler }) {
    const [pointerPosition, setPointerPosition] = useState({ x: 0, y: 0 });
    const priceValue = useRef(0);

    useEffect(() => {
        const handleMouseMove = (e) => {
            const rect = parentRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            setPointerPosition({ x, y });

            if (yScaler?.y) {
                const invertedY = yScaler.y.invert(y); // Calculate price value from y position
                priceValue.current = invertedY.toFixed(2); // Format to 2 decimal places
            }
        };

        const parent = parentRef.current;
        parent.addEventListener("mousemove", handleMouseMove);

        return () => {
            parent.removeEventListener("mousemove", handleMouseMove);
        };
    }, [parentRef, yScaler]);

    return (
        <>
            <div
                className="absolute z-56 right-0 text-[12px] bg-primary-100 rounded-xs p-1"
                style={{
                    top: `${pointerPosition.y}px`, // Follow pointer Y position
                    transform: "translateY(-50%)", // Center vertically
                }}
            >
                {priceValue.current} {/* Display calculated price value */}
            </div>
            <div
                className="absolute z-56 bottom-0 text-[12px] bg-primary-100 rounded-xs p-1"
                style={{
                    left: `${pointerPosition.x}px`, // Follow pointer X position
                    transform: "translateX(-50%)", // Center horizontally
                }}
            >{hoveredDate}</div>
        </>
    );
}


