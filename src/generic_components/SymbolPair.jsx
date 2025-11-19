import { usePriceInvertStore } from "../stores/stores";
import { useSourceStore } from "../stores/stores";
import { SourceConst } from "../constants/sourceConst";

export const SymbolPair = ({ poolAddress, className = "" }) => {
    const src = useSourceStore(state => state.src);
    const invertedStatus = usePriceInvertStore((state) => state.priceInvert);

    return (
        <div className={className}>{
            invertedStatus ? `${SourceConst[src].info[poolAddress].token0.symbol} / ${SourceConst[src].info[poolAddress].token1.symbol}` :
                `${SourceConst[src].info[poolAddress].token1.symbol} / ${SourceConst[src].info[poolAddress].token0.symbol}`
        }</div>
    );
}