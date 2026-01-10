import { useEffect, useMemo, useState } from "react";
import { Flex, TabPanelParent } from "../Layout/Layout";
import MarketChart from "./MarketChart";

import { PriceUpdater } from './PriceUpdater';
import { useChartQuery } from "../queries/chartquery";
import { LivePriceText } from "./Components/LivePriceText";
import usePriceStore, { usePoolStore, usePriceInvertStore } from "../stores/stores";
import { Hour24Changes } from "./Components/Hour24Changes";
import { PairSelector } from "./Components/PairSelector";
import { NetworkSelection } from "./Components/NetworkSelection";
import { LoadSymbol } from "./Components/LoadSymbol";
// import { PoolAddressView } from "./Components/PoolAddressView";
import { SwapHistory } from "./SwapHistory";
import Swap from "../order/Swap";
import { invertedHistoricalPrices } from "../utils/utils";
import { PopoverButton } from "../Layout/Elements";

function Market() {
    const [range, setRange] = useState("1h");
    const invertedStatus = usePriceInvertStore((state) => state.priceInvert);

    const { data, isError, error, isFetching } = useChartQuery({ symbolStoreObj: usePoolStore.getState(), interval: range });

    const invertedHistorical = useMemo(() => {
        if (invertedStatus) {
            return invertedHistoricalPrices(data?.ohlc);
        }
    }, [data, invertedStatus]);

    useEffect(() => {
        if (!isError && data?.ohlc.length > 0) {
            const historical = invertedStatus ? invertedHistorical : data.ohlc;
            usePriceStore.getState().setDecimalCount(historical[0].close);
            usePriceStore.getState().setTradePrice(historical[historical.length - 1].close);
        }

    }, [data, invertedHistorical, invertedStatus, isError]); // Dependencies: runs whenever `data` or `isError` changes

    return (
        <div>
            <NetworkSelection />
            <LoadSymbol />
            <Flex className="flex-col gap-1">
                <Flex className="justify-between flex-row gap-1 md:gap-3 bg-primary-900 p-2 py-4 md:p-3 md:items-center rounded-md">
                    <Flex className="gap-2 items-center text-sm md:text-lg font-semibold">
                        <PairSelector />
                        <LivePriceText OHLCData={invertedStatus ? invertedHistorical : data?.ohlc} />
                        {/* <PoolAddressView /> */}
                    </Flex>
                    <div className="hidden md:block">
                        <Hour24Changes />
                    </div>
                    <PopoverButton className="md:hidden" showClass="w-max p-6 rounded-md h-fit top-[100%] bg-primary-500 right-0 z-25">
                        <button className="text-xs text-washed">24h Changes<span className="text-[12px] px-1 text-washed-dim">▼</span></button>
                        <Hour24Changes />
                    </PopoverButton>
                </Flex>
                <Flex className="flex flex-col md:flex-row md:items-stretch gap-1">
                    <MarketChart
                        setRange={setRange}
                        range={range}
                        OHLCData={invertedStatus ? invertedHistorical : data?.ohlc}
                        isError={isError}
                        error={error}
                        isFetching={isFetching}
                        dataSymbols={data?.symbols}
                    />
                    <TabPanelParent
                        className="md:flex-1 flex flex-col"
                        tabClassName="flex-1 rounded-t-lg px-3 py-2 text-sm font-semibold"
                        btnContainerClassName="flex px-3 pt-4 justify-center items-center bg-primary-900 rounded-t-md"
                        activeTabClassName = "bg-primary-300 border-b-primary"
                        childrensClassName="w-full flex flex-col grow"
                        activeDisplay="flex"
                    >
                        <Swap label="Swap" />
                    </TabPanelParent>
                </Flex>

                <Flex className="flex flex-col md:h-64 md:flex-row gap-1 items-stretch">
                    <div className="bg-primary-900 p-2 md:p-4 2xl:w-[79%] xl:w-[74%] lg:w-[72%] md:w-[65%] rounded-md">

                    </div>
                    <div className="flex-1 h-full bg-primary-900 rounded-md">
                        <SwapHistory />
                    </div>
                </Flex>
            </Flex>

            {/* Non display / non pure component*/}
            <PriceUpdater type="trade" />
        </div>
    );
}

export default Market;