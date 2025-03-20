import { useEffect, useRef, useState, useCallback } from "react"
import { ActiveIndicatorButtons } from "./ActiveIndicatorButtons";
import Button from "../../Layout/elements";

export const IndicatorSelector = ({ d3, data, svg, scale, indicatorList, outDimension, setSubIndicators }) => {
    const activeIndicators = useRef({});
    const dropdownRef = useRef(null);

    const [showedIndicators, setShowedIndicators] = useState({});
    const [showSelector, setShowSelector] = useState(false);

    const addNewIndicator = (name, params) => {
        setShowedIndicators(prev => ({
            ...prev,
            [name]: params
        }));
        activeIndicators.current[name] = params;
        const { color, fn, ...fnParam } = params;
        drawIndicator(name, fn, fnParam, color);
        setSubIndicators ? setSubIndicators(prev => [...prev, name]) : name;
    };

    const deleteSubindicator = useCallback((name) => {
        setSubIndicators(prev => prev.filter(subIndicator => subIndicator !== name));
    }, [setSubIndicators]);

    const drawIndicator = useCallback(
        (funcName, fn, param, color = "white") => {
            svg.select(`#${funcName}`).remove();
            svg.selectAll(`.${funcName}`).remove();
            const indicatorData = fn(d3, data, ...Object.values(param));
            fn.draw(d3, svg, indicatorData, scale, color, funcName, outDimension);
        },
        [svg, d3, data, scale, outDimension] // Dependencies (make sure these are stable)
    );

    // delete listener
    useEffect(() => {
        for (const name in activeIndicators.current) {
            if (!Object.prototype.hasOwnProperty.call(showedIndicators, name)) {
                svg.select(`#${name}`).remove();
                svg.selectAll(`.${name}`).remove();
                delete activeIndicators.current[name];
                setSubIndicators ? deleteSubindicator(name) : name;
            }
        }
    }, [deleteSubindicator, setSubIndicators, showedIndicators, svg]);
 

    // update on data changes
    useEffect(() => {
        for (const name in activeIndicators.current) {
            const { color, fn, ...fnParams } = activeIndicators.current[name];
            data ? drawIndicator(name, fn, fnParams, color) : '';
        }

    }, [data, drawIndicator]);

    // handle outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowSelector(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <>
            <div className="flex gap-1">
                <Button onClick={() => setShowSelector(!showSelector)} className="text-[12px]">{outDimension ? "Sub" : "Main"}</Button>
                <ActiveIndicatorButtons showedIndicators={showedIndicators} setShowedIndicators={setShowedIndicators} />
            </div>
            <div
                style={{
                    width: showSelector ? "100%" : "0px",
                    height: showSelector ? "100%" : "0px",
                }}
                ref={dropdownRef}
                className="rounded-md flex items-start py-6 z-20 flex-col gap-2 bg-secondary overflow-y-scroll max-h-[60vh]">
                {
                    indicatorList.map(({ n, fn }) => <IndicatorItem
                        key={n}
                        n={n}
                        fn={fn}
                        data={data}
                        addNewIndicator={addNewIndicator}
                    />)
                }
            </div>
        </>
    )
}

const IndicatorItem = ({ n, fn, drawIndicator, addNewIndicator }) => {
    const [param, setParam] = useState(getParamsWithDefaults(fn));
    const [color, setColor] = useState(fn.defaultCol);

    const updateParam = (prop, value) => {
        setParam((prev) => ({ ...prev, [prop]: value }));
    };

    return (
        <div key={n} className="flex text-xs items-center min-h-12 mx-4 border-washed rounded-md px-2">
            <div className="w-20 md:w-28 overflow-hidden text-sm font-semibold text-left">{n}</div>
            <div className="w-6 md:w-14 text-xs cursor-pointer font-semibold" onClick={() => addNewIndicator(n, { color: color, fn: fn, ...param })}>Add</div>
            <input className="w-5 p-0 border-none" type="color" value={color} onChange={(e) => setColor(e.target.value)} name="colorPicker"></input>
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
                    <label className="text-washed text-xs" htmlFor="numInput">{key}</label>
                    <input className="bg-primary w-14 md:w-22 rounded-sm p-1" type="number" id="numInput" value={value} onChange={(e) => updateParam(key, e.target.value)} />
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