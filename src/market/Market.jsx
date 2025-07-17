import { useState } from "react";
import { Flex, TabPanelParent } from "../Layout/Layout";
import MarketChart from "./MarketChart";

import { useChartQuery } from "../queries/chartquery";
import { LivePriceText } from "./Components/LivePriceText";
import { useSourceStore, useSymbolStore } from "../stores/stores";
import { Hour24Changes } from "./Components/Hour24Changes";
import { SymbolSelector } from "./Components/SymbolSelector";
import { NetworkSelection } from "./Components/NetworkSelection";
import { LoadSymbol } from "./Components/LoadSymbol";
import { PoolAddressView } from "./Components/PoolAddressView";
import { SwapHistory } from "./SwapHistory";
import Swap from "../contracts/Swap";
import { SourceConst } from "../constants/sourceConst";
import { initData } from "../constants/initData";

function Market() {
    const [range, setRange] = useState("1h");
    const { symbolIn, symbolOut } = useSymbolStore();
    const network = useSourceStore(state => state.src);

    const { data = initData, isFetching, isError } = useChartQuery({
        symbolIn: symbolIn,
        symbolOut: symbolOut,
        interval: range,
        network: network,
    });

    return (
        <div>
            <NetworkSelection networkStatus={!network}/>
            <LoadSymbol symbolStatus={network && !symbolIn}/>
            <Flex className="flex-col gap-1">
                <Flex className="justify-between gap-2 bg-primary p-2 py-4 md:p-4 ">
                    <Flex className="flex-col items-start text-sm md:text-lg font-semibold">
                        <SymbolSelector symbolIn={symbolIn} symbolOut={symbolOut} />
                        <LivePriceText OHLCData={data.ohlc} />
                        <PoolAddressView src={network} symbolIn={symbolIn} symbolOut={symbolOut} />
                    </Flex>
                    <Hour24Changes symbolIn={symbolIn} symbolOut={symbolOut} src={network} />
                </Flex>
                <Flex className="flex flex-col md:flex-row gap-1">
                    <MarketChart
                        symbol={symbolOut}
                        setRange={setRange}
                        range={range}
                        OHLCData={data.ohlc}
                        isFetching={isFetching}
                        isError={isError}
                        network={SourceConst[network]}
                    />
                    <TabPanelParent className="bg-primary mx-auto" style={{ display: SourceConst[network]?.isDex ? "block" : "none" }}>
                        <Swap symbolIn={symbolIn} symbolOut={symbolOut} network={SourceConst[network]} label="Swap" />
                    </TabPanelParent>
                </Flex>

                <SwapHistory swaps={data.swaps ? data.swaps : []} />
            </Flex>
        </div>
    );
}

export default Market;