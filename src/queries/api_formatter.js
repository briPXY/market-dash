function binance(base = "USDT", symbol = "ETH", range = "50"){
    const result = {}
    result.hour24 = `https://api.binance.com/api/v3/klines?symbol=${symbol.toUpperCase()}${base.toUpperCase()}&interval=5m&limit=288`
    result.historical = `https://api.binance.com/api/v3/klines?symbol=${symbol.toUpperCase()}${base.toUpperCase()}&interval=${range}&limit=300`;
    result.index = `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}${base.toLowerCase()}@indexPrice`;
    result.mark = `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}${base.toLowerCase()}@markPrice`;
    result.trade = `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}${base.toLowerCase()}@trade`;
    return result;
}

export const symbolAdress = {
    usdt: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    eth:"0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
}


function dex(base="usdt", symbol = "eth") { // USE L2 Polygon, chain id=137
    const result = {}; 

    result.historical = "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3";
    const baseUrl = "https://open-api.openocean.finance/v3/137"; // "1" for Ethereum

    const params = new URLSearchParams({
        inTokenAddress: symbolAdress[symbol.toLocaleLowerCase()], // ETH
        outTokenAddress: symbolAdress[base.toLowerCase()], // USDT
        amount: "1000000000000000000", // 1 ETH (18 decimals)
        gasPrice: "50000000000" // 50 Gwei (estimate)
    });

    result.trade = `https://localhost:3001/uniswap/live/${base.toUpperCase()}/${symbol.toUpperCase()}`;
    result.mark = `${baseUrl}?${params.toString()}`;
    result.index = `${baseUrl}?${params.toString()}`; 
    return result;
}

export const formatAPI = {binance, dex};

export const API_DOMAIN =  import.meta.env.VITE_API_DOMAIN;
