import { useMemo } from "react"

export const ActiveIndicatorButtons = ({ showedIndicators, setShowedIndicators, className }) => {
    const indicatorNames = useMemo(() => Object.keys(showedIndicators), [showedIndicators]);

    const deleteIndicator = (name) => {
        const { [name]: _unused, ...rest } = showedIndicators;
        _unused 
        setShowedIndicators(rest);
    }
    return (
        <div className={`flex flex-wrap max-w-100 gap-2 z-20 ${className}`}>
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