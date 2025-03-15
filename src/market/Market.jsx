import { useMemo, useState } from "react";
import { Flex } from "../Layout/Layout";
import { Text } from "../Layout/elements";
import MarketChart from "./MarketChart"; 

import { useChartQuery } from "../queries/chartquery";
import { CardText } from "./Components/CardText";
import { calculateHistoricalChange } from "./utils/pricechanges";
import { LivePriceText } from "./Components/LivePriceText";
import { useSymbolStore } from "../stores/stores";

function Market() {  
    const [range, setRange] = useState("1h");
    const [indicator, setIndicator] = useState(["SMA", "SMA5"]);
    const symbolIn = useSymbolStore(state => state.symbolIn);
    const symbolOut = useSymbolStore(state => state.symbolOut);
    
    const { data: OHLCData, isLoading } = useChartQuery({
        symbolIn: symbolIn,
        symbolOut: symbolOut,
        interval: range,
    });

    const priceChanges = useMemo(() => calculateHistoricalChange(OHLCData), [OHLCData])

    return (
        <div>
            <Flex className="flex-col gap-2">
                <Flex className="justify-between bg-primary p-4">
                    <Flex className="flex-col items-start">
                        <Text setSymbol={symbolOut} as="h6">{`${symbolOut}-${symbolIn}`}</Text>
                        <LivePriceText />
                    </Flex>
                    <Flex className="gap-7">
                        <Flex className="flex-col gap-4">
                            <CardText big={priceChanges.change} small={`${range} changes`} />
                            <CardText big={priceChanges.percent} small="% changes" />
                        </Flex>
                        <Flex className="flex-col gap-4">
                            <CardText big={priceChanges.low} small={`lowest ${range}`} />
                            <CardText big={priceChanges.high} small={`highest ${range}`} />
                        </Flex>
                    </Flex>
                </Flex>
                <MarketChart
                    symbol={symbolOut}
                    setIndicator={setIndicator}
                    setRange={setRange}
                    range={range}
                    OHLCData={OHLCData}
                    isLoading={isLoading}
                    indicator={indicator}
                />
            </Flex>
        </div>
    );
}

export default Market;