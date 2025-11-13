import { getPriceFromSqrtPriceX96 } from "../utils/price.math";
import { binance_24h, UniswapV3_24h } from "../queries/fetch24hour";
import { binance, UniswapV3 } from "../queries/fetchHistory";
import { binanceTicker, UniswapV3BulkPrice } from "../queries/livePrice";
import { binanceTicks } from "./binanceTicks";
import { WSS_DOMAIN } from "./environment";
import { initData, initToken } from "./initData";
import { getUniswapQuoteFromContract, getUniswapQuoteQueryFn, initDummy } from "../queries/quotes";

export const SourceConst = {};

// uniswap v3
SourceConst.UniswapV3 = {
    name: "UniswapV3",
    desc: "Uniswap V3 Ethereum",
    exchangeIcon: "uniswap",
    network: "ethereum",
    isDex: true,
    poolURL: "https://app.uniswap.org/explore/pools/ethereum/",
    intervals: ["1h", "1d"],
    info: null,
    bulkPrices: UniswapV3BulkPrice,
    livePrice: UniswapV3BulkPrice,
    ohlcFetch: UniswapV3,
    h24Query: UniswapV3_24h,
    getPriceURL: (poolAddress) => `${WSS_DOMAIN}/liveprice/UniswapV3/${poolAddress}`,
    priceConverter: getPriceFromSqrtPriceX96,
    invertAll: true,
    invertTick: ['WETHUSDT', 'WBTCUSDC'],
    swappedSymbols: ["0x1d42064fc4beb5f8aaf85f4617ae8b3b5b8bd801"],
    quoteFunction: getUniswapQuoteFromContract,
};

// uniswap Sepolia testnet
SourceConst.UniswapV3Sepolia = {
    name: "UniswapV3Sepolia",
    desc: "Uniswap V3 Sepolia (Testnet)",
    exchangeIcon: "uniswap",
    network: "ethereum",
    isDex: true,
    poolURL: "https://app.uniswap.org/explore/pools/ethereum_sepolia/",
    intervals: ["1h", "1d"],
    info: null,
    bulkPrices: UniswapV3BulkPrice,
    livePrice: UniswapV3BulkPrice,
    ohlcFetch: UniswapV3,
    h24Query: UniswapV3_24h,
    priceConverter: getPriceFromSqrtPriceX96,
    getPriceURL: (poolAddress) => `${WSS_DOMAIN}/liveprice/UniswapV3Sepolia/${poolAddress}`,
    swappedSymbols: [],
    quoteFunction: getUniswapQuoteQueryFn,
};

// Binance (this is CEX network not L2 chain or BSC)
SourceConst.binance = {
    name: "binance",
    desc: "Binance CEX",
    exchangeIcon: "binance",
    network: "binance-smart-chain",
    isDex: false,
    intervals: ["1m", "5m", "15m", "1h", "4h", "1d", "1w", "1M"],
    info: binanceTicks,
    livePrice: binanceTicker,
    ohlcFetch: binance,
    h24Query: binance_24h,
    getPriceURL: (poolAddress) => {
        const [token0, token1] = poolAddress.split('-');
        return `wss://stream.binance.com:9443/ws/${token0.toLowerCase()}${token1.toLowerCase()}@trade`
    },
    priceConverter: (p) => p,
    swappedSymbols: [],
    quoteFunction: initDummy,
};

// Initial network
SourceConst.init = {
    name: "init",
    desc: "Loading Network",
    exchangeIcon: "uniswap",
    network: "init",
    isDex: false,
    poolURL: "/",
    intervals: ["1h", "1d"],
    info: initToken,
    bulkPrices: () => "",
    livePrice: () => "0",
    ohlcFetch: async () => initData,
    h24Query: async () => initData.ohlc,
    priceConverter: () => "",
    getPriceURL: () => "init",
    swappedSymbols: [],
    quoteFunction: initDummy,
}