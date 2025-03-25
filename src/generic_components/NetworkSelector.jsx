import { NetworkIcon } from "@web3icons/react";
import { useSourceStore } from "../stores/stores";
import { SourceConst } from "../constants/sourceConst";
import { Flex } from "../Layout/Layout";
import { PopoverButton } from "../Layout/elements";

export const NetworkSelector = () => {
    const src = useSourceStore(state => state.src);
    const setNetwork = useSourceStore(state => state.setSrc)

    return (
        <PopoverButton showClass={"w-min h-fit top-[100%] p-2 z-65 rounded-md bg-secondary"}>
            <div className="flex flex-col cursor-pointer items-center gap-1 hover:brightness-125">
                <div className="text-xs text-washed">Network</div>
                <Flex className="items-center gap-2">
                    <NetworkIcon network={SourceConst[src].network} size={32} variant="branded" className="p-0.5" />
                    <div className="font-medium">{SourceConst[src].desc}</div>
                    <div className="text-xs text-washed">▼</div>
                </Flex>
            </div>
            <div className="flex flex-col gap-3 w-max">
                {Object.keys(SourceConst).map((network) => (
                    <Flex key={network} onClick={() => setNetwork(network)} className="cursor-pointer hover:brightness-125">
                        <NetworkIcon network={SourceConst[network].network} size={32} variant="branded" className="p-0.5" />
                        <div className="text-sm">{SourceConst[network].desc}</div>
                    </Flex>
                ))}
            </div>
        </PopoverButton>
    )
}