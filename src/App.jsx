
import './App.css';
import { Section } from './Layout/Layout'
import { PriceUpdater } from './market/PriceUpdater';
import Market from './market/Market';
import { TopBar } from './generic_components/TopBar';

function App() {

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
