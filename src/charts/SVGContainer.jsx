import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { drawXAxis, drawYAxis } from "./axis";
import { xyScaler } from "./helper/xyScaler";
import IndicatorSelector from "./indicators/IndicatorSelector";
import { indicatorList } from "./indicators/indicatorList"
import { drawVolumeBars } from "./charts/volume";
import { getVisibleIndexRange } from "./helper/getVisibleIndices";
import LivePriceLine from "./LivePriceLine";
import { getBandXScale } from "./helper/getBandXScale";
import { chartDim } from "./config";
import SubIndicatorsSvgs from "./SubIndicatorsSvgs";
import { ChartSvg } from "./ChartSvg";
import SubIndicatorYLabel from "./SubIndicatorYLabel";
import { grabHandleMouseDown, grabHandleMouseLeave, grabHandleMouseMove, grabHandleMouseUp } from "./helper";

const SvgContainer = ({
    OHLCData,
    range,
    isError,
    chart,
    lengthPerItem,
    isLogScale,
}) => {
    const svgRef = useRef(null);
    const ySvgRef = useRef(null);
    const tooltipRef = useRef(null);
    const scrollContainerRef = useRef(null); // For the scrollable div
    const [subIndicators, setSubIndicators] = useState({}); // Sub-indicator state need to be shared with y-axis/label (SubIndicatorYLabel)

    // Controls xy chart grab scrolling
    const [isDown, setIsDown] = useState(false);
    const [start, setStart] = useState({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

    // Debounced scroll state for visibleOHLCData
    const [scrollStopped, setScrollStopped] = useState(null);

    const innerWidth = useMemo(() => (lengthPerItem * OHLCData?.length) - chartDim.margin.left - chartDim.margin.right, [OHLCData, lengthPerItem]);
    const yLabelWidth = useMemo(() => OHLCData[0].close.toString().length * 3.3, [OHLCData])

    const mainSvg = d3.select(svgRef.current);
    const ySvg = d3.select(ySvgRef.current);

    const visibleOHLCData = useMemo(() => {
        if (scrollStopped) {
            const { iLeft, iRight } = getVisibleIndexRange(scrollContainerRef, OHLCData.length);
            return OHLCData.slice(iLeft, iRight);
        }
        else { // 1st render scroll chart to right, slicing data most right
            const sliceLeft = ((innerWidth - (window.innerWidth * 0.8)) / innerWidth) * OHLCData.length;
            return OHLCData.slice(Math.round(sliceLeft), OHLCData.length - 1);
        }
    }, [OHLCData, innerWidth, scrollStopped]);

    const scale = useMemo(() => xyScaler(d3, visibleOHLCData, "date", "close", isLogScale, innerWidth, chartDim.innerHeight, chartDim.margin), [visibleOHLCData, innerWidth, isLogScale]);

    const bandXScale = useMemo(() => {
        return getBandXScale(d3, OHLCData, innerWidth)
    }, [OHLCData, innerWidth]);

    // Chart X scroll stop listener
    useEffect(() => {
        if (isLogScale != "LOG") return;

        const el = scrollContainerRef.current;

        let timeout;
        const onScroll = () => {
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(() => {
                setScrollStopped(Date.now());
            }, 500);
        };

        el.addEventListener("scroll", onScroll);

        return () => {
            el.removeEventListener("scroll", onScroll);
            if (timeout) clearTimeout(timeout);
        };
    }, [isLogScale]);

    // Y Dynamic SVGs
    useEffect(() => {
        ySvg.selectAll('*').remove();

        if (OHLCData?.length <= 1 || isError) return;

        drawYAxis(ySvg, scale, mainSvg);
        //drawGrid(mainSvg, scale, innerWidth, chartDim.innerHeight, bandXScale);
        chart(d3, mainSvg, scale, tooltipRef, OHLCData, bandXScale, chartDim.innerHeight);

    }, [OHLCData, innerWidth, scale, isError, chart, bandXScale, mainSvg, ySvg]);

    // Y Static SVGs
    useEffect(() => {
        if (OHLCData.length < 1) return;
        // draw axis/label
        drawXAxis(mainSvg, bandXScale, chartDim.innerHeight, range);
        // Draw volume bar overlay
        drawVolumeBars(d3, mainSvg, bandXScale, OHLCData, chartDim.innerHeight, tooltipRef);
    }, [OHLCData, bandXScale, innerWidth, mainSvg, range])

    return (
        <div className="relative">
            <div className="flex gap-0">
                <div
                    className={`overflow-auto whitespace-nowrap flex-1 hide-scrollbar scroll-stick-left cursor-crosshair select-none ${isDown ? "cursor-grabbing" : ""}`}
                    ref={scrollContainerRef}
                    onMouseDown={(e) => grabHandleMouseDown(e, scrollContainerRef.current, setIsDown, setStart)}
                    onMouseLeave={() => grabHandleMouseLeave(setIsDown)}
                    onMouseUp={() => grabHandleMouseUp(setIsDown)}
                    onMouseMove={(e) => grabHandleMouseMove(e, scrollContainerRef.current, isDown, start)}
                >
                    <ChartSvg svgRef={svgRef} width={lengthPerItem * OHLCData.length + 100} height={chartDim.height} />
                    <SubIndicatorsSvgs
                        OHLCData={OHLCData}
                        width={lengthPerItem * OHLCData.length + 100}
                        chartDim={chartDim}
                        bandXScale={bandXScale}
                        subIndicators={subIndicators}
                        setSubIndicators={setSubIndicators}
                    />
                </div>

                {/*Y labels */}
                <div className="w-fit">
                    <svg
                        width={`${yLabelWidth}px`}
                        height={chartDim.height}
                        ref={ySvgRef}
                    ></svg>
                    {Object.keys(subIndicators).map(e => (
                        <SubIndicatorYLabel
                            key={e}
                            width={`${yLabelWidth}px`}
                            height={chartDim.innerHeight * 0.5}
                            scaleY={scale.y}
                            subIndicator={e}
                            data={subIndicators[e].indicatorData}
                        />
                    ))}
                </div>

            </div>
            <div
                ref={tooltipRef}
                className="tooltip absolute flex gap-2 right-0 top-0 opacity-0 bg-[#0f0f147e] p-2"
                style={{
                    pointerEvents: "none",
                }}
            ></div>

            <LivePriceLine OHLCData={OHLCData} scale={scale} innerWidth={innerWidth} />

            <div className="absolute left-0 top-0 z-30">
                <IndicatorSelector
                    d3={d3}
                    svg={mainSvg}
                    scale={scale}
                    data={OHLCData}
                    indicatorList={indicatorList}
                    dbId={"main-indicator"}
                    init={"SMA"}
                    bandXScale={bandXScale}
                />
            </div>
        </div>
    )
};

export default SvgContainer;
