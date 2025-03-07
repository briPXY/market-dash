// Transforms API response to D3 compatible input

// BINANCE

const binance = {};

binance.candle = (data) => {
    return data.map((candle) => ({
        date: new Date(candle[0]),
        open: +candle[1],
        high: +candle[2],
        low: +candle[3],
        close: +candle[4],
        volume: +candle[5],
    }));
};

/**
* Converts Binance linear price API response to D3 line chart format.
* @param {Object} data - Binance price API response { symbol: "ETHUSDT", price: "1234.56" }
* @returns {Object} - D3-compatible line chart data point { date: Date, value: Number }
*/
binance.tick = (data) => ({
    date: new Date(), // Use current timestamp for each fetched price
    value: +data.price, // Convert price to number
});

/**
* Converts Binance ranged OLHC API response into D3 line chart format.
* @param {Array} data - Array of [timestamp, price] pairs from Binance API
* @returns {Array} - Array of { date: Date, value: Number } for D3 line chart
*/
binance.linear = (data) => {
    return data.map(entry => ({
        x: new Date(entry[0]),  // Convert timestamp to Date object
        y: parseFloat(entry[4]) // Close price as number
    })
    );
};

export { binance }


/*
Spot Trading Prices → wss://stream.binance.com:9443/ws/ethusdt@ticker
Futures (Linear Contracts) Prices → wss://fstream.binance.com/ws/ethusdt@ticker
Candlestick (Kline) Data → wss://stream.binance.com:9443/ws/ethusdt@kline_1m
Order Book (Depth) → wss://stream.binance.com:9443/ws/ethusdt@depth
*/