import { ethers } from "ethers";

/**
 * Calls a read-only function on a smart contract using a custom RPC URL.
 * 
 * @param abi - The contract ABI.
 * @param contractAddress - The address of the deployed smart contract.
 * @param rpcUrl - RPC endpoint to use (e.g., Infura, Alchemy, or public RPC).
 * @param method - The name of the contract method to call.
 * @param params - Optional array of parameters to pass to the method.
 * @returns The result of the contract method call, or null if it fails.
 */
export async function contractCallRead({ abi, contractAddress, rpcUrl, method, params = [] }) {
    try {
        const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
        const contract = new ethers.Contract(contractAddress, abi, provider);

        if (!contract[method]) {
            throw new Error(`Method "${method}" not found in contract`);
        }

        const result = await contract[method](...params);
        return result;
    } catch (error) {
        console.error(`❌ Contract call failed: ${error.message}`);
        return null;
    }
}

/**
 * Sends a write (mutating) transaction to a contract method.
 * 
 * @param abi - Contract ABI
 * @param contractAddress - Deployed contract address
 * @param rpcUrl - RPC URL for network context
 * @param method - Contract method to call
 * @param params - Parameters to pass to the method
 * @returns Transaction receipt or null if failed
 */
export async function contractCallWrite({ abi, contractAddress, rpcUrl, method, params = [] }) {
    try {
        // Ensure wallet is connected
        if (!window.ethereum) throw new Error("No wallet (window.ethereum) found");

        // Setup provider & signer from wallet
        const browserProvider = new ethers.providers.Web3Provider(window.ethereum);
        await browserProvider.send("eth_requestAccounts", []); // Trigger wallet connect
        const signer = browserProvider.getSigner();

        // Optional: check wallet is on same network as rpcUrl
        const targetProvider = new ethers.providers.JsonRpcProvider(rpcUrl);
        const expectedChainId = (await targetProvider.getNetwork()).chainId;
        const walletChainId = (await browserProvider.getNetwork()).chainId;
        if (walletChainId !== expectedChainId) {
            throw new Error(`Wallet is on wrong network (expected chainId ${expectedChainId}, got ${walletChainId})`);
        }

        // Create contract with signer
        const contract = new ethers.Contract(contractAddress, abi, signer);

        if (!contract[method]) {
            throw new Error(`Method "${method}" not found in contract`);
        }

        // Call the method with parameters
        const tx = await contract[method](...params);
        console.log("📤 Transaction sent:", tx.hash);

        // Wait for confirmation
        const receipt = await tx.wait();
        console.log("✅ Transaction mined:", receipt.transactionHash);

        return receipt;
    } catch (error) {
        console.error(`❌ Contract write failed: ${error.message}`);
        return null;
    }
}
