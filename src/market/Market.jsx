import { useMemo, useState } from "react";
import { Flex } from "../Layout/Layout";
import { Text } from "../Layout/elements";
import MarketChart from "./MarketChart"; 

import { useChartQuery } from "../queries/chartquery"; 
import { calculateHistoricalChange } from "./utils/pricechanges";
import { LivePriceText } from "./Components/LivePriceText";
import { useSymbolStore } from "../stores/stores";
import { use24HourQuery } from "../queries/24hourQuery";
import { Hour24Changes } from "./Components/Hour24Changes";

function Market() {  
    const [range, setRange] = useState("1h"); 
    const symbolIn = useSymbolStore(state => state.symbolIn);
    const symbolOut = useSymbolStore(state => state.symbolOut);
    
    const { data: OHLCData, isLoading, isError } = useChartQuery({
        symbolIn: symbolIn,
        symbolOut: symbolOut,
        interval: range,
    });

    const {data: hour24data, isLoading: hour24Loading} = use24HourQuery({symbolIn: symbolIn, symbolOut: symbolOut});

    const priceChanges = useMemo(() => calculateHistoricalChange(hour24data), [hour24data])

    return (
        <div>
            <Flex className="flex-col gap-2">
                <Flex className="justify-between bg-primary p-4">
                    <Flex className="flex-col items-start">
                        <Text setSymbol={symbolOut} as="h6">{`${symbolOut}-${symbolIn}`}</Text>
                        <LivePriceText />
                    </Flex>
                   <Hour24Changes hour24Loading={hour24Loading} priceChanges={priceChanges} /> 
                </Flex>
                <MarketChart
                    symbol={symbolOut} 
                    setRange={setRange}
                    range={range}
                    OHLCData={OHLCData}
                    isLoading={isLoading} 
                    isError={isError}
                />
            </Flex>
        </div>
    );
}

export default Market;