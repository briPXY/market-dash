
import './App.css';
import { Section } from './Layout/Layout'
import Market from './market/Market';
import { TopBar } from './generic_components/TopBar';
import "./idb/init.js";
import { usePoolStore, useSourceStore, useWalletStore } from './stores/stores';
import { useEffect } from 'react';
import { isSavedStateExist, loadState } from './idb/stateDB';
import { localStorageDeleteDottedKeyAll, localStorageLoadDottedKeyAll } from './utils/utils';
import { tryReconnectWallet } from './order/wallet';
import WalletList from './order/WalletList';
import UserWalletSidebar from './order/UserWalletSidebar';
import WalletExtensionListener from './order/WalletExtensionListener';
import { installTokenLists } from './idb/tokenListDB';
import { installPairLists } from './idb/pairListDB';
import { UserSetting } from './generic_components/UserSetting';

// eslint-disable-next-line no-unused-vars
function BadComponentTest() {
    throw new Error("React crash test");
}

function App() {
    const { setSrc } = useSourceStore();
    const { setAddress } = usePoolStore();

    // Init handler
    useEffect(() => {
        async function init() {
            // Install token lists and pair lists from json into indexedDB, if not installed before
            await installTokenLists();
            await installPairLists();

            const savedNetworkExist = await isSavedStateExist(`savedSource`);

            if (savedNetworkExist) {
                const savedNetwork = await loadState("savedSource");
                setSrc(savedNetwork);
            }
            else {
                setSrc("binance");
            }

            // Load saved wallet login 
            const savedWalletLogin = localStorageLoadDottedKeyAll("wallet.address");
            const isConnected = await tryReconnectWallet(savedWalletLogin);

            if (isConnected) {
                localStorage.setItem('wallet.isConnected', isConnected);
                useWalletStore.getState().setWalletInfo(savedWalletLogin);
            }
            else {
                localStorageDeleteDottedKeyAll("wallet");
                useWalletStore.getState().logoutWallet();
            }
        }

        init();
    }, [setAddress, setSrc]);

    // App on-close handler
    useEffect(() => {
        const handleBeforeUnload = () => {
            // Browser wallet need connected again after app close
            localStorage.setItem('wallet.isConnected', 'false');
        }

        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload)
        }
    }, [])

    return (
        <>
            {/* <BadComponentTest /> */}
            <Section className="overflow-visible w-full mb-1">
                <TopBar />
            </Section>
            <Section className="overflow-visible w-full">
                <Market />
            </Section>
            <Section ></Section>

            {/* Modals */}
            <WalletList />
            <UserWalletSidebar />
            <UserSetting/>

            {/* Non pure components */}
            <WalletExtensionListener onWalletEvent={(info) => console.log(info)} />
        </>
    )
}

export default App
