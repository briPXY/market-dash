

export const chartDim = {
    margin: { top: 15, right: 5, bottom: 0, left: 5 },
    containerHeight: (screen.height * window.devicePixelRatio) * 0.60,
    extraLeft: 100,
};

chartDim.subIndicatorHeight = 150;

export const barPadding = 0.3;

export const subIndicatorMargin = { top: 0, right: chartDim.margin.right, bottom: 0, left: chartDim.margin.left }

// Also define max subindicators on a chart
export const subIndHeight = {
    0: 0,
    1: chartDim.containerHeight * 0.22,
    2: chartDim.containerHeight * 0.19,
    3: chartDim.containerHeight * 0.15,
}

export const Grid = {
    dashes: "3 6",
    color: "rgb(90,125,240,1)",
    thickness: 0.2,
    text: "rgb(255,255,255,0.7)"
}

