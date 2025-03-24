// Transforms API response to D3 compatible input
import axios from "axios";
import { formatAPI } from "./api_formatter";
import { PoolAddress } from "../constants/uniswapAddress";

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

async function dex(symbolIn, symbolOut, interval, count = 150) {
    const poolInterval = {
        "1h": "poolHourDatas",
        "1d": "poolDayDatas",
    }

    try {
        if (!PoolAddress[symbolOut.toUpperCase()][symbolIn.toUpperCase()]) {
            throw new Error(`Pool address not found for ${symbolIn}`);
        }
        const poolAddress = PoolAddress[symbolOut.toUpperCase()][symbolIn.toUpperCase()]
        const timeframes = { "1h": "1h", "1d": "1d" };
        if (!timeframes[interval]) {
            throw new Error("Invalid timeframe. Use '1h' or '1d'.");
        }

        const response = await fetch("http://localhost:3001/uniswap/ohlc", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                poolAddress,
                timeframe: timeframes[interval],
                count: count,
            })
        });

        const data = await response.json();
        if (!data || !data.poolHourDatas) {
            throw new Error("Invalid data received");
        }
  
        // Convert ETH per USDT to USDT per ETH
        const convertedData = data[poolInterval[interval]].map(entry => ({
            date: entry.periodStartUnix,
            open: Number((1 / parseFloat(entry.open)).toFixed(2)),
            high: Number((1 / parseFloat(entry.low)).toFixed(2)), // Swap high/low
            low: Number((1 / parseFloat(entry.high)).toFixed(2)),
            close: Number((1 / parseFloat(entry.close)).toFixed(2)),
            volume: Number(parseFloat(entry.volumeUSD).toFixed(2))
        }));
 
        return convertedData;
    } catch (error) {
        console.error("Error fetching Uniswap data:", error);
        return null;
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


export { binance, dex }


/*
Spot Trading Prices → wss://stream.binance.com:9443/ws/ethusdt@ticker
Futures (Linear Contracts) Prices → wss://fstream.binance.com/ws/ethusdt@ticker
Candlestick (Kline) Data → wss://stream.binance.com:9443/ws/ethusdt@kline_1m
Order Book (Depth) → wss://stream.binance.com:9443/ws/ethusdt@depth
*/