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

    const margin = useRef({ top: 22, right: 5, bottom: 22, left: 5 })
    const height = window.innerHeight * 0.425;
    const innerWidth = useMemo(() => (lengthPerItem * OHLCData?.length) - margin.current.left - margin.current.right, [OHLCData, lengthPerItem]);
    const innerHeight = height - margin.current.top - margin.current.bottom;
    const subIndicatorHeight = useMemo(() => innerHeight * 0.5 * subIndicators.length, [innerHeight, subIndicators]);
    const yLabelWidth = useMemo(() => OHLCData[0].close.toString().length * 3.3, [OHLCData])

    const outDimension = useMemo(() => ({
        w: innerWidth,
        h: subIndicatorHeight,
        m: margin.current
    }), [innerWidth, subIndicatorHeight, margin]);

    const svg = d3.select(svgRef.current);
    const ySvg = d3.select(ySvgRef.current);
    const subSvg = d3.select(subRef.current);

    const visibleOHLCData = useMemo(() => {
        if (scrollStopped) {
            const { iLeft, iRight } = getVisibleIndexRange(scrollContainerRef, OHLCData.length);
            return OHLCData.slice(iLeft, iRight);
        }
        else { // 1st render slicing
            const sliceLeft = ((innerWidth - (window.innerWidth * 0.8)) / innerWidth) * OHLCData.length;
            return OHLCData.slice(Math.round(sliceLeft), OHLCData.length - 1);
        }
    }, [OHLCData, innerWidth, scrollStopped]);

    const scale = useMemo(() => xyScaler(d3, visibleOHLCData, "date", "close", isLogScale, innerWidth, innerHeight, margin.current), [visibleOHLCData, innerHeight, innerWidth, isLogScale]);

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

    useEffect(() => {
        svg.selectAll(".main").remove();
        ySvg.selectAll('*').remove();

        if (OHLCData?.length <= 1 || isError) return;
        // draw axis/label
        drawAxesAndLabels(svg, ySvg, scale, bandXScale, innerHeight, range);

        //draw grid
        drawGrid(svg, scale, innerWidth, innerHeight, bandXScale);

        // Draw volume bar overlay
        drawVolumeBars(d3, svg, bandXScale, OHLCData, innerHeight, tooltipRef);

        chart(d3, svg, scale, tooltipRef, OHLCData, bandXScale, innerHeight);
        //line(d3, svg, scale, tooltipRef, OHLCData, innerHeight);

    }, [OHLCData, lengthPerItem, isLogScale, range, height, innerWidth, innerHeight, scale, svg, ySvg, isError, chart, bandXScale]);

    useEffect(() => {
        drawSubIndicatorGrid(subSvg, innerWidth, OHLCData, subIndicatorHeight, margin.current, subIndicators.length);
    }, [OHLCData, innerWidth, subIndicatorHeight, subIndicators, subSvg]);

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
                {/*Y labels */}
                <div className="w-fit">
                    <svg
                        width={`${yLabelWidth}px`}
                        height={height}
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
                    svg={svg}
                    scale={scale}
                    data={OHLCData}
                    indicatorList={indicatorList}
                    dbId={"main-indicator"}
                    init={"SMA"}
                    bandXScale={bandXScale}
                />
            </div>
            <div style={{ top: `${height}px` }} className="absolute left-0 z-30">
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
