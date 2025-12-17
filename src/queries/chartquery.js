import { useQuery } from "@tanstack/react-query";
import { timeFrameToMs } from "../constants/constants.js";
import { useMemo } from "react";
import { initData } from "../constants/initData.js";
import { MissingAPIKeyError } from "../constants/environment.js";
import { useSourceStore } from "../stores/stores.js";
/**
 * Custom React Query hook to fetch and process candlestick data.
 * @param {string} apiUrl - The API URL to fetch data from.
 * @param {Function} transformFn - data transform function
 * @returns {Object} - Query result from React Query.
 */
const useChartQuery = ({ symbols, interval, initState, symbolStoreObj }) => {

    const queryKey = useMemo(() => ["mainchart", symbols, interval], [symbols, interval]);
    const initialData = useMemo(() => { return initData }, [])

    return useQuery({
        queryKey: queryKey,
        //enabled: !address,
        queryFn: async () => {
            try {
                if (initState || !useSourceStore.getState().src) return initialData;
                const data = await useSourceStore.getState().data.ohlcFetch(symbolStoreObj, interval, useSourceStore.getState().src);
                return data;
            } catch (err) {
                console.error(err)
                if (err instanceof MissingAPIKeyError) {
                    throw new MissingAPIKeyError(err.message);
                }
                throw new Error("Historical data query is not responded")
            }
        },
        refetchInterval: timeFrameToMs[interval],
        staleTime: 0,
        refetchOnWindowFocus: false,
        cacheTime: timeFrameToMs[interval],
        placeholderData: (prev) => prev !== undefined ? prev : initialData,
        enabled: !initState,
        retry: 0,
    });
};


export { useChartQuery };
