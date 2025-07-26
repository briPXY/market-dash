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

export const fetchLivePrice = async (network, decimals0, decimals1, address) => {
    try {
        await delay(Math.floor(Math.random() * (2000 - 100 + 1)) + 100) 

        const provider = new ethers.JsonRpcProvider(Subgraphs[network].RPC);  // Public RPC

        const poolABI = [
            "function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)"
        ];

        const poolContract = new ethers.Contract(address, poolABI, provider);
        const slot0 = await poolContract.slot0(); 
 
        const sqrtPriceX96 = slot0.sqrtPriceX96.toString();

        LivePrice[network][address] = sqrtPriceX96;

        LivePriceListener.emit(`priceUpdate:${network}:${address}`, {
            provider: network,
            address: address,
            p: sqrtPriceX96,
            timestamp: new Date().toISOString()
        });
    }
    catch (e) {
        console.error("fetchLivePrice error @ address", address, e);
    }

}

async function loopFetch(network) {
    while (true) {
        const poolAdresses = Subgraphs[network].info;

        for (const address in poolAdresses) {
            const poolInfo = Subgraphs[network].info[address];
            const decimals0 = Number(poolInfo.token0.decimals)
            const decimals1 = Number(poolInfo.token1.decimals);
            await fetchLivePrice(network, decimals0, decimals1, address);
        }
        //console.log(network, LivePrice[network])
        const seconds = Math.floor(Math.random() * (8000 - 6000 + 1)) + 6000;
        await delay(seconds); // Wait 5-7 seconds between cycles
    }
}

for (const network of networks) {
    LivePrice[network] = {};
    loopFetch(network);
}