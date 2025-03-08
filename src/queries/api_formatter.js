function binance(symbol = "ETH", range = "50"){
    const result = {}
    result.historical = `https://api.binance.com/api/v3/klines?symbol=${symbol.toUpperCase()}USDT&interval=${range}&limit=100`;
    result.index = `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}usdt@indexPrice`;
    result.mark = `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}usdt@markPrice`;
    result.trade = `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}usdt@trade`;
    return result;
}

export const formatAPI = {binance};

export const API_DOMAIN =  import.meta.env.VITE_API_DOMAIN;
