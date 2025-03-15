import { useEffect, useRef, useMemo, useState } from "react";
import * as d3 from "d3";
import { indicator, indicatorChart } from "./indicators";
import LivePriceOverlay from "./LivePriceOverlay";
import { drawGrid } from "./grid";
import { drawAxesAndLabels } from "./axis";
import { ZoomOverlay } from "./ZoomOverlay";
import { Yscale } from "../market/Components/Yscale";
import { Flex, PopoverButton } from "../Layout/Layout";
import { drawLineChart } from "./drawLineChart";
import Button from "../Layout/elements";
import { yScaler } from "./yScaler";

const LiveChart = ({
    fillColor = "rgba(12,176,133,0.1)",
    lineColor = "#0cb085",
    OHLCData,
    indicatorType,
    indicatorMethod,
    range,
}) => {
    const svgRef = useRef(null);
    const ySvgRef = useRef(null);
    const tooltipRef = useRef(null);

    const [lengthPerItem, setLengthPerItem] = useState(16);

    const margin = useRef({ top: 20, right: 0, bottom: 30, left: 0 })
    const height = window.innerHeight * 0.4;
    const innerWidth = (lengthPerItem * OHLCData.length) - margin.current.left - margin.current.right;
    const innerHeight = height - margin.current.top - margin.current.bottom;

    const [isLogScale, setYscale] = useState("LOG");
    const [draw, setDraw] = useState(false);

    const indicatorData = useMemo(() => indicator[indicatorMethod](d3, OHLCData), [OHLCData, indicatorMethod]);

    useEffect(() => {
        if (OHLCData.length < 2) return;

        const svg = d3.select(svgRef.current);
        const ySvg = d3.select(ySvgRef.current);

        const scale = { x: null, y: null }

        svg.selectAll("*").remove();
        ySvg.selectAll('*').remove();

        // Conditionally create Y scale: logarithmic or linear.
        scale.y = yScaler(d3, OHLCData, isLogScale, innerHeight, margin);

        scale.x = d3.scaleTime()
            .domain([d3.min(OHLCData, d => d.date), d3.max(OHLCData, d => d.date)])
            .range([margin.current.left, innerWidth]);

        // draw axis/label
        drawAxesAndLabels(svg, ySvg, scale, innerHeight, OHLCData.length, range)

        //draw grid
        drawGrid(svg, scale, innerWidth, innerHeight, margin.current);

        drawLineChart(d3, svg, scale, tooltipRef, OHLCData, innerHeight, lineColor, fillColor); 
        
        // Indicator 
        indicatorChart[indicatorType](d3, svg, indicatorData, scale.x, scale.y);
        setDraw(true);

    }, [OHLCData, lengthPerItem, fillColor, lineColor, indicatorType, indicatorData, isLogScale, range, height, innerWidth, innerHeight]);

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
        </div>
    )
};

export default LiveChart;
