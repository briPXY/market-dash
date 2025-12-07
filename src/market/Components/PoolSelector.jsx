import { SourceConst } from "../../constants/sourceConst";
import { PopoverButton } from "../../Layout/Elements"
import { useSourceStore, usePoolStore, usePriceInvertStore } from "../../stores/stores";
import { Flex } from "../../Layout/Layout";
import { useEffect, useState } from "react";
import { saveState } from "../../idb/stateDB";
import { LoadingIcon } from "../../Layout/svg";
import { PriceText } from "../../generic_components/PriceText";
import { SymbolPair } from "../../generic_components/SymbolPair";
import PairIcon from "../../generic_components/PairIcon";
import { FormTokenSearch } from "../FormTokenSearch";
import { FormPairSearch } from "../FormPairSearch";

export const PoolSelector = () => {
    const src = useSourceStore(state => state.src);
    const setAddress = usePoolStore(fn => fn.setAddress);
    const address = usePoolStore(state => state.address);
    const [bulkPrices, setBulkPrices] = useState(null);
    const symbol0 = usePoolStore(state => state.symbol0);
    const symbol1 = usePoolStore(state => state.symbol1);
    const inverted = usePriceInvertStore((state) => state.priceInvert);

    const setPool = async (selectedAddress) => {
        await saveState(`savedTick-${src}`, selectedAddress)
        setAddress(selectedAddress);
    }

    const handlePopOver = async () => {
        if (SourceConst[src].bulkPrices) {
            const prices = await SourceConst[src].bulkPrices(src);
            setBulkPrices(prices);
        }
        return;
    }

    return (
        <PopoverButton onPopover={handlePopOver} showClass={"bg-primary-500 w-[85vw] md:w-90 h-fit top-[100%] p-1 py-2 left-0 z-65 rounded-md"}>
            <div className="flex cursor-pointer font-medium items-center gap-1 justify-start hover:brightness-125 rounded-md">
                <SymbolPair poolAddress={address} className="inline-block text-base md:text-lg text-start text-nowrap" />
                <PairIcon className="w-1/2 flex" symbol0={symbol0} symbol1={symbol1} spacing="-100%" style={{ width: "30px" }} style1={{ clipPath: "inset(0 0 0 50%)" }} />
                <div className="text-xs text-washed">▼</div>
            </div>
            <div className="flex flex-col p-1 gap-0">
                <div className="flex items-center mb-1 gap-1 w-full">
                    <FormTokenSearch className="flex-1" target={inverted ? "token0" : "token1"} />
                    <div className="text-washed-dim font-light">/</div>
                    <FormTokenSearch className="flex-1" target={inverted ? "token1" : "token0"} />
                </div>
                <FormPairSearch className="w-full h-full" />
                <div className="border border-primary-100 rounded-md mt-3">
                    <div className="text-xs text-washed px-3 pt-2 text-left rounded-t-md">Highlights</div>
                    <Flex className="justify-between px-3 py-2 border-b border-primary-100 text-xs">
                        <div>Pool</div>
                        <div>Latest price/swap</div>
                    </Flex>
                    {Object.keys(SourceConst[src].info).map((poolAddress) => (
                        <SymbolSelectorItem
                            key={poolAddress}
                            setPool={setPool}
                            poolAddress={poolAddress}
                            network={SourceConst[src]}
                            preloadPrice={bulkPrices ? bulkPrices[poolAddress] : null}
                            symbol0={SourceConst[src].info[poolAddress].token0.symbol}
                            symbol1={SourceConst[src].info[poolAddress].token1.symbol}
                        />
                    ))}
                </div>
            </div>
        </PopoverButton>
    )
}

const SymbolSelectorItem = ({ poolAddress, setPool, network = SourceConst.UniswapV3, preloadPrice, symbol1 = "", symbol0 = "" }) => {
    const [price, setPrice] = useState(null);

    useEffect(() => {
        const liveUpdate = async () => {
            const livePrice = await network.livePrice(poolAddress);
            setPrice(isNaN(livePrice) ? '-' : livePrice.toString());
        }

        if (network.bulkPrices) {
            setPrice(preloadPrice);
            return;
        }
        else {
            liveUpdate();
        }
    }, [poolAddress, network, preloadPrice]);

    return (
        <button onClick={() => setPool(poolAddress)} className="flex w-full px-3 py-2 hover:brightness-125 rounded-sm bg-primary-500 text-sm items-center justify-between">
            <div className="flex gap-2">
                <SymbolPair poolAddress={poolAddress} className = "text-sm" />
                <PairIcon symbol0={symbol0} symbol1={symbol1} size={18} spacing="2px" />
            </div>
            <PriceText className="font-medium text-xs" input={price} />
            {!price && <LoadingIcon className="w-10 h-10" />}
        </button>
    )
}