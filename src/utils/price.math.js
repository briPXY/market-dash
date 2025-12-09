import Decimal from 'decimal.js';
import { ethers } from "ethers";
// import { isTickPriceReversed } from './utils'; 

export const PriceSample = { historical: 0 };
/**
 * Convert Uniswap V3 sqrtPriceX96 to price (token1 per token0 by default)
 *
 * @param {string | bigint} sqrtPriceX96 - The sqrtPriceX96 value from Uniswap
 * @param {number | string} token0Decimals - Decimals of token0 (e.g., 18 for ETH)
 * @param {number | string} token1Decimals - Decimals of token1 (e.g., 6 for USDT)
 * @param {boolean} invert - If true, returns price of token0 per token1 instead
 * @returns {string} Price as a decimal string with 16 digits of precision
 */
export function getPriceFromSqrtPriceX96(
    sqrtPriceX96,
    token0,
    token1
) {
    // const isPriceReversed = isTickPriceReversed(network, address);
    const token0Decimals = token0.decimals;
    const token1Decimals = token1.decimals;

    const sqrt = new Decimal(sqrtPriceX96.toString());
    const price = sqrt.pow(2).div(new Decimal(2).pow(192));


    // ❗ Correct: token0Decimals - token1Decimals
    const scaleFactor = new Decimal(10).pow(Number(token0Decimals) - Number(token1Decimals));
    let adjustedPrice = price.mul(scaleFactor);

    // if (isPriceReversed) {
    //     adjustedPrice = new Decimal(1).div(adjustedPrice);
    // }

    const isOhlcAboveOne = PriceSample.historical > 1;
    const isLivePriceAboveOne = adjustedPrice > 1;
    const notInverted = isLivePriceAboveOne && isOhlcAboveOne;

    const result = notInverted ? adjustedPrice.toFixed(16) : (1 / adjustedPrice).toFixed(16);
    return result;
}

export const getTokenDecimals = async (tokenAddress, provider) => {
    try {
        const erc20ABI = ["function decimals() view returns (uint8)"];
        const tokenContract = new ethers.Contract(tokenAddress, erc20ABI, provider);
        const decimals = await tokenContract.decimals();
        return decimals;
    } catch (error) {
        console.error("Error fetching token decimals:", error);
        return null;
    }
};

export function calculateHistoricalChange(data) {
    if (!data || data.length < 2) {
        return { change: 0, high: 0, low: 0, percent: 0, volume: 0, trades: 0 }; // Need at least two data points
    }

    const first = data[0];  // Oldest price in range
    const last = data[data.length - 1]; // Latest price in range

    let highest = first.close;
    let lowest = first.close;

    for (let i = 1; i < data.length; i++) {
        if (data[i].close > highest) highest = data[i].close;
        if (data[i].close < lowest) lowest = data[i].close;
    }

    const priceChange = last.close - first.close;
    const priceChangePercent = (priceChange / first.close) * 100;

    return {
        change: priceChange.toFixed(2),
        percent: priceChangePercent.toFixed(2),
        high: highest,
        low: lowest,
        volume: data.reduce((sum, e) => sum + e.volume, 0),
        trades: data.reduce((sum, e) => sum + e.trades, 0),
    };
}