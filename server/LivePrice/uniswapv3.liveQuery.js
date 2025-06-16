import { ethers } from "ethers";
import LivePrice, { LivePriceListener } from "./livePrice.js";
import PoolAddress from "../poolAddress.js";


export const TokenDecimal = {
    USDT: 6,
    ETH: 18,
    WBTC: 8,
    DAI: 18,
    LINK: 18,
    WETH: 18,
    USDC: 6,
    UNI: 18,
    beraSTONE: 18,
    USDM: 6,
    MKR: 18,
    HKDM: 6,
}

export const UniswapV3LivePrice = async (symbols, address) => {
    const currency = symbols.split("-");
    const token1 = currency[0], token2 = currency[1];

    const provider = new ethers.JsonRpcProvider("https://eth.llamarpc.com");  // Public RPC

    const poolABI = [
        "function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)"
    ];

    const poolContract = new ethers.Contract(address, poolABI, provider);

    const slot0 = await poolContract.slot0();

    const sqrtPriceX96 = BigInt(slot0[0])
    const numerator = sqrtPriceX96 * sqrtPriceX96;
    const denominator = BigInt(2) ** BigInt(192);
    const rawPrice = Number(numerator) / Number(denominator);

    let decimalDiff = TokenDecimal[token2] - TokenDecimal[token1];
    let adjustedPrice = rawPrice * 10 ** decimalDiff;

    // 🔹 If price is too small (< 1), invert it
    if (adjustedPrice < 1) {
        adjustedPrice = 1 / adjustedPrice;
    }

    LivePrice.UniswapV3[symbols] = parseFloat(adjustedPrice);

    LivePriceListener.emit(`priceUpdate:UniswapV3:${symbols}`, {
        provider: 'UniswapV3',
        symbol: symbols,
        p: parseFloat(adjustedPrice),
        timestamp: new Date().toISOString()
    }); 

} 
 
function fetchDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function pollUniswapV3() {
    while (true) {
        try {
            for (const [symbol, address] of Object.entries(PoolAddress.UniswapV3)) {
            await UniswapV3LivePrice(symbol, address);
        }
        } catch (err) {
            console.error("Polling error:", err);
        }

        await fetchDelay(5000); // Wait 5 seconds between cycles
    }
}

pollUniswapV3();