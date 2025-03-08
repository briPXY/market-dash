import { useState } from "react";
import { Box, Flex } from "../Layout/Layout";
import { Text } from "../Layout/elements";
import Chart from "./Chart";
import usePriceStore from "../stores/stores";


function Market() {
    const [symbol, setSymbol] = useState("ETH");
    const tradePrice = usePriceStore((state) => state.trade);

    return (
        <Box>
            <Flex column>
                <Flex className="justify-between">
                    <Flex column>
                        <Text setSymbol={setSymbol} as="h6">{`${symbol}-USDT`}</Text>
                        <Text as="h4" className="text-green-600">{tradePrice}</Text>
                    </Flex>
                </Flex>
                <Chart symbol={symbol} />
            </Flex>
        </Box>
    );
}

export default Market;