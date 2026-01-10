import { getUniswapQuoteFromContract, validateUniswapPoolExist } from "../order/contracts";
import { getTokenBySymbolChainId } from "../idb/tokenListDB";
import { UniswapOptionPanel } from "../order/components/UniswapOptionPanel";

export const AppSetting = {
    CacheTime_PairsPricesOnPicker: 20000, // miliseconds
}

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
    wXRP: "XRP",
    wDOGE: "DOGE",
    wADA: "ADA",
    wSOL: "SOL",
    wDOT: "DOT",
    wLTC: "LTC",
    wTRX: "TRX",
    WXMR: "XMR",
};

const reverseMap = (map) => {
    return Object.fromEntries(
        Object.entries(map).map(([wrapped, standard]) => [standard, wrapped])
    );
};

export const standardSymbolToWrapped = {};

// standardSymbolToWrapped.ethereum = {
//     BTC: "WBTC",     // Bitcoin (The most common version) 
//     ETH: "WETH",
//     // Other Major Chains
//     BNB: "WBNB",     // BNB Coin
//     SOL: "WSOL",     // Solana
//     FIL: "WFIL",     // Filecoin
//     ZEC: "WZEC",     // Zcash (or renZEC)
//     DOGE: "WDOGE",   // Dogecoin (or renDOGE)
//     LTC: "WLTC",     // Litecoin
//     XMR: "WXMR",     // Monero 
//     DOT: "wDOT",
//     XRP: "wXRP"
// }

standardSymbolToWrapped.ethereum = reverseMap(wrappedTokenMap);

// Charts related constants
export const defaultDecimalRule = { 0: 2, 99: 3, rest: 2 };
export const swapDecimalRule = { 0: 4, 99: 3, rest: 2 };
export const quoteDecimalRule = { 0: 5, 99: 4, rest: 2 };

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
    "https://ethereum.publicnode.com",       // Fast, reliable public RPC
    "https://eth.llamarpc.com",              // Solid fallback, community-backed
    "https://cloudflare-eth.com",

    "https://rpc.payload.de/eth",            // Community maintained, Germany-based
    "https://ethereum.blockpi.network/v1/rpc/public", // Public offering by BlockPI
    "https://rpc.flashbots.net",             // MEV-aware RPC, may not always be ideal for general use

    "https://1rpc.io/eth",                   // Free, decent for low-volume
    "https://cloudflare-eth.com",             // Operated by Cloudflare, can be slow or down

    "https://rpc.ankr.com/eth",              // probably need api key
];

export const BLOCKCHAINS_INFO = {
    // -----------------------
    // EVM
    // -----------------------
    "0x1": { name: "Mainnet", url: "https://etherscan.io/address/#" },
    "0x5": { name: "Goerli Testnet", url: "https://goerli.etherscan.io/address/#" },
    "0xaa36a7": { name: "Sepolia Testnet", url: "https://sepolia.etherscan.io/address/#" },

    "0x38": { name: "BNB Smart Chain", url: "https://bscscan.com/address/#" },
    "0x61": { name: "BSC Testnet", url: "https://testnet.bscscan.com/address/#" },

    "0x89": { name: "Polygon", url: "https://polygonscan.com/address/#" },
    "0x13881": { name: "Polygon Mumbai", url: "https://mumbai.polygonscan.com/address/#" },

    "0xa": { name: "Optimism", url: "https://optimistic.etherscan.io/address/#" },
    "0x1a4": { name: "Optimism Goerli", url: "https://goerli-optimism.etherscan.io/address/#" },

    "0xa4b1": { name: "Arbitrum One", url: "https://arbiscan.io/address/#" },
    "0x66eed": { name: "Arbitrum Goerli", url: "https://goerli.arbiscan.io/address/#" },

    "0x2105": { name: "Base", url: "https://basescan.org/address/#" },
    "0x14a33": { name: "Base Goerli", url: "https://goerli.basescan.org/address/#" },

    // -----------------------
    // BITCOIN
    // -----------------------
    "btc:mainnet": {
        name: "Bitcoin Mainnet",
        url: "https://www.blockchain.com/explorer/addresses/btc/#"
    },
    "btc:livenet": {
        name: "Bitcoin Mainnet",
        url: "https://www.blockchain.com/explorer/addresses/btc/#"
    },
    "btc:testnet": {
        name: "Bitcoin Testnet",
        url: "https://www.blockchain.com/explorer/addresses/tbtc/#"
    },
    "btc:regtest": {
        name: "Bitcoin Regtest",
        url: ""
    }, // no public explorer
    "btc:signet": {
        name: "Bitcoin Signet",
        url: "https://mempool.space/signet/address/#"
    },

    // -----------------------
    // SOLANA
    // -----------------------
    "sol:https://api.mainnet-beta.solana.com": {
        name: "Solana Mainnet",
        url: "https://explorer.solana.com/address/#"
    },
    "sol:https://api.devnet.solana.com": {
        name: "Solana Devnet",
        url: "https://explorer.solana.com/address/#?cluster=devnet"
    },
    "sol:https://api.testnet.solana.com": {
        name: "Solana Testnet",
        url: "https://explorer.solana.com/address/#?cluster=testnet"
    },

    // -----------------------
    // SUI
    // -----------------------
    "sui:mainnet": { name: "Sui Mainnet", url: "https://suiscan.xyz/mainnet/account/#" },
    "sui:testnet": { name: "Sui Testnet", url: "https://suiscan.xyz/testnet/account/#" },
    "sui:devnet": { name: "Sui Devnet", url: "https://suiscan.xyz/devnet/account/#" },

    // -----------------------
    // APTOS
    // -----------------------
    "aptos:mainnet": {
        name: "Aptos Mainnet",
        url: "https://explorer.aptoslabs.com/account/#"
    },
    "aptos:testnet": {
        name: "Aptos Testnet",
        url: "https://explorer.aptoslabs.com/account/#?network=testnet"
    },
    "aptos:devnet": {
        name: "Aptos Devnet",
        url: "https://explorer.aptoslabs.com/account/#?network=devnet"
    },

    // -----------------------
    // COSMOS
    // -----------------------
    "cosmoshub-4": {
        name: "Cosmos Hub",
        url: "https://www.mintscan.io/cosmos/account/#"
    },
    "osmosis-1": {
        name: "Osmosis",
        url: "https://www.mintscan.io/osmosis/account/#"
    },
};

export const ChainId = {};

ChainId.ethereum = {
    // Layer 1 (L1) / Mainnets
    1: "ethereum",
    10: "optimism",
    56: "bsc",
    137: "polygon",
    250: "fantom",
    42161: "arbitrum",
    43114: "avalanche",
    8453: "base",
    // Other Popular Chains
    100: "gnosis", // Formerly xDai
    // Testnets
    5: "goerli",
    11155111: "sepolia",
    420: "optimism-goerli",
    421613: "arbitrum-goerli",
    80001: "polygon-mumbai",
    97: "bsc-testnet",
    4002: "fantom-testnet",
    43113: "avalanche-fuji",
    84531: "base-goerli",
    // Less Common / Emerging EVM Chains
    66: "velas",
    128: "heco",
    288: "boba",
    592: "astar",
    1284: "moonbeam",
    1285: "moonriver",
    2000: "dogechain",
    8217: "klaytn",
    1088: "metis",
    1313161554: "aurora",
    1666600000: "harmony-shard-0",
    2020: "ronin",
    42220: "celo",
    59140: "lineagoerli",
    59144: "linea",
    1337: "local",
    31337: "hardhat",
};

export const FiatSymbol = {
    "USD": "$"
};

export const Traders = {};

Traders.Uniswap = {
    tokenInfoGetter: getTokenBySymbolChainId,
    quoterFn: getUniswapQuoteFromContract,
    pairValidator: validateUniswapPoolExist,
    optionComponent: UniswapOptionPanel,
    standarizedSymbol: (symbol) => standardSymbolToWrapped.ethereum[symbol] ?? symbol
}