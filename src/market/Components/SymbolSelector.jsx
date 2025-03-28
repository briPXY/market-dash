import { TokenIcon } from "@web3icons/react";
import { SourceConst } from "../../constants/sourceConst";
import Button, { PopoverButton } from "../../Layout/Elements"
import { useSourceStore, useSymbolStore } from "../../stores/stores";
import { Flex } from "../../Layout/Layout";
import { useEffect, useState } from "react";
import { saveState } from "../../idb/stateDB";

export const SymbolSelector = ({ symbolIn, symbolOut }) => {
    const src = useSourceStore(state => state.src);
    const setAll = useSymbolStore(fn => fn.setAll);

    const setSymbol = async (symbol0, symbol1) => {
        await saveState(`savedTick-${src}`, [symbol0,symbol1])
        setAll(symbol0, symbol1);
    }

    return (
        <PopoverButton showClass={"bg-secondary w-[65vw] md:w-80 h-fit top-[100%] p-2 left-0 z-65 rounded-md"}>
            <div className="flex cursor-pointer font-medium items-center gap-1 justify-start hover:brightness-125 rounded-md">
                <div className="text-base md:text-lg">{`${symbolIn}/${symbolOut}`}</div>
                <TokenIcon symbol={symbolIn.toLowerCase()} size={32} color="#fff" variant="branded" className="bg-secondary rounded-full p-0.5" />
                <div className="text-xs text-washed">▼</div>
            </div>
            <div className="flex flex-col gap-3">
                <Flex className="justify-between text-washed text-xs px-2">
                    <div>{src == "dex"? "Pool" : "Symbol"}</div>
                    <div>Latest price/swap</div>
                </Flex>
                {SourceConst[src].symbols.map((pair, i) => (
                    <SymbolSelectorItem key={i} setSymbol={setSymbol} pair={pair} src={src} />
                ))}
            </div>
        </PopoverButton>
    )
}

const SymbolSelectorItem = ({ pair, setSymbol, src }) => {
    const [price, setPrice] = useState('-');

    useEffect(() => {
        const liveUpdate = async () => {
            const livePrice = await SourceConst[src].livePrice(pair[0], pair[1]);
            setPrice(livePrice);
        }
        liveUpdate();
    }, [pair, src])

    return (
        <Flex className="justify-between pr-3">
            <Button onClick={() => setSymbol(pair[0], pair[1])} className="w-fit p-0 text-sm gap-2">
                <TokenIcon symbol={pair[0].toLowerCase()} variant="branded" size={22} />
                <div>{`${pair[0]}/${pair[1]}`}</div>
            </Button>
            <div className="font-medium text-xs">{price}</div>
        </Flex>
    )
}