import { PopoverButton } from "../../Layout/Elements"
import { useSourceStore, usePoolStore, usePriceInvertStore } from "../../stores/stores";
import { Flex } from "../../Layout/Layout";
import { useEffect, useState } from "react";
import { LoadingIcon } from "../../Layout/svg";
import { PriceText } from "../../generic_components/PriceText";
import { SymbolPair } from "../../generic_components/SymbolPair";
import PairIcon from "../../generic_components/PairIcon";
import { FormTokenSearch } from "../FormTokenSearch";
import { FormPairSearch } from "../FormPairSearch";
import { stdSymbol } from "../../utils/utils";

export const PoolSelector = () => {
    const priceSrcData = useSourceStore(state => state.data);
    const pairSymbols = usePoolStore(state => state.symbols);

    const [bulkPrices, setBulkPrices] = useState(null);
    const inverted = usePriceInvertStore((state) => state.priceInvert);

    const handlePopOver = async () => {
        if (priceSrcData.bulkPrices) {
            const prices = await priceSrcData.bulkPrices(pairSymbols);
            setBulkPrices(prices);
        }
        return;
    };

    return (
        <PopoverButton onPopover={handlePopOver} showClass={"bg-primary-500 w-[85vw] md:w-90 h-fit top-[100%] p-1 py-2 left-0 z-65 rounded-md"}>
            <div className="flex cursor-pointer font-medium items-center gap-1 justify-start hover:brightness-125 rounded-md">
                <SymbolPair
                    symbol0={stdSymbol(usePoolStore.getState().token0.symbol)}
                    symbol1={stdSymbol(usePoolStore.getState().token1.symbol)}
                    className="inline-block text-base md:text-lg text-start text-nowrap"
                />
                <PairIcon className="w-1/2 flex"
                    symbol0={stdSymbol(usePoolStore.getState().token0.symbol)}
                    symbol1={stdSymbol(usePoolStore.getState().token1.symbol)} spacing="-100%"
                    style={{ width: "30px" }}
                    style1={{ clipPath: "inset(0 0 0 50%)" }}
                />
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

                    {/* bookmarks/highlight */}
                    {priceSrcData.initPairs.map((pairObj) => (
                        <SymbolSelectorItem
                            key={pairObj.symbols}
                            pairObj={pairObj}
                            preloadPrice={bulkPrices ? bulkPrices[pairSymbols] : null}
                        />
                    ))}
                </div>
            </div>
        </PopoverButton>
    )
}

const SymbolSelectorItem = ({ pairObj, preloadPrice, }) => {
    const [price, setPrice] = useState(null);

    const setPairFromPairObj = usePoolStore(fn => fn.setPairFromPairObj);
    const priceSrcData = useSourceStore(state => state.data);

    useEffect(() => {
        const liveUpdate = async () => {
            const livePrice = await priceSrcData.fetchPrice(pairObj.symbols);
            setPrice(isNaN(livePrice) ? '-' : livePrice.toString());
        }

        if (priceSrcData.bulkPrices) {
            setPrice(preloadPrice);
            return;
        }
        else {
            liveUpdate();
        }
    }, [preloadPrice, priceSrcData, pairObj.symbols]);

    return (
        <button onClick={() => setPairFromPairObj(pairObj)} className="flex w-full px-3 py-2 hover:brightness-125 rounded-sm bg-primary-500 text-sm items-center justify-between">
            <div className="flex gap-2">
                <SymbolPair symbol0={stdSymbol(pairObj.token0.symbol)} symbol1={stdSymbol(pairObj.token1.symbol)} className="text-sm" />
                <PairIcon symbol0={stdSymbol(pairObj.token0.symbol)} symbol1={stdSymbol(pairObj.token1.symbol)} size={18} spacing="2px" />
            </div>
            <PriceText className="font-medium text-xs" input={price} />
            {!price && <LoadingIcon className="w-3 h-3" />}
        </button>
    )
}