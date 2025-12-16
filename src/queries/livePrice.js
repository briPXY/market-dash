import { getPriceFromSqrtPriceX96 } from "../utils/price.math";
import { DOMAIN } from "../constants/environment";
import { ethers } from "ethers";
import { RPC_URLS } from "../constants/constants";
import { useSourceStore } from "../stores/stores";

const _LivePriceLoops = {
    ether: false,
}

export const UniswapV3BulkPrice = async (provider) => {
    try {
        const response = await fetch(`${DOMAIN}/bulkprice/${provider}`);
        const json = await response.json();

        for (const address in json.data) {
            json.data[address] = getPriceFromSqrtPriceX96(json.data[address], provider, address);
        }

        return json.data;

    } catch (error) {
        console.error('Error fetching bulk prices', provider, error);
    }
}

export const binanceTicker = async (pairObj) => {
    if (!pairObj.symbols) return;
    const apiUrl = `https://api.binance.com/api/v3/ticker/price?symbol=${pairObj.symbols}`;
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        return parseFloat(data.price);
    } catch (error) {
        console.error("Error fetching price:", error);
    }
};

export async function fetchTickerOnNodeServer(symbols, networkName) {
    const res = await fetch(`${DOMAIN}/api/t/${symbols}@${networkName}`)
    const priceData = await res.json();
    return parseFloat(priceData.price);
}

const ws = { current: null };
let reconnectTimer;

export const closeLivePriceWebSocket = (err) => {
    clearTimeout(reconnectTimer);
    if (!ws.current) return;
    ws.current.onclose = null;
    ws.current.onerror = () => console.error(err);
    ws.current.close();
    ws.current = null;
}

const handleWebSocketReconnect = (error) => {

    if (ws.current) {
        closeLivePriceWebSocket(error);
    }
    if (error) {
        console.error(error)
    }

    clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(livePriceWebSocket, 5000);
};

let silentTimer;

export const livePriceWebSocket = async (priceSource, pairObj, setPrice) => {

    const symbols = pairObj.symbols.toLowerCase();
    // fetch ticker 1st in case wss not response instantly
    const singleFetcher = priceSource.data.fetchPrice.bind(priceSource);
    singleFetcher(pairObj.symbols).then(p => setPrice(p ?? 0));

    if (ws.current !== null) {
        closeLivePriceWebSocket();
    }

    const tradeSocket = new WebSocket(`wss://stream.binance.com:9443/ws/${symbols}@trade`);
    ws.current = tradeSocket;

    tradeSocket.onopen = () => {
        silentTimer = setTimeout(() => {
            fallbackToMiniTicker(symbols, setPrice);
        }, 3000); // 3 seconds silence timeout
    };

    tradeSocket.onmessage = (event) => {
        clearTimeout(silentTimer);
        const message = JSON.parse(event.data);
        setPrice(message.p);
    };

    tradeSocket.onerror = handleWebSocketReconnect;
    tradeSocket.onclose = handleWebSocketReconnect;
};

function fallbackToMiniTicker(symbols, setPrice) {
    closeLivePriceWebSocket();

    const miniSocket = new WebSocket(`wss://stream.binance.com:9443/ws/${symbols}@miniTicker`);
    ws.current = miniSocket;

    miniSocket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        setPrice(message.c);
    };

    miniSocket.onerror = handleWebSocketReconnect;
    miniSocket.onclose = handleWebSocketReconnect;
}
// ----------------------------------
// [ NON WEBSOCKET LIVE PRICE LOOPER]
// ----------------------------------

async function _probeRpc(url) {
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

const _RPC = {};
const rpcIndex = {};
const _RPCProviders = {}; // <--- cache providers

async function _setProvider(network, url, idx) {
    // check first using fetch
    await _probeRpc(url);

    // destroy old one if any
    if (_RPCProviders[network]) {
        _RPCProviders[network].destroy?.();
        console.log(`Destroyed old provider for ${network}`);
    }

    const provider = new ethers.JsonRpcProvider(url);
    _RPC[network] = url;
    rpcIndex[network] = idx;
    _RPCProviders[network] = provider;
}

async function _selectWorkingRpc(network, rpcArray) {
    for (let i = 0; i < rpcArray.length; i++) {
        try {
            await _setProvider(network, rpcArray[i], i);
            return rpcArray[i];
        } catch (err) {
            console.warn(`RPC failed for ${network}: ${rpcArray[i]} (${err.message})`);
        }
    }
    throw new Error(`No working RPC found for ${network}`);
}

function _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const fetchUniswapPoolPrice = async (network, pairObj) => {
    try {
        await _delay(Math.floor(Math.random() * (2000 - 100 + 1)) + 100);

        const provider = _RPCProviders[network]; // reuse provider, not new each time 
        const poolABI = [
            "function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)"
        ];

        const poolContract = new ethers.Contract(pairObj.address, poolABI, provider);
        const slot0 = await poolContract.slot0();

        const sqrtPriceX96 = slot0.sqrtPriceX96.toString();

        return sqrtPriceX96;
    } catch (e) {
        console.error("fetchLivePrice error @", pairObj.address, "network:", network, e.message);

        if (e.message.includes("failed to detect network") || e.message.includes("ECONN")) {
            try {
                await _selectWorkingRpc(network, RPC_URLS.default);
            } catch (fatal) {
                throw new Error(`All RPCs failed for ${network}, message:${fatal.message}`);
            }
        }
        return false;
    }
};

export function killAllLivePriceLoops() {
    for (const val in _LivePriceLoops) {
        _LivePriceLoops[val] = false;
    }
}

export async function uniswapOneTimerPrice(pairObj) {
    const price = await fetchUniswapPoolPrice(useSourceStore.getState().src, pairObj);
    const converted = getPriceFromSqrtPriceX96(price, pairObj.token0, pairObj.token1);
    return converted;
}

export async function ethereurmLivePriceLoopers(priceSourceObj, pairObj, setPrice) {
    const looperName = `${priceSourceObj.src}${pairObj.address}`;
    _LivePriceLoops[looperName] = true;

    await _selectWorkingRpc(priceSourceObj.src, RPC_URLS.default);

    if (!pairObj.address) {
        _LivePriceLoops[looperName] = false;
        return;
    }

    while (_LivePriceLoops[looperName]) {
        const price = await fetchUniswapPoolPrice(priceSourceObj.src, pairObj);
        if (!price) continue;
        const converted = getPriceFromSqrtPriceX96(price, pairObj.token0, pairObj.token1);
        setPrice(converted);

        if (!_LivePriceLoops[looperName]) return;

        await _delay(8000);

        if (!_LivePriceLoops[looperName]) return;
    }
}