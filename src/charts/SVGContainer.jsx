import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { drawYAxis } from "./axis";
import IndicatorSelector from "./indicators/IndicatorSelector";
import { indicatorList, subIndicatorList } from "./indicators/indicatorList";
import { drawVolumeBars } from "./charts/volume";
import LivePriceLine from "./LivePriceLine";
import { chartDim, subIndicatorMargin } from "./config";
import SubIndicatorsSvgs from "./SubIndicatorsSvgs";
import { ChartSvg } from "./ChartSvg";
import SubIndicatorYLabel from "./SubIndicatorYLabel";
import { getBandXScale, getVisibleIndexRange, grabHandleMouseDown, grabHandleMouseLeave, grabHandleMouseMove, grabHandleMouseUp, xyScaler } from "./helper";
import CrosshairOverlay from "./CrosshairOverlay";
import OverlayXGridAxis from "./OverlayXGridAxis";
import CrosshairXYLabels from "./CrosshairXYLabels";

const SvgContainer = ({
    OHLCData,
    range,
    isError,
    chart,
    lengthPerItem,
    isLogScale,
}) => {
    const containerRef = useRef(null);
    const svgRef = useRef(null);
    const ySvgRef = useRef(null);
    const xLabelRef = useRef(null);
    const tooltipRef = useRef(null);
    const chartContainerRef = useRef(null); // For the scrollable div
    const mainSvg = d3.select(svgRef.current);

    const [subIndicators, setSubIndicators] = useState({}); // Sub-indicator state need to be shared with y-axis/label (SubIndicatorYLabel)
    const [isDown, setIsDown] = useState(false); // Controls xy chart grab scrolling
    const [start, setStart] = useState({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });
    const [scrollStopped, setScrollStopped] = useState(null); // Debounced scroll state for visibleOHLCData

    const innerWidth = useMemo(() => (lengthPerItem * OHLCData?.length) + chartDim.margin.right + chartDim.margin.left, [OHLCData, lengthPerItem]);
    const yLabelWidth = useMemo(() => (((Math.floor(Math.log10(Math.abs(Math.round(OHLCData[0].close) + 1))) + 1) + (OHLCData[0].close.toString().match(/\.0+/)?.[0].length || 0))) * 13, [OHLCData]);
    const subIndicatorDim = useMemo(() => {
        return { w: innerWidth, h: chartDim.subIndicatorHeight, m: subIndicatorMargin }
    }, [innerWidth])

    const visibleOHLCData = useMemo(() => {
        if (scrollStopped) {
            const { iLeft, iRight } = getVisibleIndexRange(chartContainerRef, OHLCData.length);
            return OHLCData.slice(iLeft, iRight);
        }
        else { // 1st render scroll chart to right, slicing data most right
            const sliceLeft = ((innerWidth - (window.innerWidth * 0.8)) / innerWidth) * OHLCData.length;
            return OHLCData.slice(Math.round(sliceLeft), OHLCData.length - 1);
        }
    }, [OHLCData, innerWidth, scrollStopped]);

    const scale = useMemo(() => xyScaler(visibleOHLCData, "date", "close", isLogScale, innerWidth, chartDim.innerHeight, chartDim.margin), [visibleOHLCData, innerWidth, isLogScale]);

    const bandXScale = useMemo(() => {
        return getBandXScale(OHLCData, innerWidth)
    }, [OHLCData, innerWidth]);

    // Chart X scroll stop listener
    useEffect(() => {
        if (isLogScale != "LOG") return;

        const el = chartContainerRef.current;

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
        const ySvg = d3.select(ySvgRef.current);
        ySvg.selectAll('*').remove();

        if (OHLCData?.length <= 1 || isError) return;

        drawYAxis(ySvg, scale, mainSvg);
        //drawGrid(mainSvg, scale, innerWidth, chartDim.innerHeight, bandXScale);
        chart(d3, mainSvg, scale, tooltipRef, OHLCData, bandXScale, chartDim.innerHeight);

    }, [OHLCData, innerWidth, scale, isError, chart, bandXScale, mainSvg]);

    // Y Static SVGs
    useEffect(() => {
        if (OHLCData.length < 1) return;

        const xLabelSvg = d3.select(xLabelRef.current);
        xLabelSvg.selectAll('*').remove();
        // Draw volume bar overlay
        drawVolumeBars(d3, mainSvg, bandXScale, OHLCData, chartDim.innerHeight, tooltipRef);
    }, [OHLCData, bandXScale, innerWidth, mainSvg, range]);

    return (
        <div ref={containerRef} className="relative">
            <div className="flex gap-0">
                <div
                    className={`overflow-auto whitespace-nowrap flex-1 hide-scrollbar scroll-stick-left cursor-crosshair pb-8 select-none ${isDown ? "cursor-grabbing" : ""}`}
                    ref={chartContainerRef}
                    onMouseDown={(e) => grabHandleMouseDown(e, chartContainerRef.current, setIsDown, setStart)}
                    onMouseUp={() => grabHandleMouseUp(setIsDown)}
                    onMouseLeave={() => grabHandleMouseLeave(setIsDown)}
                    onMouseMove={(e) => grabHandleMouseMove(e, chartContainerRef.current, isDown, start)}
                    style={{ position: "relative" }}
                >
                    <ChartSvg svgRef={svgRef} width={innerWidth + chartDim.extraLeft} height={chartDim.height} />
                    <SubIndicatorsSvgs
                        OHLCData={OHLCData}
                        width={innerWidth + chartDim.extraLeft}
                        chartDim={chartDim}
                        bandXScale={bandXScale}
                        subIndicators={subIndicators}
                    />
                    {/* x axis overlay-grid and labels */}
                    <OverlayXGridAxis bandXScale={bandXScale} innerWidth={innerWidth} range={range} parentRef={chartContainerRef} tooltipRef={tooltipRef} data={OHLCData} />

                </div>

                <CrosshairOverlay parentRef={containerRef} />
                <CrosshairXYLabels parentRef={containerRef} yScaler={scale.y} />

                {/*Y labels */}
                <div >
                    <svg
                        width={`${yLabelWidth}px`}
                        height={chartDim.height}
                        ref={ySvgRef}
                    ></svg>
                    {Object.keys(subIndicators).map(e => (
                        <SubIndicatorYLabel
                            key={e}
                            name={e}
                            width={yLabelWidth}
                            height={chartDim.subIndicatorHeight}
                            yScaler={subIndicators[e].yScaler}
                            data={subIndicators[e].indicatorData}
                        />
                    ))}
                </div>

            </div>
            <div
                ref={tooltipRef}
                className="tooltip z-55 absolute text-[11.5px] md:text-xs left-0 md:right-12 flex flex-wrap md:max-w-full max-w-60 md:justify-end justify-start gap-1 md:gap-2 md:top-0 top-6 p-1"
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
            <div className="absolute left-0 z-30" style={{ top: chartDim.innerHeight }}>
                <IndicatorSelector
                    svg={null}
                    scale={null}
                    bandXScale={bandXScale}
                    data={OHLCData}
                    indicatorList={subIndicatorList}
                    outDimension={subIndicatorDim}
                    setSubIndicators={setSubIndicators}
                    dbId={"sub-indicator"}
                    init={"MACD"}
                />
            </div>
        </div>
    );
};

export default SvgContainer;
