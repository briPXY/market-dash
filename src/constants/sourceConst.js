import { binance_24h, UniswapV3_24h } from "../queries/fetch24hour";
import { binanceHistorical, UniswapV3Historical } from "../queries/fetchHistory";
import { binanceTicker, ethereurmLivePriceLoopers, livePriceWebSocket, uniswapOneTimerPrice } from "../queries/livePrice";
import { binanceHighlights, uniswapV3EtherumHighlights, uniswapV3SepoilaStarterPairs } from "./starterPairs";
import { WSS_DOMAIN } from "./environment";
import { initData, initToken } from "./initData";
import { getUniswapQuoteFromContract, getUniswapQuoteQueryFn, initDummy } from "../queries/quotes";

export const SourceConst = {};

// uniswap v3
SourceConst["uniswap:1"] = { // name must resemble indexeDB's pair-list
    name: "UniswapV3",
    desc: "Uniswap V3 Ethereum",
    exchangeIcon: "uniswap",
    network: "ethereum",
    isDex: true,
    poolURL: (pair) => `https://app.uniswap.org/explore/pools/ethereum/${pair}`,
    intervals: ["1h", "1d"],
    initPairs: uniswapV3EtherumHighlights,
    fetchPrice: uniswapOneTimerPrice,
    livePrice: ethereurmLivePriceLoopers,
    ohlcFetch: UniswapV3Historical,
    h24Query: UniswapV3_24h,
    getLivePriceURL: (poolAddress) => `${WSS_DOMAIN}/liveprice/UniswapV3/${poolAddress}`,
    quoteFunction: getUniswapQuoteFromContract,
};

// uniswap Sepolia testnet
SourceConst["uniswap:11155111"] = {
    name: "UniswapV3Sepolia",
    desc: "Uniswap V3 Sepolia (Testnet)",
    exchangeIcon: "uniswap",
    network: "ethereum",
    isDex: true,
    poolURL: (pair) => `https://app.uniswap.org/explore/pools/ethereum_sepolia/${pair}`,
    intervals: ["1h", "1d"],
    initPairs: uniswapV3SepoilaStarterPairs,
    fetchPrice: uniswapOneTimerPrice,
    livePrice: ethereurmLivePriceLoopers,
    ohlcFetch: UniswapV3Historical,
    h24Query: UniswapV3_24h,
    getLivePriceURL: (poolAddress) => `${WSS_DOMAIN}/liveprice/UniswapV3Sepolia/${poolAddress}`,
    quoteFunction: getUniswapQuoteQueryFn,
};

// Binance (this is CEX price source not L2 chain like BSC)
SourceConst.binance = {
    name: "binance",
    desc: "Binance CEX",
    exchangeIcon: "binance",
    network: "binance-smart-chain",
    isDex: false,
    poolURL: (pair) => `https://www.binance.com/en/trade/${pair}?type=spot`,
    intervals: ["1m", "5m", "15m", "1h", "4h", "1d", "1w", "1M"],
    initPairs: binanceHighlights,
    fetchPrice: binanceTicker,
    livePrice: livePriceWebSocket,
    ohlcFetch: binanceHistorical,
    h24Query: binance_24h,
    getLivePriceURL: (symbols) => `wss://stream.binance.com:9443/ws/${symbols.toLowerCase()}@trade`,
    swappedSymbols: [],
    quoteFunction: initDummy,
};

// Initial (dummy) network
SourceConst.init = {
    name: "init",
    desc: "Loading Network",
    exchangeIcon: "uniswap",
    network: "init",
    isDex: false,
    poolURL: "/",
    intervals: ["1h", "1d"],
    initPairs: initToken,
    bulkPrices: () => "",
    fetchPrice: () => "0",
    livePrice: ethereurmLivePriceLoopers,
    ohlcFetch: async () => initData,
    h24Query: async () => initData.ohlc,
    getLivePriceURL: () => "init",
    quoteFunction: initDummy,
}