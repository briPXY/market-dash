import { useEffect, useRef, useMemo } from "react";
import * as d3 from "d3";
import { indicator, indicatorChart } from "./indicators"; 
import LivePriceOverlay from "./overlays/LivePriceOverlay";
import { drawGrid } from "./grid";
import { drawAxesAndLabels } from "./axis";

const LiveLineChart = ({
    width = 600,
    height = 300,
    fillColor = "rgba(12,176,133,0.1)",
    lineColor = "#0cb085",
    historicalData,
    indicatorType,
    indicatorMethod,
    isLogScale,
    livePrice,
    range,
}) => {
    const svgRef = useRef(null);
    const tooltipRef = useRef(null);
    const scalesRef = useRef({
        x: () => {},
        y: () => {},
      });
  
    const indicatorData = useMemo(() => indicator[indicatorMethod](d3, historicalData), [historicalData, indicatorMethod]);
 
    useEffect(() => {
        if (historicalData.length < 2) return;

        const svg = d3.select(svgRef.current);
        const margin = { top: 20, right: 30, bottom: 30, left: 50 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        // Conditionally create Y scale: logarithmic or linear.

        if (isLogScale) {
            // Ensure the lower bound is > 0 for log scale.
            const minY = d3.min(historicalData, d => d.y);
            const safeMin = minY > 0 ? minY : 1;
            scalesRef.current.y = d3.scaleLog()
                .domain([safeMin, d3.max(historicalData, d => d.y) * 1.05])
                .range([innerHeight, margin.top]);
        } else {
            scalesRef.current.y = d3.scaleLinear()
                .domain([0, d3.max(historicalData, d => d.y) * 1.05])
                .range([innerHeight, margin.top])
                .nice(12);
        }

        scalesRef.current.x = d3.scaleTime()
            .domain([d3.min(historicalData, d => d.x), d3.max(historicalData, d => d.x)])
            .range([margin.left, innerWidth]);

        // Generate exactly 12 ticks for the Y axis. 

        const line = d3.line()
            .x(d => scalesRef.current.x(d.x))
            .y(d => scalesRef.current.y(d.y))
            .curve(d3.curveMonotoneX);

        const area = d3.area()
            .x(d => scalesRef.current.x(d.x))
            .y0(innerHeight)
            .y1(d => scalesRef.current.y(d.y))
            .curve(d3.curveMonotoneX);

        svg.selectAll("*").remove();

        // draw axis/label
        drawAxesAndLabels(svg, scalesRef.current, innerWidth, innerHeight, margin, range)

        //draw grid
        drawGrid(svg, scalesRef.current, innerWidth, innerHeight, margin); 

        // Draw area
        svg.append("path")
            .datum(historicalData)
            .attr("class", "area")
            .attr("fill", fillColor)
            .attr("d", area);

        // Draw line
        svg.append("path")
            .datum(historicalData)
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke", lineColor)
            .attr("stroke-width", 2)
            .attr("d", line);

        const tooltip = d3.select(tooltipRef.current); // Select tooltip inside the component

        svg.selectAll(".circle")
            .data(historicalData)
            .enter()
            .append("circle")
            .attr("class", "circle")
            .attr("cx", d => scalesRef.current.x(d.x))
            .attr("cy", d => scalesRef.current.y(d.y))
            .attr("r", 3)
            .attr("fill", lineColor)
            .on("mouseover", (event, d) => {
                tooltip.style("opacity", 1)
                    .html(`time: ${d3.timeFormat("%H:%M:%S")(d.x)}<br/>price: ${d.y}`)
                    .style("left", `${event.offsetX}px`)
                    .style("top", `${event.offsetY}px`);
            })
            .on("mouseout", () => {
                tooltip.style("opacity", 0);
            });

        // Indicator 
        indicatorChart[indicatorType](d3, svg, indicatorData, scalesRef.current.x, scalesRef.current.y);

    }, [historicalData, width, height, fillColor, lineColor, indicatorType, indicatorData, isLogScale, range]);


    return (
        <div className="relative">
            <svg ref={svgRef} width={width} height={height}></svg>
            <div
                ref={tooltipRef}
                className="tooltip"
                style={{
                    position: "absolute",
                    opacity: 0,
                    background: "#111", 
                    padding: "4px",
                    pointerEvents: "none",
                    transform: "translate(-50%, -100%)", // Position above the point
                    whiteSpace: "nowrap",
                }}
            ></div>
            {livePrice && <LivePriceOverlay livePrice={livePrice} width={width} height={height} yScale={scalesRef.current.y} />}
        </div>
    )
};

export default LiveLineChart;
