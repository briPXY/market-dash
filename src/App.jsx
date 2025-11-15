
import './App.css';
import { Section } from './Layout/Layout'
import { PriceUpdater } from './market/PriceUpdater';
import Market from './market/Market';
import { TopBar } from './generic_components/TopBar';
import "./idb/init.js";
import { usePoolStore, useSourceStore } from './stores/stores';
import { useEffect } from 'react';
import { isSavedStateExist, loadState } from './idb/stateDB';
import { initPoolsInfo } from './idb/init.js';

// eslint-disable-next-line no-unused-vars
function BadComponentTest() {
    throw new Error("React crash test");
}

function App() {
    const { setSrc, setSaved } = useSourceStore();
    const { setAddress } = usePoolStore();

    async function handleNetworkChange(selectedNetwork) {
        const poolAddress = await initPoolsInfo(selectedNetwork);

        if (poolAddress) {
            setSrc(selectedNetwork);
            setAddress(poolAddress);
        }
    }

    useEffect(() => {
        async function init() {
            const savedNetworkExist = await isSavedStateExist(`savedNetwork`);
            if (savedNetworkExist) {
                const savedNetwork = await loadState("savedNetwork");
                const poolAddress = await initPoolsInfo(savedNetwork);
                setSrc(savedNetwork);
                setAddress(poolAddress);
            }
            else {
                setSaved(false);
            }
        }
        init();
    }, [setAddress, setSaved, setSrc])

    return (
        <>
            {/* <BadComponentTest /> */}
            <PriceUpdater type="trade" />  {/* ✅ Updates trade price */}
            <PriceUpdater type="index" />  {/* ✅ Updates index price */}
            <Section className="overflow-visible w-full mb-1">
                <TopBar handleNetworkChange={handleNetworkChange} />
            </Section>
            <Section className="overflow-visible w-full">
                <Market handleNetworkChange={handleNetworkChange} />
            </Section>
            <Section ></Section>
        </>
    )
}

export default App
