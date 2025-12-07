import { openDB } from 'idb';

function getNestedValue(obj, path) {
    return path.reduce((currentObj, key) => {
        if (currentObj === null || currentObj === undefined) {
            return undefined;
        }
        return currentObj[key];
    }, obj);
}

function binanceEntryMethod(info) {
    const obj = {};
    obj.symbols = info.symbol;
    obj.symbols_rev = info.quoteAsset + info.baseAsset;//reversed symbol pair
    obj.symbol0 = info.baseAsset;
    obj.symbol1 = info.quoteAsset;
    return obj;
}

function subgraphEntryMethod(info) {
    const obj = {};
    obj.symbols = info.token0.symbol + info.token1.symbol;
    obj.symbols_rev = info.token1.symbol + info.token0.symbol; // reversed symbols
    obj.symbol0 = info.token0.symbol;
    obj.symbol1 = info.token1.symbol;
    // additional infos
    obj.token0 = info.token0;
    obj.token1 = info.token1;
    obj.address = info.id; // pool address
    obj.liquidity = info.liquidity;
    obj.fee_tier = info.feeTier;
    return obj;
}

export async function createPaiListsDB(pathToDive, sourceURL, exchange = "", entryMethod) {
    // 1. DONE signature check
    if (localStorage.getItem(`pair-list:${exchange}`) === "true") {
        return false;
    }

    // 2. Open DB with composite keyPath
    const db = await openDB("pair-list", 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains("pair-list")) {
                const store = db.createObjectStore("pair-list", {
                    keyPath: ['exchange', 'symbol0', 'symbol1']
                });

                store.createIndex("byExchange", "exchange");
                store.createIndex("bySymbols", "symbols");
                store.createIndex("bySymbolsReversed", "symbols_rev");
            }
        }
    });

    let json;

    // fetch url
    try {
        const res = await fetch(sourceURL);
        if (!res.ok) {
            console.warn(`Skipping: ${sourceURL} (HTTP ${res.status})`);
            return null;
        }
        json = await res.json();
    } catch (err) {
        console.warn(`Skipping: ${sourceURL} (FETCH FAILED)`, err);
        return null;
    }

    const list = getNestedValue(json, pathToDive);

    if (!Array.isArray(list)) {
        console.warn(`Skipping: ${sourceURL}, invalid list structure`);
        return null;
    }

    const tx = db.transaction("pair-list", "readwrite");
    const store = tx.objectStore("pair-list");

    for (const info of list) {
        const obj = entryMethod(info);
        obj.exchange = exchange;
        await store.put(obj)
    }

    await tx.done;

    localStorage.setItem(`pair-list:${exchange}`, "true");
    console.log(`${exchange} pair list database has installed`);
    return true;
} // v1

export async function searchPairList(
    exchangeName,
    keyword,
    limit = 20,
    signal = { aborted: false }
) {
    const db = await openDB("pair-list", 1);
    const tx = db.transaction("pair-list", "readonly");
    const store = tx.objectStore("pair-list");

    keyword = keyword.replace(/[- ]/g, '');

    //  Try FAST SEARCH using bySymbol index 

    const index = store.index("bySymbols");
    const fastRange = IDBKeyRange.bound(keyword, keyword + "\uffff");
    let cursor = await index.openCursor(fastRange);

    const fastResults = [];
    let count = 0;

    while (cursor) {
        if (signal.aborted) throw new DOMException("Aborted", "AbortError");

        const record = cursor.value;
        if (record.exchange === exchangeName) {
            fastResults.push(record);
            count++;

            if (count >= limit) {
                await tx.done;
                return fastResults;
            }
        }

        cursor = await cursor.continue();
    }

    // If fast search found results → return immediately
    if (fastResults.length > 0) {
        await tx.done;
        return fastResults;
    }

    //  SLOW SEARCH using composite key scanning 

    const keyRange = IDBKeyRange.bound(
        [exchangeName],
        [exchangeName, "\uffff", "\uffff"]
    );

    let slowCursor = await store.openCursor(keyRange);
    const slowResults = [];
    let slowCount = 0;

    while (slowCursor) {
        if (signal.aborted) throw new DOMException("Aborted", "AbortError");

        // eslint-disable-next-line no-unused-vars
        const [_, baseAsset, quoteAsset] = slowCursor.key;

        if (baseAsset.includes(keyword) || quoteAsset.includes(keyword)) {
            slowResults.push(slowCursor.value);
            slowCount++;

            if (slowCount >= limit) break;
        }

        slowCursor = await slowCursor.continue();
    }

    await tx.done;
    return slowResults;
}


export async function installPairLists(callback = () => { }) {
    await createPaiListsDB(["symbols"], "/pair-list/exchangeInfo.json", "binance", binanceEntryMethod);
    await createPaiListsDB(["data", "pools"], "/pair-list/UniswapV3Pairs.json", "uniswap:1", subgraphEntryMethod);
    callback();
}