import { useState } from "react";
import { Flex, TabPanelParent } from "../Layout/Layout";
import MarketChart from "./MarketChart";

import { useChartQuery } from "../queries/chartquery";
import { LivePriceText } from "./Components/LivePriceText";
import { useSourceStore, usePoolStore } from "../stores/stores";
import { Hour24Changes } from "./Components/Hour24Changes";
import { PoolSelector } from "./Components/PoolSelector";
import { NetworkSelection } from "./Components/NetworkSelection";
import { LoadSymbol } from "./Components/LoadSymbol";
import { PoolAddressView } from "./Components/PoolAddressView";
import { SwapHistory } from "./SwapHistory";
import Swap from "../contracts/Swap";
import { SourceConst } from "../constants/sourceConst";
import { initData } from "../constants/initData";

function Market({ handleNetworkChange }) {
    const [range, setRange] = useState("1h");
    const { address } = usePoolStore();
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
                <Flex className="justify-between gap-2 bg-primary p-2 py-4 md:p-4 ">
                    <Flex className="flex-col items-start text-sm md:text-lg font-semibold">
                        <PoolSelector address={address} />
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
                    <TabPanelParent className="bg-primary mx-auto" style={{ display: SourceConst[network]?.isDex ? "block" : "none" }}>
                        <Swap
                            token0={SourceConst[network].info[address].token0}
                            token1={SourceConst[network].info[address].token1}
                            poolAddress={address}
                            network={SourceConst[network]}
                            isDEX={SourceConst[network].isDex}
                            label="Swap"
                        />
                    </TabPanelParent>
                </Flex>

                <SwapHistory swaps={data.swaps ? data.swaps : []} />
            </Flex>
        </div>
    );
}

export default Market;