import { useEffect, useRef } from "react";
import usePriceStore, { useSourceStore, useSymbolStore } from "../stores/stores";
import { formatAPI } from "../queries/api_formatter";
import { decimalTrimmer } from "../utils/decimalTrimmer";

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
 
        const connectWebSocket = () => {
            if (ws.current !== null) {
                closeWebSocket(ws); 
            }

            if (!formatAPI[src](symbolOut, symbolIn)[type]) {
                return;
            }
             
            const socket = new WebSocket(formatAPI[src](symbolOut, symbolIn)[type]); 
            ws.current = socket;

            socket.onmessage = (event) => {
                const message = JSON.parse(event.data); 
                const price = decimalTrimmer(Number(message.p)); 
                setPrice(price);console.log(message);
            };

            socket.onerror = (err) => handleReconnect(err);
            socket.onclose = handleReconnect;
        };

        const handleReconnect = (error) => { 
            if (ws.current) {
                closeWebSocket(ws);
            }
            if (error){
                console.error(error)
            }

            clearTimeout(reconnectTimer.current);
            reconnectTimer.current = setTimeout(connectWebSocket, 5000);
        };

        let updateTicker;

        connectWebSocket();

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