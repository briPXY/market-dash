import { useEffect } from "react";
import usePriceStore, { useSourceStore, usePoolStore } from "../stores/stores";
import { closeLivePriceWebSocket, killAllLivePriceLoops } from "../queries/livePrice";


const PriceUpdater = ( ) => { 
    const symbols = usePoolStore(state => state.symbols); 

    useEffect(() => {
        if (symbols == "init" || !symbols) return;

        useSourceStore.getState().data.livePrice(useSourceStore.getState(), usePoolStore.getState(), usePriceStore.getState().setTradePrice)

        return () => {
            closeLivePriceWebSocket();
            killAllLivePriceLoops();
        };

    }, [symbols]);

    return null; // non-pure component
};

export { PriceUpdater }