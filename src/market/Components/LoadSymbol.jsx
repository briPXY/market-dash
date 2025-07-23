import { LoadingIcon } from "../../Layout/Elements"


export const LoadSymbol = ({ symbolStatus }) => {
    const symbolUndefined = {
        true: {},
        false: { display: "none" },
        null: { display: "none" },
    } 
    
    return (
        <div className="bg-secondary floating-modal" style={symbolUndefined[symbolStatus]}>
            <div className="flex items-center rounded-lg pr-2 pl-8">
                <div className="text-xs md:text-sm">Loading pools information</div>
                <LoadingIcon className="w-12 h-12"/>
            </div>
        </div>
    )
}