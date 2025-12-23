import { useMemo } from "react";
import { CardValueChange } from "./CardValueChange"
import { calculateHistoricalChange } from "../../utils/price.math";
import { useAppInitStore, usePoolStore, usePriceInvertStore, useSourceStore } from "../../stores/stores";
import { formatPrice, invertedHistoricalPrices } from "../../utils/utils";
import { useQuery } from "@tanstack/react-query";

export const Hour24Changes = () => {
    const pairSymbols = usePoolStore(state => state.symbols);
    const initDone = useAppInitStore(state => state.initDone);

    const { data: hour24data } = useQuery({
        queryKey: ["24HourHistorical", pairSymbols],
        queryFn: async () => {
            try {
                const data = await useSourceStore.getState().data.h24Query(usePoolStore.getState(), useSourceStore.getState().src);
                return data; // Apply transformation if provided
            } catch (e) {
                console.error(e);
            }
        },
        refetchInterval: 310000, // Fetch every 5 minutes + secs
        staleTime: 310000, // Default: Cache data for 1 min
        enabled: pairSymbols !== "init" && !initDone,
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
        <div className="flex flex-col items-start md:flex-row md:gap-7">
            <CardValueChange num={priceChanges.change} baseNum={0} text={`24h Changes`} />
            <CardValueChange num={priceChanges.percent} baseNum={0} unit={'%'} text="Changes" />
            <CardValueChange num={formatPrice(priceChanges.low.toString())} baseNum={priceChanges.low + 100} text={`Low 24h`} />
            <CardValueChange num={formatPrice(priceChanges.high.toString())} baseNum={0} text={`High 24h`} />
            <CardValueChange num={formatPrice(priceChanges.volume.toString())} text={`24h Vol`} />
            <CardValueChange num={priceChanges.trades ? priceChanges.trades.toFixed(0) : "-"} text={`24h trades`} />
        </div>
    );
}