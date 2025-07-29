export function SwapTokenInfo({ tokenName, label }) { 
    return (
        <div className="flex gap-1 items-end justify-between w-full text-sm">
            <div className="">{label}</div>
            <div className="text-washed">{tokenName}</div>
        </div>
    );
}