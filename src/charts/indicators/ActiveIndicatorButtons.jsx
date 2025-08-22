import { useCallback, useMemo } from "react"
import { saveState } from "../../idb/stateDB";

export const ActiveIndicatorButtons = ({ svg, showedIndicators, setShowedIndicators, className, setSubIndicators, dbId }) => {
    const indicatorInfo = useMemo(() => {
        return Object.entries(showedIndicators).map(([name, values]) => {
            // pick only numeric values from the inner object
            const numbers = Object.values(values).filter(v => typeof v === "number");
            return [name, ...numbers];
        });
    }, [showedIndicators]);

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
                indicatorInfo.map((item) =>
                (
                    <div key={item[0]} className="flex gap-1 items-center text-[12px] md:text-xs p-1 rounded-sm border-washed">
                        <div style={{ backgroundColor: showedIndicators[item[0]].color, width: "4px", height: "4px", borderRadius: "3px" }}></div>
                        <div className="font-semibold">{item[0]}</div>
                        <div className="text-washed">{item.slice(1).join(" ")}</div>
                        <button onClick={() => deleteIndicator(item[0])} className="bg-primary-500 text-[10px] px-0.5 rounded-sm cursor-pointer">X</button>
                    </div>
                ))
            }
        </div>
    )
}