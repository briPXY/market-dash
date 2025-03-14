import { useEffect } from "react";
import usePriceStore from "./stores";
import { API_DOMAIN, formatAPI } from "../queries/api_formatter";

const supportWebSocket = {
    binance: true,
    dex: false,
}

const PriceUpdater = ({ symbolOut, type }) => {
    const setPrice = usePriceStore((state) => type == "trade" ? state.setTradePrice : state.setIndexPrice);

    useEffect(() => {
        let ws;
        let reconnectTimer;

        const fetchREST = async () => {
            const fetchURL = formatAPI[API_DOMAIN]('usdt', symbolOut)[type];
            try {
                const response = await fetch(fetchURL);
                const data = await response.json();

                // Extract the float price
                if (data.outAmount) {
                    const price = parseFloat(data.outAmount) / 1e6; // USDT usually has 6 decimals
                    return price;
                } else {
                    throw new Error("No price data found");
                }
            } catch (error) {
                console.error("Error fetching price:", error);
                return null;
            }
        } 

        const connectWebSocket = () => {
            ws = new WebSocket(formatAPI[API_DOMAIN]("usdt", symbolOut)[type]);

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

        const updateTicker = supportWebSocket[API_DOMAIN] ? connectWebSocket() : setInterval(() => fetchREST(), 2000); ;

        return () => {
            if (ws) ws.close();
            clearTimeout(reconnectTimer);
            clearInterval(updateTicker);
        };
    }, [setPrice, symbolOut, type]);

    return null; // ✅ No UI needed, only updates Zustand
};

export { PriceUpdater }