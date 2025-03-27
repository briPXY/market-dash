import { useState } from "react";
import { Flex } from "../Layout/Layout";
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

function Market() {
    const [range, setRange] = useState("1h");
    const { symbolIn, symbolOut } = useSymbolStore();
    const src = useSourceStore(state => state.src);

    const { data: OHLCData, isFetching, isError } = useChartQuery({
        symbolIn: symbolIn,
        symbolOut: symbolOut,
        interval: range,
        src: src,
    });

    const { data: hour24data, isLoading: hour24Loading } = use24HourQuery({ symbolIn: symbolIn, symbolOut: symbolOut, src: src });

    if (!src) {
        return (<NetworkSelection />);
    }

    if (src && !symbolIn) {
        return (<LoadSymbol src={src} />)
    }

    return (
        <div>
            <Flex className="flex-col gap-1">
                <Flex className="justify-between bg-primary p-4">
                    <Flex className="flex-col items-start">
                        <SymbolSelector symbolIn={symbolIn} symbolOut={symbolOut} />
                        <LivePriceText OHLCData={OHLCData} />
                        <PoolAddressView src={src} symbolIn={symbolIn} symbolOut={symbolOut} />
                    </Flex>
                    <Hour24Changes hour24Loading={hour24Loading} hour24data={hour24data} />
                </Flex>
                <MarketChart
                    symbol={symbolOut}
                    setRange={setRange}
                    range={range}
                    OHLCData={OHLCData}
                    isFetching={isFetching}
                    isError={isError}
                />
            </Flex>
        </div>
    );
}

export default Market;