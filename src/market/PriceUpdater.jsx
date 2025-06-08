import { useEffect, useRef } from "react";
import usePriceStore, { useSourceStore, useSymbolStore } from "../stores/stores";
import { formatAPI } from "../queries/api_formatter";
import { decimalTrimmer } from "../utils/decimalTrimmer";
import { SourceConst } from "../constants/sourceConst";

const supportWebSocket = {
    binance: true,
    dex: false,
}

const closeWebSocket = (ws) => {
    if (!ws.current) return;
    ws.current.onclose = null;
    ws.current.onerror = null;
    ws.current.close();
    ws.current = null;
}

/**
 * Ticking live price with websocket or REST
 * @param {type} param0 
 * @returns 
 */

const PriceUpdater = ({ type }) => {
    const setPrice = usePriceStore((state) => type == "trade" ? state.setTradePrice : state.setIndexPrice);
    const symbolIn = useSymbolStore(state => state.symbolIn);
    const symbolOut = useSymbolStore(state => state.symbolOut);
    const src = useSourceStore(state => state.src);
    const ws = useRef(null);
    let reconnectTimer = useRef(null);

    useEffect(() => {

        if (!symbolIn || !src) return;

        const fetchREST = async () => {
            const latestPrice = await SourceConst.dex.livePrice(symbolIn, symbolOut)
            setPrice(latestPrice);
        }

        // Websockt for Binance
        const connectWebSocket = () => {
            if (ws.current !== null) {
                closeWebSocket(ws);
            }

            const socket = new WebSocket(formatAPI[src](symbolOut, symbolIn)[type]);
            ws.current = socket;

            socket.onmessage = (event) => {
                const message = JSON.parse(event.data);
                const price = decimalTrimmer(Number(message.p));
                setPrice(price);
            };

            socket.onerror = handleReconnect;
            socket.onclose = handleReconnect;
        };

        const handleReconnect = () => {
            if (ws.current) {
                closeWebSocket(ws);
            }
            clearTimeout(reconnectTimer.current);
            reconnectTimer.current = setTimeout(connectWebSocket, 5000);
        };

        let updateTicker;

        if (supportWebSocket[src]) {
            connectWebSocket();
        } else {
            closeWebSocket(ws);
            updateTicker = setInterval(() => fetchREST(), 5000);
        }

        return () => {
            if (ws.current) {
                closeWebSocket(ws);
            }
            clearTimeout(reconnectTimer.current);
            if (updateTicker) clearInterval(updateTicker);
        };

    }, [setPrice, src, symbolIn, symbolOut, type]);

    return null; // ✅ No UI needed, only updates Zustand
};

export { PriceUpdater }