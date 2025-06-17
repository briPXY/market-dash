import { useMemo } from "react";
import { Flex } from "../../Layout/Layout"
import { CardValueChange } from "./CardValueChange"
import { calculateHistoricalChange } from "../../utils/pricechanges";

export const Hour24Changes = ({ hour24data }) => {
    const priceChanges = useMemo(() => calculateHistoricalChange(hour24data), [hour24data]); 
    
    return (
        <Flex className="gap-2 md:gap-7">
            <Flex className="flex-col gap-2 md:gap-4">
                <CardValueChange num={priceChanges.change} baseNum={0} text={`24h changes`} />
                <CardValueChange num={priceChanges.percent} baseNum={0} unit={'%'} text="changes" />
            </Flex>
            <Flex className="flex-col gap-2 md:gap-4">
                <CardValueChange num={priceChanges.low.toFixed(2)} baseNum={priceChanges.low + 100} text={`lowest 24h`} />
                <CardValueChange num={priceChanges.high.toFixed(2)} baseNum={0} text={`highest 24h`} />
            </Flex>
            <Flex className="flex-col gap-2 md:gap-4">
                <CardValueChange num={priceChanges.volume.toFixed(0)} text={`24h volume`} />
                <CardValueChange num={priceChanges.trades ? priceChanges.trades.toFixed(0) : "-"} text={`24h trades`} />
            </Flex>
        </Flex>
    );
}