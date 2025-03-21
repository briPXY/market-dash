import { useState } from "react";
import { Flex } from "../Layout/Layout";
import { Text } from "../Layout/elements";
import MarketChart from "./MarketChart";

import { useChartQuery } from "../queries/chartquery";
import { LivePriceText } from "./Components/LivePriceText";
import { useSymbolStore } from "../stores/stores";
import { use24HourQuery } from "../queries/24hourQuery";
import { Hour24Changes } from "./Components/Hour24Changes";

function Market() {
    const [range, setRange] = useState("1h");
    const symbolIn = useSymbolStore(state => state.symbolIn);
    const symbolOut = useSymbolStore(state => state.symbolOut);

    const { data: OHLCData, isFetching, isError } = useChartQuery({
        symbolIn: symbolIn,
        symbolOut: symbolOut,
        interval: range,
    });

    const { data: hour24data, isLoading: hour24Loading } = use24HourQuery({ symbolIn: symbolIn, symbolOut: symbolOut });
    console.log(OHLCData.length)
    return (
        <div>
            <Flex className="flex-col gap-2">
                <Flex className="justify-between bg-primary p-4">
                    <Flex className="flex-col items-start">
                        <Text setSymbol={symbolOut} as="h6">{`${symbolOut}-${symbolIn}`}</Text>
                        <LivePriceText OHLCData={OHLCData} />
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