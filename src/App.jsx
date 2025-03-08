
import './App.css';
import { Section } from './Layout/Layout'
import { PriceUpdater } from './stores/PriceUpdater';
import Market from './market/Market';

function App() {

  return (
    <>
      <PriceUpdater symbol="ETH" type="trade" />  {/* ✅ Updates trade price */}
      <PriceUpdater symbol="ETH" type="index" />  {/* ✅ Updates index price */}
      <Section className="overflow-visible">
        <Market />
      </Section>
      <Section ></Section>
    </>
  )
}

export default App
