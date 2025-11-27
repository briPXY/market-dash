import React, { useEffect, useMemo, useRef } from "react";
import * as d3 from "d3";
import { drawIndicator, drawIndicatorError } from "./indicators/draws";
import { chartDim } from "./config";
import { usePoolStore } from "../stores/stores";

const SubIndicatorsSvg = ({ width, height, bandXScale, color, indicatorData, yScaler, fn, name }) => {
    const subRef = useRef(null);
    const pool = usePoolStore(state => state.address);
    const dataSample = useRef(null);

    const outDimension = useMemo(() => ({
        w: width,
        h: height,
        m: chartDim.margin
    }), [height, width]);

    // Draw sub indicator on data/state changes
    useEffect(() => {
        const sampled = JSON.stringify(indicatorData).slice(0, 99);

        // Prevent re-draw
        if (sampled == dataSample.current) {
            return;
        }

        const d3Svg = d3.select(subRef.current);

        if (indicatorData.errorIndicatorData) {
            drawIndicatorError(d3Svg, indicatorData, yScaler, bandXScale, color, name, outDimension);
            dataSample.current = sampled;
            return;
        }

        drawIndicator(name, fn, indicatorData, color, d3Svg, yScaler, bandXScale, outDimension);
        dataSample.current = sampled;
    }, [bandXScale, color, fn, indicatorData, name, outDimension, pool, yScaler]);

    return (
        <svg className="border-y border-y-washed/20 p-0" ref={subRef} width={width} height={outDimension.h}></svg>
    );
};

export default React.memo(SubIndicatorsSvg);