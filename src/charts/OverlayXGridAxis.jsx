import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import { drawXGridAxisLabel } from "./axis";
import { useElementSizeThrottled } from "../stores/hooks";
import { chartDim } from "./config";

const OverlayXGridAxis = ({ bandXScale, innerWidth, range, parentRef }) => {
    const { height } = useElementSizeThrottled(parentRef, 500);
    const xLabelRef = useRef(null);

    useEffect(() => { 
        const xLabelSvg = d3.select(xLabelRef.current); 
        xLabelSvg.selectAll("*").remove();

        // Draw axis/label 
        drawXGridAxisLabel(xLabelSvg, bandXScale, height + 42, range);
    }, [bandXScale, innerWidth, range, height]);

    return (
        <svg className="absolute bottom-0 pointer-events-none" ref={xLabelRef} width={innerWidth + chartDim.extraLeft} height={height + 42} ></svg>
    );
};

export default React.memo(OverlayXGridAxis);
