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

