import { useEffect, useRef } from "react";
import usePriceStore, { useSourceStore, usePoolStore } from "../stores/stores";
import { SourceConst } from "../constants/sourceConst";

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
    const pool = usePoolStore(state => state.address); 
    const src = useSourceStore(state => state.src);
    const ws = useRef(null);
    let reconnectTimer = useRef(null);

    useEffect(() => {

        if (!pool || !src) return; 
 
        const connectWebSocket = () => {
            if (ws.current !== null) {
                closeWebSocket(ws); 
            } 
             
            const network = SourceConst[src];
            const socket = new WebSocket(network.getPriceURL(pool));
            ws.current = socket;

            socket.onmessage = (event) => {
                const message = JSON.parse(event.data);
                const converted = SourceConst[src].priceConverter(message.p, src, pool);
                setPrice(converted);
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

    }, [setPrice, src, pool, type]);

    return null; // ✅ No UI needed, only updates Zustand
};

export { PriceUpdater }