import { useWalletStore } from "../stores/stores";
import { walletLogin } from "./walletLogin";

export const WalletLogin = ({ setLogState, className = "bg-secondary p-3 rounded-md text-accent font-semibold", text = "Connect Wallet" }) => {
    const handleLogin = async () => {
        const { address, signature } = await walletLogin(setLogState);

        if (address && signature) {
            useWalletStore.getState().setWalletInfo({ address, signature, message: "" });
        }

        setLogState(null); // Login process done (reset UI)
    };

    return (
        <button onClick={handleLogin} className={className}>{text}</button>
    );
}