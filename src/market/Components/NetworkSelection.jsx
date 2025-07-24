import { NetworkIcon } from "@web3icons/react";
import { SourceConst } from "../../constants/sourceConst";
import { Flex } from "../../Layout/Layout";
import { saveState } from "../../idb/stateDB";
import { useSourceStore } from "../../stores/stores";
import { LoadingIcon } from "../../Layout/Elements";

export const NetworkSelection = ({ networkStatus, handleNetworkChange }) => {
    const networkSrc = useSourceStore.getState().src;

    const setNetwork = async (network) => {
        await saveState(`savedNetwork`, network);
        handleNetworkChange(network);
    }

    const networkUndefinded = {
        true: {},
        false: { display: "none" },
        null: { display: "none" },
    }

    return (
        <div className="w-full bg-primary h-screen floating-modal" style={networkUndefinded[networkStatus]}>
            <div className="h-14"></div>
            <div className="flex flex-col gap-3 border-washed items-center rounded-lg mx-auto max-w-100 p-10">

                <div>
                    <div className="font-bold">DEX Pool Graph Views</div>
                    <div className="text-sm mb-4 mt-4">Select Exchange Network:</div>
                </div>
                {networkSrc && <div className="flex items-center">
                    <div>Loading network</div>
                    <LoadingIcon className="w-12 h-12" />
                </div>
                }
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

                <div className="text-washed text-xs mt-4">*This is developer&apos;s demo project. Unexpected network and error might occur. Use the web3 transactions with caution.</div>
            </div>
        </div>
    )
}