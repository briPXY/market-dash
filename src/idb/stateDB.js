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
        console.log(`State saved for ID: ${id}`);
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
