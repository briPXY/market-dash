import { useEffect, useState } from "react";
import usePriceStore, { useWalletStore } from "../stores/stores";
import { TokenIcon } from "@web3icons/react";
import { svg } from "../Layout/svg";
import { WalletLogin } from "./Login";
import FiatValue from "./FiatValue";


function removeNonNumeric(rawValue) {
    let cleaned = rawValue
        .replace(/[^0-9.]/g, '')          // allow only digits and dot
        .replace(/^\.+/, '')              // remove leading dots
        .replace(/\.{2,}/g, '.');         // replace multiple dots with single dot

    // Ensure only one decimal separator
    const parts = cleaned.split('.');
    if (parts.length > 2) {
        cleaned = parts[0] + '.' + parts.slice(1).join('');
    }

    // Remove leading zeros unless directly before decimal point
    cleaned = cleaned.replace(/^0+(?=\d)/, '');

    return cleaned;
}


function Swap({ symbolIn, symbolOut, poolAddress, network, isDEX}) {
    const [sellAmount, setSellAmount] = useState('');
    const [buyAmount, setBuyAmount] = useState(0);
    const [currentSymbolIn, setCurrentSymbolIn] = useState(symbolIn);
    const [currentSymbolOut, setCurrentSymbolOut] = useState(symbolOut);
    const [reversed, setReversed] = useState(false);
    const [loginState, setloginState] = useState(null); // For displaying login process status text only
    const currentRate = usePriceStore((state) => state.trade);
    const address = useWalletStore(state => state.address); // Real logged-in/off state

    const handleChangeSymbols = (symIn, symOut, sell, buy, reverse = false) => {
        setCurrentSymbolIn(symIn);
        setCurrentSymbolOut(symOut);
        setSellAmount(sell);
        setBuyAmount(buy);
        reverse ? setReversed(!reversed) : null;
    };

    const handleSellChange = (value) => {
        let cleaned = removeNonNumeric(value);
        const numeric = parseFloat(cleaned.replace(',', '.'));
        setSellAmount(cleaned);
        if (!isNaN(numeric)) {
            const amount = reversed ? numeric / currentRate : numeric * currentRate;
            setBuyAmount(amount.toFixed(4));
        } else {
            setBuyAmount(0); // fallback
        }
    };

    const handleBuyChange = (value) => {
         let cleaned = removeNonNumeric(value);
        const numeric = parseFloat(cleaned.replace(',', '.'));
        setBuyAmount(cleaned);
        if (!isNaN(numeric)) {
            const amount = reversed ? numeric * currentRate : numeric / currentRate;
            setSellAmount(amount.toFixed(4));
        } else {
            setSellAmount(0); // fallback
        }
    };

    useEffect(() => { // Reset form when pool address changed
        setCurrentSymbolIn(symbolIn);
        setCurrentSymbolOut(symbolOut);
        setSellAmount(0);
        setBuyAmount(0);
    }, [symbolIn, symbolOut])

    if (!isDEX) return null;

    return (
        <div className="flex flex-col gap-2 bg-primary p-4 rounded-md w-full h-full relative">
            <div className="flex flex-col items-start gap-2 rounded-lg p-4 border-washed hover:border-active">
                <div>Sell</div>
                <div className="flex items-center justify-between">
                    <input
                        type="text"
                        inputMode="decimal"
                        pattern="[0-9]*[.,]?[0-9]*"
                        value={sellAmount}
                        onChange={(e) => handleSellChange(e.target.value)}
                        className="px-0 py-2 focus-within:outline-2 rounded-md text-white w-full text-2xl"
                    />
                    <TokenIcon symbol={currentSymbolIn?.toLowerCase()} size={32} color="#fff" variant="branded" />
                    <span className="ml-2 text-white font-semibold">{currentSymbolIn}</span>
                </div>
                <FiatValue symbol={currentSymbolIn} value={sellAmount} />
            </div>

            <button
                onClick={() => handleChangeSymbols(currentSymbolOut, currentSymbolIn, buyAmount, sellAmount, true)}
                className="flex items-center justify-center bg-secondary p-2 rounded-md text-white"
            >
                <svg.Swap />
            </button>

            <div className="flex flex-col items-start gap-2 rounded-lg p-4 border-washed hover:border-active">
                <div>Buy</div>
                <div className="flex items-center justify-between">
                    <input
                        type="text"
                        inputMode="decimal"
                        pattern="[0-9]*[.,]?[0-9]*"
                        value={buyAmount}
                        onChange={(e) => handleBuyChange((e.target.value))}
                        className="px-0 py-2 focus-within:outline-2 rounded-md text-white w-full text-2xl"
                    />
                    <TokenIcon symbol={currentSymbolOut?.toLowerCase()} size={32} color="#fff" variant="branded" />
                    <span className="ml-2 text-white font-semibold">{currentSymbolOut}</span>
                </div>
                <FiatValue symbol={currentSymbolOut} value={buyAmount} />
            </div>

            {!address && <WalletLogin setLogState={setloginState} />}
            {address && <button className="bg-accent p-3 rounded-md text-primary font-semibold">Swap</button>}

            <button
                onClick={() => window.open(`${network.poolURL}${poolAddress}`, "_blank")}
                className="bg-transparent p-3 rounded-md border-washed text-washed font-semibold"
            >Swap on Uniswap
            </button>

            {loginState &&
                <div className="h-full w-full bg-transparent-blur absolute left-0 top-0">
                    <div className="mx-auto max-w-[80%] p-4 bg-primary rounded-md border-washed text-sm">{loginState}</div>
                </div>
            }
        </div>
    );
}

export default Swap;
