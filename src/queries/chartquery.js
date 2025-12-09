import { useQuery } from "@tanstack/react-query";
import { timeFrameToMs } from "../constants/constants.js";
import { useMemo } from "react";
import { initData } from "../constants/initData.js";
import { SourceConst } from "../constants/sourceConst.js";
/**
 * Custom React Query hook to fetch and process candlestick data.
 * @param {string} apiUrl - The API URL to fetch data from.
 * @param {Function} transformFn - data transform function
 * @returns {Object} - Query result from React Query.
 */
const useChartQuery = ({ symbols, interval, network }) => {

    const queryKey = useMemo(() => ["historical", symbols, interval, network], [symbols, interval, network]);
    const initialData = useMemo(() => { return initData }, [])

    return useQuery({
        queryKey: queryKey,
        //enabled: !address,
        queryFn: async () => {
            const data = await SourceConst[network].ohlcFetch(symbols, interval, network);
            return data; // Apply transformation if provided
        },
        refetchInterval: timeFrameToMs[interval],
        staleTime: 0,
        refetchOnWindowFocus: false,
        cacheTime: timeFrameToMs[interval],
        initialData,
    });
};


export { useChartQuery };
