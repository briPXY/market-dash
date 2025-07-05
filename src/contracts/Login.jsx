import { useWalletStore } from "../stores/stores";
import { walletLogin } from "./walletLogin";

export const Login = ({ setLogState, className = "bg-secondary p-3 rounded-md text-accent font-semibold" }) => {
    const handleLogin = async () => {
        const { address, signature } = await walletLogin(setLogState);
        useWalletStore.getState().setWalletInfo({ address, signature, message: "" });
        setLogState(null); // Login process done (reset UI)
    };

    return (
        <button onClick={handleLogin} className={className}>Connect Wallet</button>
    );
}