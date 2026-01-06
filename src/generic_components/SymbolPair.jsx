import { usePriceInvertStore } from "../stores/stores";

export const SymbolPair = ({ symbol0, symbol1, className = "" }) => {
    const invertedStatus = usePriceInvertStore((state) => state.priceInvert);
    return (
        <div className={className}>{
            invertedStatus ? `${symbol1} / ${symbol0}` :
                `${symbol0} / ${symbol1}`
        }</div>
    );
}