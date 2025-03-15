

import { useRef } from "react";
import LiveChart from "../charts/LiveChart";
import { Flex, PopoverButton } from "../Layout/Layout";
import { IndicatorList, RangeSelector } from "./Components/ChartBarMenu"; 

function MarketChart({ OHLCData, isLoading, setRange, setIndicator, indicator, range }) {
    const containerRef = useRef(null);
 
    if (isLoading) {
        return (
            <div className="w-full h-full" >
                <p>Loading...</p>
            </div>
        )
    }

    return (
        <div ref={containerRef} className="bg-primary p-4 overflow-visible h-full w-full" >
            <Flex className="flex-col overflow-visible h-full w-full">
                <Flex className="pb-4 pt-4 items-center">
                    <PopoverButton>
                        <button>{indicator[1]}</button>
                        <IndicatorList setIndicator={setIndicator} />
                    </PopoverButton>
                    <RangeSelector setRange={setRange} selected={range} />
                </Flex>
                <LiveChart indicatorType={indicator[0]}
                    indicatorMethod={indicator[1]} OHLCData={OHLCData} range={range} /> 
            </Flex>
        </div>
    );
}


export default MarketChart;