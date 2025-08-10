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

// D3 related constants
export const defaultDecimalRule = { 0: 2, 99: 3, rest: 2 };
export const swapDecimalRule = { 0: 4, 99: 3, rest: 2 };

export const chartGridColor = "rgb(110 146 255)";
export const chartGridThickness = 0.1;

export const d3TimeFormats = {
    "1m": "%H:%M",      // 12:30
    "5m": "%H:%M",
    "15m": "%H:%M",
    "30m": "%H:%M",
    "1h": "%b-%d %H:%M",  // Mar 07 12:00 (Shows Date + Time)
    "4h": "%b-%d %H:%M",  // Mar 07 12:00 (Shows Date + Time)
    "1d": "%b %d",      // Mar 07
    "1w": "%b %Y",      // Mar 2025
    "1M": "%b %Y",      // Mar 2025
};