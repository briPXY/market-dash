// import { DOMAIN } from "../constants/environment";
import { SourceConst } from "../constants/sourceConst";
import { isSavedStateExist, loadState } from "./stateDB";

export async function initPoolsInfo(network) {
    try {
        // if (SourceConst[network].isDex) {
        //     let res = await fetch(`${DOMAIN}/api/poolinfo/${network}`);
        //     let obj = await res.json();
        //     SourceConst[network].info = {};
        //     Object.assign(SourceConst[network].info, obj.data);

        //     // For swapped token
        //     SourceConst[network].swappedSymbols?.forEach((address) => {
        //         const temp = SourceConst[network].info[address].token0;
        //         SourceConst[network].info[address].token0 = SourceConst[network].info[address].token1;
        //         SourceConst[network].info[address].token1 = temp;

        //     })
        // }

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
        console.error("error @ initPoolsInfo:", e);
        return null;
    }
}