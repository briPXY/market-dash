import { useQuery } from "@tanstack/react-query";
import * as fetchHistory from "./fetchHistory.js"
import { API_DOMAIN } from "./api_formatter.js";
import { timeFrameToMs } from "../constants/intervals.js";
import { useMemo } from "react";
/**
 * Custom React Query hook to fetch and process candlestick data.
 * @param {string} apiUrl - The API URL to fetch data from.
 * @param {Function} transformFn - data transform function
 * @returns {Object} - Query result from React Query.
 */
const useChartQuery = ({ symbolIn = "usdt", symbolOut, interval }) => {

    const queryKey = useMemo(() => ["historical", symbolIn, symbolOut, interval], [symbolIn, symbolOut, interval]);
    const placeHolder = useMemo(() => { return [{ open: 0, high: 0, low: 0, close: 0, volume: 0, date: 16000 }] }, [])

    return useQuery({
        queryKey: queryKey,
        queryFn: async () => {
            const data = await fetchHistory[API_DOMAIN](symbolIn, symbolOut, interval);
            return data; // Apply transformation if provided
        },
        refetchInterval: timeFrameToMs[interval],
        staleTime: timeFrameToMs[interval], // Default: Cache data for 1 min
        placeholderData: placeHolder,
    });
};


export { useChartQuery };
