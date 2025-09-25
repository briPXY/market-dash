import { useCallback, useEffect, useRef, useState } from "react";
import { hoveredData } from "./helper";

export default function CrosshairXYLabels({ parentRef, yScaler }) {
    const [pointer, setPointer] = useState({ x: 0, y: 0, price: 0 });
    const rafRef = useRef(null);

    const handleMouseMove = useCallback(
        (e) => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);

            rafRef.current = requestAnimationFrame(() => {
                const rect = parentRef.current.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const invertedY = yScaler.invert(y);

                setPointer({ x, y, price: invertedY.toFixed(2) });
            });
        },
        [parentRef, yScaler]
    );

    useEffect(() => {
        const parent = parentRef.current;
        parent.addEventListener("mousemove", handleMouseMove);
        return () => {
            parent.removeEventListener("mousemove", handleMouseMove);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [handleMouseMove, parentRef]);

    return (
        <>
            <div
                className="absolute z-56 right-0 text-[12px] bg-primary-100 rounded-xs p-1"
                style={{
                    top: `${pointer.y}px`, // Follow pointer Y position
                    transform: "translateY(-50%)", // Center vertically
                }}
            >
                {pointer.price} {/* Display calculated price value */}
            </div>
            <div
                className="absolute z-56 bottom-0 text-[12px] bg-primary-100 rounded-xs p-1"
                style={{
                    left: `${pointer.x}px`, // Follow pointer X position
                    transform: "translateX(-50%)", // Center horizontally
                }}
            >{hoveredData.date}</div>
        </>
    );
}


