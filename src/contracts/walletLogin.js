import { BrowserProvider } from "ethers";

export async function walletLogin(setState = () => { null }) {
    try {
        if (!window.ethereum) {
            setState("❌ No Ethereum wallet detected. Please install MetaMask or a similar wallet extension.");
            return null;
        }

        // Use BrowserProvider in ethers v6
        const provider = new BrowserProvider(window.ethereum);
        
        setState("🚀 Requesting wallet accounts...");
        const accounts = await provider.send("eth_requestAccounts", []);

        if (!accounts || accounts.length === 0) {
            console.warn("⚠️ No accounts connected. User might have rejected the connection.");
            setState("Connection Rejected", "You need to connect an account to log in.");
            return null;
        }

        const connectedAddress = accounts[0];
        setState("✅ Wallet connected. Address:\n" + connectedAddress);

        // getSigner() now requires passing the account address
        const signer = await provider.getSigner(connectedAddress);

        const messageToSign = `You're about to sign in on market-dash app.\n\nWARNING: This is a developer demo app, risk from inconsistent data might occurs. Check established dApp like Uniswap for accurate gas, rates and real time prices\n\nAddress: ${connectedAddress}\nTimestamp: ${Date.now()}`;

        let signature = null;
        try {
            setState("✍️ Requesting signature for authentication message...");
            signature = await signer.signMessage(messageToSign);
            setState("✅ Message signed. Signature:\n" + signature);
        } catch (signError) {
            console.warn("⚠️ Message signing rejected or failed:", signError.message);
            setState("Signature Required", "Signing the message is required for full authentication. You can still use the DApp, but some features might be limited.");
        }

        return {
            address: connectedAddress,
            signature: signature
        };

    } catch (error) {
        setState("❌ Wallet login failed:\n" + error);

        let errorMessage = "An unknown error occurred during wallet login.";
        if (error.code === 4001) { // User rejected request
            errorMessage = "Wallet connection rejected by the user.";
        } else if (error.message) {
            errorMessage = error.message;
        }
        await new Promise(resolve => setTimeout(resolve, 2500));
        console.error("Login Failed: " + errorMessage);
        return null;
    }
}
