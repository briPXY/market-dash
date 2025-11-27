import { useModalVisibilityStore, useWalletStore } from "../stores/stores";
import { ModalOverlay } from "../generic_components/ModalOverlay";
import { localStorageDeleteDottedKeyAll, openLink } from "../utils/utils";
import { BlockyAvatar } from "../Layout/svg";
import { NetworkIcon } from "@web3icons/react";
import { BLOCKCHAINS_INFO } from "../constants/constants";

export default function UserWalletSidebar() {
    const visibility = useModalVisibilityStore(state => state.account);
    const { setModalVisibility } = useModalVisibilityStore();
    const walletAddress = useWalletStore(state => state.address);
    const chainId = useWalletStore(state => state.chainId);
    const blockchain = useWalletStore(state => state.blockchain);
    const isConnected = useWalletStore(state => state.isConnected);
    const addressText = walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(walletAddress.length - 5)}` : "Not logged-in";

    const logoutHandler = () => {
        localStorageDeleteDottedKeyAll("wallet");
        useWalletStore.getState().logoutWallet();
        setTimeout(() => setModalVisibility("account", false), 1000);
    };

    return (
        <ModalOverlay isOpen={visibility} closeFn={() => setModalVisibility("account", false)} alignItems="start" justifyContent="end">
            <div className="shadow-lg shadow-black/40 max-h-[90vh] overflow-hidden bg-primary-900 rounded-lg w-full md:w-90 px-3 py-6 text-white border border-washed-dim">
                <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-3 text-lg">
                        <BlockyAvatar address={walletAddress} size={36} className="rounded-full" />
                        <div>{addressText}</div>
                    </div>
                    <div className="flex items-center justify-center text-xs my-1.5">
                        <NetworkIcon name={blockchain} size={22} variant="mono" />
                        <div className="leading-1">{blockchain}</div>
                        {isConnected && <div className="box-content bg-accent rounded-full w-1 h-1 mx-1.5 border-3 border-primary-500/70"></div>}
                        {!isConnected && <div className="box-content bg-accent-negative rounded-full w-1 h-1 mx-1.5 border-3 border-primary-500/70"></div>}
                        <div className="leading-1">{BLOCKCHAINS_INFO[chainId]?.name}</div>
                    </div>
                    <div className="flex text-xs text-washed gap-1.5 w-full">
                        <button className="px-1.5 flex-1 bg-primary-100 py-0.5 rounded-sm" onClick={() => navigator.clipboard.writeText(walletAddress)}>Copy</button>
                        <button className="px-1.5 flex-1 bg-primary-100 py-0.5 rounded-sm" onClick={() => openLink(BLOCKCHAINS_INFO[chainId]?.url.replace("#", walletAddress))}>Explorer</button>
                    </div>
                    <button className="px-1.5 py-1 w-full text-accent-negative border border-accent-negative rounded-sm text-sm" onClick={logoutHandler}>Logout</button>
                </div>
            </div>
        </ModalOverlay>
    );
}