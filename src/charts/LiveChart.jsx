import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import LivePriceOverlay from "./LivePriceOverlay";
import { drawGrid } from "./grid";
import { drawAxesAndLabels } from "./axis";
import { ZoomOverlay } from "./ZoomOverlay";
import { Yscale } from "../market/Components/Yscale";
import { Flex, PopoverButton } from "../Layout/Layout";
import { line } from "./charts/line";
import Button from "../Layout/elements";
import { xyScaler } from "./xyScaler";
import { IndicatorSelector } from "./indicators/IndicatorSelector";

const LiveChart = ({
    OHLCData, 
    range,
    isLoading,
    isError,
}) => {
    const svgRef = useRef(null);
    const ySvgRef = useRef(null);
    const tooltipRef = useRef(null);
    const [showedIndicators, setShowedIndicators] = useState([]);

    const [lengthPerItem, setLengthPerItem] = useState(16);

    const margin = useRef({ top: 20, right: 0, bottom: 30, left: 0 })
    const height = window.innerHeight * 0.4;
    const innerWidth = (lengthPerItem * OHLCData.length) - margin.current.left - margin.current.right;
    const innerHeight = height - margin.current.top - margin.current.bottom;

    const [isLogScale, setYscale] = useState("LOG");
    const [draw, setDraw] = useState(false);

    const svg = d3.select(svgRef.current);
    const ySvg = d3.select(ySvgRef.current);
    const scale = useMemo(() => xyScaler(d3, OHLCData, isLogScale, innerWidth, innerHeight, margin.current), [OHLCData, innerHeight, innerWidth, isLogScale]);

    useEffect(() => {
        if (!OHLCData.length || isLoading || isError) return;
 
        svg.selectAll(".main").remove();
        ySvg.selectAll('*').remove();
 
        // draw axis/label
        drawAxesAndLabels(svg, ySvg, scale, innerHeight, OHLCData.length, range)

        //draw grid
        drawGrid(svg, scale, innerWidth, innerHeight, margin.current);

        line(d3, svg, scale, tooltipRef, OHLCData, innerHeight);

        setDraw(true); 

    }, [OHLCData, lengthPerItem, isLogScale, range, height, innerWidth, innerHeight, scale, svg, ySvg, isLoading, isError]);

    useEffect(() => {
        console.log(`PARENT Mounted `); 
    }, []);


    return (
        <div className="relative">
            <div className="flex gap-0 ">
                <div className="w-full max-w-[92vw] overflow-x-auto whitespace-nowrap hide-scrollbar scroll-stick-left">
                    <svg ref={svgRef} width={lengthPerItem * OHLCData.length + 100} height={height}>
                        <g className="y-axis" ></g>
                        {/* Scrollable Chart Content (Grid, X-Axis, Lines, etc.) */}
                        <g className="chart-content" ></g>
                    </svg>
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
            <LivePriceOverlay draw={draw} isLogScale={isLogScale == "LOG"} OHLCData={OHLCData} margin={margin} innerHeight={innerHeight} />
            <Flex className="overflow-visible items-center gap-4 text-sm">
                <PopoverButton>
                    <Button>{isLogScale}</Button>
                    <Yscale setYscale={setYscale}></Yscale>
                </PopoverButton>
                <ZoomOverlay setLengthPerItem={setLengthPerItem} />
            </Flex>
            <div className="absolute top-0 right-6 md:right-22">
                <PopoverButton right="0%" showClass="z-15 right-0" hideClass="h-0 w-0 overflow-hidden">
                    <Button className="text-xs shadow-2xl">Indicator</Button>
                    <IndicatorSelector d3={d3} svg={svg} scale={scale} data={OHLCData} showedIndicators={showedIndicators} setShowedIndicators={setShowedIndicators} />
                </PopoverButton>
            </div>
        </div>
    )
};

export default LiveChart;
