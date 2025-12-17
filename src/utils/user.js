// --- Utility functions for saving/loading encrypted local user data  ---

import { ethers } from "ethers";
import { deleteState, isSavedStateExist, loadState, saveState } from "../idb/stateDB";
import { MissingAPIKeyError } from "../constants/environment";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function base64ToArrayBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}

// --- CORE CRYPTO FUNCTIONS ---  

async function deriveMasterKey(walletSignature, salt) {
    const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(walletSignature), { name: 'PBKDF2' }, false, ['deriveKey']);
    return crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt: salt, iterations: 100000, hash: 'SHA-256', },  // 100,000 iterations is a common minimum recommendation
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

async function encryptApiKey(key, plaintext) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv, }, key, encoder.encode(plaintext));
    return {
        encryptedData: arrayBufferToBase64(ciphertext),
        iv: arrayBufferToBase64(iv.buffer),
    };
}

async function decryptApiKey(key, encryptedData, iv) {
    const ciphertextBuffer = base64ToArrayBuffer(encryptedData);
    const ivBuffer = base64ToArrayBuffer(iv);
    const plaintextBuffer = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: new Uint8Array(ivBuffer), }, key, ciphertextBuffer);
    return decoder.decode(plaintextBuffer);
}

export function validateEtherWalletInfo(message, signature, walletAddress) {
    if (!message || !signature || !walletAddress) {
        throw new Error("Missing required parameters for validation.");
    }

    const recoveredAddress = ethers.verifyMessage(message, signature);
    const normalizedExpectedAddress = ethers.getAddress(walletAddress);
    if (recoveredAddress.toLowerCase() !== normalizedExpectedAddress.toLowerCase()) throw new Error("Wallet signature failed to validate");

    return true;
}

export async function encryptAndSaveUserSecret(keyName, apiKeyToStore, walletAddress, walletSignature, walletMessage) {
    try {
        validateEtherWalletInfo(walletMessage, walletSignature, walletAddress);

        const salt = encoder.encode(walletAddress);
        const saltBase64 = arrayBufferToBase64(salt.buffer);
        const masterKey = await deriveMasterKey(walletSignature, salt);
        const { encryptedData, iv } = await encryptApiKey(masterKey, apiKeyToStore);

        const storedObject = {
            salt: saltBase64,
            iv: iv,
            encryptedKey: encryptedData,
        };

        await saveState(`${keyName}_${walletAddress}`, storedObject);

        return "Your secret succesfully saved at local database";
    } catch (e) {
        console.error(e);
        throw new Error("Error during saving user secret");
    }
}

export async function decryptAndLoadUserSecret(keyName, walletAddress, walletSignature) {
    try {
        const isSecretExist = await isSavedStateExist(`${keyName}_${walletAddress}`);
        
        if (!isSecretExist) {
            throw new MissingAPIKeyError(`Saved ${keyName} from user ${walletAddress} is not available`);
        }

        const storedUserSecret = await loadState(`${keyName}_${walletAddress}`);
        const retrievedSalt = base64ToArrayBuffer(storedUserSecret.salt);
        const retrievedMasterKey = await deriveMasterKey(walletSignature, new Uint8Array(retrievedSalt));

        const decryptedSecret = await decryptApiKey(retrievedMasterKey, storedUserSecret.encryptedKey, storedUserSecret.iv);
        return decryptedSecret;
    } catch (e) {
        console.error(e);
        throw new MissingAPIKeyError("Error during loading user secret");
    }
}

export async function deleteUserSecret(keyName, walletAddress) {
    try {
        const isSecretExist = await isSavedStateExist(`${keyName}_${walletAddress}`);
        if (!isSecretExist) {
            throw new Error(`Saved ${keyName} from user ${walletAddress} is not available`);
        }
        deleteState(`${keyName}_${walletAddress}`);

    } catch (e) {
        console.error(e);
        throw new Error("Error during loading user secret");
    }
}