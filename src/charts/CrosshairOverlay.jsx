import { useRef, useEffect } from "react";
import { useElementSizeThrottled } from "../stores/hooks";

export default function CrosshairOverlay({ parentRef }) {
    const { width, height } = useElementSizeThrottled(parentRef, 1000);
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const parent = parentRef.current;
        if (!canvas || !parent || !width || !height) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;

        // Set internal resolution
        canvas.width = width * dpr;
        canvas.height = height * dpr;

        // Match CSS size exactly to parent
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        // Reset transform so drawing uses CSS px
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const handleMouseMove = (e) => {
            const rect = parent.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            ctx.clearRect(0, 0, width, height);

            if (x >= 0 && x <= width && y >= 0 && y <= height) {
                ctx.beginPath();
                ctx.setLineDash([5, 5]);
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
                ctx.strokeStyle = "rgba(255,255,255,0.5)";
                ctx.lineWidth = 1;
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
                ctx.stroke();
            }
        };

        const handleMouseLeave = () => {
            ctx.clearRect(0, 0, width, height);
        };

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


