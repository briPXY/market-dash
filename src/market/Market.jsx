import { useEffect, useMemo, useState } from "react";
import { Flex, TabPanelParent } from "../Layout/Layout";
import MarketChart from "./MarketChart";

import { PriceUpdater } from './PriceUpdater';
import { useChartQuery } from "../queries/chartquery";
import { LivePriceText } from "./Components/LivePriceText";
import {  usePoolStore, usePriceInvertStore } from "../stores/stores";
import { Hour24Changes } from "./Components/Hour24Changes";
import { PoolSelector } from "./Components/PoolSelector";
import { NetworkSelection } from "./Components/NetworkSelection";
import { LoadSymbol } from "./Components/LoadSymbol";
import { PoolAddressView } from "./Components/PoolAddressView";
import { SwapHistory } from "./SwapHistory";
import Swap from "../order/Swap";
import { PriceSample } from "../utils/price.math";
import { invertedHistoricalPrices } from "../utils/utils";

function Market({ initState }) {
    const [range, setRange] = useState("1h");
    const symbols = usePoolStore(state => state.symbols);
    const invertedStatus = usePriceInvertStore((state) => state.priceInvert);

    const { data, isError, error, isFetching } = useChartQuery({ symbols, symbolStoreObj: usePoolStore.getState(), interval: range, initState });

    useEffect(() => {
        if (!isError && data?.length > 0) {
            PriceSample.historical = data?.ohlc[0].close;
        }

    }, [data, isError]); // Dependencies: runs whenever `data` or `isError` changes

    const invertedHistorical = useMemo(() => {
        if (invertedStatus) {
            return invertedHistoricalPrices(data?.ohlc)
        }
    }
        , [data, invertedStatus]);

    return (
        <div>
            <NetworkSelection />
            <LoadSymbol />
            <Flex className="flex-col gap-1">
                <Flex className="justify-between gap-3 bg-primary-900 p-2 py-4 md:p-4 md:items-center">
                    <Flex className="flex-col md:flex-row md:gap-5 md:items-center items-start text-sm md:text-lg font-semibold">
                        <PoolSelector />
                        <LivePriceText OHLCData={invertedStatus ? invertedHistorical : data?.ohlc} />
                        <PoolAddressView />
                    </Flex>
                    <Hour24Changes initState={initState} />
                </Flex>
                <Flex className="flex flex-col md:flex-row gap-1">
                    <MarketChart
                        setRange={setRange}
                        range={range}
                        OHLCData={invertedStatus ? invertedHistorical : data?.ohlc}
                        isError={isError}
                        error={error}
                        isFetching={isFetching}
                        dataSymbols={data?.symbols}
                    />
                    <TabPanelParent className="md:flex-1" tabClassName="flex-1 rounded-t-lg px-3 py-2 bo text-sm font-semibold" btnContainerClassName="flex px-3 pt-4 justify-center items-center bg-primary-900">
                        <Swap label="Swap" />
                    </TabPanelParent>
                </Flex>

                <div className="flex w-full bg-primary-900 p-2 md:p-4 justify-center">
                    <SwapHistory swaps={data?.swaps ? data?.swaps : []} />
                </div>
            </Flex>

            {/* Non display / non pure component*/}
            <PriceUpdater type="trade" />
        </div>
    );
}

export default Market;