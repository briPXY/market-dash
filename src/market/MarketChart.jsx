


import LiveChart from "../charts/LiveChart";
import { Flex } from "../Layout/Layout";
import { RangeSelector } from "./Components/ChartBarMenu";

function MarketChart({ OHLCData, isFetching, isError, setRange, range }) { 
    
    return (
        <div className="bg-primary p-4 overflow-visible h-full w-full" >
            <Flex className="flex-col overflow-visible h-full w-full">
                <Flex className="pb-4 pt-4 items-center">
                    <RangeSelector setRange={setRange} selected={range} />
                    <div>{isFetching ? "Loading data.." : ''}</div>
                    <div>{isError ? "Connection error" : ''}</div>
                </Flex>
                <LiveChart
                    OHLCData={OHLCData}
                    range={range}
                    isFetching={isFetching}
                    isError={isError}
                />
            </Flex>
        </div>
    );
}


export default MarketChart;