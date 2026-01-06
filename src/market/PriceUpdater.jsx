import { useEffect } from "react";
import usePriceStore, { useSourceStore, usePoolStore, useAppInitStore } from "../stores/stores";
import { closeLivePriceWebSocket, killAllLivePriceLoops } from "../queries/livePrice";
import { startFiatRateUpdater, stopFiatRate } from "../queries/getFiatRate";
import { stdSymbol } from "../utils/utils";


const PriceUpdater = () => {
    const symbols = usePoolStore(state => state.symbols);
    const token0 = usePoolStore(state => state.token0); // subscribe for symbol swapping 
    const fiatSymbol = usePriceStore(state => state.fiatSymbol);
    const initDone = useAppInitStore(state => state.initDone);

    useEffect(() => {
        if (symbols == "init" || !symbols) return;

        useSourceStore.getState().data.livePrice(useSourceStore.getState(), usePoolStore.getState(), usePriceStore.getState().setTradePrice);

        return () => {
            closeLivePriceWebSocket();
            killAllLivePriceLoops();
        };

    }, [symbols]);

    // fiat rate updater (60 sec interval)
    useEffect(() => {
        if (!token0 || !token0.symbol || !initDone) return;

        startFiatRateUpdater(stdSymbol(usePoolStore.getState().token0.symbol), fiatSymbol, "iv0", (val) => usePriceStore.getState().setFiat0(val));
        startFiatRateUpdater(stdSymbol(usePoolStore.getState().token1.symbol), fiatSymbol, "iv1", (val) => usePriceStore.getState().setFiat1(val));

        return () => {
            stopFiatRate("iv0");
            stopFiatRate("iv1");
        };

    }, [fiatSymbol, initDone, token0]);

    return null; // non-pure component
};

export { PriceUpdater }