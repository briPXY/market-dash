import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import * as fetch24Hour from "./fetch24hour.js"
import { API_DOMAIN } from "./api_formatter";

export const use24HourQuery = ({ symbolIn = "usdt", symbolOut }) => {

    const queryKey = useMemo(() => ["24h", symbolIn, symbolOut], [symbolIn, symbolOut]);

    return useQuery({
        queryKey: queryKey,
        queryFn: async () => {
            const data = await fetch24Hour[API_DOMAIN](symbolIn, symbolOut);
            return data; // Apply transformation if provided
        },
        refetchInterval: 310000, // Fetch every 5 minutes + secs
        staleTime: 310000, // Default: Cache data for 1 min
    });
};
