import { useModalVisibilityStore, useWalletStore } from "../stores/stores";
import { ModalOverlay } from "../generic_components/ModalOverlay";
import { localStorageDeleteDottedKeyAll } from "../utils/utils";
import { BlockyAvatar } from "../Layout/svg";
import { NetworkIcon } from "@web3icons/react";

export default function UserWalletSidebar() {
    const visibility = useModalVisibilityStore(state => state.account);
    const { setModalVisibility } = useModalVisibilityStore();
    const walletAddress = useWalletStore(state => state.address);
    const networkName = useWalletStore(state => state.networkName);
    const blockchain = useWalletStore(state => state.blockchain);
    const isConnected = useWalletStore(state => state.isConnected);
    const addressText = walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(walletAddress.length - 5)}` : "Not logged-in";

    const logoutHandler = () => {
        localStorageDeleteDottedKeyAll("wallet");
        useWalletStore.getState().logoutWallet();
        setTimeout(() => setModalVisibility("account", false), 1000);
    };

    return (
        <ModalOverlay isOpen={visibility} closeFn={() => setModalVisibility("account", false)} alignItems="start" justifyContent="right">
            <div className="shadow-lg shadow-black/40 max-h-[90vh] overflow-hidden bg-primary-900 rounded-lg w-90 px-3 py-6 text-white border border-washed-dim">
                <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center gap-3 text-lg">
                        <BlockyAvatar address={walletAddress} size={38} className="rounded-full" />
                        <div>{addressText}</div>
                    </div>
                    <div className="flex items-center justify-center text-xs">
                        <NetworkIcon name={blockchain} size={22} variant="mono" />
                        <div className="leading-1">{blockchain}</div>
                        {isConnected && <div className="box-content bg-accent rounded-full w-1 h-1 mx-1.5 border-3 border-primary-500/70"></div>}
                        {!isConnected && <div className="box-content bg-accent-negative rounded-full w-1 h-1 mx-1.5 border-3 border-primary-500/70"></div>}
                        <div className="leading-1">{networkName}</div>
                    </div>
                    <div className="flex text-sm gap-1.5">
                        <button className="px-1.5 pb-0.5 text-washed bg-primary-500 border border-washed-dim rounded-sm">copy</button>
                        <button className="px-1.5 pb-0.5 text-washed bg-primary-500 border border-washed-dim rounded-sm">explorer</button>
                        <button className="px-1.5 pb-0.5 text-accent-negative bg-primary-500 border border-accent-negative rounded-sm" onClick={logoutHandler}>logout</button>
                    </div>
                </div>
            </div>
        </ModalOverlay>
    );
}