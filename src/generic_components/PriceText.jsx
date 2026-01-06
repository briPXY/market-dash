import { useMemo } from "react"
import { formatPrice } from "../utils/utils";
import { usePriceInvertStore } from "../stores/stores";

export function PriceText({ input, isRaw = false, className, style = {} }) {
    const invertedStatus = usePriceInvertStore((state) => state.priceInvert);

    const price = useMemo(() => {
        if (!input) return '-';
        const priceString = invertedStatus ? (1 / input).toString() : input.toString();
        return formatPrice(priceString, isRaw);
    }, [input, invertedStatus, isRaw]);

    return (
        <div className={className} style={style}>{price}</div>
    );
}