import { binanceTicker, UniswapV3BulkPrice } from "../queries/livePrice";
import { PoolAddress } from "./uniswapAddress";

export const SourceConst = {};

// uniswap v3
SourceConst.UniswapV3 = {
    desc: "Uniswap V3 Ethereum Mainnet",
    network: "ethereum",
    isDex: true,
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
};

// Binance non L2 chain
SourceConst.binance = {
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
};