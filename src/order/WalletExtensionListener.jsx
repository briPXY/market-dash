import { useEffect } from "react";
import { BLOCKCHAINS_INFO } from "../constants/constants";
import { useWalletStore } from "../stores/stores";
import { localStorageDeleteDottedKeyAll } from "../utils/utils";

export default function WalletExtensionListener({ onWalletEvent }) {
    const deleteWalletValues = useWalletStore(state => state.deleteWalletValues);
    const setWalletInfo = useWalletStore(state => state.setWalletInfo);

    useEffect(() => {
        if (!window.ethereum) return;

        const providerObj = window.ethereum;

        // Detect connector (same as login function)
        // const detectConnector = () => {
        //     const flags = {
        //         isMetaMask: "metamask",
        //         isRabby: "rabby",
        //         isBraveWallet: "brave",
        //         isCoinbaseWallet: "coinbase",
        //         isTrustWallet: "trust",
        //         isTrust: "trust",
        //         isOKXWallet: "okx",
        //         isPhantom: "phantom",
        //         isFrame: "frame"
        //     };
        //     for (const key in flags) {
        //         if (providerObj[key]) return flags[key];
        //     }
        //     return "unknown";
        // };

        /** EVENT HANDLERS **/

        const handleAccountsChanged = async () => {
            const accounts = await providerObj.request({ method: "eth_accounts" });
            const account = accounts?.[0] ?? null;

            if (!account) {
                // User disconnected wallet
                localStorage.removeItem("wallet.address");
                localStorage.removeItem("wallet.approvedAccounts");
                localStorage.setItem("wallet.isConnected", "false");
                deleteWalletValues("address", "approvedAccounts", "isConnected")
                return;
            }

            localStorage.setItem("wallet.address", account);
            localStorage.setItem("wallet.approvedAccounts", account); // single string 
            localStorage.setItem("wallet.loginTime", Date.now());
            setWalletInfo({ approvedAccounts: account, address: account, "loginTime": Date.now() });

            // IMPORTANT: new account = old signature invalid
            localStorage.removeItem("wallet.signature");
            localStorage.removeItem("wallet.message");
            deleteWalletValues("message", "signature");

        };

        const handleChainChanged = async () => {
            const chainId = await providerObj.request({ method: "eth_chainId" });
            localStorage.setItem("wallet.chainId", chainId);
            localStorage.setItem("wallet.networkName", BLOCKCHAINS_INFO[chainId]?.name ?? "Unknown");
            localStorage.setItem("wallet.loginTime", Date.now());

            // **IMPORTANT** - EIP recommends reload on chain change 
        };

        const handleDisconnect = async () => {
            localStorageDeleteDottedKeyAll("wallet");
            useWalletStore.getState().logoutWallet();
            console.warn("Wallet disconnected");
        };

        /** SUBSCRIBE **/
        providerObj.on("accountsChanged", handleAccountsChanged);
        providerObj.on("chainChanged", handleChainChanged);
        providerObj.on("disconnect", handleDisconnect);
        providerObj.on("connect", async () => {
            console.log("connected");
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
