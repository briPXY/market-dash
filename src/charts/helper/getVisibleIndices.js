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
export function getVisibleIndexRange(elementRef, arrayLength, lengthPerItem, padding = 200) {
    if (!elementRef?.current || arrayLength <= 0 || lengthPerItem <= 0) {
        return { iLeft: 0, iRight: arrayLength - 1, scrollLeft: 0, chartWidth: 0, totalWidth: 0 };
    }

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

