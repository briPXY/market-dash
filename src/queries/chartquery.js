import { useQuery } from "@tanstack/react-query";
import * as fetchHistory from "./fetchHistory.js" 
import { timeFrameToMs } from "../constants/intervals.js";
import { useMemo } from "react";
/**
 * Custom React Query hook to fetch and process candlestick data.
 * @param {string} apiUrl - The API URL to fetch data from.
 * @param {Function} transformFn - data transform function
 * @returns {Object} - Query result from React Query.
 */
const useChartQuery = ({ symbolIn, symbolOut, interval, src }) => {

    const queryKey = useMemo(() => ["historical", symbolIn, symbolOut, interval, src], [symbolIn, symbolOut, interval, src]);
    //const initialData = useMemo(() => { return [{ open: 0, high: 0, low: 0, close: 0, volume: 0, date: 16000 }] }, [])

    return useQuery({
        queryKey: queryKey,
        enabled: !!(symbolIn && symbolOut), // Disable query if either symbol is missing
        queryFn: async () => { 
            const data = await fetchHistory[src](symbolIn, symbolOut, interval); 
            return data; // Apply transformation if provided
        },
        refetchInterval: timeFrameToMs[interval],
        staleTime: 0, 
        cacheTime: timeFrameToMs[interval],
        //initialData,
    });
};


export { useChartQuery };
