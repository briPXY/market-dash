import { toBigInt } from 'ethers';

export function getPriceFromSqrtPriceX96(sqrtPriceX96, token0Decimals, token1Decimals) {
    const bPriceX96 = toBigInt(sqrtPriceX96);
    const numerator = bPriceX96 * bPriceX96;
    const denominator = 2n ** 192n;
    const rawPrice = Number(numerator) / Number(denominator);

    const decimalDiff = token1Decimals - token0Decimals;
    const adjustedPrice = rawPrice * 10 ** decimalDiff;

    return adjustedPrice.toFixed(8); // or use .toFixed(8) if you want more readable string
}