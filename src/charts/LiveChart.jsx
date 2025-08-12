import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { drawSubIndicatorGrid } from "./grid";
import { drawXAxis, drawYAxis } from "./axis";
import { xyScaler } from "./helper/xyScaler";
import { IndicatorSelector } from "./indicators/IndicatorSelector";
import { indicatorList, subIndicatorList } from "./indicators/indicatorList"
import { drawVolumeBars } from "./charts/volume";
import { getVisibleIndexRange } from "./helper/getVisibleIndices";
import LivePriceLine from "./LivePriceLine";
import { getBandXScale } from "./helper/getBandXScale";

const chartDim = {
    margin: { top: 22, right: 5, bottom: 22, left: 5 },
    height: window.innerHeight * 0.42,
};

chartDim.innerHeight = chartDim.height - chartDim.margin.top - chartDim.margin.bottom;

const LiveChart = ({
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
    const subRef = useRef(null);
    const scrollContainerRef = useRef(null); // For the scrollable div

    const [subIndicators, setSubIndicators] = useState([]);
    // Debounced scroll state for visibleOHLCData
    const [scrollStopped, setScrollStopped] = useState(null);

    const innerWidth = useMemo(() => (lengthPerItem * OHLCData?.length) - chartDim.margin.left - chartDim.margin.right, [OHLCData, lengthPerItem]);
    const subIndicatorHeight = useMemo(() => chartDim.innerHeight * 0.5 * subIndicators.length, [subIndicators]);
    const yLabelWidth = useMemo(() => OHLCData[0].close.toString().length * 3.3, [OHLCData])

    const outDimension = useMemo(() => ({
        w: innerWidth,
        h: subIndicatorHeight,
        m: chartDim.margin
    }), [innerWidth, subIndicatorHeight]);

    const mainSvg = d3.select(svgRef.current);
    const ySvg = d3.select(ySvgRef.current);
    const subSvg = d3.select(subRef.current);

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

    useEffect(() => {
        drawSubIndicatorGrid(subSvg, innerWidth, bandXScale, subIndicatorHeight, chartDim.margin, subIndicators.length);
    }, [OHLCData, bandXScale, innerWidth, subIndicatorHeight, subIndicators, subSvg]);

    return (
        <div className="relative">
            <div className="flex gap-0">
                <div
                    className={`overflow-x-auto whitespace-nowrap flex-1 hide-scrollbar scroll-stick-left`}
                    ref={scrollContainerRef}
                >
                    <svg ref={svgRef} width={lengthPerItem * OHLCData.length + 100} height={chartDim.height}>
                        <g className="y-axis" ></g>
                        {/* Scrollable Chart Content (Grid, X-Axis, Lines, etc.) */}
                        <g className="chart-content" ></g>
                    </svg>
                    {/*sub indicator */}
                    <svg ref={subRef} width={lengthPerItem * OHLCData.length + 100} height={chartDim.height * 0.5 * subIndicators.length}></svg>
                </div>
                {/*Y labels */}
                <div className="w-fit">
                    <svg
                        width={`${yLabelWidth}px`}
                        height={chartDim.height}
                        ref={ySvgRef}
                    ></svg>
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
            <div style={{ top: `${chartDim.height}px` }} className="absolute left-0 z-30">
                <IndicatorSelector
                    d3={d3}
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
        </div>
    )
};

export default LiveChart;
