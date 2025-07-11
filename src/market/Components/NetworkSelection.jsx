import { NetworkIcon } from "@web3icons/react";
import { SourceConst } from "../../constants/sourceConst";
import { Flex } from "../../Layout/Layout";
import { saveState } from "../../idb/stateDB";
import { useSourceStore } from "../../stores/stores";
import { LoadingIcon } from "../../Layout/Elements";

export const NetworkSelection = () => {
    const setSrc = useSourceStore(state => state.setSrc);

    const setNetwork = async (network) => {
        await saveState(`savedNetwork`, network)
        setSrc(network);
    }

    return (
        <div className="w-full bg-primary h-screen">
            <div className="h-14"></div>
            <div className="flex flex-col gap-3 border-washed items-center rounded-lg mx-auto max-w-100 p-10">

                <div>
                    <div className="font-bold">DEX Pool Graph Views</div>
                    <div className="text-sm mb-4 mt-4">Select Exchange Network:</div>
                </div>
                <div className="flex items-center">
                    <div>Loading network</div>
                    <LoadingIcon className="w-12 h-12" />
                </div>
                {Object.keys(SourceConst).map((network) => (
                    <Flex
                        key={network}
                        onClick={() => setNetwork(network)}
                        className="p-4 w-full gap-3 bg-primary border-washed rounded-md cursor-pointer hover:brightness-125"
                        style={{ display: "flex" }}
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