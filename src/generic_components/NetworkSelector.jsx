import { NetworkIcon } from "@web3icons/react/dynamic";
import { useSourceStore } from "../stores/stores";
import { PopoverButton } from "../Layout/Elements";
import { Flex } from "../Layout/Layout";
import { SourceConst } from "../constants/sourceConst";

export const NetworkSelector = () => {
    const srcName = useSourceStore(state => state.src);

    if (!srcName) {
        return <div className="text-sm">Network Unselected</div>
    }

    return (
        <PopoverButton showClass={"w-min h-fit top-[100%] z-65 rounded-md bg-primary-500"}>
            <div className="flex flex-col cursor-pointer items-start gap-1 hover:brightness-125">
                <div className="text-xs text-washed md:visible hidden">Network</div>
                <Flex className="items-center gap-2">
                    <NetworkIcon id={useSourceStore.getState().data.network} size={32} variant="branded" className="p-0.5 bg-primary-500 rounded-md" />
                    <div className="text-sm text-left">{useSourceStore.getState().data.desc}</div>
                    <div className="text-xs text-washed">▼</div>
                </Flex>
            </div>
            <div className="flex flex-col p-4 gap-3 w-max">
                {Object.keys(SourceConst).slice(0, -1).map((network) => (
                    <Flex key={network} onClick={() => useSourceStore.getState().setSrc(network)} className="cursor-pointer gap-2 hover:brightness-125">
                        <NetworkIcon id={SourceConst[network]?.network} size={24} variant="branded" />
                        <div className="text-sm">{SourceConst[network].desc}</div>
                    </Flex>
                ))}
            </div>
        </PopoverButton>
    )
}