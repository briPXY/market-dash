import { defaultDecimalRule, wrappedTokenMap } from "../constants/constants";
import { SourceConst } from "../constants/sourceConst";

export const formatSwapData = (swaps) => {
    // console.log("SWAPS", swaps);
    return swaps.map((trade) => {
        const date = new Date(parseInt(trade.timestamp) * 1000).toLocaleString();
        const price = Math.abs(parseFloat(trade.amount1) / parseFloat(trade.amount0)).toFixed(6);
        const total = parseFloat(trade.amount0).toFixed(4);
        const amount = Math.abs(parseFloat(trade.amount1)).toFixed(2);
        const sender = trade.sender;
        const recipient = trade.recipient;

        return {
            date,
            price,
            total,
            amount,
            sender,
            recipient,
        };
    });
};

export function isTickPriceReversed(network, pool) {
    if (SourceConst[network].invertAll) {
        return true;
    }

    if (SourceConst[network].invertTick) {
        return SourceConst[network].invertTick.includes(`${SourceConst[network].info[pool].token0.symbol}${SourceConst[network].info[pool].token1.symbol}`);
    }
    else {
        return false;
    }
}

export function formatPrice(str, isRaw = false, rule = defaultDecimalRule) {
    const num = parseFloat(str);

    if (isRaw || isNaN(num)) return str;

    if (num < 1) {
        const match = str.match(/^0\.(0*)(\d+)/);
        if (!match) return str;
        const [, zeroes, digits] = match;
        // Keep up to 2 significant digits after leading zeros
        return `0.${zeroes}${digits.slice(0, rule[0])}`;
    }

    if (num < 100) {
        return Number(num).toFixed(rule[99]);
    }

    return Number(num).toFixed(rule.rest);
}

export function stdSymbol(symbol) {
    return wrappedTokenMap[symbol] || symbol;
}

export function invertedHistoricalPrices(array) {
    return array.map(item => ({
        ...item,
        open: 1 / item.open,
        high: 1 / item.high,
        low: 1 / item.low,
        close: 1 / item.close,
    }));
}

export function trimmedFloatDigits(num, maxFloatingNonZeros = 2) {
    const floatings = num.toString().match(/\.[0-9]+/)?.[0] || "";
    const leadingZeros = floatings.match(/0+/)?.[0].length || 0;
    return leadingZeros + maxFloatingNonZeros;
}

export async function getAvailableRPC(rpcUrls) {
    for (let i = 0; i < rpcUrls.length; i++) {
        const url = rpcUrls[i];
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    jsonrpc: "2.0",
                    id: 1,
                    method: "eth_blockNumber",
                    params: []
                }),
            });

            if (!response.ok) {
                throw new Error(`RPC returned status ${response.status}`);
            }

            const data = await response.json();
            if (data.result) {
                return url;
            } else {
                throw new Error("No block data received");
            }
        } catch (error) { 
            console.warn(`❌ RPC failed [${url}]: ${error.message}`);
            // Continue to next URL
        }
    }

    // All RPCs failed
    console.error("⚠️ All RPC URLs failed.");
    throw new Error("⚠️ All RPC URLs failed.");
}