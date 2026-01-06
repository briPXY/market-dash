import { useQuery } from "@tanstack/react-query";
import { timeFrameToMs } from "../constants/constants.js";
import { useMemo } from "react";
import { initData } from "../constants/initData.js";
import { MissingAPIKeyError } from "../constants/environment.js";
import { usePoolStore, useSourceStore } from "../stores/stores.js";
import { GetKey, loadState, QueryCacheDB, saveState } from "../idb/stateDB.js";
import { invertedHistoricalPricesMutate } from "../utils/utils.js";

/**
 * Custom React Query hook to fetch and process candlestick data.
 * @param {string} apiUrl - The API URL to fetch data from.
 * @param {Function} transformFn - data transform function
 * @returns {Object} - Query result from React Query.
 */
const useChartQuery = ({ interval, symbolStoreObj }) => {
    const symbols = usePoolStore(state => state.symbols);
    const priceSource = useSourceStore((state) => state.src);
    const queryKey = useMemo(() => ["mainchart", symbols, interval, priceSource], [symbols, interval, priceSource]);
    const initialData = useMemo(() => { return initData }, []);

    const cacheTime = useMemo(() => {
        const twoDays = 48 * 60 * 60 * 1000;
        const halfInterval = timeFrameToMs[interval] >= 360000 ? timeFrameToMs[interval] / 2 : timeFrameToMs[interval];
        return Math.min(halfInterval, twoDays);
    }, [interval]);

    return useQuery({
        queryKey: queryKey,
        queryFn: async () => {
            try {
                let data, samplePrice;
                let shouldReversed = false; // reverse to follow order of fetch price (real order from contract call)
                let tickPrice = await loadState(GetKey.tickSample(priceSource, symbols));
                const cachedData = await QueryCacheDB.getItem("price_query_cache", queryKey);

                if (!cachedData) {
                    data = await useSourceStore.getState().data.ohlcFetch(symbolStoreObj, interval, priceSource);
                    if (!data.ohlc || data.ohlc.length <= 1) throw new Error("No data is retrieved");
                    samplePrice = Number(data.ohlc[0].close);
                }
                else {
                    samplePrice = Number(cachedData.ohlc[0].close);
                }

                if (!tickPrice) {
                    tickPrice = await useSourceStore.getState().data.fetchPrice(usePoolStore.getState());
                }

                // decide if data should reversed or not
                if (Number(tickPrice)) {
                    await saveState(GetKey.tickSample(priceSource, symbols), Number(tickPrice));
                    shouldReversed = Number(tickPrice) < 1 && samplePrice > 1 || Number(tickPrice) > 1 && samplePrice < 1;
                }

                if (shouldReversed) { // reverse original rate on the data
                    invertedHistoricalPricesMutate(cachedData ? cachedData.ohlc : data.ohlc);
                }

                if (!cachedData && data.ohlc.length > 1) {
                    data.symbols = symbols;
                    await QueryCacheDB.setItem("price_query_cache", queryKey, data, cacheTime);
                    return data;
                }

                return cachedData;
            } catch (err) {console.error(err)
                if (err instanceof MissingAPIKeyError) {
                    throw new MissingAPIKeyError(err.message);
                }
                throw new Error("Historical data query is not responded")
            }
        },
        refetchInterval: timeFrameToMs[interval],
        staleTime: cacheTime,
        notifyOnChangeProps: ['data', 'error'], // This ignores the 'isFetching' transition during background polling
        placeholderData: (prev) => prev !== undefined ? prev : initialData,
        enabled: () => Boolean(symbols && symbols != "init" && priceSource),
        retry: 0,
    });
};


export { useChartQuery };
