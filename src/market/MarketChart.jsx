


import { useState } from "react";
import LiveChart from "../charts/LiveChart";
import Button, { PopoverButton } from "../Layout/elements";
import { Flex } from "../Layout/Layout";
import { RangeSelector } from "./Components/ChartBarMenu";
import { ChartSelector } from "./Components/ChartSelector";
import { candlestick } from "../charts/charts/candlestick";

function MarketChart({ OHLCData, isFetching, isError, setRange, range }) {
    const [chart, setChart] = useState({ n: "Candlestick", f: candlestick });

    return (
        <div className="bg-primary p-4 overflow-visible h-full w-full" >
            <Flex className="flex-col overflow-visible h-full w-full">
                <Flex className="pb-4 pt-4 items-center justify-between">
                    <RangeSelector setRange={setRange} selected={range} />
                    <div>{isFetching ? "Loading data.." : ''}</div>
                    <div>{isError ? "Connection error" : ''}</div>
                    <PopoverButton showClass={"w-auto h-full top-[100%] right-6 z-15"}>
                        <Button>
                            <img className="w-4 h-4 invert" src={`/svg/${chart.n}.svg`} />
                        </Button>
                        <ChartSelector setChart={setChart} activeChart={chart.n} />
                    </PopoverButton>
                </Flex>
                <LiveChart
                    OHLCData={OHLCData}
                    range={range}
                    isFetching={isFetching}
                    isError={isError}
                    chart={chart.f}
                />
            </Flex>
        </div>
    );
}


export default MarketChart;