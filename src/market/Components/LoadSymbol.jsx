

export const LoadSymbol = ({ symbolStatus }) => {
    const symbolUndefined = {
        true: {},
        false: { display: "none" }
    } 
    
    return (
        <div className="w-full bg-primary h-screen floating-modal" style={symbolUndefined[symbolStatus]}>
            <div className="h-14"></div>
            <div className="flex flex-col gap-3 rounded-lg mx-auto max-w-100 p-10">
                <div className="text-sm">Loading symbols...</div>
            </div>
        </div>
    )
}