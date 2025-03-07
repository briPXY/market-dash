
import './App.css';
import Chart from './market/Chart'; 
import { Section} from './Layout/Layout'

function App() {

  return (
    <>
      <Section className="overflow-visible">
        <Chart symbol="ETH" range="1h"/>
      </Section>
      <Section ></Section>
    </>
  )
}

export default App
