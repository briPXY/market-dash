import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import LivePriceOverlay from "./LivePriceOverlay";
import { drawGrid, drawSubIndicatorGrid } from "./grid";
import { drawAxesAndLabels } from "./axis";
import { ZoomOverlay } from "./ZoomOverlay";
import { Yscale } from "../market/Components/Yscale";
import { Flex } from "../Layout/Layout";
import { line } from "./charts/line";
import { Button, PopoverButton } from "../Layout/elements";
import { xyScaler } from "./xyScaler";
import { IndicatorSelector } from "./indicators/IndicatorSelector";
import { indicatorList, subIndicatorList } from "./indicators/indicatorList"

const LiveChart = ({
    OHLCData,
    range,
    isFetching,
    isError,
}) => {
    const svgRef = useRef(null);
    const ySvgRef = useRef(null);
    const tooltipRef = useRef(null);
    const subRef = useRef(null);

    const [lengthPerItem, setLengthPerItem] = useState(16);
    const [subIndicators, setSubIndicators] = useState([]);

    const margin = useRef({ top: 15, right: 5, bottom: 15, left: 5 })
    const height = window.innerHeight * 0.4;
    const innerWidth = (lengthPerItem * OHLCData.length) - margin.current.left - margin.current.right;
    const innerHeight = height - margin.current.top - margin.current.bottom;
    const subIndicatorHeight = useMemo(() => innerHeight * 0.5 * subIndicators.length, [innerHeight, subIndicators])

    const outDimension = useMemo(() => ({
        w: innerWidth,
        h: subIndicatorHeight,
        m: margin.current
    }), [innerWidth, subIndicatorHeight, margin]);

    const [isLogScale, setYscale] = useState("LOG");

    const svg = d3.select(svgRef.current);
    const ySvg = d3.select(ySvgRef.current);
    const subSvg = d3.select(subRef.current);
    const scale = useMemo(() => xyScaler(d3, OHLCData, "date", "close", isLogScale, innerWidth, innerHeight, margin.current), [OHLCData, innerHeight, innerWidth, isLogScale]);

    useEffect(() => {
        svg.selectAll(".main").remove();
        ySvg.selectAll('*').remove();

        if (!OHLCData.length || isFetching || isError) return;
        // draw axis/label
        drawAxesAndLabels(svg, ySvg, scale, innerHeight, OHLCData.length, range);

        //draw grid
        drawGrid(svg, scale, innerWidth, innerHeight);

        line(d3, svg, scale, tooltipRef, OHLCData, innerHeight);

    }, [OHLCData, lengthPerItem, isLogScale, range, height, innerWidth, innerHeight, scale, svg, ySvg, isFetching, isError]);

    useEffect(() => {
        if (isFetching) return;
        drawSubIndicatorGrid(subSvg, innerWidth, subIndicatorHeight, margin.current, subIndicators.length);
    }, [innerWidth, isFetching, scale, subIndicatorHeight, subIndicators, subSvg])
    
    return (
        <div className="relative">
            <div className="flex gap-0 ">
                <div className="w-full max-w-[92vw] overflow-x-auto whitespace-nowrap hide-scrollbar scroll-stick-left">
                    <svg ref={svgRef} width={lengthPerItem * OHLCData.length + 100} height={height}>
                        <g className="y-axis" ></g>
                        {/* Scrollable Chart Content (Grid, X-Axis, Lines, etc.) */}
                        <g className="chart-content" ></g>
                    </svg>
                    {/*sub indicator */}
                    <svg ref={subRef} width={lengthPerItem * OHLCData.length + 100} height={height * 0.5 * subIndicators.length}></svg>
                </div>
                <svg
                    width={'3rem'}
                    height={height}
                    className="sticky right-0 z-10"
                    ref={ySvgRef}
                ></svg>
            </div>
            <div
                ref={tooltipRef}
                className="tooltip absolute opacity-0 bg-black p-2 whitespace-nowrap"
                style={{
                    pointerEvents: "none",
                }}
            ></div>

            <LivePriceOverlay isLogScale={isLogScale == "LOG"} OHLCData={OHLCData} margin={margin} innerHeight={innerHeight} />

            {/** buttons*/}

            <Flex className="overflow-visible justify-end items-center gap-4 text-sm">
                <PopoverButton>
                    <Button>{isLogScale}</Button>
                    <Yscale setYscale={setYscale}></Yscale>
                </PopoverButton>
                <ZoomOverlay setLengthPerItem={setLengthPerItem} />
            </Flex>
            <div className="absolute top-0 left-0 max-w-[94vh] max-h-100 z-30">
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
            <div className="absolute top-80 left-0 max-w-[94vh] max-h-100 z-30">
                <IndicatorSelector
                    d3={d3}
                    svg={subSvg}
                    scale={scale}
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
