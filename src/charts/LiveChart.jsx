import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { drawGrid, drawSubIndicatorGrid } from "./grid";
import { drawAxesAndLabels } from "./axis";
import { xyScaler } from "./helper/xyScaler";
import { IndicatorSelector } from "./indicators/IndicatorSelector";
import { indicatorList, subIndicatorList } from "./indicators/indicatorList"
import { drawVolumeBars } from "./charts/volume";
import { getVisibleIndexRange } from "./helper/getVisibleIndices";
import LivePriceLine from "./LivePriceLine";
import { getBandXScale } from "./helper/getBandXScale";

const LiveChart = ({
    OHLCData = [{ open: 0, high: 0, low: 0, close: 0, volume: 0, date: 16000 }],
    range,
    isFetching,
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
    const [scrollStopped, setScrollStopped] = useState(0);

    const margin = useRef({ top: 15, right: 5, bottom: 15, left: 5 })
    const height = window.innerHeight * 0.425;
    const innerWidth = useMemo(() => (lengthPerItem * OHLCData.length) - margin.current.left - margin.current.right, [OHLCData.length, lengthPerItem])
    const innerHeight = height - margin.current.top - margin.current.bottom;
    const subIndicatorHeight = useMemo(() => innerHeight * 0.5 * subIndicators.length, [innerHeight, subIndicators])

    const outDimension = useMemo(() => ({
        w: innerWidth,
        h: subIndicatorHeight,
        m: margin.current
    }), [innerWidth, subIndicatorHeight, margin]);

    const svg = d3.select(svgRef.current);
    const ySvg = d3.select(ySvgRef.current);
    const subSvg = d3.select(subRef.current);

    // Chart X scroll stop listener
    useEffect(() => {
        if (isLogScale != "LOG") return;

        const el = scrollContainerRef.current;
        if (!el) return;

        let timeout;
        const onScroll = () => {
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(() => {
                setScrollStopped(Date.now());
            }, 500);
        };

        el.addEventListener("scroll", onScroll);
        setScrollStopped(Date.now()); // Force Y adjustment at start

        return () => {
            el.removeEventListener("scroll", onScroll);
            if (timeout) clearTimeout(timeout);
        };
    }, [isLogScale]);

    const visibleOHLCData = useMemo(() => {
        if (!OHLCData || !scrollContainerRef.current) return OHLCData;
        const { iLeft, iRight } = getVisibleIndexRange(scrollContainerRef, OHLCData.length, 100);
        return OHLCData.slice(iLeft, iRight);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [OHLCData, scrollStopped]);

    const scale = useMemo(() => xyScaler(d3, OHLCData, "date", "close", isLogScale, innerWidth, innerHeight, margin.current, visibleOHLCData), [OHLCData, visibleOHLCData, innerHeight, innerWidth, isLogScale]);
    const bandXScale = useMemo(() => getBandXScale(d3, OHLCData, innerWidth),[OHLCData, innerWidth])

    useEffect(() => {
        svg.selectAll(".main").remove();
        ySvg.selectAll('*').remove();

        if (!OHLCData || isFetching || isError) return;
        // draw axis/label
        drawAxesAndLabels(svg, ySvg, scale, innerHeight, OHLCData.length, range);

        //draw grid
        drawGrid(svg, scale, innerWidth, innerHeight);

        // Draw volume bar overlay
        drawVolumeBars(d3, svg, bandXScale, OHLCData, innerHeight, tooltipRef);

        chart(d3, svg, scale, tooltipRef, OHLCData, bandXScale, innerHeight);
        //line(d3, svg, scale, tooltipRef, OHLCData, innerHeight);

    }, [OHLCData, lengthPerItem, isLogScale, range, height, innerWidth, innerHeight, scale, svg, ySvg, isFetching, isError, chart, bandXScale]);

    useEffect(() => {
        if (isFetching) return;
        drawSubIndicatorGrid(subSvg, innerWidth, OHLCData, subIndicatorHeight, margin.current, subIndicators.length);
    }, [OHLCData, innerWidth, isFetching, scale, subIndicatorHeight, subIndicators, subSvg]);

    return (
        <div className="relative">
            <div className="flex gap-0">
                <div
                    className="overflow-x-auto whitespace-nowrap flex-1 hide-scrollbar scroll-stick-left"
                    ref={scrollContainerRef}
                >
                    <svg ref={svgRef} width={lengthPerItem * OHLCData.length + 100} height={height}>
                        <g className="y-axis" ></g>
                        {/* Scrollable Chart Content (Grid, X-Axis, Lines, etc.) */}
                        <g className="chart-content" ></g>
                    </svg>
                    {/*sub indicator */}
                    <svg ref={subRef} width={lengthPerItem * OHLCData.length + 100} height={height * 0.5 * subIndicators.length}></svg>
                </div>
                <div className="w-fit">
                    <svg
                        width={'3rem'}
                        height={height}
                        ref={ySvgRef}
                    ></svg>
                </div>
            </div>
            <div
                ref={tooltipRef}
                className="tooltip absolute opacity-0 bg-black p-2 whitespace-nowrap"
                style={{
                    pointerEvents: "none",
                }}
            ></div>

            <LivePriceLine OHLCData={OHLCData} scale={scale} innerWidth={innerWidth} />
            
            <div className="absolute left-0 top-0 max-w-[94vw] max-h-100 z-10">
                <IndicatorSelector
                    d3={d3}
                    svg={svg}
                    scale={scale}
                    data={OHLCData}
                    indicatorList={indicatorList}
                    dbId={"main-indicator"}
                    init={"SMA"}
                />
            </div>
            <div style={{ top: `${height}px` }} className="absolute left-0 max-w-[94vw] max-h-100 z-10">
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
