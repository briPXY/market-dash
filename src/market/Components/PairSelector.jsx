import { PopoverButton } from "../../Layout/Elements"
import { useSourceStore, usePoolStore } from "../../stores/stores";
import { Flex } from "../../Layout/Layout";
import { useEffect, useState } from "react";
import { LoadingIcon } from "../../Layout/svg";
import { PriceText } from "../../generic_components/PriceText";
import { SymbolPair } from "../../generic_components/SymbolPair";
import PairIcon from "../../generic_components/PairIcon";
// import { FormTokenSearch } from "../FormTokenSearch";
import { FormPairSearch } from "../FormPairSearch";
import { stdSymbol } from "../../utils/utils";
import { AppSetting } from "../../constants/constants";

export const PairSelector = () => {
    const priceSrcData = useSourceStore.getState().data;
    const token0 = usePoolStore(state => state.token0); // At least one pair state subscribing 
    // const inverted = usePriceInvertStore((state) => state.priceInvert); 

    return (
        <PopoverButton showClass={"bg-primary-500 w-[85vw] md:w-90 h-fit top-[100%] p-1 py-2 left-0 z-65 rounded-md"}>
            <div className="flex cursor-pointer font-medium items-center gap-1 justify-start p-1 md:pr-4 bg-primary-500 border border-primary-100 rounded-full px-2 md:px-3 hover:brightness-125">
                <div className="inline-block font-light text-sm md:text-lg text-start text-nowrap">
                    {`${stdSymbol(token0.symbol)} / ${stdSymbol(usePoolStore.getState().token1.symbol)}`}
                </div>
                <PairIcon className="w-1/3 flex"
                    symbol0={stdSymbol(token0.symbol)}
                    symbol1={stdSymbol(usePoolStore.getState().token1.symbol)}
                    style={{ width: "32px" }}
                    size={24}
                    className1="shadow-[0_4px_6px_-1px_rgba(0,0,0,0.5)] rounded-full"
                />
            </div>
            <div className="flex flex-col p-1 gap-0">
                {/* <div className="flex items-center mb-1 gap-1 w-full">
                    <FormTokenSearch className="flex-1" target={inverted ? "token0" : "token1"} />
                    <div className="text-washed-dim font-light">/</div>
                    <FormTokenSearch className="flex-1" target={inverted ? "token1" : "token0"} />
                </div> */}
                <FormPairSearch className="w-full h-full" />
                <div className="border border-primary-100 rounded-md mt-3">
                    <div className="text-xs text-washed px-3 pt-2 text-left rounded-t-md">Highlights</div>
                    <Flex className="justify-between px-3 py-2 border-b border-primary-100 text-xs">
                        <div>Pair</div>
                        <div>Latest Price</div>
                    </Flex>

                    {/* bookmarks/highlight */}
                    {priceSrcData && priceSrcData.initPairs.map((pairObj) => (
                        <SymbolSelectorItem
                            key={pairObj.symbols}
                            pairObj={pairObj}
                        />
                    ))}
                </div>
            </div>
        </PopoverButton>
    )
}

const SymbolSelectorItem = ({ pairObj }) => {
    const [price, setPrice] = useState(null);

    const setPairFromPairObj = usePoolStore(fn => fn.setPairFromPairObj);
    const priceSrcData = useSourceStore(state => state.data);

    const delay = async (ms) => { // prevent free RPC rate limit
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    useEffect(() => {
        const liveUpdate = async () => {
            const cachedPrice = localStorage.getItem(`rtick-${pairObj.symbols}`);

            if (cachedPrice && (Date.now() - JSON.parse(cachedPrice).timestamp) < AppSetting.CacheTime_PairsPricesOnPicker) {
                setPrice(JSON.parse(cachedPrice).value.toString());
                return;
            }

            await delay(Math.floor(Math.random() * (2000 - 100 + 1)) + 100);
            const livePrice = await priceSrcData.fetchPrice(pairObj);
            setPrice(livePrice.toString());
            localStorage.setItem(`rtick-${pairObj.symbols}`, JSON.stringify({ value: livePrice, timestamp: Date.now() }));
        }

        liveUpdate();
    }, [pairObj, priceSrcData]);

    return (
        <button onClick={() => setPairFromPairObj(pairObj)} className="flex w-full px-3 py-2 hover:brightness-125 rounded-sm bg-primary-500 text-sm items-center justify-between">
            <div className="flex gap-2">
                <SymbolPair symbol0={stdSymbol(pairObj.token0.symbol)} symbol1={stdSymbol(pairObj.token1.symbol)} className="text-sm" />
                <PairIcon symbol0={stdSymbol(pairObj.token0.symbol)} symbol1={stdSymbol(pairObj.token1.symbol)} size={18} spacing="2px" />
            </div>
            <PriceText className="font-medium text-xs" input={price} />
            {!price && <LoadingIcon className="w-2.5 h-2.5" />}
        </button>
    )
}