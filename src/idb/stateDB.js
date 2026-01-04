import { openDB } from 'idb';

// Initialize the IndexedDB database
const dbPromise = openDB('dex-market-database', 1, {
    upgrade(db) {
        if (!db.objectStoreNames.contains('stateStore')) {
            db.createObjectStore('stateStore', { keyPath: 'id' });
        }
    },
});

// Save state as a string
export async function saveState(id, state) {
    try {
        const db = await dbPromise;
        await db.put('stateStore', { id, value: JSON.stringify(state) });
    } catch (error) {
        console.error("Failed to save state:", error);
    }
}

// Load state and parse it back
export async function loadState(id) {
    const db = await dbPromise;
    const data = await db.get('stateStore', id);
    return data && data.value ? JSON.parse(data.value) : null;
}

// Delete stored state
export async function deleteState(id) {
    const db = await dbPromise;
    await db.delete('stateStore', id);
}

export async function isSavedStateExist(id) {
    const db = await dbPromise;
    const data = await db.get('stateStore', id);
    return data != undefined; // Returns `true` if the ID exist
}

// Timed DB 
export async function saveStateTimed(id, state, ttlSeconds = 300) {
    try {
        const db = await dbPromise;
        const expiresAt = Date.now() + ttlSeconds * 1000;
        await db.put('stateStore', {
            id,
            value: JSON.stringify(state),
            expiresAt
        });
    } catch (error) {
        console.error("Failed to save state:", error);
    }
}

export async function loadStateTimed(id) {
    try {
        const db = await dbPromise;
        const record = await db.get('stateStore', id);
        if (!record) return null;

        if (record.expiresAt && Date.now() > record.expiresAt) {
            // Optionally delete the expired record
            await db.delete('stateStore', id);
            return null; // expired
        }

        return JSON.parse(record.value);
    } catch (error) {
        console.error("Failed to load state:", error);
        return null;
    }
}

// Prop/value updater for JSON db value for all db stores
export async function dbUpdateProperty(dbName = "", storeName = "", key, path = [], newValue) {
    try {
        const db = await openDB(dbName, 1);
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);

        const data = await store.get(key);

        if (!data) {
            throw new Error(`Entry with key ${key} not found`);
        }
        // drill into the object using the path array
        let current = data;
        for (let i = 0; i < path.length - 1; i++) {
            const segment = path[i];
            if (!(segment in current)) {
                current[segment] = {};
            }
            current = current[segment];
        }

        const finalSegment = path[path.length - 1];
        current[finalSegment] = newValue;

        await store.put(data);
        await tx.done;

        return true;
    } catch (e) {
        e; return false; // silent
    }
}

// Tanstack query presister
const queryPersistDB = openDB('query_cache', 2, { // Bumped to version 2
    upgrade(db) {
        let priceStore;
        if (!db.objectStoreNames.contains('price_query_cache')) {
            priceStore = db.createObjectStore('price_query_cache');
        } else {
            priceStore = db.transaction.objectStore('price_query_cache');
        }

        if (!priceStore.indexNames.contains('by_expiry')) {
            priceStore.createIndex('by_expiry', 'expiresAt');
        }

        let pairStore;
        if (!db.objectStoreNames.contains('pair_validation_cache')) {
            pairStore = db.createObjectStore('pair_validation_cache');
        } else {
            pairStore = db.transaction.objectStore('pair_validation_cache');
        }

        if (!pairStore.indexNames.contains('by_expiry')) {
            pairStore.createIndex('by_expiry', 'expiresAt');
        }
    },
});

// const getqueryKey = (queryKey) => JSON.stringify(queryKey);

export const QueryCacheDB = {
    async setItem(store, queryKey, value, expiredMs = null) { // null = never expired
        try {
            const db = await queryPersistDB;
            const expiresAt = expiredMs ? Date.now() + expiredMs : null;
            await db.put(store, { value, expiresAt }, queryKey);
        } catch (error) {
            console.error('IDB Save Error:', error);
            // We don't throw; we let the app continue even if persistence fails
        }
    },

    async getItem(store, queryKey) {
        try {
            const db = await queryPersistDB;
            const result = await db.get(store, queryKey);
            if (!result) return null;

            if (result.expiresAt && Date.now() > result.expiresAt) {
                await db.delete(store, queryKey);
                return null;
            }

            return result.value; // Ensure null if undefined
        } catch (error) {
            console.error('IDB Get Error:', error);
            return null;
        }
    },

    // DELETE: Removes specific record
    async removeItem(store, queryKey) {
        try {
            const db = await queryPersistDB;
            await db.delete(store, queryKey);
        } catch (error) {
            console.error('IDB Delete Error:', error);
        }
    },

    async purgeExpired(store) {
        try {
            const db = await queryPersistDB;
            const tx = db.transaction(store, 'readwrite');
            const index = tx.store.index('by_expiry');
            
            // Find everything where expiresAt <= current timestamp
            const range = IDBKeyRange.upperBound(Date.now());
            let cursor = await index.openCursor(range);

            while (cursor) {
                await cursor.delete();
                cursor = await cursor.continue();
            }
            await tx.done;
            console.info(`Purged expired items from ${store}`);
        } catch (error) {
            console.error('Purge Error:', error);
        }
    }
};