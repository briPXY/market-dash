import { useEffect, useRef, useState, useCallback } from "react"
import { ActiveIndicatorButtons } from "./ActiveIndicatorButtons";
import Button from "../../Layout/Elements";
import { isSavedStateExist, loadState, saveState } from "../../idb/stateDB";

export const IndicatorSelector = ({ d3, data, svg, scale, bandXScale, indicatorList, outDimension, setSubIndicators, dbId, init }) => {
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
        [svg, d3, data, scale, bandXScale, outDimension] // Dependencies (make sure these are stable)
    );

    const addNewIndicator = useCallback((name, params) => {
        setShowedIndicators(prev => ({
            ...prev,
            [name]: params
        }));
        
        if (setSubIndicators) {
            setSubIndicators(prev => [...prev, name]);
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
                style={{
                    width: showSelector ? "100%" : "0px",
                    height: showSelector ? "100%" : "0px",
                }}
                ref={dropdownRef}
                className="rounded-md flex items-start py-6 z-50 flex-col gap-2 bg-secondary overflow-y-scroll max-w-[94vw] max-h-[60vh]">
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
        <div key={n} className="flex text-xs justify-start max-w-full items-center min-h-12 mx-2 md:mx-4 border-washed rounded-md p-2">
            <div className="w-14 md:w-28 overflow-hidden text-sm text-left">{n}</div>
            <div className="text-xs mr-1 cursor-pointer font-semibold" onClick={() => addNewIndicator(n, { color: color, fn: fn, ...param })}>Add</div>
            <input className="w-5 p-0 border-none" type="color" value={color} onChange={(e) => setColor(e.target.value)} name="colorPicker"></input>
            <div className="md:w-8 w-4"></div>
            <ListOfInput fParam={param} func={fn} drawIndicator={drawIndicator} updateParam={updateParam} />
        </div>
    )
}

const ListOfInput = ({ fParam, updateParam }) => {
    return (
        <div className="flex flex-wrap gap-1">
            {Object.entries(fParam).map(([oaramName, value]) => (
                <div className="flex flex-col items-start gap-0.5" key={oaramName}>
                    <label className="text-washed text-xs" htmlFor="numInput">{oaramName}</label>
                    <input className="bg-primary w-14 md:w-22 rounded-sm p-1" type="number" id="numInput" value={value} onChange={(e) => updateParam(oaramName, e.target.value)} />
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