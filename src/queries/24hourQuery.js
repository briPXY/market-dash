import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react"; 
import { SourceConst } from "../constants/sourceConst.js";

export const use24HourQuery = ({ poolAddress, network }) => {
   
    const queryKey = useMemo(() => ["24h", poolAddress, network], [poolAddress, network]);

    return useQuery({
        queryKey: queryKey,
        enabled: !!poolAddress && !!network, // Disable query if either symbol is missing
        queryFn: async () => {
            const data = await SourceConst[network].h24Query(poolAddress, network);
            return data; // Apply transformation if provided
        },
        refetchInterval: 310000, // Fetch every 5 minutes + secs
        staleTime: 310000, // Default: Cache data for 1 min
    });
};
