import { useQuery } from "@tanstack/react-query";
import { timeFrameToMs } from "../constants/intervals.js";
import { useMemo } from "react";
import { initData } from "../constants/initData.js";
import { SourceConst } from "../constants/sourceConst.js";
/**
 * Custom React Query hook to fetch and process candlestick data.
 * @param {string} apiUrl - The API URL to fetch data from.
 * @param {Function} transformFn - data transform function
 * @returns {Object} - Query result from React Query.
 */
const useChartQuery = ({ symbolIn, symbolOut, interval, network }) => {

    const queryKey = useMemo(() => ["historical", symbolIn, symbolOut, interval, network], [symbolIn, symbolOut, interval, network]);
    const initialData = useMemo(() => { return initData }, [])

    return useQuery({
        queryKey: queryKey,
        enabled: !!(symbolIn && symbolOut), // Disable query if either symbol is missing
        queryFn: async () => {
            const data = await SourceConst[network].ohlcFetch(symbolIn, symbolOut, interval, network);
            return data; // Apply transformation if provided
        },
        refetchInterval: timeFrameToMs[interval],
        staleTime: 0,
        cacheTime: timeFrameToMs[interval],
        initialData,
    });
};


export { useChartQuery };
