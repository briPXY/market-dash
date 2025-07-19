import { binance, UniswapV3 } from "../queries/fetchHistory";
import { binanceTicker, UniswapV3BulkPrice } from "../queries/livePrice";
import { WSS_DOMAIN } from "./environment";
import { PoolAddress } from "./uniswapAddress";

export const SourceConst = {};

// uniswap v3
SourceConst.UniswapV3 = {
    name: "UniswapV3",
    desc: "Uniswap V3 Ethereum",
    network: "ethereum",
    isDex: true,
    poolURL: "https://app.uniswap.org/explore/pools/ethereum/",
    intervals: ["1h", "1d"],
    symbols: Object.entries(PoolAddress.UniswapV3).flatMap(([parent, children]) =>
        Object.keys(children).map(child => [child, parent])
    ),
    symbolSet: () => {
        return Object.entries(PoolAddress.UniswapV3).flatMap(([parent, children]) =>
            Object.keys(children).map(child => [parent, child])
        );
    },
    bulkPrices: UniswapV3BulkPrice,
    livePrice: UniswapV3BulkPrice,
    ohlcFetch: UniswapV3,
    getPriceURL: (token1, token2) => `${WSS_DOMAIN}/liveprice/UniswapV3/${token2.toUpperCase()}-${token1.toUpperCase()}`,
};

// uniswap Sepolia testnet
SourceConst.UniswapV3Sepolia = {
    name: "UniswapV3Sepolia",
    desc: "Uniswap V3 Sepolia (Testnet)",
    network: "ethereum",
    isDex: true,
    poolURL: "https://app.uniswap.org/explore/pools/ethereum_sepolia/",
    intervals: ["1h", "1d"],
    symbols: Object.entries(PoolAddress.UniswapV3Sepolia).flatMap(([parent, children]) =>
        Object.keys(children).map(child => [child, parent])
    ),
    symbolSet: () => {
        return Object.entries(PoolAddress.UniswapV3Sepolia).flatMap(([parent, children]) =>
            Object.keys(children).map(child => [parent, child])
        );
    },
    bulkPrices: UniswapV3BulkPrice,
    livePrice: UniswapV3BulkPrice,
    ohlcFetch: UniswapV3,
    getPriceURL: (token1, token2) => `${WSS_DOMAIN}/liveprice/UniswapV3Sepolia/${token2.toUpperCase()}-${token1.toUpperCase()}`,
};

// Binance (this is CEX network not L2 chain or BSC)
SourceConst.binance = {
    name: "binance",
    desc: "Binance CEX",
    network: "binance-smart-chain",
    isDex: false,
    intervals: ["1m", "5m", "15m", "1h", "4h", "1d", "1w", "1M"],
    symbols: [
        ["BTC", "USDT"],
        ["ETH", "USDT"],
        ["BNB", "USDT"],
        ["XRP", "USDT"],
        ["DOGE", "USDT"],
        ["ADA", "USDT"],
        ["SOL", "USDT"],
        ["DOT", "USDT"],
        ["MATIC", "USDT"],
        ["LTC", "USDT"],
        ["TRX", "USDT"],
        ["SHIB", "USDT"],
        ["AVAX", "USDT"],
        ["LINK", "USDT"],
        ["ATOM", "USDT"],
    ],
    livePrice: binanceTicker,
    ohlcFetch: binance,
    getPriceURL: (token1, token2) => `wss://stream.binance.com:9443/ws/${token1.toLowerCase()}${token2.toLowerCase()}@trade`,
};