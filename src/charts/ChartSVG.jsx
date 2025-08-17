import React from "react";

export const ChartSvg = React.memo(({ svgRef, width, height }) => {
    return (
        <svg ref={svgRef} width={width} height={height}>
            <g className="y-axis" ></g>
            {/* Scrollable Chart Content (Grid, X-Axis, Lines, etc.) */}
            <g className="chart-content" ></g>
        </svg>
    );
});

ChartSvg.displayName = 'ChartSvg';