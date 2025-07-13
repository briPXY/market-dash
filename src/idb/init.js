import { SourceConst } from "../constants/sourceConst";
import { useSourceStore, useSymbolStore } from "../stores/stores";
import { isSavedStateExist, loadState } from "./stateDB";
const { setAll } = useSymbolStore.getState();

export async function initSymbols(network) {
    const savedTickExist = await isSavedStateExist(`savedTick-${network}`);

    if (savedTickExist) {
        const state = await loadState(`savedTick-${network}`);
        setAll(state[0], state[1]);
    }
    else {
        const [symbolIn, symbolOut] = SourceConst[network].symbols[0];
        setAll(symbolIn, symbolOut);
    }
}

(async () => {
    const savedNetworkExist = await isSavedStateExist("savedNetwork");

    if (savedNetworkExist) {
        const savedNetwork = await loadState("savedNetwork");
        useSourceStore.setState({ src: savedNetwork });

        // Get saved symbol/token pair
        const network = useSourceStore.getState().src;
        initSymbols(network);
    }
})();