
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

function App() {
	const { setSrc } = useSourceStore();
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
			const savedNetworkExist = isSavedStateExist(`savedNetwork`);
			if (savedNetworkExist) {
				const savedNetwork = await loadState("savedNetwork");
				const poolAddress = await initPoolsInfo(savedNetwork);
				setSrc(savedNetwork);
				setAddress(poolAddress);
			}
		}
		init();
	}, [setAddress, setSrc])

	return (
		<>
			<PriceUpdater type="trade" />  {/* ✅ Updates trade price */}
			<PriceUpdater type="index" />  {/* ✅ Updates index price */}
			<Section className="overflow-visible w-full">
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
