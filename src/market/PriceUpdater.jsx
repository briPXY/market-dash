import { useEffect, useRef } from "react";
import usePriceStore, { useSourceStore, usePoolStore } from "../stores/stores"; 

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
    const symbols = usePoolStore(state => state.symbols); 
    const priceSource = useSourceStore(state => state.data);
    const ws = useRef(null);
    let reconnectTimer = useRef(null);
    
    useEffect(() => { 

        if (symbols == "init" || useSourceStore.getState().src == "init") return; 
 
        const connectWebSocket = () => {
            if (ws.current !== null) {
                closeWebSocket(ws); 
            } 
 
            const socket = new WebSocket(priceSource.getPriceURL(symbols));
            ws.current = socket;

            socket.onmessage = (event) => {
                const message = JSON.parse(event.data);
                const converted = priceSource.priceConverter(message.p, usePoolStore.getState().token0, usePoolStore.getState().token1);
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

    }, [setPrice, type, symbols, priceSource]);

    return null; // ✅ No UI needed, only updates Zustand
};

export { PriceUpdater }