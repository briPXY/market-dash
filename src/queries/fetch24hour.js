import axios from "axios";
import { formatAPI } from "./api_formatter";
import * as history from "./fetchHistory";

export const binance_24h = async function (symbols) {
    try { 
        const dataUrl = formatAPI.binance(symbols).hour24;

        const response = await axios.get(dataUrl);
        const data = response.data; // Extracting data properly

        return data.map((candle) => ({
            date: +(candle[0]),
            open: +candle[1],
            high: +candle[2],
            low: +candle[3],
            close: +candle[4],
            volume: +candle[5],
            trades: +candle[8],
        }));
    } catch (error) {
        console.error("Error fetching Binance data:", error);
        return []; // Return an empty array if there is an error
    }
};

export const UniswapV3_24h = async function (poolAddress, network) {
    const result = await history.UniswapV3(poolAddress, "1h", network);
    return result.ohlc ? result.ohlc.slice(-24) : result;
}