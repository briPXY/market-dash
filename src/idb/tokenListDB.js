import { openDB } from 'idb';

const RECENT_CACHE_KEY = "token-search:recent";
const RECENT_CACHE_LIMIT = 8; // how many recent queries to store

export async function importTokenLists(sources = [{ url: null, list: null, chainId: null, blockchain: null }]) {
    let failures = 0;

    const primaryKey = "address";        // must be uniform across sources
    const secondaryKey = "chainId";      // this is the one we dummy-fill if missing

    // done signature check
    if (localStorage.getItem("token-list:done") === "true") {
        console.log("Token list already imported. Skipping...");
        return false;
    }

    // open DB with composite keyPath
    const db = await openDB("token-list", 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains("tokens")) {
                const store = db.createObjectStore("tokens", {
                    keyPath: [primaryKey, secondaryKey], // dynamic composite key
                });

                store.createIndex("symbol", "symbol");
                store.createIndex("name", "name");
                store.createIndex("symbol_chain", ["symbol", "chainId"]);
            }
        }
    });

    // import each source
    for (const source of sources) {
        let json;

        // fetch url
        try {
            const res = await fetch(source.url);
            if (!res.ok) {
                console.warn(`Skipping: ${source.url} (HTTP ${res.status})`);
                failures++;
                continue;
            }
            json = await res.json();
        } catch (err) {
            console.warn(`Skipping: ${source.url} (FETCH FAILED)`, err);
            failures++;
            continue;
        }

        const list = json[source.list];

        if (!Array.isArray(list)) {
            console.warn(`Skipping: ${source.url}, invalid list structure`);
            failures++;
            continue;
        }

        const tx = db.transaction("tokens", "readwrite");
        const store = tx.objectStore("tokens");

        for (const token of list) {
            // IMPORTANT to standarize or will got double entry
            token.address = token.address.toLowerCase();

            // ensure chainId key exists, or create dummy
            if (!(secondaryKey in token) || !token[secondaryKey]) {
                token[secondaryKey] = `${source.blockchain}:${source.chainId}`;
            }
            else {
                token.chainId = `${source.blockchain}:${token.chainId}`;
            }

            token.blockchain = source.blockchain ?? "null"; // blockchain not just L2 or sub-chain

            await store.put(token); // insert or replace
        }

        await tx.done;
    }

    // create DONE signature
    if (failures < sources.length) {
        localStorage.setItem("token-list:done", "true");
        console.log("Token import completed successfully.");
    }

    return true;
} // v4

export async function getTokenBySymbolChainId(symbol, chainId, filter = null) {
    const db = await openDB("token-list", 1);
    const tx = db.transaction("tokens", "readonly");
    const store = tx.objectStore("tokens");

    const idx = store.index("symbol_chain");
    const token = await idx.get([symbol, chainId]);

    if (!token) return null;

    if (!filter) return token;

    // extract filter index:value
    const [filterIndex, filterValue] = Object.entries(filter)[0];

    // If the found token already matches filter → done
    if (token[filterIndex] === filterValue) {
        return token;
    }

    const customIdx = store.index(filterIndex);
    let cursor = await customIdx.openCursor(filterValue);

    // walk the index results until symbol + chainId also match
    while (cursor) {
        const entry = cursor.value;

        if (
            entry.symbol === symbol &&
            entry.chainId === chainId &&
            entry[filterIndex] === filterValue
        ) {
            return entry;
        }

        cursor = await cursor.continue();
    }

    return null;
}


export function loadRecentSearches() {
    let recent = [];

    try {
        const saved = localStorage.getItem(RECENT_CACHE_KEY);
        if (saved) recent = JSON.parse(saved);
    } catch (e) { e }

    return Array.isArray(recent) ? recent : [];
}

function saveRecentSearch(query) {
    const recent = loadRecentSearches();

    // remove old duplicate
    const existingIndex = recent.indexOf(query);
    if (existingIndex !== -1) recent.splice(existingIndex, 1);

    // push newest
    recent.unshift(query);

    // trim to max
    if (recent.length > RECENT_CACHE_LIMIT) {
        recent.length = RECENT_CACHE_LIMIT;
    }

    localStorage.setItem(RECENT_CACHE_KEY, JSON.stringify(recent));
}


export async function searchTokensRegex(query, signal, chain = null, limit = 24) {

    if (!query || typeof query !== "string" || limit <= 0) return [];

    const db = await openDB("token-list", 1);

    // Save search pattern to recent history
    saveRecentSearch(query);

    // Compile full regex (case-insensitive)
    let regex;
    try {
        regex = new RegExp(query, "i");
    } catch (e) {
        console.error("Invalid regex:", query, e);
        return [];
    }

    if (signal && signal.aborted) {
        throw signal.reason || new DOMException("Aborted", "AbortError");
    }

    const all = await db.getAll("tokens"); // full scan, small DB OK
    const results = [];

    for (const token of all) {
        if (signal && signal.aborted) {
            // Throw an error to abruptly exit the async function and jump to the catch block
            throw signal.reason || new DOMException("Aborted", "AbortError");
        }

        if (results.length >= limit) break;
        if (chain && token.chain !== chain) continue;

        const sym = token.symbol ?? "";
        const nam = token.name ?? "";

        // FULL REGEX MATCH ANYWHERE
        if (regex.test(sym) || regex.test(nam)) {
            results.push(token);
        }
    }

    return results;
}

export async function searchTokensHybrid(query, chain = null, limit = 24) {
    if (!query || typeof query !== "string" || limit <= 0) return [];

    const db = await openDB("token-list", 1);
    const q = query.toLowerCase();

    const results = new Map(); // avoid duplicates
    let count = 0;

    // helper to push results
    const add = (token, priority) => {
        const key = token.chain + "_" + token.address;
        if (!results.has(key)) {
            results.set(key, { ...token, _p: priority });
            count++;
        }
    };

    //   PREFIX SEARCHES (indexed, fastest)


    // 1a. prefix match SYMBOL
    {
        const tx = db.transaction("tokens", "readonly");
        const idx = tx.store.index("lower");
        let cursor = await idx.openCursor(IDBKeyRange.bound(q, q + "\uffff"));

        while (cursor && count < limit) {
            if (!chain || cursor.value.chain === chain) {
                add(cursor.value, 1); // highest relevance
            }
            cursor = await cursor.continue();
        }
    }

    // stop early?
    if (count >= limit) return Array.from(results.values()).sort((a, b) => a._p - b._p);

    // 1b. prefix match NAME
    {
        const tx = db.transaction("tokens", "readonly");
        const idx = tx.store.index("name");
        let cursor = await idx.openCursor(IDBKeyRange.bound(q, q + "\uffff"));

        while (cursor && count < limit) {
            if (!chain || cursor.value.chain === chain) {
                add(cursor.value, 2);
            }
            cursor = await cursor.continue();
        }
    }

    if (count >= limit) return Array.from(results.values()).sort((a, b) => a._p - b._p);

    //   SUBSTRING SEARCHES (regex-like, fallback)
    // scoped to chain if provided 

    const all = await db.getAll("tokens"); // safe because DB size small

    for (const token of all) {
        if (count >= limit) break;
        if (chain && token.chain !== chain) continue;

        const sym = token.symbol ?? "";
        const nam = token.name ?? "";

        if (sym.includes(q)) {
            add(token, 3);
            continue;
        }
        if (nam.includes(q)) {
            add(token, 4);
            continue;
        }
    }

    // sort by priority, return clean objects
    return Array.from(results.values())
        .sort((a, b) => a._p - b._p)
        .map(t => { delete t._p; return t; });
}

export async function installTokenLists() {
    await importTokenLists([
        { url: "/token-list/uniswapv3ethereum.json", list: "tokens", chainId: 1, blockchain: "ethereum" },
        { url: "/token-list/ethereum.json", list: "tokens", chainId: 1, blockchain: "ethereum" },
    ]);
}
