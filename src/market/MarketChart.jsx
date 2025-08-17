


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

function MarketChart({ OHLCData, isError, setRange, range}) {
    const [chart, setChart] = useState({ n: "Candlestick", f: candlestick });
    const [lengthPerItem, setLengthPerItem] = useState(isAgentMobile ? 6 : 7);
    const [isLogScale, setYscale] = useState("LOG");

    return (
        <div className={`bg-primary-900 p-2 md:p-4 h-full w-full md:w-[77%] md:flex-none`}>
            <Flex className="flex-col h-full">
                <Flex className="pb-4 pt-4 items-center gap-2 justify-between">
                    <RangeSelector setRange={setRange} selected={range} />
                    <div>{isError ? "Connection error" : ''}</div>
                    <Flex className="overflow-visible justify-end items-center gap-2 text-sm">
                        <PopoverButton showClass={"w-auto h-full top-[100%] right-0 z-15"}>
                            <Button className="w-6 h-6">
                                <img className="w-3 h-3 invert" src={`/svg/${chart.n}.svg`} />
                            </Button>
                            <ChartSelector setChart={setChart} activeChart={chart.n} />
                        </PopoverButton>
                        <PopoverButton showClass={"w-auto h-full top-[100%] right-0 z-15"}>
                            <Button className="text-xs px-1.5 h-6">{isLogScale.toLowerCase()}</Button>
                            <Yscale setYscale={setYscale}></Yscale>
                        </PopoverButton>
                        <ZoomOverlay setLengthPerItem={setLengthPerItem} />
                    </Flex>
                </Flex>
                <SvgContainer
                    OHLCData={OHLCData}
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