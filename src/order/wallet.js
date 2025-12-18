import { BrowserProvider } from "ethers";
import { BLOCKCHAINS_INFO } from "../constants/constants";

export async function extensionWalletLogin(setState = () => { }, onSuccess = () => { }) {
    try {
        if (!window.ethereum) {
            setState("No Ethereum wallet detected. Please install MetaMask or a similar wallet extension.");
            return null;
        }

        // Detect wallet brand (MetaMask / Rabby / OKX etc.)
        const providerObj = window.ethereum;
        let connector = "unknown";

        const flags = {
            isMetaMask: "metamask",
            isRabby: "rabby",
            isBraveWallet: "brave",
            isCoinbaseWallet: "coinbase",
            isTrustWallet: "trust",
            isTrust: "trust",
            isOKXWallet: "okx",
            isPhantom: "phantom",
            isFrame: "frame"
        };

        for (const flag in flags) {
            if (providerObj[flag]) {
                connector = flags[flag];
                break;
            }
        }

        // Normal injected provider
        const provider = new BrowserProvider(window.ethereum);

        setState("Requesting wallet accounts...");
        const accounts = await provider.send("eth_requestAccounts", []);

        if (!accounts || accounts.length === 0) {
            setState("Connection Rejected", "You need to connect an wallet to log in.");
            return null;
        }

        const connectedAddress = accounts[0];
        setState("Wallet" + connector + " connected. Address:\n" + connectedAddress);

        const chainId = await provider.send("eth_chainId", []);

        // Sign message
        const signer = await provider.getSigner(connectedAddress);
        const messageToSign =
            `You're about to sign in to Pola. This is a web demo version of the app. Your address is ${connectedAddress}. This signature is important for encrypting sensitive user data on the local disk.`;

        let signature = null;
        try {
            setState("Requesting signature for authentication message...");
            signature = await signer.signMessage(messageToSign);
            setState("Message signed.");
        } catch {
            setState("Signature Required", "Signing is required for authentication.");
            return null;
        }

        onSuccess();

        // **Fast return object — NO onchain fetch**
        return {
            address: connectedAddress,
            signature,
            message: messageToSign,
            chainId,
            provider: "injected",
            connector,
            loginTime: Date.now(),
            approvedAccounts: accounts,
            networkName: BLOCKCHAINS_INFO[chainId].name,
            blockchain: "Ethereum",
            isConnected: true,
        };

    } catch (error) {
        setState("Wallet login failed");
        console.error("Login Failed:", error);
        return null;
    }
}

export async function tryReconnectWallet(savedWalletLogin) {
    if (!savedWalletLogin) return;

    const { blockchain, provider, address } = savedWalletLogin;

    // No blockchain info = nothing to reconnect
    if (!blockchain || !provider || !address) return;

    // EVM WALLETS (MetaMask / Rabby / Coinbase / Brave / OKX / Injected) 
    if (blockchain === "Ethereum" && window.ethereum) {
        try {
            const accounts = await window.ethereum.request({ method: "eth_accounts" });
            // If address still exists → silently reconnect (no popup)
            if (accounts && accounts.length > 0) {
                // Nothing else to do. The wallet is now reconnected.
                return true;
            }
        } catch {/* ignore */ }
        return false;
    }

    // BITCOIN (Unisat / Xverse / OKX Bitcoin mode) 
    if (blockchain === "Bitcoin" && (window.unisat || window.xverse)) {
        try {
            const api = window.unisat ?? window.xverse;
            const addrs = (await api.getAccounts?.()) ?? [];
            if (addrs && addrs.length > 0) {
                return true; // reconnected
            }
        } catch {/* ignore */ }
        return false;
    }

    //  SOLANA (Phantom / Solflare) 
    if (blockchain === "Solana" && window.solana?.isPhantom) {
        try {
            const resp = await window.solana.connect({ onlyIfTrusted: true });

            if (resp?.publicKey) {
                return true; // reconnected
            }
        } catch {/* ignore */ }
        return false;
    }

    // ---------------------------------------
    //  TODO: Other chains can be added here
    // ---------------------------------------

    // No supported wallet matches → nothing to reconnect
    return false;
}
