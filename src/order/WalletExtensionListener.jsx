import { useEffect } from "react";
import { BLOCKCHAINS_INFO } from "../constants/constants";
import { useWalletStore } from "../stores/stores";

export default function WalletExtensionListener({ onWalletEvent }) {
    const deleteWalletValues = useWalletStore(state => state.deleteWalletValues);
    const setWalletInfo = useWalletStore(state => state.setWalletInfo);

    useEffect(() => {
        if (!window.ethereum) return;

        const providerObj = window.ethereum;

        // Detect connector (same as login function)
        const detectConnector = () => {
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
            for (const key in flags) {
                if (providerObj[key]) return flags[key];
            }
            return "unknown";
        };

        const buildWalletState = async () => {
            try {
                const accounts = await providerObj.request({ method: "eth_accounts" });
                const chainId = await providerObj.request({ method: "eth_chainId" });

                const isConnected = accounts && accounts.length > 0;
                const address = isConnected ? accounts[0] : null;
                const connector = detectConnector();

                return {
                    address,
                    signature: null,           // signatures are handled only on login
                    message: null,
                    chainId,
                    provider: "injected",
                    connector,
                    loginTime: Date.now(),
                    approvedAccounts: accounts ?? [],
                    networkName: BLOCKCHAINS_INFO[chainId]?.name ?? "Unknown",
                    blockchain: "Ethereum",
                    isConnected,
                };
            } catch {
                return {
                    address: null,
                    signature: null,
                    message: null,
                    chainId: null,
                    provider: "injected",
                    connector: detectConnector(),
                    loginTime: Date.now(),
                    approvedAccounts: [],
                    networkName: "Unknown",
                    blockchain: "Ethereum",
                    isConnected: false,
                };
            }
        };

        /** EVENT HANDLERS **/

        const handleAccountsChanged = async () => {
            const accounts = await providerObj.request({ method: "eth_accounts" });
            const account = accounts?.[0] ?? null;

            if (!account) {
                // User disconnected wallet
                localStorage.removeItem("wallet.address");
                localStorage.removeItem("wallet.approvedAccounts");
                localStorage.setItem("wallet.isConnected", "false"); 
                deleteWalletValues("address","approvedAccounts","isConnected")
                return;
            }

            localStorage.setItem("wallet.address", account);
            localStorage.setItem("wallet.approvedAccounts", account); // single string 
            localStorage.setItem("wallet.loginTime", Date.now()); 
            setWalletInfo({approvedAccounts: account, address: account, "loginTime": Date.now()});

            // IMPORTANT: new account = old signature invalid
            localStorage.removeItem("wallet.signature");
            localStorage.removeItem("wallet.message"); 
            deleteWalletValues("message","signature");
            
        };

        const handleChainChanged = async () => {
            const chainId = await providerObj.request({ method: "eth_chainId" });
            localStorage.setItem("wallet.chainId", chainId);
            localStorage.setItem("wallet.networkName", BLOCKCHAINS_INFO[chainId]?.name ?? "Unknown");
            localStorage.setItem("wallet.loginTime", Date.now());

            // **IMPORTANT** - EIP recommends reload on chain change
            window.location.reload();
        };

        const handleDisconnect = async () => {
            const state = await buildWalletState();
            onWalletEvent({ type: "disconnect", ...state });
        };

        /** SUBSCRIBE **/
        providerObj.on("accountsChanged", handleAccountsChanged);
        providerObj.on("chainChanged", handleChainChanged);
        providerObj.on("disconnect", handleDisconnect);
        providerObj.on("connect", async () => {
            const state = await buildWalletState();
            onWalletEvent({ type: "connect", ...state });
        });

        /** CLEANUP ON UNMOUNT **/
        return () => {
            providerObj.removeListener("accountsChanged", handleAccountsChanged);
            providerObj.removeListener("chainChanged", handleChainChanged);
            providerObj.removeListener("disconnect", handleDisconnect);
            providerObj.removeAllListeners?.("connect");
        };

    }, [deleteWalletValues, onWalletEvent, setWalletInfo]);

    return null; // component renders nothing
}
