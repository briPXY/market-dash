


import { useState } from "react";
import SvgContainer from "../charts/SvgContainer";
import Button, { PopoverButton } from "../Layout/Elements";
import { Flex } from "../Layout/Layout";
import { RangeSelector } from "./Components/ChartBarMenu";
import { ChartSelector } from "./Components/ChartSelector";
import { candlestick } from "../charts/charts/candlestick";
import { Yscale } from "./Components/Yscale";
import { ZoomOverlay } from "../charts/ZoomOverlay";
import { isAgentMobile } from "../constants/environment";
import { PreChartScreen } from "./Components/PreChartScreen";
import { initData } from "../constants/initData";

function MarketChart({ OHLCData, isError, isFetching, error, setRange, range, dataSymbols }) {
    const [chart, setChart] = useState({ n: "Candlestick", f: candlestick });
    const [lengthPerItem, setLengthPerItem] = useState(isAgentMobile ? 4 : 6);
    const [isLogScale, setYscale] = useState("LOG"); 

    return (
        <div className={`bg-primary-900 p-2 md:p-4 h-full w-full 2xl:w-[79%] xl:w-[74%] lg:w-[72%] md:w-[65%] sm:w-[60%] md:flex-none`}>
            <Flex className="flex-col h-full relative">
                <Flex className="pb-3 pt-0 items-center gap-2 justify-between">
                    <RangeSelector setRange={setRange} selected={range} />
                    <div className="text-xs text-accent-negative">{isError ? "Connection error" : ''}</div>
                    <Flex className="overflow-visible justify-end items-center gap-2 text-sm">
                        <PopoverButton showClass={"w-auto h-full top-[100%] right-0 z-15"}>
                            <Button className="w-6 h-6">
                                <img className="w-3 h-3 invert" src={`/svg/${chart.n}.svg`} />
                            </Button>
                            <ChartSelector setChart={setChart} activeChart={chart.n} />
                        </PopoverButton>
                        <PopoverButton showClass={"w-auto h-full top-[100%] right-0 z-15"}>
                            <Button className="text-xs text-washed px-1.5 h-6">{isLogScale.toLowerCase()}</Button>
                            <Yscale setYscale={setYscale}></Yscale>
                        </PopoverButton>
                        <ZoomOverlay setLengthPerItem={setLengthPerItem} />
                    </Flex>
                </Flex>
                <PreChartScreen isFetching={isFetching} error={error} isError={isError} dataSymbols={dataSymbols} />
                <SvgContainer
                    OHLCData={OHLCData ?? initData.ohlc}
                    range={range}
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