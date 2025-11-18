import { useState } from "react";
import { Flex, TabPanelParent } from "../Layout/Layout";
import MarketChart from "./MarketChart";

import { PriceUpdater } from './PriceUpdater';
import { useChartQuery } from "../queries/chartquery";
import { LivePriceText } from "./Components/LivePriceText";
import { useSourceStore, usePoolStore } from "../stores/stores";
import { Hour24Changes } from "./Components/Hour24Changes";
import { PoolSelector } from "./Components/PoolSelector";
import { NetworkSelection } from "./Components/NetworkSelection";
import { LoadSymbol } from "./Components/LoadSymbol";
import { PoolAddressView } from "./Components/PoolAddressView";
import { SwapHistory } from "./SwapHistory";
import Swap from "../order/Swap";
import { SourceConst } from "../constants/sourceConst";
import { initData } from "../constants/initData";
import WalletList from "../order/WalletList";

function Market({ handleNetworkChange }) {
    const [range, setRange] = useState("1h");
    const address = usePoolStore(state => state.address);
    const { src: network } = useSourceStore();

    const { data = initData, isError } = useChartQuery({
        address: address,
        interval: range,
        network: network,
    });

    return (
        <div>
            <NetworkSelection handleNetworkChange={handleNetworkChange} />
            <LoadSymbol />
            <Flex className="flex-col gap-1">
                <Flex className="justify-between gap-3 bg-primary-900 p-2 py-4 md:p-4 md:items-center">
                    <Flex className="flex-col md:flex-row md:gap-5 md:items-center items-start text-sm md:text-lg font-semibold">
                        <PoolSelector />
                        <LivePriceText OHLCData={data.ohlc} />
                        <PoolAddressView src={network} address={address} />
                    </Flex>
                    <Hour24Changes address={address} src={network} />
                </Flex>
                <Flex className="flex flex-col md:flex-row gap-1">
                    <MarketChart
                        setRange={setRange}
                        range={range}
                        OHLCData={data.ohlc}
                        isError={isError}
                        network={SourceConst[network]}
                    />
                    <TabPanelParent className="md:flex-1" style={{ display: SourceConst[network]?.isDex ? "block" : "none" }} tabClassName="rounded-md px-3 py-2 text-xs font-medium" btnContainerClassName="flex pt-4 justify-center items-center bg-primary-900">
                        <Swap
                            token0={SourceConst[network].info[address].token0}
                            token1={SourceConst[network].info[address].token1}
                            isDEX={SourceConst[network].isDex}
                            label="Swap"
                        />
                    </TabPanelParent>
                </Flex>

                <div className="flex w-full bg-primary-900 p-2 md:p-4 justify-center">
                    <SwapHistory swaps={data.swaps ? data.swaps : []} />
                </div>
            </Flex>
            {/* Modals */}
            <WalletList />

            {/* Non display / non pure component*/}
            <PriceUpdater type="trade" />  {/* ✅ Updates trade price */}
            <PriceUpdater type="index" />  {/* ✅ Updates index price */}
        </div>
    );
}

export default Market;