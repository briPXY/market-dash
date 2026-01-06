import Decimal from 'decimal.js';
import { ethers } from "ethers";
// import { isTickPriceReversed } from './utils'; 


export function getPriceFromSqrtPriceX96(sqrtPriceX96, token0, token1) {
    const sqrt = new Decimal(sqrtPriceX96.toString());
    const price = sqrt.pow(2).div(new Decimal(2).pow(192));
    const decimalAdjustment = new Decimal(10).pow(token0.decimals).div(new Decimal(10).pow(token1.decimals));
    const adjustedPrice = price.mul(decimalAdjustment);
    return adjustedPrice.toFixed(16)
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

let isOracleBelow1 = false;
const inverter = [(price) => price, (price) => 1 / price, (price) => price];

export function rateOrderMatchOracle(price) {
    return inverter[isOracleBelow1 + (price < 1)](price);
}

export function setIsOraclePriceBelow1(price) {
    if (Number(price)) {
        isOracleBelow1 = price < 1;
    }
}