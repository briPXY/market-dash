import { useMemo } from "react"
import { formatPrice } from "../utils/utils";

export function PriceText({ input, isRaw = false, className, style = {} }) {
    const price = useMemo(() => {
        return formatPrice(input, isRaw);
    }, [input, isRaw]);

    return (
        <div className={className} style={style}>{price}</div>
    );
}