// Transforms API response to D3 compatible input
import axios from "axios";
import { formatAPI } from "./api_formatter";
import { PoolAddress } from "../constants/uniswapAddress";
import { formatSwapData } from "../utils/formatSwapData";

// BINANCE

const binance = async function (symbolIn, symbolOut, interval) {
    try {
        const dataUrl = formatAPI.binance(symbolOut, symbolIn, interval).historical;

        const response = await axios.get(dataUrl);
        const data = response.data; // Extracting data properly 

        return data.map((candle) => ({
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
    } catch (error) {
        console.error("Error fetching Binance data:", error);
        return []; // Return an empty array if there is an error
    }
};

// async function getPairAddress(tokenA, tokenB) {
//     const query = {
//         query: `
//         {
//           pairs(
//             where: {
//               token0: "${tokenA}",
//               token1: "${tokenB}"
//             }
//           ) {
//             id
//             token0 { symbol }
//             token1 { symbol }
//           }
//         }`
//     };

//     const url = "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3";

//     const res = await axios.post(url, query, {
//         headers: { "Content-Type": "application/json" }
//     });

//     const pairs = res.data.data.pairs;
//     return pairs.length ? pairs[0].id : null;
// }

async function UniswapV3(symbolIn, symbolOut, interval, pool = "UniswapV3") {
    const poolInterval = {
        "1h": "poolHourDatas",
        "1d": "poolDayDatas",
    }

    try {
        if (!PoolAddress[pool][symbolOut.toUpperCase()][symbolIn.toUpperCase()]) {
            throw new Error(`Pool address not found for ${symbolIn}`);
        }
        //const poolAddress = PoolAddress[symbolOut.toUpperCase()][symbolIn.toUpperCase()]
        const timeframes = { "1h": "1h", "1d": "1d" };
        const timeProp = { "1h": "periodStartUnix", "1d": "date" };

        if (!timeframes[interval]) {
            throw new Error("Invalid timeframe. Use '1h' or '1d'.");
        }

        const server = import.meta.env.VITE_OLHC_URL || "/uniswap/ohlc/";
        const response = await fetch(`${server}${symbolIn}/${symbolOut}/${interval}`);
        const data = await response.json();

        if (!data) {
            throw new Error("Invalid data received");
        }
        
        const reversedRate = data.data[poolInterval[interval]][0].close < 1; // Reversed against symbolIn/symbolOut logic
        const operator = reversedRate ? (num) => parseFloat(1 / num) : (num) => num;
        const multiplyUnixTime = timeProp[interval] == "periodStartUnix" ? 1000 : 1; 
        data.data[poolInterval[interval]].reverse(); // Beucause it's desc in graphql query.

        const convertedData = data.data[poolInterval[interval]].map(entry => ({
            close: Number(operator(entry.close)),
            date: entry[timeProp[interval]] * multiplyUnixTime,
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

            return { ohlc: convertedData, swaps: swapHistory }
        }

        return convertedData;

    } catch (error) {
        console.error("Error fetching Uniswap data:", error);
        return [{ date: 0, open: 0, high: 0, low: 0, close: 0, volume: 0, error: true }];
    }
}

// 🔹 Convert swap data to D3.js candlestick format
// function formatForD3(data, interval) {
//     const intervalMap = timeFrameToMs[interval];
//     const grouped = {};

//     data.forEach(({ timestamp, amountUSD }) => {
//         const bucket = Math.floor(timestamp / intervalMap[interval]) * intervalMap[interval];

//         if (!grouped[bucket]) {
//             grouped[bucket] = {
//                 timestamp: bucket,
//                 prices: [],
//                 volume: 0,
//                 trades: 0 // Trade count
//             };
//         }

//         grouped[bucket].prices.push(parseFloat(amountUSD));
//         grouped[bucket].volume += parseFloat(amountUSD); // Total volume in USD
//         grouped[bucket].trades += 1; // Number of trades
//     });

//     return Object.values(grouped).map(({ timestamp, prices, volume, trades }) => ({
//         date: new Date(timestamp * 1000).toISOString(),
//         open: prices[0],
//         high: Math.max(...prices),
//         low: Math.min(...prices),
//         close: prices[prices.length - 1],
//         volume, // Total USD traded in the interval
//         trades   // Total trades in the interval
//     }));
// }


export { binance, UniswapV3 }


/*
Spot Trading Prices → wss://stream.binance.com:9443/ws/ethusdt@ticker
Futures (Linear Contracts) Prices → wss://fstream.binance.com/ws/ethusdt@ticker
Candlestick (Kline) Data → wss://stream.binance.com:9443/ws/ethusdt@kline_1m
Order Book (Depth) → wss://stream.binance.com:9443/ws/ethusdt@depth
*/