import { binanceTicker, dexLivePrice } from "../queries/livePrice";
import { PoolAddress } from "./uniswapAddress";

export const SourceConst = {}

SourceConst.dex = {};
SourceConst.binance = {};

SourceConst.dex.desc = "Uniswap V3 Ethereum Mainnet";
SourceConst.binance.desc = "Binance CEX";

SourceConst.dex.network = "ethereum";
SourceConst.binance.network = "bsc";

SourceConst.dex.isDex = true;
SourceConst.binance.isDex = false;

// intervals
SourceConst.dex.intervals = ["1h", "1d"];
SourceConst.binance.intervals = ["1m", "5m", "15m", "1h", "4h", "1d", "1w", "1M"];

// [in, out]
SourceConst.dex.symbols = Object.entries(PoolAddress).flatMap(([parent, children]) =>
    Object.keys(children).map(child => [child, parent])
);

SourceConst.dex.symbolSet = () => {
    return Object.entries(PoolAddress).flatMap(([parent, children]) =>
        Object.keys(children).map(child => [parent, child])
    );
}

SourceConst.binance.symbols = [
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
    ["ATOM", "USDT"]
];

// single ticker
SourceConst.dex.livePrice = dexLivePrice;
SourceConst.binance.livePrice = binanceTicker;