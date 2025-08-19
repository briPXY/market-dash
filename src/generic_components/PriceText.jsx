import { useMemo } from "react"
import { formatPrice } from "../utils/utils";
import { usePriceInvertStore } from "../stores/stores";

export function PriceText({ input, isRaw = false, className, style = {} }) {
    const invertedStatus = usePriceInvertStore((state) => state.priceInvert);

    const price = useMemo(() => {
        const priceString = invertedStatus ? (1 / input).toString() : input;
        return formatPrice(priceString, isRaw);
    }, [input, invertedStatus, isRaw]);

    return (
        <div className={className} style={style}>{price}</div>
    );
}