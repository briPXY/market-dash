
import './App.css';
import { Section } from './Layout/Layout'
import { PriceUpdater } from './market/PriceUpdater';
import Market from './market/Market';
import { TopBar } from './generic_components/TopBar';
import "./idb/init.js";
import { useEffect } from 'react';
import { isSavedStateExist, loadState } from './idb/stateDB';
import { useSourceStore } from './stores/stores';

function App() {
	const setSrc = useSourceStore(state => state.setSrc);

	useEffect(() => {
		async function init() {
			const savedNetworkExist = await isSavedStateExist("savedNetwork");

			if (savedNetworkExist) {
				const savedNetwork = await loadState("savedNetwork");
				setSrc(savedNetwork);
			}
		}
		init();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return (
		<>
			<PriceUpdater type="trade" />  {/* ✅ Updates trade price */}
			<PriceUpdater type="index" />  {/* ✅ Updates index price */}
			<Section className="overflow-visible w-full">
				<TopBar />
			</Section>
			<Section className="overflow-visible w-full">
				<Market />
			</Section>
			<Section ></Section>
		</>
	)
}

export default App
