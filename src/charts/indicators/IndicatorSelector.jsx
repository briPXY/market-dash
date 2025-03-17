import { useEffect, useRef, useState } from "react"
import { indicatorList } from "./indicatorList"

export const IndicatorSelector = ({ d3, data, svg, scale, showedIndicators, setShowedIndicators }) => {
    const [names, setNames] = useState([]);

    const drawIndicator = (funcName, func, param, redraw, color = "white") => {

        if (redraw == "redraw") {
            svg.select(`#${funcName}`).remove();
            const indicatorData = func(d3, data, Object.values(param));
            func.draw(d3, svg, indicatorData, scale.x, scale.y, color, funcName);

            showedIndicators.funcName = { color: color, ...param };
            setShowedIndicators(showedIndicators);
            return
        }

        if (names.includes(funcName)) return

        const newNames = names.concat(funcName);
        setNames(newNames);

        const indicatorData = func(d3, data, Object.values(param));
        func.draw(d3, svg, indicatorData, scale.x, scale.y, color, funcName);

        showedIndicators.funcName = { color: color, ...param };
        setShowedIndicators(showedIndicators);
    }

    return (
        <div className="rounded-md px-6 flex items-start py-8 flex-col gap-2 bg-secondary overflow-y-scroll w-fit max-h-[60vh]">
            {
                indicatorList.map(({ n, fn }) => <IndicatorItem key={n} n={n} fn={fn} drawIndicator={drawIndicator} data={data} />)
            }
        </div>
    )
}

const IndicatorItem = ({ n, fn, drawIndicator, data }) => {
    const [param, setParam] = useState(getParamsWithDefaults(fn));
    const active = useRef(false);
    const color = useRef(fn.defaultCol)

    const updateParam = (prop, value) => {
        setParam((prev) => ({ ...prev, [prop]: value }));
    };

    const clickHandler = () => {
        drawIndicator(n, fn, param, false, color.current);
        active.current = true;
    } 

    useEffect(() => {
        if (active.current == true) {
            drawIndicator(n, fn, param, "redraw", color.current);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, drawIndicator, fn, n])

    return (
        <div key={n} className="flex text-xs items-center min-h-12 border-washed rounded-md px-2">
            <div className="w-20 md:w-28 overflow-hidden text-sm font-semibold text-left">{n}</div>
            <div className="w-6 md:w-14 text-xs cursor-pointer font-semibold" onClick={() => clickHandler()}>Add</div>
            <input className="w-5 p-0 border-none" type="color" value={color.current} onChange={(e) => color.current = e.target.value} name="colorPicker"></input>
            <div className="md:w-8 w-4"></div>
            <ListOfInput fParam={param} func={fn} drawIndicator={drawIndicator} updateParam={updateParam} />
        </div>
    )
}

const ListOfInput = ({ fParam, updateParam }) => {
    return (
        <div className="flex gap-1">
            {Object.entries(fParam).map(([key, value]) => (
                <div className="flex flex-col items-start" key={key}>
                    <label className="text-washed" htmlFor="numInput">{key}</label>
                    <input className="bg-primary w-14 md:w-22 p-1" type="number" id="numInput" value={value} onChange={(e) => updateParam(key, e.target.value)} />
                </div>
            ))}
        </div>
    )
}

function getParamsWithDefaults(func) {
    const match = func.toString().match(/\(([^)]*)\)/);
    if (!match) return {};

    return match[1]
        .split(',')
        .map(p => p.trim())
        .filter(p => p) // Remove empty values
        .slice(2) // Exclude the first two parameters
        .reduce((acc, param) => {
            const [name, defaultValue] = param.split('=').map(p => p.trim());
            acc[name] = defaultValue !== undefined ? eval(defaultValue) : null;
            return acc;
        }, {});
}