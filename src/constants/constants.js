export const timeFrameToMs = {
    "1s": 1000,       // 1 second
    "5s": 5000,       // 5 seconds
    "15s": 15000,     // 15 seconds
    "30s": 30000,     // 30 seconds
    "1m": 60000,      // 1 minute
    "5m": 300000,     // 5 minutes
    "15m": 900000,    // 15 minutes
    "30m": 1800000,   // 30 minutes
    "1h": 3600000,    // 1 hour
    "4h": 14400000,   // 4 hours
    "12h": 43200000,  // 12 hours
    "1d": 86400000,   // 1 day
    "1w": 604800000,  // 1 week
    "1M": 2592000000, // 1 month (approximate)
    "1y": 31104000000,
};

export const timeFrameText = {
    "1s": "1s",       // 1 second
    "5s": "5s",       // 5 seconds
    "15s": "15s",     // 15 seconds
    "30s": "30s",     // 30 seconds
    "1m": "1m",      // 1 minute
    "5m": "5m",     // 5 minutes
    "15m": "15m",    // 15 minutes
    "30m": "30m",   // 30 minutes
    "1h": "1h",    // 1 hour
    "4h": "4h",   // 4 hours
    "12h": "12h",  // 12 hours
    "1d": "1D",   // 1 day
    "1w": "1W",  // 1 week
    "1M": "1M", // 1 month (approximate)
    "1y": "1Y",
};

export const wrappedTokenMap = {
    WETH: "ETH",          // Ethereum
    WBNB: "BNB",          // BNB Chain (Binance Smart Chain)
    WBTC: "BTC",          // Bitcoin (on Ethereum)
    WAVAX: "AVAX",        // Avalanche
    WMATIC: "MATIC",      // Polygon
    WFTM: "FTM",          // Fantom
    WGLMR: "GLMR",        // Moonbeam
    WKLAY: "KLAY",        // Klaytn
    WONE: "ONE",          // Harmony
    WCELO: "CELO",        // Celo
    WHT: "HT",            // Huobi Token
    WXDAI: "XDAI",        // xDai (now Gnosis)
};

// Charts related constants
export const defaultDecimalRule = { 0: 2, 99: 3, rest: 2 };
export const swapDecimalRule = { 0: 4, 99: 3, rest: 2 };

export const d3TimeFormats = {
    "1m": "%H:%M",
    "5m": "%H:%M",
    "15m": "%H:%M",
    "30m": "%H:%M",
    "1h": "%b-%d %H:%M",
    "4h": "%b-%d %H:%M",
    "1d": "%b %d",
    "1w": "%b %Y",
    "1M": "%b %Y",
};

export const RPC_URLS = {};

RPC_URLS.default = [
    // 🔝 Highly reliable public RPCs
    "https://rpc.ankr.com/eth",              // Very stable, widely used
    "https://ethereum.publicnode.com",       // Fast, reliable public RPC
    "https://eth.llamarpc.com",              // Solid fallback, community-backed
    "https://cloudflare-eth.com",

    // 🧪 Less battle-tested or newer
    "https://rpc.payload.de/eth",            // Community maintained, Germany-based
    "https://ethereum.blockpi.network/v1/rpc/public", // Public offering by BlockPI
    "https://rpc.flashbots.net",             // MEV-aware RPC, may not always be ideal for general use

    // 🧾 Extra fallbacks (less stable or slower)
    "https://1rpc.io/eth",                   // Free, decent for low-volume
    "https://cloudflare-eth.com"             // Operated by Cloudflare, can be slow or down
];