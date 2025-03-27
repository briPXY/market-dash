


import { useState } from "react";
import LiveChart from "../charts/LiveChart";
import Button, { PopoverButton } from "../Layout/elements";
import { Flex } from "../Layout/Layout";
import { RangeSelector } from "./Components/ChartBarMenu";
import { ChartSelector } from "./Components/ChartSelector";
import { candlestick } from "../charts/charts/candlestick";
import { Yscale } from "./Components/Yscale";
import { ZoomOverlay } from "../charts/ZoomOverlay";

function MarketChart({ OHLCData, isFetching, isError, setRange, range }) {
    const [chart, setChart] = useState({ n: "Candlestick", f: candlestick });
    const [lengthPerItem, setLengthPerItem] = useState(14);
    const [isLogScale, setYscale] = useState("LOG");

    if (!OHLCData.length) {
        return (<div>waiting for the network...</div>)
    }

    return (
        <div className="bg-primary p-4 overflow-visible h-full w-full" >
            <Flex className="flex-col overflow-visible h-full w-full">
                <Flex className="pb-4 pt-4 items-center gap-2 justify-between">
                    <RangeSelector setRange={setRange} selected={range} />

                    <div>{isFetching ? "Loading data.." : ''}</div>
                    <div>{isError ? "Connection error" : ''}</div>

                    <Flex className="overflow-visible justify-end items-center gap-4 text-sm">
                        <PopoverButton showClass={"w-auto h-full top-[100%] right-0 z-15"}>
                            <Button>
                                <img className="w-4 h-4 invert" src={`/svg/${chart.n}.svg`} />
                            </Button>
                            <ChartSelector setChart={setChart} activeChart={chart.n} />
                        </PopoverButton>
                        <PopoverButton showClass={"w-auto h-full top-[100%] right-0 z-15"}>
                            <Button className="text-xs">{isLogScale.toLowerCase()}</Button>
                            <Yscale setYscale={setYscale}></Yscale>
                        </PopoverButton>
                        <ZoomOverlay setLengthPerItem={setLengthPerItem} />
                    </Flex>
                </Flex>
                <LiveChart
                    OHLCData={OHLCData}
                    range={range}
                    isFetching={isFetching}
                    isError={isError}
                    chart={chart.f}
                    isLogScale={isLogScale}
                    lengthPerItem={lengthPerItem}
                />
            </Flex>
        </div>
    );
}


export default MarketChart;