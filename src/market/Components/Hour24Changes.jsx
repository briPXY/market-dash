import { useMemo } from "react";
import { Flex, SvgMemo } from "../../Layout/Layout"
import { CardValueChange } from "./CardValueChange"
import { calculateHistoricalChange } from "../../utils/price.math";
import { use24HourQuery } from "../../queries/24hourQuery";
import { LoadingIcon } from "../../Layout/svg";
import { usePriceInvertStore } from "../../stores/stores";
import { formatPrice, invertedHistoricalPrices } from "../../utils/utils";

export const Hour24Changes = ({ address, src }) => {
    const { data: hour24data, isLoading: hour24Loading } = use24HourQuery({
        poolAddress: address,
        network: src,
    });

    const invertedStatus = usePriceInvertStore((state) => state.priceInvert);

    const priceChanges = useMemo(() => {
        if (invertedStatus) {
            const invertedPrices = invertedHistoricalPrices(hour24data);
            return calculateHistoricalChange(invertedPrices);
        }
        return calculateHistoricalChange(hour24data);
    }, [hour24data, invertedStatus]);

    if (hour24Loading) {
        return (
            <Flex className="items-center justify-center">
                <div>Loading 24 hours data</div>
                <SvgMemo>
                    <LoadingIcon className="w-12 h-12" />
                </SvgMemo>
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
                <CardValueChange num={formatPrice(priceChanges.low.toString())} baseNum={priceChanges.low + 100} text={`lowest 24h`} />
                <CardValueChange num={formatPrice(priceChanges.high.toString())} baseNum={0} text={`highest 24h`} />
            </Flex>
            <Flex className="flex-col md:flex-row gap-2 md:gap-10">
                <CardValueChange num={formatPrice(priceChanges.volume.toString())} text={`24h volume`} />
                <CardValueChange num={priceChanges.trades ? priceChanges.trades.toFixed(0) : "-"} text={`24h trades`} />
            </Flex>
        </Flex>
    );
}