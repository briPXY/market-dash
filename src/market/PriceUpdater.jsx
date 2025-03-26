import { useEffect, useRef } from "react";
import usePriceStore, { useSourceStore, useSymbolStore } from "../stores/stores";
import {  formatAPI } from "../queries/api_formatter";
import { PoolAddress, TokenDecimal } from "../constants/uniswapAddress";
import { ethers } from "ethers";
import { decimalTrimmer } from "../utils/decimalTrimmer"; 

const supportWebSocket = {
    binance: true,
    dex: false,
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
            const provider = new ethers.JsonRpcProvider("https://eth.llamarpc.com");  // Public RPC

            const poolABI = [
                "function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)"
            ];

            const poolAddress = PoolAddress[symbolOut][symbolIn]

            const poolContract = new ethers.Contract(poolAddress, poolABI, provider);

            const slot0 = await poolContract.slot0();

            // Extract sqrtPriceX96 from slot0
            const sqrtPriceX96 = BigInt(slot0[0]); // Get sqrtPriceX96 as BigInt

            const numerator = sqrtPriceX96 * sqrtPriceX96;
            const denominator = BigInt(2) ** BigInt(192);

            const rawPrice = Number(numerator) / Number(denominator); 

            const adjustedPrice = rawPrice * 10 ** (TokenDecimal[symbolIn.toUpperCase()] - TokenDecimal[symbolOut.toUpperCase()]);
            const price = decimalTrimmer(adjustedPrice);
            setPrice(price);
        }

        const connectWebSocket = () => {  
            if (ws.current !== null) {
                ws.current.close(); // Close existing connection before creating a new one
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
                ws.current.close();
                ws.current = null;
            }
            clearTimeout(reconnectTimer.current);
            reconnectTimer.current = setTimeout(connectWebSocket, 5000);
        };

        const updateTicker = supportWebSocket[src] ? connectWebSocket() : setInterval(() => fetchREST(), 5000);

        return () => {
            if (ws.current) {
                ws.current.close();
                ws.current = null;
            }
            clearTimeout(reconnectTimer.current);
            clearInterval(updateTicker);
        };

    }, [setPrice, src, symbolIn, symbolOut, type]);

    return null; // ✅ No UI needed, only updates Zustand
};

export { PriceUpdater }