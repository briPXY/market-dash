
import { useChartQuery } from "../queries/chartquery";
import * as transform from "../queries/transforms";
import { useEffect, useState } from "react";

import LiveLineChart from "./Line";
import { timeInterval } from "../constants/intervals";
import { Box, Flex, PopoverButton } from "../Layout/Layout";
import { IndicatorList, RangeSelector } from "./Components/ChartBarMenu";
import { Yscale } from "./Components/Yscale";
import { formatAPI } from "../queries/api_formatter";

function Chart({ symbol }) {

    const [livePrice, setLivePrice] = useState(null);
    const [range, setRange] = useState("1h");
    const [indicator, setIndicator] = useState(["SMA", "SMA5"]);
    const [yscale, setYscale] = useState("LOG");
 
    const { data: historicalData, isLoading } = useChartQuery({ 
        dataUrl: formatAPI[import.meta.env.VITE_API_DOMAIN](symbol, range), 
        transformFn: transform[import.meta.env.VITE_API_DOMAIN].linear, 
        refetchInterval: timeInterval[range],
    });

    // ticker
    useEffect(() => {
        if (!symbol) return;

        let ws;
        let reconnectTimer;

        const connectWebSocket = () => {
            ws = new WebSocket(import.meta.env[`VITE_${symbol.toUpperCase()}_TICK`]);

            ws.onmessage = (event) => {
                const message = JSON.parse(event.data);
                setLivePrice(parseFloat(message.p)); // Store live price separately
            };

            ws.onerror = reconnectWebSocket;
            ws.onclose = reconnectWebSocket;
        };

        const reconnectWebSocket = () => {
            if (ws) ws.close();
            clearTimeout(reconnectTimer);
            reconnectTimer = setTimeout(connectWebSocket, 5000);
        };

        connectWebSocket();

        return () => {
            if (ws) ws.close();
            clearTimeout(reconnectTimer);
        };
    }, [symbol]);

    if (isLoading) return <p>Loading...</p>;

    return (
        <Box className="overflow-visible">
            <Flex column className="overflow-visible">
                <Flex>
                    <PopoverButton>
                        <button>{indicator[0]}</button>
                        <IndicatorList setIndicator={setIndicator} />
                    </PopoverButton>
                    <RangeSelector setRange={setRange} selected={range}/>
                </Flex>
                <LiveLineChart isLogScale={yscale == "LOG"} indicatorType={indicator[0]}
                    indicatorMethod={indicator[1]} width={1200} height={500} historicalData={historicalData}
                    livePrice={livePrice} />
                <Flex className="overflow-visible">
                    <PopoverButton>
                        <button>{yscale}</button>
                        <Yscale setYscale={setYscale}></Yscale>
                    </PopoverButton>
                </Flex>
            </Flex>
        </Box>
    );
}


export default Chart;