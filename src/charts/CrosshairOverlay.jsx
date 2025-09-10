import { useRef, useEffect } from "react";
import { useElementSizeThrottled } from "../stores/hooks";

export default function CrosshairOverlay({ parentRef }) {
    const { width, height } = useElementSizeThrottled(parentRef, 2000);
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const parent = parentRef.current;
        if (!canvas || !parent) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);

        const handleMouseMove = (e) => {
            const rect = parent.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.setLineDash([5, 5]);
                ctx.lineTo(x, rect.height);
                ctx.strokeStyle = "rgba(255,255,255,0.4)";
                ctx.lineWidth = 1;
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(rect.width, y);
                ctx.stroke();
            }
        };

        const handleMouseLeave = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        };

        // Attach event listeners to the parent container 
        parent.addEventListener("mousemove", handleMouseMove);
        parent.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            parent.removeEventListener("mousemove", handleMouseMove);
            parent.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, [width, height, parentRef]);

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            style={{
                position: "absolute",
                inset: 0,
                zIndex: 55,
                pointerEvents: "none", // Allow all events to pass through
            }}
        ></canvas>
    );
}


