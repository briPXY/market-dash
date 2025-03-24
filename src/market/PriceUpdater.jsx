import { useEffect } from "react";
import usePriceStore, { useSymbolStore } from "../stores/stores";
import { API_DOMAIN, formatAPI } from "../queries/api_formatter";
import { PoolAddress,  TokenDecimal } from "../constants/uniswapAddress";
import { ethers } from "ethers";

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

    useEffect(() => {
        let ws;
        let reconnectTimer;

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
             
            const price = Number(numerator) / Number(denominator);
             
            const adjustedPrice = price * 10 ** (TokenDecimal[symbolIn.toUpperCase()] - TokenDecimal[symbolOut.toUpperCase()]); 
            setPrice(adjustedPrice.toFixed(2));
        }

        const connectWebSocket = () => {
            ws = new WebSocket(formatAPI[API_DOMAIN](symbolOut, symbolIn)[type]);

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

        const updateTicker = supportWebSocket[API_DOMAIN] ? connectWebSocket() : setInterval(() => fetchREST(), 5000);;

        return () => {
            if (ws) ws.close();
            clearTimeout(reconnectTimer);
            clearInterval(updateTicker);
        };
    }, [setPrice, symbolIn, symbolOut, type]);

    return null; // ✅ No UI needed, only updates Zustand
};

export { PriceUpdater }