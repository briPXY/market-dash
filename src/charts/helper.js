import * as d3 from "d3";

export const hoveredData = {};

export function convertOHLCtoD3(ohlcData) {
    return ohlcData.map(d => ({
        x: new Date(d.date), // Convert to JS Date object
        y: d.close // Use closing price for line chart
    }));
}

// Grabable element handler for xy scrolling
export function grabHandleMouseDown(e, el, setIsDown, setStart) {
    setIsDown(true);
    setStart({
        x: e.pageX - el.offsetLeft,
        y: e.pageY - el.offsetTop,
        scrollLeft: el.scrollLeft,
        scrollTop: el.scrollTop,
    });
}

export function grabHandleMouseLeave(setIsDown) {
    setIsDown(false);
}

export function grabHandleMouseUp(setIsDown) {
    setIsDown(false);
}

export function grabHandleMouseMove(e, el, isDown, start) {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const y = e.pageY - el.offsetTop;
    el.scrollLeft = start.scrollLeft - (x - start.x);
    el.scrollTop = start.scrollTop - (y - start.y);
}

export function chartSvgCleanup(svg) {
    svg.selectAll(".main").remove(); // Clears all elements with class "main" from previous charts/renderings
    svg.selectAll(".line-chart-path-specific").remove();
    svg.selectAll(".line-chart-circle-specific").remove();
    svg.selectAll(".line-chart-area-specific").remove();
    svg.selectAll('.tooltip-overlay').remove();
}

export function getBandXScale(historicalData, innerWidth) {
    return d3.scaleBand()
        .domain(historicalData.map(d => d.date))
        .range([0, innerWidth])
        .paddingInner(0.35) // 20% of band width is space between candles 
}

/**
 * Predicts the most left and most right visible indices of the OHLCData array
 * based on the current horizontal scroll position and chart dimensions.
 * 
 * @param {number} scrollLeft - The current horizontal scroll position (in px)
 * @param {number} viewWidth - The visible width of the chart container (in px)
 * @param {number} lengthPerItem - The width of each data item (in px)
 * @param {number} totalLength - The total number of data items (OHLCData.length)
 * @returns {{left: number, right: number}} - The most left and most right visible indices
 */
export function getVisibleIndices(scrollLeft, viewWidth, lengthPerItem, totalLength) {
    // Calculate the leftmost and rightmost visible indices
    const left = Math.max(0, Math.floor(scrollLeft / lengthPerItem));
    const right = Math.min(
        totalLength - 1,
        Math.ceil((scrollLeft + viewWidth) / lengthPerItem) - 1
    );
    return { left, right };
}

/**
 * Returns the visible index range based on the current X scroll position of an element.
 * The element should be a ref (useRef) from React (e.g., a chart container div).
 * 
 * @param {object} elementRef - The ref object pointing to the scrollable element (e.g., useRef from LiveChart)
 * @param {number} arrayLength - The total number of data items (OHLCData.length)
 * @returns {{left: number, right: number, scrollLeft: number, viewWidth: number, totalWidth: number}} - The left and right indices currently visible and scroll info
 */
export function getVisibleIndexRange(elementRef, arrayLength, padding = 200) {
    const el = elementRef.current;
    const scrollLeft = el.scrollLeft + el.scrollWidth; // Add scrollwidth because scroll stick right at initial render
    const clientWidth = el.clientWidth + padding;
    const scrollWidth = el.scrollWidth;
    const visibleItems = Math.round((clientWidth / scrollWidth) * arrayLength);

    const iRight = Math.round((scrollLeft / scrollWidth) * arrayLength);
    let iLeft = iRight - visibleItems;
    iLeft < 0 ? iLeft = 0 : iLeft;
    return { iLeft, iRight, scrollLeft, clientWidth, scrollWidth };
}

export function xyScaler(data, xValue, yValue, isLogScale = "LOG", innerWidth, innerHeight, margin) {
    if (!data){
        return;
    }

    let y;
    // console.log( OHLCData.length);
    if (isLogScale == "LOG") { 
        const min = d3.min(data, d => d[yValue]);
        const max = d3.max(data, d => d[yValue]);
        
        y = d3.scaleLinear()
            .domain([min, max])
            .range([innerHeight, margin.top])
            .nice();
    } else {
        const min = d3.min(data, d => d[yValue]);
        const max = d3.max(data, d => d[yValue]);
        y = d3.scaleLinear()
            .domain([min, max])
            .range([innerHeight, margin.top])
            .nice();
    }

    const x = d3.scaleTime()
        .domain([d3.min(data, d => d[xValue]), d3.max(data, d => d[xValue])])
        .range([margin.left, innerWidth]);

    return { x, y };
}

export function yIndicator(indicatorData, innerIndicatorHeight, valueTarget) {

    // Separate Y scale for indicators (e.g., MACD)
    let yIndicator = d3.scaleLinear()
        .domain([
            d3.min(indicatorData, d => d[valueTarget]),
            d3.max(indicatorData, d => d[valueTarget])
        ])
        .range([innerIndicatorHeight, 0])
        .nice();

    return yIndicator

}