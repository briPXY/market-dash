import { NetworkIcon } from "@web3icons/react";
import { SourceConst } from "../../constants/sourceConst";
import { Flex } from "../../Layout/Layout"; 
import { useSourceStore } from "../../stores/stores";
import { svg } from "../../Layout/svg";

export const NetworkSelection = ({ handleNetworkChange }) => {
    const { init, saved } = useSourceStore();

    const setNetwork = async (network) => {
        handleNetworkChange(network);
    }

    const unselected = {
        true: {},
        false: { display: "none" },
        null: { display: "none" },
    }

    return (
        <div className="w-full bg-primary-900 h-screen floating-modal" style={unselected[init]}>
            <div className="h-14"></div>
            <div className="flex flex-col gap-3 border-washed items-center rounded-lg mx-auto max-w-100 p-10">

                <div>
                    <div className="font-bold">DEX Pool Graph Views</div>
                    <div className="text-sm mb-4 mt-4">Select Exchange Network:</div>
                </div>
                {
                    saved && <div className="flex items-center">
                        <div>Loading network</div>
                        <svg.LoadingIcon className="w-12 h-12" />
                    </div>
                }
                {!saved && Object.keys(SourceConst).slice(0, -1).map((network) => (
                    <Flex
                        key={network}
                        onClick={() => setNetwork(network)}
                        className="p-4 w-full gap-3 bg-primary-900 border-washed rounded-md cursor-pointer hover:brightness-125"
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