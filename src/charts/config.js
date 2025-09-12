

export const chartDim = {
    margin: { top: 22, right: 5, bottom: 22, left: 5 },
    height: window.innerHeight * 0.42,
};

chartDim.innerHeight = chartDim.height - chartDim.margin.top - chartDim.margin.bottom;
chartDim.subIndicatorHeight = 150;

export const barPadding = 0.3;

export const Grid = {
    dashes: "3 6",
    color: "rgb(90,125,240,1)",
    thickness: 0.2,
    text:"rgb(255,255,255,0.7)"
}
