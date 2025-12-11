import { useEffect } from "react";
import usePriceStore, { useSourceStore, usePoolStore } from "../stores/stores";
import { closeLivePriceWebSocket } from "../queries/livePrice";

/**
 * Ticking live price with websocket or REST
 * @param {type} param0 
 * @returns 
 */

const PriceUpdater = ({ type }) => {
    const setPrice = usePriceStore((state) => type == "trade" ? state.setTradePrice : state.setIndexPrice);
    const symbols = usePoolStore(state => state.symbols);
    const priceSource = useSourceStore(state => state.data);

    useEffect(() => {
        if (symbols == "init" || useSourceStore.getState().src == "init") return;

        priceSource.livePrice(useSourceStore.getState(), usePoolStore.getState(), setPrice)

        return () => {
            closeLivePriceWebSocket();
        };

    }, [setPrice, type, symbols, priceSource]);

    return null; // non-pure component
};

export { PriceUpdater }