import { DOMAIN } from "../constants/environment";

export const UniswapV3BulkPrice = async (provider) => {
    try {
        const response = await fetch(`${DOMAIN}/bulkprice/${provider}`);
        const json = await response.json();
        return json.data;

    } catch (error) {
        console.error('Error fetching bulk prices', provider, error);
    }
}


export const binanceTicker = async (symbolIn, symbolOut) => {
    const apiUrl = `https://api.binance.com/api/v3/ticker/price?symbol=${symbolIn.toUpperCase()}${symbolOut.toUpperCase()}`;
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        return parseFloat(data.price);
    } catch (error) {
        console.error("Error fetching price:", error);
    }
};