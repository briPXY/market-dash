// Transforms API response to D3 compatible input
import axios from "axios";
import { formatAPI } from "./api_formatter";
import { formatSwapData } from "../utils/utils";
import { initData } from "../constants/initData";
import { DOMAIN } from "../constants/environment";
import { decryptAndLoadUserSecret } from "../utils/user";
import { useWalletStore } from "../stores/stores";

// BINANCE

export const binanceHistorical = async function (symbolStoreObj, interval) {
    try {
        const dataUrl = formatAPI.binance(symbolStoreObj.symbols, interval).historical;

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

export async function UniswapV3Historical(symbolStoreObj, interval, network = "uniswap:1") {
    const poolInterval = {
        "1h": "poolHourDatas",
        "1d": "poolDayDatas",
    }

    try {
        const timeframes = { "1h": "1h", "1d": "1d" };
        const timeProp = { "1h": "periodStartUnix", "1d": "date" };

        if (!timeframes[interval]) {
            interval = "1h";
        }

        const walletStoreObj = useWalletStore.getState();
        const apiKey = await decryptAndLoadUserSecret("Subgraph API Key", walletStoreObj.address, walletStoreObj.signature);

        const response = await fetch(`${DOMAIN}/api/v1/his/${interval}/${symbolStoreObj.address}@${network}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': apiKey
            }
        });

        const data = await response.json();

        if (!data) {
            throw new Error("Invalid data received");
        }

        data.data[poolInterval[interval]].reverse(); // Beucause it's desc in graphql query.

        const convertedData = data.data[poolInterval[interval]].map(entry => ({
            close: Number(entry.close),
            date: entry[timeProp[interval]] * 1000,
            dateOpen: 0, // Dummy value
            high: Number(entry.low), // Swap high/low
            low: Number(entry.high),
            open: Number(entry.open),
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
