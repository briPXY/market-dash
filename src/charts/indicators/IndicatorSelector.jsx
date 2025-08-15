import { useEffect, useRef, useState, useCallback } from "react"
import { ActiveIndicatorButtons } from "./ActiveIndicatorButtons";
import Button from "../../Layout/Elements";
import { isSavedStateExist, loadState, saveState } from "../../idb/stateDB";
import * as d3 from "d3";

export const IndicatorSelector = ({ data, svg, scale, bandXScale, indicatorList, outDimension, setSubIndicators, dbId, init }) => {
    const dropdownRef = useRef(null);

    const [showedIndicators, setShowedIndicators] = useState({});
    const [showSelector, setShowSelector] = useState(false);

    const drawIndicator = useCallback(
        (funcName, fn, param, color = "white") => {
            svg.select(`#${funcName}`).remove();
            svg.selectAll(`.${funcName}`).remove();
            const indicatorData = fn(d3, data, ...Object.values(param));
            fn.draw(d3, svg, indicatorData, scale, bandXScale, color, funcName, outDimension);
        },
        [svg, data, scale, bandXScale, outDimension] // Dependencies (make sure these are stable)
    );

    const addNewIndicator = useCallback((name, params) => {
        setShowedIndicators(prev => ({
            ...prev,
            [name]: params
        }));

        if (setSubIndicators) {
            setSubIndicators(prev => { 
                // No duplication
                if (prev.includes(name)) { 
                    return prev;
                } 
                return [...prev, name];
            });
        }
    }, [setSubIndicators]);

    // Update on data/state changes
    useEffect(() => {
        for (const name in showedIndicators) {
            let { color, fn, ...fnParams } = showedIndicators[name];
            // fn not saved on db 
            saveState(dbId, showedIndicators);
            data ? drawIndicator(name, fn, fnParams, color) : '';
        }

    }, [data, dbId, drawIndicator, indicatorList, showedIndicators]);

    // Handle outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowSelector(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Check if there are saved states
    useEffect(() => {
        async function check(id) {
            const checkSavedStates = await isSavedStateExist(id);

            if (checkSavedStates) {
                const savedState = await loadState(id);
                // Restore function reference
                for (const name in savedState) {
                    savedState[name].fn = indicatorList[name].fn;
                }
                setShowedIndicators(savedState);
                setSubIndicators ? setSubIndicators(Object.keys(savedState)) : null;
            }
            // No saved states, use starter indicators
            else {
                const fn = indicatorList[init].fn;
                const params = getParamsWithDefaults(fn);
                setShowedIndicators({ [init]: { fn: fn, color: fn.defaultCol, ...params } });
                setSubIndicators ? setSubIndicators([init]) : init;
            }
        }

        check(dbId)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <>
            <div className="flex gap-1">
                <Button onClick={() => setShowSelector(!showSelector)} className="text-[12px] gap-2">
                    <img className="w-2.5 h-2.5" src="/svg/g5.svg"></img>
                    <div>{outDimension ? "Sub" : "Main"}</div>
                </Button>
                <ActiveIndicatorButtons svg={svg} showedIndicators={showedIndicators} setShowedIndicators={setShowedIndicators} setSubIndicators={setSubIndicators} dbId={dbId} />
            </div>
            <div
                ref={dropdownRef}
                className={showSelector ? "floating-modal rounded-md flex items-start px-2 pb-6 z-50 flex-col gap-2 bg-primary-500 overflow-y-scroll max-h-[80vh] md:w-fit w-[95vw] border-primary-100" : "hidden"}>
                <div className="text-center w-full px-2 py-2 md:px-4 md:py-3 md:mb-5">{`Select ${dbId}:`}</div>
                {
                    Object.keys(indicatorList).map((name) => <IndicatorItem
                        key={name}
                        n={name}
                        fn={indicatorList[name].fn}
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
        <div key={n} className="flex text-xs border-washed border-solid p-1 md:p-2 rounded-sm h-fit items-start md:items-center py-2">
            <div className="flex gap-1 items-center">
                <div className="w-20 md:w-36 overflow-hidden text-sm font-medium text-left">{n}</div>
                <div className="text-xs cursor-pointer rounded-sm bg-primary-100 h-fit pb-1 pt-0.5 px-1.5" onClick={() => addNewIndicator(n, { color: color, fn: fn, ...param })}>Insert</div>
                <input className="w-5 p-0 border-none" type="color" value={color} onChange={(e) => setColor(e.target.value)} name="colorPicker"></input>
            </div>
            <div className="md:w-8 w-4"></div>
            <ListOfInput fParam={param} func={fn} drawIndicator={drawIndicator} updateParam={updateParam} />
        </div>
    )
}

const ListOfInput = ({ fParam, updateParam }) => {
    return (
        <div className="flex flex-col md:flex-row flex-wrap md:gap-4 gap-1 md:max-w-150">
            {Object.entries(fParam).map(([paramName, value]) => (
                <div className="flex flex-row justify-between md:justify-start items-center md:w-28 w-full gap-2" key={paramName}>
                    <label className="md:w-fit w-24 text-xs text-start" htmlFor="numInput">{`${paramName}:`}</label>
                    <input className="w-full bg-primary-900 font-medium p-1 rounded-xs" type="number" id="numInput" value={value} onChange={(e) => updateParam(paramName, e.target.value)} />
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