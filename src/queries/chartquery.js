import { useQuery } from "@tanstack/react-query";
import axios from "axios";

/**
 * Custom React Query hook to fetch and process candlestick data.
 * @param {string} apiUrl - The API URL to fetch data from.
 * @param {Function} transformFn - data transform function
 * @returns {Object} - Query result from React Query.
 */
const useChartQuery = ({ dataUrl, transformFn, refetchInterval, queryKey = ["chartItem", dataUrl], staleTime = 60000 }) => {
    return useQuery({
        queryKey,
        queryFn: async () => {
            const { data } = await axios.get(dataUrl); 
            return transformFn ? transformFn(data) : data; // Apply transformation if provided
        },
        refetchInterval,
        staleTime, // Default: Cache data for 1 min
    });
};


export { useChartQuery };
