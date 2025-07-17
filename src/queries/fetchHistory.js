// Transforms API response to D3 compatible input
import axios from "axios";
import { formatAPI } from "./api_formatter";
import { PoolAddress } from "../constants/uniswapAddress";
import { formatSwapData } from "../utils/formatSwapData";
import { initData } from "../constants/initData";
import { DOMAIN } from "../constants/environment";

// BINANCE

const binance = async function (symbolIn, symbolOut, interval) {
    try {
        const dataUrl = formatAPI.binance(symbolOut, symbolIn, interval).historical;

        const response = await axios.get(dataUrl);
        const data = response.data; // Extracting data properly 

        const array = data.map((candle) => ({
            date: +(candle[6]), // timestamp close
            open: +candle[1],
            high: +candle[2],
            low: +candle[3],
            close: +candle[4],
            volume: +candle[5],
            dateOpen: +candle[0], // timestamp open
            quote: +candle[7], // quotes asset volume
            trades: +candle[8],
        }));

        return { ohlc: array, swap: null };

    } catch (error) {
        console.error("Error fetching Binance data:", error);
        return initData; // Return an empty array if there is an error
    }
};

async function UniswapV3(symbolIn, symbolOut, interval, network = "UniswapV3") {
    const poolInterval = {
        "1h": "poolHourDatas",
        "1d": "poolDayDatas",
    }

    try {
        if (!PoolAddress[network][symbolOut.toUpperCase()][symbolIn.toUpperCase()]) {
            throw new Error(`Pool address not found for ${symbolIn}`);
        }
        //const poolAddress = PoolAddress[symbolOut.toUpperCase()][symbolIn.toUpperCase()]
        const timeframes = { "1h": "1h", "1d": "1d" };
        const timeProp = { "1h": "periodStartUnix", "1d": "date" };
        const multiplyUnixTime = { "1h": 1, "1d": 1000 };

        if (!timeframes[interval]) {
            interval = "1h";
        }
 
        const response = await fetch(`${DOMAIN}/historical/${network}/${symbolIn}/${symbolOut}/${interval}`);
        const data = await response.json();

        if (!data) {
            throw new Error("Invalid data received");
        }

        const reversedRate = data.data[poolInterval[interval]][0].close < 1; // Reversed against symbolIn/symbolOut logic
        const operator = reversedRate ? (num) => parseFloat(1 / num) : (num) => num;
        data.data[poolInterval[interval]].reverse(); // Beucause it's desc in graphql query.

        const convertedData = data.data[poolInterval[interval]].map(entry => ({
            close: Number(operator(entry.close)),
            date: entry[timeProp[interval]] * multiplyUnixTime[interval],
            dateOpen: 0, // Dummy value
            high: Number(operator(entry.low)), // Swap high/low
            low: Number(operator(entry.high)),
            open: Number(operator(entry.open)),
            quote: 0,    // Dummy value
            trades: 0,   // Dummy value
            volume: Number(parseFloat(entry.volumeUSD)),
        }));

        if (data.data.swaps) {
            const swapHistory = formatSwapData(data.data.swaps);

            return { ohlc: convertedData, swaps: swapHistory };
        }

        return { ohlc: convertedData, swaps: null };

    } catch (error) {
        console.error("Error fetching UniswapV3 data:", error);
        return initData;
    }
}

export { binance, UniswapV3 }
