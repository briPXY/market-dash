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
                className={showSelector ? "floating-modal rounded-md flex items-start px-2 pb-6 z-50 flex-col gap-2 bg-primary-500 overflow-y-scroll max-h-[80vh] md:max-w-110 w-[95vw] border-primary-100" : "hidden"}>

                <div className="text-center px-2 py-2 w-full md:px-4 md:py-3 md:mb-5">{`Select ${dbId}:`}</div>
                {
                    Object.keys(indicatorList).map((abbreviation) => <IndicatorItem
                        key={abbreviation}
                        abbreviation={abbreviation}
                        name={indicatorList[abbreviation].name}
                        fn={indicatorList[abbreviation].fn}
                        data={data}
                        addNewIndicator={addNewIndicator}
                    />)
                }
            </div>
        </>
    )
}

const IndicatorItem = ({ abbreviation, name, fn, drawIndicator, addNewIndicator }) => {
    const [param, setParam] = useState(getParamsWithDefaults(fn));
    const [color, setColor] = useState(fn.defaultCol);
    const [showOpt, setShowOpt] = useState(false);

    const updateParam = (prop, value) => {
        setParam((prev) => ({ ...prev, [prop]: value }));
    };

    return (
        <div key={abbreviation} className="flex flex-col text-xs p-1 md:p-2 gap-2 rounded-sm w-full items-start md:items-center py-2">
            <div className="flex gap-1 justify-between items-center w-full">
                <div className="flex-col w-[55%] break-words">
                    <div className="overflow-hidden text-sm font-semibold text-left">{abbreviation}</div>
                    <div className="text-xs text-washed font-light text-left"><i>{name}</i></div>
                </div>
                <div className="flex gap-1 h-full items-center">
                    <input className="w-5 h-4 border-none cursor-pointer" type="color" value={color} onChange={(e) => setColor(e.target.value)} name="colorPicker"></input>
                    <button className="text-xs cursor-pointer rounded-sm h-full p-1.5 border-1 box-border border-washed-dim" onClick={() => setShowOpt(!showOpt)}>Options</button>
                    <button className="text-xs cursor-pointer rounded-sm bg-washed-dim p-1.5" onClick={() => addNewIndicator(abbreviation, { color: color, fn: fn, ...param })}>Insert</button>
                </div>
            </div>
            <ListOfInput fParam={param} drawIndicator={drawIndicator} updateParam={updateParam} style={{ display: showOpt ? "flex" : "none" }} />
        </div>
    )
}

const ListOfInput = ({ fParam, updateParam, ...rest }) => {
    return (
        <div className="flex w-full flex-wrap md:gap-3 gap-2 mb-1" {...rest}>
            {Object.keys(fParam).length === 0 && <div className="text-washed text-sm"><i>No parameter</i></div>}
            {Object.entries(fParam).map(([paramName, value]) => (
                <div className="flex flex-row justify-between md:justify-start items-center gap-1 " key={paramName}>
                    <label className=" text-sm text-start " htmlFor="numInput">{`${paramName}:`}</label>
                    <input className="w-10 bg-primary-900 p-1 rounded-xs" type="number" value={value} onChange={(e) => updateParam(paramName, e.target.value)} />
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