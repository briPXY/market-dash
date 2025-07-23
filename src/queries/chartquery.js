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
const useChartQuery = ({ address, interval, network }) => {

    const queryKey = useMemo(() => ["historical", address, interval, network], [address, interval, network]);
    const initialData = useMemo(() => { return initData }, [])

    return useQuery({
        queryKey: queryKey,
        enabled: !!address && !!network, // Disable query if either symbol is missing
        queryFn: async () => {
            const data = await SourceConst[network].ohlcFetch(address, interval, network);
            return data; // Apply transformation if provided
        },
        refetchInterval: timeFrameToMs[interval],
        staleTime: 0,
        cacheTime: timeFrameToMs[interval],
        initialData,
    });
};


export { useChartQuery };
