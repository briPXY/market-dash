import { getPriceFromSqrtPriceX96 } from "../utils/price.math";
import { DOMAIN } from "../constants/environment";

export const UniswapV3BulkPrice = async (provider) => {
    try {
        const response = await fetch(`${DOMAIN}/bulkprice/${provider}`);
        const json = await response.json();

        for (const address in json.data){
            json.data[address] = getPriceFromSqrtPriceX96(json.data[address], provider, address);
        }

        return json.data;

    } catch (error) {
        console.error('Error fetching bulk prices', provider, error);
    }
}


export const binanceTicker = async (symbols) => { 
    const apiUrl = `https://api.binance.com/api/v3/ticker/price?symbol=${symbols}`;
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        return parseFloat(data.price);
    } catch (error) {
        console.error("Error fetching price:", error);
    }
};