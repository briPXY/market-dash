import { NetworkIcon } from "@web3icons/react";
import { SourceConst } from "../../constants/sourceConst";
import { Flex } from "../../Layout/Layout";
import { useEffect, useState } from "react";
import { isSavedStateExist, loadState, saveState } from "../../idb/stateDB";
import { useSourceStore } from "../../stores/stores";
import { LoadingIcon } from "../../Layout/Elements";

export const NetworkSelection = () => {
    const setSrc = useSourceStore(state => state.setSrc);
    const [manualSelect, setManualSelect] = useState(false);

    const setNetwork = async (network) => {
        await saveState(`savedNetwork`, network)
        setSrc(network);
    }

    const checkSavedState = async () => {
        const exist = await isSavedStateExist("savedNetwork");

        if (exist) {
            const state = await loadState("savedNetwork");
            setSrc(state);
        }
        else {
            setManualSelect(true); 
        }
    }

    useEffect(() => {
        checkSavedState();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className="w-full bg-primary h-screen">
            <div className="h-14"></div>
            <div className="flex flex-col gap-3 border-washed items-center rounded-lg mx-auto max-w-100 p-10">
                {manualSelect && 
                <div>
                    <div className="font-bold">DEX Pool Graph Views</div>
                    <div className="text-sm mb-4 mt-4">Select Exchange Network:</div>
                </div>
                }
                {!manualSelect &&
                    <div className="flex items-center">
                        <div>Loading network</div>
                        <LoadingIcon className="w-12 h-12"/>
                    </div>
                }
                {Object.keys(SourceConst).map((network) => (
                    <Flex
                        key={network}
                        onClick={() => setNetwork(network)}
                        className="p-4 w-full gap-3 bg-primary border-washed rounded-md cursor-pointer hover:brightness-125"
                        style={{ display: manualSelect ? "flex" : "none" }}
                    >
                        <NetworkIcon id={SourceConst[network].network} size={24} variant="branded" />
                        <div className="font-medium">{SourceConst[network].desc}</div>
                    </Flex>
                ))
                }
                
                <div className="text-washed text-xs mt-4">*This is work-in-progress demo project. Not recommended for trading or swapping tokens and cryptos here. Use real exchange or Uniswap for tokens swapping</div>
            </div>
        </div>
    )
}