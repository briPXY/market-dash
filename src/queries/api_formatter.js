function binance(symbol, range){
    return `https://api.binance.com/api/v3/klines?symbol=${symbol.toUpperCase()}USDT&interval=${range}&limit=100`;
}

export const formatAPI = {binance}
