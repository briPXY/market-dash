import { openDB } from 'idb';

const RECENT_CACHE_KEY = "token-search:recent";
const RECENT_CACHE_LIMIT = 8; // how many recent queries to store

export async function importTokenLists(sources = [{ url: null, list: null, chainId: null, blockchain: null }]) {
    let failures = 0;

    const primaryKey = "address";        // must be uniform across sources
    const secondaryKey = "chainId";      // this is the one we dummy-fill if missing

    // 1. DONE signature check
    if (localStorage.getItem("token-list:done") === "true") {
        console.log("Token list already imported. Skipping...");
        return false;
    }

    // 2. Open DB with composite keyPath
    const db = await openDB("token-list", 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains("tokens")) {
                const store = db.createObjectStore("tokens", {
                    keyPath: ["address", "chainId"], // dynamic composite key
                });

                store.createIndex("symbol_lower", "symbol_lower");
                store.createIndex("name_lower", "name_lower");
                store.createIndex("blockchain", "blockchain");
                store.createIndex(primaryKey, primaryKey);
                store.createIndex("compatible_exchange", "compatible_exchange");
            }
        }
    });

    // 3. Import each source
    for (const source of sources) {
        let json;

        const compatible_exchange = source.compatibleExchange ? source.compatibleExchange : "";

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

            // ensure chainId key exists, or create dummy
            if (!(secondaryKey in token) || !token[secondaryKey]) {
                token[secondaryKey] = source.chainId ?? "null";
            }

            token.symbol_lower = token.symbol?.toLowerCase?.() ?? "";
            token.name_lower = token.name?.toLowerCase?.() ?? "";
            // obligatory chain field 
            token.compatible_exchange = compatible_exchange;
            token.blockchain = source.blockchain ?? "null";


            await store.put(token);
        }

        await tx.done;
    }

    // 4. DONE signature
    if (failures < sources.length) {
        localStorage.setItem("token-list:done", "true");
        console.log("Token import completed successfully.");
    }

    return true;
} // v2

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

        const sym = token.symbol_lower ?? "";
        const nam = token.name_lower ?? "";

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
        const idx = tx.store.index("symbol_lower");
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
        const idx = tx.store.index("name_lower");
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

        const sym = token.symbol_lower ?? "";
        const nam = token.name_lower ?? "";

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

