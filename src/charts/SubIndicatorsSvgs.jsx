import React, { useEffect, useMemo, useRef } from "react";
import * as d3 from "d3";
import { drawIndicator } from "./indicators/draws";
import { chartDim } from "./config";

const SubIndicatorsSvgs = ({ width,  bandXScale, subIndicators }) => {
    const subRefs = useRef({});
    const d3Svgs = useRef({});

    const outDimension = useMemo(() => ({
        w: width,
        h: 150,
        m: chartDim.margin
    }), [width]);  

    // Draw sub indicator on data/state changes
    useEffect(() => {
        if (Object.keys(subIndicators).length === 0) {
            return;
        }
        Object.keys(subRefs.current).forEach(name => {
            const { color, indicatorData, yScaler, fn } = subIndicators[name];
            d3Svgs.current[name] = d3.select(subRefs.current[name]);
            drawIndicator(name, fn, indicatorData, color, d3Svgs.current[name], yScaler, bandXScale, outDimension);
        });
    }, [bandXScale, outDimension, subIndicators]);

    return (
        <>
            {Object.keys(subIndicators).map(name => (
                <svg key={name} className="border-y-1 border-y-washed/20 p-0" ref={el => (subRefs.current[name] = el)} width={width} height={outDimension.h}></svg>
            ))}
        </>
    );
};

export default React.memo(SubIndicatorsSvgs);