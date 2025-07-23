import { DOMAIN } from "../constants/environment";
import { SourceConst } from "../constants/sourceConst";
import { useSourceStore, usePoolStore } from "../stores/stores";
import { isSavedStateExist, loadState } from "./stateDB";
const { setAddress } = usePoolStore.getState();

export async function initPoolsInfo(network) {
    try {
        if (!SourceConst[network].info) {
            let res = await fetch(`${DOMAIN}/api/poolinfo/${network}`);
            let obj = await res.json();
            SourceConst[network].info = {};
            Object.assign(SourceConst[network].info, obj.data);
        }
    }
    catch (e) {
        console.error("network error during init():", e);
    }
    finally {
        const savedTickExist = await isSavedStateExist(`savedTick-${network}`);

        if (savedTickExist) {
            const state = await loadState(`savedTick-${network}`);
            setAddress(state);
        }
        else {
            const address = Object.keys(SourceConst[network].info)[0];
            setAddress(address);
        }
    }
}

(async () => {
    const savedNetworkExist = await isSavedStateExist("savedNetwork");

    if (savedNetworkExist) {
        const savedNetwork = await loadState("savedNetwork");
        useSourceStore.setState({ src: savedNetwork });

        // Get saved symbol/token pair
        const network = useSourceStore.getState().src;
        await initPoolsInfo(network);
    }
})();