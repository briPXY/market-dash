import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { ModalOverlay } from "../generic_components/ModalOverlay";
import { useModalVisibilityStore, useWalletStore } from "../stores/stores";
import LineTextLine from "../generic_components/LineTextLine";
import { WalletIcon } from "@web3icons/react";
import { walletLogin } from "./walletLogin";

//Hash-map of provider flags to friendly names
const walletObjects = {
    isMetaMask: { name: "MetaMask", id: "metamask" },
    isCoinbaseWallet: { name: "Coinbase Wallet", id: "coinbase" },
    isBraveWallet: { name: "Brave Wallet", id: "brave" }, // Corrected ID is 'brave'
    isFrame: { name: "Frame Wallet", id: "frame" },
    isRabby: { name: "Rabby Wallet", id: "rabby" },
    isTrust: { name: "Trust Wallet", id: "trust" }, // Used 'trust-wallet' for consistency
    isTrustWallet: { name: "Trust Wallet", id: "trust" },
    isOKXWallet: { name: "OKX Wallet", id: "okx" }, // Corrected ID is 'okx'
    isPhantom: { name: "Phantom (EVM mode)", id: "phantom" },
};

export default function WalletList() {
    const visibility = useModalVisibilityStore(state => state.wallet);
    const { setModalVisibility } = useModalVisibilityStore();
    const [wallets, setWallets] = useState([]);
    const [hasProvider, setHasProvider] = useState(false);
    const walletAddress = useWalletStore(state => state.address)

    const handleLogin = async () => {
        const { address, signature } = await walletLogin();

        if (address && signature) {
            useWalletStore.getState().setWalletInfo({ address, signature, message: "" });
        }
    };

    useEffect(() => {
        const detectWallets = async () => {
            if (!window?.ethereum) return;

            setHasProvider(true);

            // Provider list (multi-provider or fallback)
            const providers = window.ethereum.providers
                ? window.ethereum.providers
                : [window.ethereum];

            const detected = [];

            for (const provider of providers) {
                // Wrap with ethers.js
                // eslint-disable-next-line no-unused-vars
                const ethersProvider = new ethers.BrowserProvider(provider);

                // 🔍 Find first matching flag
                const found = Object.keys(walletObjects).find(
                    flag => provider[flag] === true
                );

                if (found) {
                    detected.push(walletObjects[found]);
                } else {
                    detected.push("EIP-1193 Wallet");
                }
            }

            setWallets([...new Set(detected)]);
        };

        detectWallets();
    }, []);

    return (
        <ModalOverlay isOpen={visibility} closeFn={() => setModalVisibility("wallet", false)}>
            <div className="shadow-lg shadow-black/40 bg-primary-900 rounded-lg w-80 p-5 text-white border-1 border-washed-dim">
                {!walletAddress && <div>Connect a wallet</div>}
                {walletAddress && <div className="text-accent">Wallet login success!</div>}
                <div className="h-4"></div>
                <LineTextLine>Installed Wallets</LineTextLine>

                {!hasProvider && <p>No Ethereum wallet detected.</p>}

                {wallets.length > 0 && (
                    <ul className="mt-2 space-y-1">
                        {wallets.map((e) => (
                            <li
                                onClick={handleLogin}
                                key={e.name}
                                className="text-sm flex gap-3 justify-start items-center bg-primary-500 hover:bg-primary-100 p-3 rounded-md cursor-pointer">
                                <WalletIcon id={e.id} className="rounded-md" variant="background" size="40"></WalletIcon>
                                <div>{e.name}</div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </ModalOverlay>
    );
}
