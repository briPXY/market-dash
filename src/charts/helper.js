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
