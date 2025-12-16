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
};

const networks = Object.keys(Subgraphs);

const RPC = {};
const rpcIndex = {};
const Providers = {}; // <--- cache providers

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function probeRpc(url) {
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_blockNumber", params: [] }),
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error.message || "RPC error");
    return data.result;
}

async function setProvider(network, url, idx) {
    // check first using fetch
    await probeRpc(url);

    // destroy old one if any
    if (Providers[network]) {
        Providers[network].destroy?.();
        console.log(`Destroyed old provider for ${network}`);
    }

    const provider = new ethers.JsonRpcProvider(url);
    RPC[network] = url;
    rpcIndex[network] = idx;
    Providers[network] = provider;
    console.log(`Active provider for ${network}: ${url}`);
}

async function selectWorkingRpc(network) {
    const urls = Subgraphs[network].RPC;
    for (let i = 0; i < urls.length; i++) {
        try {
            await setProvider(network, urls[i], i);
            return urls[i];
        } catch (err) {
            console.warn(`RPC failed for ${network}: ${urls[i]} (${err.message})`);
        }
    }
    throw new Error(`No working RPC found for ${network}`);
}

// Rotate to next RPC if current fails
async function rotateRpc(network) {
    const urls = Subgraphs[network].RPC;
    let start = (rpcIndex[network] ?? 0) + 1;

    for (let i = 0; i < urls.length; i++) {
        const idx = (start + i) % urls.length;
        try {
            await setProvider(network, urls[idx], idx);
            console.log(`SSwitched RPC for ${network} → ${urls[idx]}`);
            return urls[idx];
        } catch {
            console.warn(`RPC unavailable for ${network}: ${urls[idx]}`);
        }
    }
    throw new Error(`All RPC endpoints failed for ${network}`);
}

export const fetchLivePrice = async (network, decimals0, decimals1, address) => {
    try {
        await delay(Math.floor(Math.random() * (2000 - 100 + 1)) + 100);

        const provider = Providers[network]; // reuse provider, not new each time

        const poolABI = [
            "function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)"
        ];

        const poolContract = new ethers.Contract(address, poolABI, provider);
        const slot0 = await poolContract.slot0();

        const sqrtPriceX96 = slot0.sqrtPriceX96.toString();
        LivePrice[network][address] = sqrtPriceX96;

        LivePriceListener.emit(`priceUpdate:${network}:${address}`, {
            provider: network,
            address,
            p: sqrtPriceX96,
            timestamp: new Date().toISOString()
        });

        return true;
    } catch (e) {
        console.error("fetchLivePrice error @", address, "network:", network, e.message);

        LivePriceListener.emit(`priceUpdate:${network}:${address}`, {
            provider: network,
            address,
            p: "error",
            message: e.message,
            timestamp: new Date().toISOString()
        });

        if (e.message.includes("failed to detect network") || e.message.includes("ECONN")) {
            try {
                await rotateRpc(network);
            } catch (fatal) {
                throw new Error(`All RPCs failed for ${network}, message:${fatal.message}`);
            }
        }
        return false;
    }
};

async function loopFetch(network) {
    try {
        while (true) {
            const poolAdresses = Subgraphs[network].info;

            for (const address in poolAdresses) {
                const poolInfo = poolAdresses[address];
                const decimals0 = Number(poolInfo.token0.decimals);
                const decimals1 = Number(poolInfo.token1.decimals);

                await fetchLivePrice(network, decimals0, decimals1, address);
            }

            const seconds = Math.floor(Math.random() * (8000 - 6000 + 1)) + 6000;
            await delay(seconds);
        }
    } catch (err) {
        console.error(`Loop for ${network} stopped:`, err.message);
    }
}

(async () => {
    for (const network of networks) {
        LivePrice[network] = {};
        try {
            await selectWorkingRpc(network); // pick initial RPC
            loopFetch(network);
        } catch (err) {
            console.error(`No RPC available for ${network}:`, err.message);
        }
    }
})();