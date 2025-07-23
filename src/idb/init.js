import { DOMAIN } from "../constants/environment";
import { SourceConst } from "../constants/sourceConst"; 
import { isSavedStateExist, loadState } from "./stateDB";

export async function initPoolsInfo(network) {
    try {
        if (!SourceConst[network].info) {
            let res = await fetch(`${DOMAIN}/api/poolinfo/${network}`);
            let obj = await res.json();
            SourceConst[network].info = {};
            Object.assign(SourceConst[network].info, obj.data);
        }

        const savedTickExist = await isSavedStateExist(`savedTick-${network}`);

        if (savedTickExist) {
            const savedAddress = await loadState(`savedTick-${network}`);
            return savedAddress;
        }
        else {
            const newAddress = Object.keys(SourceConst[network].info)[0];
            return newAddress;
        }
    }
    catch (e) {
        console.error("network error @initPoolsInfo:", e);
    }
}