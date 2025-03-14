// Transforms API response to D3 compatible input
import axios from "axios";
import { formatAPI, symbolAdress } from "./api_formatter";
import { timeFrameToMs } from "../constants/intervals";

// BINANCE

const binance = async function (symbolIn, symbolOut, interval) {
    try {
        const dataUrl = formatAPI.binance(symbolIn, symbolOut, interval).historical; 

        const response = await axios.get(dataUrl);
        const data = response.data; // Extracting data properly
 
        return data.map((candle) => ({
            date: new Date(candle[0]),
            open: +candle[1],
            high: +candle[2],
            low: +candle[3],
            close: +candle[4],
            volume: +candle[5],
        }));
    } catch (error) {
        console.error("Error fetching Binance data:", error);
        return []; // Return an empty array if there is an error
    }
};

async function getPairAddress(tokenA, tokenB) {
    const query = {
        query: `
        {
          pairs(
            where: {
              token0: "${tokenA}",
              token1: "${tokenB}"
            }
          ) {
            id
            token0 { symbol }
            token1 { symbol }
          }
        }`
    };

    const url = "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3";

    const res = await axios.post(url, query, {
        headers: { "Content-Type": "application/json" }
    });

    const pairs = res.data.data.pairs;
    return pairs.length ? pairs[0].id : null;
}

const dex = async function (symbolIn, symbolOut, interval) {
    const now = Math.floor(Date.now() / 1000);
    const startTime = now - 86400; // Fetch last 24 hours

    const pairAddress = await getPairAddress(symbolAdress[symbolIn], symbolAdress[symbolOut]);

    const query = {
        query: `
        {
          swaps(
            where: { pair: "${pairAddress}", timestamp_gte: ${startTime} }
            orderBy: timestamp
            orderDirection: asc
            first: 1000
          ) {
            amountUSD
            timestamp
          }
        }`
    };

    const url = "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3";

    try {
        const res = await axios.post(url, query, {
            headers: { "Content-Type": "application/json" }
        });

        return formatForD3(res.data.data.swaps, interval);
    } catch (error) {
        console.error("Error fetching data:", error);
        return [];
    }
}


// 🔹 Convert swap data to D3.js candlestick format
function formatForD3(data, interval) {
    const intervalMap = timeFrameToMs[interval];
    const grouped = {};

    data.forEach(({ timestamp, amountUSD }) => {
        const bucket = Math.floor(timestamp / intervalMap[interval]) * intervalMap[interval];

        if (!grouped[bucket]) {
            grouped[bucket] = { timestamp: bucket, prices: [] };
        }
        grouped[bucket].prices.push(parseFloat(amountUSD));
    });

    return Object.values(grouped).map(({ timestamp, prices }) => ({
        date: new Date(timestamp * 1000).toISOString(),
        open: prices[0],
        high: Math.max(...prices),
        low: Math.min(...prices),
        close: prices[prices.length - 1]
    }));
}

export { binance, dex }


/*
Spot Trading Prices → wss://stream.binance.com:9443/ws/ethusdt@ticker
Futures (Linear Contracts) Prices → wss://fstream.binance.com/ws/ethusdt@ticker
Candlestick (Kline) Data → wss://stream.binance.com:9443/ws/ethusdt@kline_1m
Order Book (Depth) → wss://stream.binance.com:9443/ws/ethusdt@depth
*/