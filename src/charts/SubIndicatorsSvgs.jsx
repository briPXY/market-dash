import React, { useEffect, useMemo, useRef } from "react";
import IndicatorSelector from "./indicators/IndicatorSelector"
import { drawSubIndicatorGrid } from "./grid";
import * as d3 from "d3";
import { subIndicatorList } from "./indicators/indicatorList";
import { drawIndicator } from "./indicators/draws";

const SubIndicatorsSvgs = ({ OHLCData, width, chartDim, bandXScale, subIndicators, setSubIndicators }) => {
    const subRefs = useRef({});
    const d3Svgs = useRef({});

    const outDimension = useMemo(() => ({
        w: innerWidth,
        h: 150,
        m: chartDim.margin
    }), [chartDim.margin]);

    useEffect(() => {
        if (Object.keys(subIndicators).length === 0) {
            return;
        }

        Object.keys(subRefs.current).forEach(name => {
            d3Svgs.current[name] = d3.select(subRefs.current[name]);
            drawSubIndicatorGrid(d3Svgs.current[name], innerWidth, bandXScale, outDimension.h, chartDim.margin, subIndicators.length);
        });
    }, [bandXScale, chartDim.margin, outDimension.h, subIndicators]);

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
    }, [bandXScale, outDimension, setSubIndicators, subIndicators]);

    return (
        <>
            <div style={{ top: `${chartDim.height}px` }} className="absolute left-0 z-30">
                <IndicatorSelector
                    svg={null}
                    scale={null}
                    bandXScale={bandXScale}
                    data={OHLCData}
                    indicatorList={subIndicatorList}
                    outDimension={outDimension}
                    setSubIndicators={setSubIndicators}
                    dbId={"sub-indicator"}
                    init={"MACD"}
                />
            </div>
            {Object.keys(subIndicators).map(name => (
                <svg key={name} className="border-y-1 border-y-washed/20 p-0" ref={el => (subRefs.current[name] = el)} width={width} height={outDimension.h}></svg>
            ))}
        </>
    );
};

export default React.memo(SubIndicatorsSvgs);