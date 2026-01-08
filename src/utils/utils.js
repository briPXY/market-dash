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

export function countLeadingDecimalZeros(n) {
    if (n <= 0 || n >= 1) return 0; // Only for decimals between 0 and 1
    return Math.abs(Math.floor(Math.log10(n))) - 1;
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

export function formatPriceInternational(input, rule = { min: 0, max: 6, ignoreLeadingZeroes: true }) {
    const num = parseFloat(String(input));
    if (isNaN(num)) return input;

    if (rule.ignoreLeadingZeroes) {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: rule.min,
            maximumFractionDigits: num < 100 ? rule.max : 2,
        }).format(num);
    }

    let trailZeroes = countLeadingDecimalZeros(Number(input));
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: rule.min ?? 0,
        maximumFractionDigits: trailZeroes + (rule.max ?? 0),
    }).format(num);
}

export function stdSymbol(symbol) {
    if (symbol) return wrappedTokenMap[symbol] ?? symbol.replace(/^w/, "");
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

export function invertedHistoricalPricesMutate(array) {
    array.forEach(item => {
        item.open = 1 / item.open;
        item.high = 1 / item.high;
        item.low = 1 / item.low;
        item.close = 1 / item.close;
    });
}

export function trimmedFloatDigits(num = 0, maxFloatingNonZeros = 2) {
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
            console.warn(`RPC failed [${url}]: ${error.message}`);
            // Continue to next URL
        }
    }

    // All RPCs failed
    console.error("All RPC URLs failed.");
    throw new Error("All RPC URLs failed.");
}

export function localStorageSaveDottedKeyAll(name, obj) {
    if (!name || typeof obj !== "object" || obj === null) {
        console.error("localStorageObjectSave: invalid arguments");
        return false;
    }

    // Remove old stored keys with this prefix
    const prefix = `${name}.`;

    for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
            localStorage.removeItem(key);
        }
    }

    // Save new values
    for (const prop in obj) {
        if (!Object.hasOwn(obj, prop)) continue;      // ✔ ESLint-safe
        if (typeof obj[prop] === "function") continue;

        const storageKey = `${name}.${prop}`;
        const value = obj[prop] === null ? "" : String(obj[prop]);

        localStorage.setItem(storageKey, value);
    }

    return true;
}

export function localStorageLoadDottedKeyAll(keySample) {
    if (!keySample.includes(".")) return null;

    const [prefix] = keySample.split(".");
    const result = {};
    const prefixDot = prefix + ".";
    let foundAny = false;

    for (let i = 0; i < localStorage.length; i++) {
        const fullKey = localStorage.key(i);
        if (fullKey.startsWith(prefixDot)) {
            const prop = fullKey.slice(prefixDot.length);
            result[prop] = localStorage.getItem(fullKey);
            foundAny = true;
        }
    }

    return foundAny ? result : null;
}

export function localStorageDeleteDottedKeyAll(key) {
    const prefixDot = key + ".";

    // 1. Delete the exact key ("wallet.provider")
    localStorage.removeItem(key);

    // 2. Delete all "wallet.*" keys
    const keysToDelete = [];

    for (let i = 0; i < localStorage.length; i++) {
        const fullKey = localStorage.key(i);
        if (fullKey.startsWith(prefixDot)) {
            keysToDelete.push(fullKey);
        }
    }

    keysToDelete.forEach(k => localStorage.removeItem(k));
}

export async function openLink(url) {
    const isElectron =
        typeof window !== 'undefined' &&
        typeof window.process === 'object' &&
        window.process.type === 'renderer';

    if (isElectron) {
        // dynamically import electron only when running in electron
        // const { shell } = await import('electron');
        // shell.openExternal(url);
    } else {
        window.open(url, '_blank', 'noopener,noreferrer');
    }
}

export const sortByRelevance = (dataArray = [{}], propToSort = "", searchTerm = "") => {
    if (!searchTerm) {
        // If no search term, return a non-mutated, alphabetically sorted copy
        return [...dataArray].sort((a, b) => a.symbol.localeCompare(b.symbol));
    }

    const lowerSearchTerm = searchTerm.toLowerCase();

    // Create a copy to avoid mutating the original array
    return [...dataArray].sort((a, b) => {
        const symbolA = a[propToSort].toLowerCase();
        const symbolB = b[propToSort].toLowerCase();

        // --- Define a relevance score (lower score = higher priority) ---
        const getScore = (symbol) => {
            if (symbol === lowerSearchTerm) return 0; // Exact match
            if (symbol.startsWith(lowerSearchTerm)) return 1; // Starts with
            if (symbol.includes(lowerSearchTerm)) return 2; // Contains
            return 3; // No relevance match
        };

        const scoreA = getScore(symbolA);
        const scoreB = getScore(symbolB);

        // Primary sort: by relevance score (lower score first)
        if (scoreA !== scoreB) {
            return scoreA - scoreB;
        }

        // Secondary sort: alphabetical (if scores are equal)
        return symbolA.localeCompare(symbolB);
    });
};
