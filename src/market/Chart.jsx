
import { useChartQuery } from "../queries/chartQuery";
import * as transform from "../queries/transforms";
import { useEffect, useState } from "react";

import LiveLineChart from "./Line";
import { timeInterval } from "../constants/intervals";
import { Box, Flex, PopoverButton } from "../Layout/Layout";
import { IndicatorList } from "./Components/ChartBarMenu";
import { Yscale } from "./Components/Yscale";
 
function Chart({ symbol, range }) { 
    
    const [livePrice, setLivePrice] = useState(null);
    const [indicator, setIndicator] = useState(["SMA", "SMA5"]);
    const [yscale, setYscale] = useState("LOG");

    const dataUrl = import.meta.env[`VITE_${symbol.toUpperCase()}_${range}`];
    const transformFn = transform[import.meta.env.VITE_API_DOMAIN].linear;
    const refetchInterval = timeInterval[range];
    const { data: historicalData, isLoading } = useChartQuery({ dataUrl, transformFn, refetchInterval });
 

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
                </Flex>
                <LiveLineChart isLogScale={yscale == "LOG"} indicatorType={indicator[0]} 
                indicatorMethod={indicator[1]} width={1200} height={500} historicalData={historicalData} 
                livePrice={livePrice}/>
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