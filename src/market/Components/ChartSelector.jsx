import { useRef } from "react"
import { candlestick } from "../../charts/charts/candlestick"
import { line } from "../../charts/charts/line"
import Button from "../../Layout/elements"

export const ChartSelector = ({ setChart, activeChart }) => {
    const charts = useRef([
        { n: "Line Chart", f: line },
        { n: "Candlestick", f: candlestick },
    ]);

    return (
        <div className="bg-secondary p-4 pb-8 flex flex-col gap-2 text-sm rounded-md">
            {
                charts.current.map((chart) => (
                    <Button key={chart.n} onClick={() => setChart(chart)} className={`w-32 gap-2 justify-start ${activeChart == chart.n ? "border-active" : "border-washed"}`}>
                        <img className="w-4 h-4 invert" src={`/svg/${chart.n}.svg`} />
                        <div>{chart.n}</div>
                    </Button>
                ))
            }
        </div>
    )
}