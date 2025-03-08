import { useEffect } from "react";
import usePriceStore from "./stores";
import { API_DOMAIN, formatAPI } from "../queries/api_formatter";

const PriceUpdater = ({ symbol , type}) => {
    const setPrice = usePriceStore((state) => type == "trade" ? state.setTradePrice : state.setIndexPrice);

    useEffect(() => {
        let ws;
        let reconnectTimer;

        const connectWebSocket = () => {
            ws = new WebSocket(formatAPI[API_DOMAIN](symbol)[type]);

            ws.onmessage = (event) => {
                const message = JSON.parse(event.data);
                setPrice(parseFloat(message.p)); // Store live price separately
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
    }, [setPrice, symbol, type]);

    return null; // ✅ No UI needed, only updates Zustand
}; 

export {PriceUpdater}