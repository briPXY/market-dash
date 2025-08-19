import { useEffect, useState } from "react";
import usePriceStore, { useWalletStore } from "../stores/stores";
import { TokenIcon } from "@web3icons/react";
import { SwapIcon } from "../Layout/svg";
import { WalletLogin } from "./Login";
import FiatValue from "./FiatValue";
import { formatPrice, stdSymbol } from "../utils/utils";
import { SwapTokenInfo } from "./components/SwapTokenInfo";
import { swapDecimalRule } from "../constants/constants";
import { SvgMemo } from "../Layout/Layout";


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


function Swap({ token0, token1, poolAddress, network, isDEX }) {
    const [sellAmount, setSellAmount] = useState('');
    const [buyAmount, setBuyAmount] = useState(0);
    const [currentTokenIn, setcurrentTokenIn] = useState(token1);
    const [currentTokenOut, setcurrentTokenOut] = useState(token0);
    const [reversed, setReversed] = useState(false);
    const [loginState, setloginState] = useState(null); // For displaying login process status text only
    const currentRate = usePriceStore((state) => state.trade);
    const accountAddress = useWalletStore(state => state.address); // Real logged-in/off state

    const handleChangeSymbols = (tokenIn, tokenOut, sell, buy, reverse = false) => {
        setcurrentTokenIn(tokenIn);
        setcurrentTokenOut(tokenOut);
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
            const formatted = formatPrice(amount.toFixed(24).toString(), false, swapDecimalRule);
            setBuyAmount(formatted);
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
            const formatted = formatPrice(amount.toFixed(24).toString(), false, swapDecimalRule);
            setSellAmount(formatted);
        } else {
            setSellAmount(0); // fallback
        }
    };

    useEffect(() => { // Reset form when pool address changed
        setcurrentTokenIn(token1);
        setcurrentTokenOut(token0);
        setReversed(false);
        setSellAmount(0);
        setBuyAmount(0);
    }, [token0, token1, poolAddress]);

    if (!isDEX) return null;

    return (
        <div className="flex flex-col gap-2 bg-primary-900 p-4 rounded-md w-full h-full relative">
            <div className="flex gap-0 flex-col items-center">
                <div className="flex flex-col items-start gap-2 rounded-xl p-4 bg-primary-500 hover:border-active w-full">
                    <SwapTokenInfo label={"SELL"} tokenName={currentTokenIn.name} />
                    <div className="flex items-center w-full justify-between">
                        <input
                            type="text"
                            inputMode="decimal"
                            pattern="[0-9]*[.,]?[0-9]*"
                            value={sellAmount}
                            onChange={(e) => handleSellChange(e.target.value)}
                            className="px-0 py-2 focus-within:outline-1 text-white font-semibold w-full text-2xl"
                        />
                        <TokenIcon symbol={stdSymbol(currentTokenIn.symbol).toLowerCase()} size={36} color="#fff" variant="branded" />
                        <span className="ml-1 text-white">{currentTokenIn.symbol}</span>
                    </div>
                    <FiatValue symbol={currentTokenIn.symbol} value={sellAmount} />
                </div>

                <button
                    onClick={() => handleChangeSymbols(currentTokenOut, currentTokenIn, buyAmount, sellAmount, true)}
                    className="flex items-center justify-center bg-primary-100 p-3 rounded-full w-fit text-white -my-4.5 z-10"
                >
                    <SvgMemo>
                        <SwapIcon color={reversed ? "#ffffff" : "#ffffff75"} />
                    </SvgMemo>
                </button>

                <div className="flex flex-col items-start gap-2 rounded-xl p-4 bg-primary-500 hover:border-active w-full">
                    <SwapTokenInfo label={"BUY"} tokenName={currentTokenOut.name} />
                    <div className="flex items-center w-full justify-between">
                        <input
                            type="text"
                            inputMode="decimal"
                            pattern="[0-9]*[.,]?[0-9]*"
                            value={buyAmount}
                            onChange={(e) => handleBuyChange((e.target.value))}
                            className="px-0 py-2 focus-within:outline-1 text-white font-semibold w-full text-2xl"
                        />
                        <TokenIcon symbol={stdSymbol(currentTokenOut.symbol).toLowerCase()} size={36} color="#fff" variant="branded" />
                        <span className="ml-1 text-white">{currentTokenOut.symbol}</span>
                    </div>
                    <FiatValue symbol={currentTokenOut.symbol} value={buyAmount} />
                </div>
            </div>

            {!accountAddress && <WalletLogin setLogState={setloginState} />}
            {accountAddress && <button className="bg-accent p-3 rounded-md text-primary-900 font-semibold">Swap</button>}

            <button
                onClick={() => window.open(`${network.poolURL}${poolAddress}`, "_blank")}
                className="bg-transparent p-3 rounded-md border-washed text-washed font-semibold"
            >Swap on Uniswap
            </button>

            {loginState &&
                <div className="h-full w-full bg-transparent-blur absolute left-0 top-0">
                    <div className="mx-auto max-w-[80%] p-4 bg-primary-900 rounded-md border-washed text-sm">{loginState}</div>
                </div>
            }
        </div>
    );
}

export default Swap;
