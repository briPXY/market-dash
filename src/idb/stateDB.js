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
    return data ? JSON.parse(data.value) : null;
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
