import { useCallback, useEffect, useRef, useState } from "react";
import { hoveredData } from "./helper";
import { trimmedFloatDigits } from "../utils/utils";

export default function CrosshairXYLabels({ parentRef, yScaler }) {
    const [pointer, setPointer] = useState({ x: 0, y: 0, price: 0 });
    const rafRef = useRef(null);
    const floatDigits = useRef(0);

    const handleMouseMove = useCallback(
        (e) => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);

            rafRef.current = requestAnimationFrame(() => {
                const rect = parentRef.current.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                setPointer({ x, y, price: yScaler.invert(y).toFixed(floatDigits.current) });
            });
        },
        [parentRef, yScaler]
    );

    useEffect(() => {
        const parent = parentRef.current;
        parent.addEventListener("mousemove", handleMouseMove);
        floatDigits.current = trimmedFloatDigits(yScaler.invert(0)) + 1;

        return () => {
            parent.removeEventListener("mousemove", handleMouseMove);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [handleMouseMove, parentRef, yScaler]);

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


