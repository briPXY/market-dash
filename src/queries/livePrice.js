import { getPriceFromSqrtPriceX96 } from "../utils/price.math";
import { DOMAIN } from "../constants/environment";

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

export const binanceTicker = async (symbols) => {
    const apiUrl = `https://api.binance.com/api/v3/ticker/price?symbol=${symbols}`;
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
    singleFetcher(pairObj.symbols).then(p => setPrice(p));

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
