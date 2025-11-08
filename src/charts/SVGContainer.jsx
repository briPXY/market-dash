import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { drawYAxis } from "./axis";
import IndicatorSelector from "./indicators/IndicatorSelector";
import { indicatorList, subIndicatorList } from "./indicators/indicatorList";
import { drawVolumeBars } from "./charts/volume";
import LivePriceLine from "./LivePriceLine";
import { chartDim, subIndHeight, } from "./config";
import SubIndicatorsSvg from "./SubIndicatorsSvg";
import { ChartSvg } from "./ChartSvg";
import SubIndicatorYLabel from "./SubIndicatorYLabel";
import { getBandXScale, getVisibleIndexRange, grabHandleMouseDown, grabHandleMouseLeave, grabHandleMouseMove, grabHandleMouseUp, useYLabelWidth, xyScaler } from "./helper";
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
    const innerHeight = useMemo(() => chartDim.containerHeight - (Object.keys(subIndicators).length * chartDim.subIndicatorHeight) - 14, [subIndicators]);
    const yLabelWidth = useYLabelWidth(OHLCData);

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

    const scale = useMemo(() => xyScaler(visibleOHLCData, "date", "close", isLogScale, innerWidth, innerHeight, chartDim.margin), [visibleOHLCData, isLogScale, innerWidth, innerHeight]);

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
        //drawGrid(mainSvg, scale, innerWidth, innerHeight, bandXScale);
        chart(d3, mainSvg, scale, tooltipRef, OHLCData, bandXScale, innerHeight);

    }, [OHLCData, innerWidth, scale, isError, chart, bandXScale, mainSvg, innerHeight]);

    // Y Static SVGs
    useEffect(() => {
        if (OHLCData.length < 1) return;

        const xLabelSvg = d3.select(xLabelRef.current);
        xLabelSvg.selectAll('*').remove();
        // Draw volume bar overlay
        drawVolumeBars(d3, mainSvg, bandXScale, OHLCData, innerHeight, tooltipRef);
    }, [OHLCData, bandXScale, innerHeight, innerWidth, mainSvg, range]);

    return (
        <div ref={containerRef} style={{ height: `${chartDim.containerHeight}px` }} className="relative">
            <div className="flex gap-0">
                <div
                    className={`overflow-auto whitespace-nowrap flex-1 hide-scrollbar scroll-stick-left cursor-crosshair select-none ${isDown ? "cursor-grabbing" : ""}`}
                    ref={chartContainerRef}
                    onMouseDown={(e) => grabHandleMouseDown(e, chartContainerRef.current, setIsDown, setStart)}
                    onMouseUp={() => grabHandleMouseUp(setIsDown)}
                    onMouseLeave={() => grabHandleMouseLeave(setIsDown)}
                    onMouseMove={(e) => grabHandleMouseMove(e, chartContainerRef.current, isDown, start)}
                    style={{ position: "relative" }}
                >

                    <ChartSvg svgRef={svgRef} width={innerWidth + chartDim.extraLeft} height={innerHeight} />

                    {/* Sub indicators svg/drawing */}
                    {Object.keys(subIndicators).map(e => {
                        const { color, indicatorData, yScaler, fn } = subIndicators[e];
                        return (<SubIndicatorsSvg
                            height={subIndHeight[Object.keys(subIndicators).length]}
                            width={innerWidth + chartDim.extraLeft}
                            bandXScale={bandXScale}
                            subIndicator={subIndicators[e]}
                            color={color}
                            indicatorData={indicatorData}
                            yScaler={yScaler}
                            fn={fn}
                            key={e}
                            name={e}
                        />)
                    })}

                    {/* x axis overlay-grid and labels */}
                    <div className="w-1 h-[14px]"></div>
                    <OverlayXGridAxis bandXScale={bandXScale} innerWidth={innerWidth} range={range} parentRef={chartContainerRef} tooltipRef={tooltipRef} data={OHLCData} />

                </div>

                <CrosshairOverlay parentRef={containerRef} />
                <CrosshairXYLabels parentRef={containerRef} yScaler={scale.y} />

                {/*Y labels */}
                <div >
                    <svg
                        width={`${yLabelWidth}px`}
                        height={innerHeight}
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
                            color={subIndicators[e].color || "#FFFFFF"}
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
            <div className="absolute left-0 z-30" style={{ top: innerHeight }}>
                <IndicatorSelector
                    svg={null}
                    scale={null}
                    bandXScale={bandXScale}
                    data={OHLCData}
                    innerWidth={innerWidth}
                    indicatorList={subIndicatorList}
                    setSubIndicators={setSubIndicators}
                    dbId={"sub-indicator"}
                    init={"MACD"}
                />
            </div>
        </div>
    );
};

export default SvgContainer;
