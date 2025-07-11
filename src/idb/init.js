import { useSourceStore, useSymbolStore } from "../stores/stores";
import { isSavedStateExist, loadState } from "./stateDB";
const { setAll } = useSymbolStore.getState();

(async () => {
    const savedNetworkExist = await isSavedStateExist("savedNetwork");

    if (savedNetworkExist) {
        const savedNetwork = await loadState("savedNetwork");
        useSourceStore.setState({ src: savedNetwork });
    }

    // Get saved symbol/token pair
    const network = useSourceStore.getState().src; 
    const savedTickExist = await isSavedStateExist(`savedTick-${network}`);

    if (savedTickExist) {
        const state = await loadState(`savedTick-${network}`);
        setAll(state[0], state[1]);
    }

})();