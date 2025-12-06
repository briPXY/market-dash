import { openDB } from 'idb';

export async function createPaiListsDB(arrayNameInResponse, sourceURL, exchange = "") {
    // 1. DONE signature check
    if (localStorage.getItem(`pair-list:${exchange}`) === "true") {
        return false;
    }

    // 2. Open DB with composite keyPath
    const db = await openDB("pair-list", 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains("pair-list")) {
                const store = db.createObjectStore("pair-list", {
                    keyPath: ['exchange', 'baseAsset', 'quoteAsset']
                });

                store.createIndex("byExchange", "exchange");
                store.createIndex("bySymbol", "symbol");
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

    const list = json[arrayNameInResponse];

    if (!Array.isArray(list)) {
        console.warn(`Skipping: ${sourceURL}, invalid list structure`);
        return null;
    }

    const tx = db.transaction("pair-list", "readwrite");
    const store = tx.objectStore("pair-list");

    for (const info of list) {
        const obj = {};
        obj.symbol = info.symbol;
        obj.exchange = exchange;
        obj.baseAsset = info.baseAsset;
        obj.quoteAsset = info.quoteAsset;
        await store.put(obj);
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

    const index = store.index("bySymbol");
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


export async function installPairLists() {
    await createPaiListsDB("symbols", "/pair-list/exchangeInfo.json", "binance");
}