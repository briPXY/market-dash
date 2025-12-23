import { ExchangeIcon } from "@web3icons/react/dynamic";
import { useAppInitStore, useSourceStore } from "../stores/stores";
import { PopoverButton } from "../Layout/Elements";
import { Flex } from "../Layout/Layout";
import { SourceConst } from "../constants/sourceConst";

export const NetworkSelector = () => {
    const srcName = useSourceStore(state => state.src);
    const initDone = useAppInitStore(state => state.initDone);

    if (!srcName || !initDone) {
        return <div className="text-sm">Network Unselected</div>
    }

    return (
        <PopoverButton showClass={"w-min h-fit top-[100%] bg-primary-500 z-65 rounded-lg border border-primary-100"}>
            <Flex className="items-center cursor-pointer border border-primary-100 rounded-full hover:brightness-125">
                <div className="font-light text-xs pl-3 pr-1">Source:</div>
                <ExchangeIcon id={useSourceStore.getState().data.exchangeIcon} size={30} variant="branded" className="p-0.5 rounded-sm" />
                <div className="text-xs font-semibold text-left">{useSourceStore.getState().data.name}</div>
                <div className="text-[12px] px-1.5 text-washed-dim">▼</div>
            </Flex>
            <div className="p-2 md:p-6 ">
                <div className="font-bold my-1">Price Sources</div>
                <div className="grid grid-cols-1 md:grid-cols-2 py-4 w-[91vw] md:w-160 gap-3">
                    {Object.keys(SourceConst).slice(0, -1).map((network) => (
                        <Flex
                            key={network}
                            onClick={() => useSourceStore.getState().setSrc(network, SourceConst)}
                            className="rounded-md items-center p-2 h-fit border border-primary-100 bg-primary-500 cursor-pointer gap-2 hover:brightness-125"
                            style={{ borderColor: srcName == network ? "var(--color-primary)" : "" }}
                        >
                            <ExchangeIcon
                                id={SourceConst[network].exchangeIcon}
                                size={36}
                                variant="branded"
                                className="h-full w-auto rounded-sm"
                            />
                            <div>
                                <div className="text-left font-semibold md:text-base text-sm">
                                    {SourceConst[network].name}
                                </div>
                                <div className="text-xs text-left font-light text-washed">
                                    {SourceConst[network].desc}
                                </div>
                            </div>
                        </Flex>
                    ))}
                </div>
            </div>
        </PopoverButton>
    )
}