import { Text } from "../../Layout/elements"
import usePriceStore from "../../stores/stores";

export const LivePriceText = () => {
    const tradePrice = usePriceStore((state) => state.trade);
    
    return (<Text as="h4" className="text-green-600">{tradePrice}</Text>)
}