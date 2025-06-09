import { ethers } from "ethers";
import { PoolAddress, TokenDecimal } from "../constants/uniswapAddress";
import { decimalTrimmer } from "../utils/decimalTrimmer"; 

export const UniswapV3LivePrice = async (symbolIn, symbolOut) => {
    const provider = new ethers.JsonRpcProvider("https://eth.llamarpc.com");  // Public RPC

    const poolABI = [
        "function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)"
    ];

    const poolAddress = PoolAddress.UniswapV3[symbolOut.toUpperCase()][symbolIn.toUpperCase()]

    const poolContract = new ethers.Contract(poolAddress, poolABI, provider);

    const slot0 = await poolContract.slot0();
 
    const sqrtPriceX96 = BigInt(slot0[0])
    const numerator = sqrtPriceX96 * sqrtPriceX96;
    const denominator = BigInt(2) ** BigInt(192);
    const rawPrice = Number(numerator) / Number(denominator);

    let decimalDiff = TokenDecimal[symbolIn.toUpperCase()] - TokenDecimal[symbolOut.toUpperCase()];
    let adjustedPrice = rawPrice * 10 ** decimalDiff;
    
    // 🔹 If price is too small (< 1), invert it
    if (adjustedPrice < 1) {
        adjustedPrice = 1 / adjustedPrice;
    }

    const price = decimalTrimmer(adjustedPrice); 
    return parseFloat(price);
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