import { useCallback, useMemo } from "react"
import { saveState } from "../../idb/stateDB";

export const ActiveIndicatorButtons = ({svg, showedIndicators, setShowedIndicators, className, setSubIndicators, dbId }) => {
    const indicatorNames = useMemo(() => Object.keys(showedIndicators), [showedIndicators]);

    // delete a sub indicator
    const deleteSubindicator = useCallback((name) => {
        setSubIndicators(prev => prev.filter(subIndicator => subIndicator !== name));
    }, [setSubIndicators]);

    const deleteIndicator = (name) => {
        const { [name]: _unused, ...rest } = showedIndicators;
        _unused
        saveState(dbId, rest);
        setShowedIndicators(rest);
        svg.select(`#${name}`).remove();
        svg.selectAll(`.${name}`).remove(); 
        setSubIndicators ? deleteSubindicator(name) : name
    }

    return (
        <div className={`flex flex-wrap max-w-100 gap-2 ${className}`}>
            {
                indicatorNames.map((item) =>
                (
                    <div key={item} className="flex gap-2 items-center text-[12px] p-1 rounded-sm border-washed">
                        <div>{item}</div>
                        <div style={{ backgroundColor: showedIndicators[item].color, width: "6px", height: "2px" }}></div>
                        <div onClick={() => deleteIndicator(item)} className="bg-secondary text-[9px] px-0.5 rounded-sm cursor-pointer">X</div>
                    </div>
                ))
            }
        </div>
    )
}