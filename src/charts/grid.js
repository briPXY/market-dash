import * as d3 from "d3";

export function drawGrid(svg, scales, innerWidth, innerHeight) {
    // X grid lines with darker grid color (#ffffff1a)

    svg.selectAll(".grid").remove();

    svg.append("g")
        .attr("class", "grid")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(scales.x)
            .ticks(5)
            .tickSize(-innerHeight)
            .tickFormat("")
        )
        .selectAll("line")
        .style("stroke", "#ffffff1a")
        .style("stroke-width", 0.5)
        .attr("class", "grid");

    svg.append("g")
        .attr("class", "grid")
        .call(d3.axisLeft(scales.y)
            .tickSize(-innerWidth - 100)
            .tickFormat("")
        )
        .selectAll("line")
        .style("stroke", "#ffffff1a")
        .style("stroke-width", 0.5)
        .attr("class", "grid");
}

export function drawSubIndicatorGrid(svg, innerWidth, innerIndicatorHeight, margin, subIndicators) {
    if (subIndicators === 0) {
        svg.selectAll(".subGrid").remove();
        return;
    }

    const yIndicator = d3.scaleLinear()
        .domain([0, 100]) // <== Set fixed range here
        .range([innerIndicatorHeight, 0])
        .nice();

    svg.selectAll(".subGrid").remove();

    // Get the Y-axis domain for indicators (e.g., MACD)
    const yDomain = yIndicator.domain();
    const middleValue = 50; 

    // Y grid lines (for indicators)
    svg.append("g")
        .attr("class", "subGrid")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yIndicator)
            .tickValues([yDomain[0], middleValue, yDomain[1]])
            .tickSize(-innerWidth)
            .tickFormat("")
        )
        .selectAll("line")
        .style("stroke", "#ffffff1a")
        .style("stroke-width", 0.5)
        .attr("class", "subGrid");

    // Middle line in the sub-indicator panel
    svg.append("line")
    .attr("class", "subGrid")
    .attr("x1", 0)
    .attr("x2", innerWidth)
    .attr("y1", yIndicator(middleValue))  
    .attr("y2", yIndicator(middleValue))
    .style("stroke", "#ffffff80")
    .style("stroke-width", 0.5);
}
