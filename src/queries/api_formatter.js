import { WSS_DOMAIN } from "../constants/environment";

function binance(symbols, range = "50") {
    const result = {}
    result.hour24 = `https://api.binance.com/api/v3/klines?symbol=${symbols}&interval=5m&limit=288`
    result.historical = `https://api.binance.com/api/v3/klines?symbol=${symbols}&interval=${range}&limit=900`;
    result.index = `wss://stream.binance.com:9443/ws/${symbols.toLowerCase()}@indexPrice`;
    result.mark = `wss://stream.binance.com:9443/ws/${symbols.toLowerCase()}@markPrice`;
    result.trade = `wss://stream.binance.com:9443/ws/${symbols.toLowerCase()}@trade`;
    return result;
}

export const symbolAdress = {
    usdt: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    eth: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
}


function UniswapV3(network, base = "usdt", symbol = "eth") { // USE L2 Polygon, chain id=137
    const result = {};

    result.historical = "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3";
    const baseUrl = "https://open-api.openocean.finance/v3/137"; // "1" for Ethereum

    const params = new URLSearchParams({
        inTokenAddress: symbolAdress[symbol.toLocaleLowerCase()], // ETH
        outTokenAddress: symbolAdress[base.toLowerCase()], // USDT
        amount: "1000000000000000000", // 1 ETH (18 decimals)
        gasPrice: "50000000000" // 50 Gwei (estimate)
    });

    // result.index = `${WSS_DOMAIN}/liveprice/UniswapV3/${base.toUpperCase()}-${symbol.toUpperCase()}`
    result.trade = `${WSS_DOMAIN}/liveprice/${network}/${base.toUpperCase()}-${symbol.toUpperCase()}`;
    result.mark = `${baseUrl}?${params.toString()}`;
    return result;
}

export const formatAPI = { binance, UniswapV3 };

export const API_DOMAIN = import.meta.env.VITE_API_DOMAIN;

/**
 * Checks if a trading pair is available on Binance using the low-weight klines API endpoint.
 *
 * @param {string} symbol The first asset (e.g., 'BTC').
 * @param {string} base The second asset (e.g., 'USDT').
 * @returns {Promise<boolean>} True if either pair permutation is available, false otherwise.
 */
// export async function checkBinanceSymbolAvailability(symbol, base) {
//     const API_BASE = 'https://api.binance.com/api/v3/klines';

//     // Define the two possible symbol permutations
//     const symbolA = `${symbols}`; // e.g., BTCUSDT
//     const symbolB = `${base.toUpperCase()}${symbol.toUpperCase()}`; // e.g., USDTBTC

//     async function checkSymbol(currentSymbol) {
//         const url = `${API_BASE}?symbol=${currentSymbol}&interval=1h&limit=1`;

//         try {
//             const response = await fetch(url);

//             const data = await response.json();

//             if (Array.isArray(data)) {
//                 return true;
//             }

//             // Error case: The response is an error object like {"code":-1121,"msg":"Invalid symbol."}
//             if (data.code === -1121) {
//                 return false; // Invalid symbol
//             }

//             return false;

//         } catch (error) {
//             error;
//             return false;
//         }
//     }

//     // Check the first permutation (e.g., BTCUSDT)
//     if (await checkSymbol(symbolA)) {
//         return true;
//     }

//     // Check the reversed permutation (e.g., USDTBTC)
//     if (await checkSymbol(symbolB)) {
//         return true;
//     }

//     // If neither permutation is available
//     return false;
// }
