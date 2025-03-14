import { useEffect, useRef, useMemo, useState } from "react";
import * as d3 from "d3";
import { indicator, indicatorChart } from "./indicators";
import LivePriceOverlay from "./LivePriceOverlay";
import { drawGrid } from "./grid";
import { drawAxesAndLabels } from "./axis";
import { convertOHLCtoD3 } from "./conversion";
import { ZoomOverlay } from "./ZoomOverlay";
import { Yscale } from "../market/Components/Yscale";
import { Flex, PopoverButton } from "../Layout/Layout";
import { drawLineChart } from "./drawLineChart";

const LiveLineChart = ({
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

    const scalesRef = useRef({
        x: null,
        y: () => { },
    });

    const [isLogScale, setYscale] = useState("LOG");
    const [draw, setDraw] = useState(false);

    const historicalData = useMemo(() => convertOHLCtoD3(OHLCData), [OHLCData])
    const indicatorData = useMemo(() => indicator[indicatorMethod](d3, historicalData), [historicalData, indicatorMethod]);

    useEffect(() => {
        if (historicalData.length < 2) return;

        const svg = d3.select(svgRef.current);
        const ySvg = d3.select(ySvgRef.current);

        const innerWidth = (lengthPerItem * historicalData.length) - margin.current.left - margin.current.right;
        const innerHeight = height - margin.current.top - margin.current.bottom;

        svg.selectAll("*").remove();
        ySvg.selectAll('*').remove();

        // Conditionally create Y scale: logarithmic or linear.
        if (isLogScale) {
            // Ensure the lower bound is > 0 for log scale.
            const minY = d3.min(historicalData, d => d.y);
            const safeMin = minY > 0 ? minY : 1;
            scalesRef.current.y = d3.scaleLog()
                .domain([safeMin, d3.max(historicalData, d => d.y) * 1.05])
                .range([innerHeight, margin.current.top]);
        } else {
            scalesRef.current.y = d3.scaleLinear()
                .domain([0, d3.max(historicalData, d => d.y) * 1.05])
                .range([innerHeight, margin.current.top])
                .nice(12);
        }

        scalesRef.current.x = d3.scaleTime()
            .domain([d3.min(historicalData, d => d.x), d3.max(historicalData, d => d.x)])
            .range([margin.current.left, innerWidth]);
        // draw axis/label
        drawAxesAndLabels(svg, ySvg, scalesRef.current, innerHeight, innerWidth, range)

        //draw grid
        drawGrid(svg, scalesRef.current, innerWidth, innerHeight, margin.current);

        drawLineChart(d3, svg, scalesRef, tooltipRef, historicalData, innerHeight, lineColor, fillColor);

        // Indicator 
        indicatorChart[indicatorType](d3, svg, indicatorData, scalesRef.current.x, scalesRef.current.y);

        setDraw(true);

    }, [historicalData, lengthPerItem, fillColor, lineColor, indicatorType, indicatorData, isLogScale, range, height]);

    return (
        <div className="relative">
            <div className="flex gap-0">
                <div className="w-full max-w-[92vw] overflow-x-auto whitespace-nowrap hide-scrollbar">
                    <svg ref={svgRef} width={lengthPerItem * historicalData.length} height={height}>
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
                    transform: "translate(-50%, -100%)", // Position above the point 
                }}
            ></div>
            <LivePriceOverlay draw={draw} yScale={scalesRef.current.y} />
            <Flex className="overflow-visible items-center gap-4">
                <PopoverButton>
                    <button>{isLogScale}</button>
                    <Yscale setYscale={setYscale}></Yscale>
                </PopoverButton>
                <ZoomOverlay setLengthPerItem={setLengthPerItem} />
            </Flex>
        </div>
    )
};

export default LiveLineChart;
