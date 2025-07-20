import { ethers } from "ethers";
import LivePrice, { LivePriceListener } from "../memory/prices.memory.js";
import Subgraphs from "../constants/subgraph.adapter.js";
import { getPriceFromSqrtPriceX96 } from "../utils/math.ether.js";

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
        const pairs = symbols.split("-");
        const token0 = pairs[0], token1 = pairs[1];

        const provider = new ethers.JsonRpcProvider(Subgraphs[network].RPC);  // Public RPC

        const poolABI = [
            "function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)"
        ];

        const poolContract = new ethers.Contract(address, poolABI, provider);
        const slot0 = await poolContract.slot0();

        const decimals0 = TokenDecimal[token0] ?? 18;
        const decimals1 = TokenDecimal[token1] ?? 18;
 
        const price = getPriceFromSqrtPriceX96(slot0.sqrtPriceX96, decimals0, decimals1)

        LivePrice[network][symbols] = price;

        LivePriceListener.emit(`priceUpdate:${network}:${symbols}`, {
            provider: network,
            symbol: symbols,
            p: price,
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
        console.log(network, LivePrice[network])
        const seconds = Math.floor(Math.random() * (8000 - 6000 + 1)) + 6000;
        await delay(seconds); // Wait 5-7 seconds between cycles
    }
}

for (const network of networks) {
    LivePrice[network] = {};
    loopFetch(network);
}