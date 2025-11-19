import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import { drawXGridAxisLabel } from "./axis";
import { useElementSizeThrottled } from "../stores/hooks";
import { chartDim } from "./config";
import { hoveredData } from "./helper";
import { trimmedFloatDigits } from "../utils/utils";

const OverlayXGridAxis = ({ bandXScale, innerWidth, range, parentRef, tooltipRef, data }) => {
    const { height } = useElementSizeThrottled(parentRef, 500);
    const xLabelRef = useRef(null);
    const digits =  trimmedFloatDigits(data[0].close);

    useEffect(() => {
        function handleTickHover(_event, tickData) {
            hoveredData.date = d3.timeFormat("%H:%M:%S")(tickData.d);
            tooltipRef.current.innerHTML = `<div> O:${data[tickData.i].open.toFixed(digits)} </div>
                 <div class="text-accent"> H:${data[tickData.i].high.toFixed(digits)} </div>
                 <div class="text-accent-negative"> L:${data[tickData.i].low.toFixed(digits)} </div>
                 <div> C:${data[tickData.i].close.toFixed(digits)} </div>
                 <div> VOL:${data[tickData.i].volume.toFixed(2)} </div>`;
        }

        const xLabelSvg = d3.select(xLabelRef.current);
        xLabelSvg.selectAll("*").remove();

        // Draw axis/label 
        drawXGridAxisLabel(xLabelSvg, bandXScale, height + 42, range, handleTickHover);
    }, [bandXScale, innerWidth, range, height, tooltipRef, data, digits]);

    return (
        <svg className="absolute bottom-0" ref={xLabelRef} width={innerWidth + chartDim.extraLeft} height={height + 28} ></svg>
    );
};

export default React.memo(OverlayXGridAxis);
