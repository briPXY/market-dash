import { useMemo } from "react";
import { Flex } from "../../Layout/Layout"
import { CardValueChange } from "./CardValueChange"
import { calculateHistoricalChange } from "../../utils/price.math";
import { use24HourQuery } from "../../queries/24hourQuery";
import { svg } from "../../Layout/svg";

export const Hour24Changes = ({ address, src }) => {

    const { data: hour24data, isLoading: hour24Loading } = use24HourQuery({
        poolAddress: address,
        network: src,
    });

    const priceChanges = useMemo(() => calculateHistoricalChange(hour24data), [hour24data]);

    if (hour24Loading) {
        return (
            <Flex className="items-center justify-center">
                <div>Loading 24 hours data</div>
                <svg.LoadingIcon className="w-12 h-12" />
            </Flex>
        )
    }

    return (
        <Flex className="gap-1 md:gap-10">
            <Flex className="flex-col md:flex-row gap-2 md:gap-10">
                <CardValueChange num={priceChanges.change} baseNum={0} text={`24h changes`} />
                <CardValueChange num={priceChanges.percent} baseNum={0} unit={'%'} text="changes" />
            </Flex>
            <Flex className="flex-col md:flex-row gap-2 md:gap-10">
                <CardValueChange num={priceChanges.low.toFixed(2)} baseNum={priceChanges.low + 100} text={`lowest 24h`} />
                <CardValueChange num={priceChanges.high.toFixed(2)} baseNum={0} text={`highest 24h`} />
            </Flex>
            <Flex className="flex-col md:flex-row gap-2 md:gap-10">
                <CardValueChange num={priceChanges.volume.toFixed(0)} text={`24h volume`} />
                <CardValueChange num={priceChanges.trades ? priceChanges.trades.toFixed(0) : "-"} text={`24h trades`} />
            </Flex>
        </Flex>
    );
}