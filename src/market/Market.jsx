import { useState } from "react";
import { Flex, TabPanelParent } from "../Layout/Layout";
import MarketChart from "./MarketChart";

import { useChartQuery } from "../queries/chartquery";
import { LivePriceText } from "./Components/LivePriceText";
import { useSourceStore, useSymbolStore } from "../stores/stores";
import { use24HourQuery } from "../queries/24hourQuery";
import { Hour24Changes } from "./Components/Hour24Changes";
import { SymbolSelector } from "./Components/SymbolSelector";
import { NetworkSelection } from "./Components/NetworkSelection";
import { LoadSymbol } from "./Components/LoadSymbol";
import { PoolAddressView } from "./Components/PoolAddressView";
import { SwapHistory } from "./SwapHistory";
import Swap from "../contracts/swap";
import { SourceConst } from "../constants/sourceConst";

function Market() {
    const [range, setRange] = useState("1h");
    const { symbolIn, symbolOut } = useSymbolStore();
    const src = useSourceStore(state => state.src);

    const { data, isFetching, isError } = useChartQuery({
        symbolIn: symbolIn,
        symbolOut: symbolOut,
        interval: range,
        src: src,
    });

    //console.log("query")
    const { data: hour24data, isLoading: hour24Loading } = use24HourQuery({ symbolIn: symbolIn, symbolOut: symbolOut, src: src });

    //console.log("24h")
    if (!src) {
        //console.log("netselect")
        return (<NetworkSelection />);
    }

    if (src && !symbolIn) {
        //console.log("loadsymb")
        return (<LoadSymbol src={src} />);
    }

    return (
        <div>
            <Flex className="flex-col gap-1">
                <Flex className="justify-between gap-2 bg-primary p-2 py-4 md:p-4 ">
                    <Flex className="flex-col items-start text-sm md:text-lg font-semibold">
                        <SymbolSelector symbolIn={symbolIn} symbolOut={symbolOut} />
                        <LivePriceText OHLCData={data.ohlc ? data.ohlc : data} />
                        <PoolAddressView src={src} symbolIn={symbolIn} symbolOut={symbolOut} />
                    </Flex>
                    <Hour24Changes hour24Loading={hour24Loading} hour24data={hour24data} />
                </Flex>
                <Flex className="flex flex-col md:flex-row gap-1">
                    <MarketChart
                        symbol={symbolOut}
                        setRange={setRange}
                        range={range}
                        OHLCData={data.ohlc ? data.ohlc : data}
                        isFetching={isFetching}
                        isError={isError}
                        network={SourceConst[src]}
                    />
                    <TabPanelParent className="bg-primary mx-auto"><Swap symbolIn={symbolIn} symbolOut={symbolOut} label="Swap" /></TabPanelParent>
                </Flex>

                <SwapHistory swaps={data.swaps ? data.swaps : null} />
            </Flex>
        </div>
    );
}

export default Market;