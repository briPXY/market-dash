import { NetworkIcon } from "@web3icons/react";
import { SourceConst } from "../../constants/sourceConst";
import { Flex } from "../../Layout/Layout";
import { useEffect } from "react";
import { isSavedStateExist, loadState, saveState } from "../../idb/stateDB";
import { useSourceStore } from "../../stores/stores";

export const NetworkSelection = () => {
    const setSrc = useSourceStore(state => state.setSrc);

    const setNetwork = async (network) => {
        await saveState(`savedNetwork`, network)
        setSrc(network);
    }

    const checkSavedState = async () => {
        const exist = isSavedStateExist("savedNetwork");

        if (exist) {
            const state = await loadState("savedNetwork");
            setSrc(state); 
        }
    }

    useEffect(() => {
        checkSavedState();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className="w-full bg-primary h-screen">
            <div className="h-14"></div>
            <div className="flex flex-col gap-3 border-washed rounded-lg mx-auto max-w-100 p-10">
                <div className="text-sm">Select Exchange Network:</div>
                {Object.keys(SourceConst).map((network) => (
                    <Flex key={network} onClick={() => setNetwork(network)} className="p-4 bg-primary border-washed rounded-md cursor-pointer hover:brightness-125">
                        <NetworkIcon network={SourceConst[network].network} size={32} className="p-0.5" />
                        <div className="font-medium">{SourceConst[network].desc}</div>
                    </Flex>
                ))}
            </div>
        </div>
    )
}