import React, { useEffect, useMemo, useRef, useState } from "react";
import { IndicatorSelector } from "./indicators/IndicatorSelector"
import { drawSubIndicatorGrid } from "./grid";
import * as d3 from "d3";
import { subIndicatorList } from "./indicators/indicatorList";

const SubIndicatorsSvgs = ({ width, chartDim, bandXScale, OHLCData, scale }) => {
    const [subIndicators, setSubIndicators] = useState([]);
    const subIndicatorHeight = useMemo(() => chartDim.innerHeight * 0.5 * subIndicators.length, [chartDim.innerHeight, subIndicators.length]);

    const subRef = useRef(null);
    const subSvg = d3.select(subRef.current);

    const outDimension = useMemo(() => ({
        w: innerWidth,
        h: subIndicatorHeight,
        m: chartDim.margin
    }), [subIndicatorHeight, chartDim.margin]);

    useEffect(() => {
        drawSubIndicatorGrid(subSvg, innerWidth, bandXScale, subIndicatorHeight, chartDim.margin, subIndicators.length);
    }, [OHLCData, bandXScale, chartDim.margin, subIndicatorHeight, subIndicators.length, subSvg]);

    return (
        <>
            <div style={{ top: `${chartDim.height}px` }} className="absolute left-0 z-30">
                <IndicatorSelector
                    svg={subSvg}
                    scale={scale}
                    bandXScale={bandXScale}
                    data={OHLCData}
                    indicatorList={subIndicatorList}
                    outDimension={outDimension}
                    setSubIndicators={setSubIndicators}
                    dbId={"sub-indicator"}
                    init={"MACD"}
                />
            </div>
            <svg className="border-y-1 border-y-washed/20 p-0" ref={subRef} width={width} height={chartDim.height * 0.5 * subIndicators.length}></svg>
        </>
    );
};

export default React.memo(SubIndicatorsSvgs);