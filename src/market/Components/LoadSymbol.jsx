import { LoadingIcon } from "../../Layout/Elements"


export const LoadSymbol = ({ symbolStatus }) => {
    const symbolUndefined = {
        true: {},
        false: { display: "none" },
        null: { display: "none" },
    } 
    
    return (
        <div className="w-full bg-primary h-screen floating-modal" style={symbolUndefined[symbolStatus]}>
            <div className="h-14"></div>
            <div className="flex items-center rounded-lg mx-auto max-w-100 p-10">
                <div className="text-sm">Loading pools information</div>
                <LoadingIcon className="w-12 h-12"/>
            </div>
        </div>
    )
}