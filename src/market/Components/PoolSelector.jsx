import { TokenIcon } from "@web3icons/react";
import { SourceConst } from "../../constants/sourceConst";
import Button, { PopoverButton } from "../../Layout/Elements"
import { useSourceStore, usePoolStore } from "../../stores/stores";
import { Flex } from "../../Layout/Layout";
import { useEffect, useState } from "react";
import { saveState } from "../../idb/stateDB";

export const PoolSelector = ({ address }) => {
    const src = useSourceStore(state => state.src);
    const setAddress = usePoolStore(fn => fn.setAddress);
    const [bulkPrices, setBulkPrices] = useState(null);

    if (!src || !address){
        return <div>Loading network info</div>
    }
    
    const token0 = SourceConst[src]?.info[address].token0.symbol;
    const token1 = SourceConst[src]?.info[address].token1.symbol;

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
        <PopoverButton onPopover={handlePopOver} showClass={"bg-secondary w-[65vw] md:w-80 h-fit top-[100%] p-2 left-0 z-65 rounded-md"}>
            <div className="flex cursor-pointer font-medium items-center gap-1 justify-start hover:brightness-125 rounded-md">
                <div className="text-base md:text-lg">{`${token0}/${token1}`}</div>
                <TokenIcon symbol={token0.toLowerCase()} size={32} color="#fff" variant="branded" className="bg-secondary rounded-full p-0.5" />
                <div className="text-xs text-washed">▼</div>
            </div>
            <div className="flex flex-col gap-3">
                <Flex className="justify-between text-washed text-xs px-2">
                    <div>{src == "dex" ? "Pool" : "Symbol"}</div>
                    <div>Latest price/swap</div>
                </Flex>
                {Object.keys(SourceConst[src].info).map((poolAddress) => (
                    <SymbolSelectorItem key={poolAddress} setPool={setPool} poolAddress={poolAddress} src={src}
                        preloadPrice={bulkPrices ? bulkPrices[poolAddress] : null}/>
                ))}
            </div>
        </PopoverButton>
    )
}

const SymbolSelectorItem = ({ poolAddress, setPool, src, preloadPrice}) => {
    const [price, setPrice] = useState('-');

    useEffect(() => { 
        const liveUpdate = async () => {
            const livePrice = await SourceConst[src].livePrice(poolAddress);
            setPrice(isNaN(livePrice) ? '-' : Number(livePrice).toFixed(2));
        }

        if (SourceConst[src].bulkPrices) { 
            setPrice(parseFloat(preloadPrice).toFixed(2));
            return;
        }
        else {
            liveUpdate();
        }
    }, [poolAddress, src, preloadPrice])

    return (
        <Flex className="justify-between pr-3">
            <Button onClick={() => setPool(poolAddress)} className="w-fit p-0 text-sm gap-2">
                <TokenIcon symbol={SourceConst[src].info[poolAddress].token0.symbol.toLowerCase()} variant="branded" size={22} />
                <div>{`${SourceConst[src].info[poolAddress].token0.symbol}/${SourceConst[src].info[poolAddress].token1.symbol}`}</div>
            </Button>
            <div className="font-medium text-xs">{price}</div>
        </Flex>
    )
}