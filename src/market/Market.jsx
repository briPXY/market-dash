import { useEffect, useRef, useState } from "react";
import { Box, Flex } from "../Layout/Layout";
import { Text } from "../Layout/elements";
import Chart from "./Chart";
import usePriceStore from "../stores/stores";

import { useChartQuery } from "../queries/chartquery";
import * as transform from "../queries/transforms";
import { API_DOMAIN, formatAPI } from "../queries/api_formatter";
import { timeInterval } from "../constants/intervals";
import { CardText } from "./Components/CardText";
import { calculateHistoricalChange } from "./utils/pricechanges";

function Market() {
    const [symbol, setSymbol] = useState("ETH");
    const tradePrice = usePriceStore((state) => state.trade);

    const [range, setRange] = useState("1h");
    const [indicator, setIndicator] = useState(["SMA", "SMA5"]);

    const priceChanges = useRef({ change: 0, low: 0, high: 0, percent: 0 })

    const { data: historicalData, isLoading } = useChartQuery({
        dataUrl: formatAPI[API_DOMAIN](symbol, range).historical,
        transformFn: transform[API_DOMAIN].linear,
        refetchInterval: timeInterval[range],
    });

    useEffect(() => {
        if (!historicalData) return;
        priceChanges.current = calculateHistoricalChange(historicalData)
    }, [historicalData])

    return (
        <Box>
            <Flex className="flex-col m-4">
                <Flex className="justify-between">
                    <Flex className="flex-col items-start">
                        <Text setSymbol={setSymbol} as="h6">{`${symbol}-USDT`}</Text>
                        <Text as="h4" className="text-green-600">{tradePrice}</Text>
                    </Flex>
                    <Flex className="gap-7">
                        <Flex className="flex-col gap-4">
                            <CardText big={priceChanges.current.change} small={`${range} changes`} />
                            <CardText big={priceChanges.current.percent} small="% changes" />
                        </Flex>
                        <Flex className="flex-col gap-4">
                            <CardText big={priceChanges.current.low} small={`lowest ${range}`} />
                            <CardText big={priceChanges.current.high} small={`highest ${range}`} />
                        </Flex>
                    </Flex>
                </Flex>
                <Chart
                    symbol={symbol}
                    setIndicator={setIndicator}
                    setRange={setRange}
                    range={range}
                    historicalData={historicalData}
                    isLoading={isLoading}
                    indicator={indicator}
                />
            </Flex>
        </Box>
    );
}

export default Market;