import { useRef } from "react"
import { candlestick } from "../../charts/charts/candlestick"
import { line } from "../../charts/charts/line"
import Button from "../../Layout/Elements"

export const ChartSelector = ({ setChart, activeChart }) => {
    const charts = useRef([
        { n: "Line Chart", f: line },
        { n: "Candlestick", f: candlestick },
    ]);

    return (
        <div className="bg-primary-500 border border-primary-300 p-1 py-4 gap-1 w-max flex flex-col rounded-md">
            {
                charts.current.map((chart) => (
                    <Button key={chart.n} onClick={() => setChart(chart)} className={`w-full px-2 gap-2 justify-start ${activeChart == chart.n ? "bg-primary-100 text-primary" : "border-none"}`}>
                        <img className="w-3 h-3 invert" src={`/svg/${chart.n}.svg`} />
                        <div className="text-sm">{chart.n}</div>
                    </Button>
                ))
            }
        </div>
    )
}