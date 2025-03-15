import axios from "axios";
import { formatAPI } from "./api_formatter";

export const binance = async function (symbolIn, symbolOut) {
    try {
        const dataUrl = formatAPI.binance(symbolIn, symbolOut).hour24; 

        const response = await axios.get(dataUrl);
        const data = response.data; // Extracting data properly
 
        return data.map((candle) => ({
            date: +(candle[0]),
            open: +candle[1],
            high: +candle[2],
            low: +candle[3],
            close: +candle[4],
            volume: +candle[5],
            trades:+candle[8],
        }));
    } catch (error) {
        console.error("Error fetching Binance data:", error);
        return []; // Return an empty array if there is an error
    }
};