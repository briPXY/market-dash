import { useMemo } from "react";
import { Flex } from "../../Layout/Layout"
import { CardValueChange } from "./CardValueChange"
import { calculateHistoricalChange } from "../../utils/price.math";
import { usePoolStore, usePriceInvertStore, useSourceStore } from "../../stores/stores";
import { formatPrice, invertedHistoricalPrices } from "../../utils/utils";
import { useQuery } from "@tanstack/react-query";

export const Hour24Changes = () => {
    const pairSymbols = usePoolStore(state => state.symbols);
    const priceSource = useSourceStore(state => state.data)

    const { data: hour24data, isLoading } = useQuery({
        queryKey: [priceSource, pairSymbols],
        queryFn: async () => {
            try {
                const data = await priceSource.h24Query(usePoolStore.getState(), useSourceStore.getState().src);
                return data; // Apply transformation if provided
            } catch (e) {
                console.error(e);
            }
        },
        refetchInterval: 310000, // Fetch every 5 minutes + secs
        staleTime: 310000, // Default: Cache data for 1 min
        enabled: pairSymbols !== "init",
        retry: 0,
    });

    const invertedStatus = usePriceInvertStore((state) => state.priceInvert);

    const priceChanges = useMemo(() => {
        if (invertedStatus) {
            const invertedPrices = invertedHistoricalPrices(hour24data);
            return calculateHistoricalChange(invertedPrices);
        }
        return calculateHistoricalChange(hour24data);
    }, [hour24data, invertedStatus]);

    return (
        <Flex className="gap-1 md:gap-10">
            <Flex className="flex-col md:flex-row gap-2 md:gap-10">
                {isLoading && <div className="text-xs">Loading...</div>}
                <CardValueChange num={priceChanges.change} baseNum={0} text={`24h changes`} />
                <CardValueChange num={priceChanges.percent} baseNum={0} unit={'%'} text="changes" />
            </Flex>
            <Flex className="flex-col md:flex-row gap-2 md:gap-10">
                <CardValueChange num={formatPrice(priceChanges.low.toString())} baseNum={priceChanges.low + 100} text={`Lowest 24h`} />
                <CardValueChange num={formatPrice(priceChanges.high.toString())} baseNum={0} text={`highest 24h`} />
            </Flex>
            <Flex className="flex-col md:flex-row gap-2 md:gap-10">
                <CardValueChange num={formatPrice(priceChanges.volume.toString())} text={`24h volume`} />
                <CardValueChange num={priceChanges.trades ? priceChanges.trades.toFixed(0) : "-"} text={`24h trades`} />
            </Flex>
        </Flex>
    );
}