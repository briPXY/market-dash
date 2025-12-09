import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { SourceConst } from "../constants/sourceConst.js";

export const use24HourQuery = ({ symbols, network }) => {

    const queryKey = useMemo(() => ["24h", symbols, network], [symbols, network]);

    return useQuery({
        queryKey: queryKey,
        queryFn: async () => {
            const data = await SourceConst[network].h24Query(symbols, network);
            return data; // Apply transformation if provided
        },
        refetchInterval: 310000, // Fetch every 5 minutes + secs
        staleTime: 310000, // Default: Cache data for 1 min
    });
};
