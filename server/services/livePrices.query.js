import { ethers } from "ethers";
import LivePrice, { LivePriceListener } from "../memory/prices.memory.js";
import Subgraphs from "../constants/subgraph.adapter.js";

export const TokenDecimal = {
    USDT: 6,
    USDC: 6,
    WBTC: 8,
    GUSD: 2,
    USDM: 6,
    HKDM: 6,
}

const networks = Object.keys(Subgraphs);

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const fetchLivePrice = async (network, symbols, address) => {
    try {
        await delay(Math.floor(Math.random() * (2000 - 100 + 1)) + 100)
        const currency = symbols.split("-");
        const token1 = currency[0], token2 = currency[1];

        const provider = new ethers.JsonRpcProvider(Subgraphs[network].RPC);  // Public RPC

        const poolABI = [
            "function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)"
        ];

        const poolContract = new ethers.Contract(address, poolABI, provider);

        const slot0 = await poolContract.slot0();

        const sqrtPriceX96 = BigInt(slot0[0])
        const numerator = sqrtPriceX96 * sqrtPriceX96;
        const denominator = BigInt(2) ** BigInt(192);
        const rawPrice = Number(numerator) / Number(denominator);

        let decimalDiff = (TokenDecimal[token2] ?? 18) - (TokenDecimal[token1] ?? 18);
        let adjustedPrice = rawPrice * 10 ** decimalDiff;

        // 🔹 If price is too small (< 1), invert it
        if (adjustedPrice < 1) {
            adjustedPrice = 1 / adjustedPrice;
        }

        LivePrice[network][symbols] = parseFloat(adjustedPrice);

        LivePriceListener.emit(`priceUpdate:${network}:${symbols}`, {
            provider: network,
            symbol: symbols,
            p: parseFloat(adjustedPrice),
            timestamp: new Date().toISOString()
        });
    }
    catch (e) {
        console.error("fetchLivePrice error @ address", address, e);
    }

}

async function loopFetch(network) {
    while (true) {
        const poolAddresses = Object.entries(Subgraphs[network].pools);

        for (const [symbol, address] of poolAddresses) {
            await fetchLivePrice(network, symbol, address);
        }

        const seconds = Math.floor(Math.random() * (7000 - 5000 + 1)) + 5000;
        await delay(seconds); // Wait 5-7 seconds between cycles
    }
}

for (const network of networks) {
    LivePrice[network] = {};
    loopFetch(network);
}