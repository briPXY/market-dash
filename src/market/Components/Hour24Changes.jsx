import { useMemo } from "react";
import { CardValueChange } from "./CardValueChange"
import { calculateHistoricalChange } from "../../utils/price.math";
import { useAppInitStore, usePoolStore, usePriceInvertStore, useSourceStore } from "../../stores/stores";
import { formatPrice, invertedHistoricalPrices, invertedHistoricalPricesMutate } from "../../utils/utils";
import { useQuery } from "@tanstack/react-query";
import { GetKey, loadState, QueryCacheDB, saveState } from "../../idb/stateDB";

export const Hour24Changes = () => {
    const pairSymbols = usePoolStore(state => state.symbols);
    const initDone = useAppInitStore(state => state.initDone);

    const { data: hour24data } = useQuery({
        queryKey: ["24HourHistorical", pairSymbols],
        queryFn: async () => {
            try {
                let data, samplePrice;
                let shouldReversed = false; // reverse to follow order of fetch price (real order from contract call)
                let tickPrice = await loadState(GetKey.tickSample(useSourceStore.getState().src, pairSymbols));

                const dbKey = ["24HourHistorical", useSourceStore.getState().src, pairSymbols];
                const cachedData = await QueryCacheDB.getItem("price_query_cache", dbKey);
                
                if (!cachedData) {
                    data = await useSourceStore.getState().data.h24Query(usePoolStore.getState(), useSourceStore.getState().src);
                    if (!data || data.length <= 1) throw new Error("No data is retrieved");
                    samplePrice = Number(data[0].close);
                }
                else {
                    samplePrice = Number(cachedData[0].close);
                }

                if (!tickPrice) {
                    tickPrice = await useSourceStore.getState().data.fetchPrice(usePoolStore.getState());
                }
                
                // decide if data should reversed or not
                if (Number(tickPrice)) {
                    await saveState(GetKey.tickSample(useSourceStore.getState().src, pairSymbols), Number(tickPrice));
                    shouldReversed = Number(tickPrice) < 1 && samplePrice > 1 || Number(tickPrice) > 1 && samplePrice < 1;
                }

                if (shouldReversed) { // reverse original rate on the data
                    invertedHistoricalPricesMutate(cachedData ? cachedData : data);
                }

                if (!cachedData && data.length > 1) {
                    await QueryCacheDB.setItem("price_query_cache", dbKey, data, 21600000); // Cache 24h data for 6 hour
                    return data;
                }

                return cachedData;
            } catch (e) {
                console.error(e, pairSymbols);
            }
        },
        refetchInterval: 310000, // Fetch every 5 minutes + secs
        staleTime: 310000, // Default: Cache data for 1 min
        enabled: pairSymbols !== "init" && initDone,
        retry: 0,
    });

    const invertedStatus = usePriceInvertStore((state) => state.priceInvert);

    const priceChanges = useMemo(() => {
        if (invertedStatus && hour24data) {
            const invertedPrices = invertedHistoricalPrices(hour24data);
            return calculateHistoricalChange(invertedPrices);
        }
        return calculateHistoricalChange(hour24data);
    }, [hour24data, invertedStatus]);

    return (
        <div className="flex flex-col items-start md:flex-row gap-2 md:gap-7">
            <CardValueChange num={priceChanges.change} baseNum={0} text={`24h Changes`} />
            <CardValueChange num={priceChanges.percent} baseNum={0} unit={'%'} text="Changes" />
            <CardValueChange num={formatPrice(priceChanges.low.toString())} baseNum={priceChanges.low + 100} text={`Low 24h`} />
            <CardValueChange num={formatPrice(priceChanges.high.toString())} baseNum={0} text={`High 24h`} />
            <CardValueChange num={formatPrice(priceChanges.volume.toString())} text={`24h Vol`} />
            <CardValueChange num={priceChanges.trades ? priceChanges.trades.toFixed(0) : "-"} text={`24h trades`} />
        </div>
    );
}