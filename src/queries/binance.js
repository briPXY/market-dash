async function binanceOHLCtoD3Linear(interval = "1h", symbol = "ETH") {
    const url = `https://api.binance.com/api/v3/klines?symbol=${symbol.toUpperCase()}USDT&interval=${interval}&limit=100`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        // Convert to D3.js-compatible format (time vs close price)
        return data.map(entry => ({
            time: new Date(entry[0]),  // Convert timestamp to Date object
            close: parseFloat(entry[4]) // Close price as number
        }));

    } catch (error) {
        console.error("Error fetching Binance OHLC data:", error);
        return [];
    }
}
 
async function fetchCurrentPrice(symbol = "ETH") {
    // Create timestamp before fetch to approximate request time
    const requestTime = new Date();

    const url = `https://api.binance.com/api/v3/ticker/price?symbol=${symbol.toUpperCase()}USDT`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        return {
            time: requestTime,          // Use pre-fetch timestamp
            price: parseFloat(data.price) // Convert price to float
        };

    } catch (error) {
        console.error("Error fetching ETH price:", error);
        return null;
    }
}
 

export default binanceOHLCtoD3Linear
export {fetchCurrentPrice}