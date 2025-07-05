import { useEffect, useState } from "react";
import usePriceStore, { useWalletStore } from "../stores/stores";
import { TokenIcon } from "@web3icons/react";
import { PoolAddress } from "../constants/uniswapAddress";
import { svg } from "../Layout/svg";
import { Login } from "./Login";

function Swap({ symbolIn, symbolOut, network }) {
    const [sellAmount, setSellAmount] = useState(0);
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
        setSellAmount(value);
        const amount = reversed ? value / currentRate : value * currentRate;
        setBuyAmount(amount.toFixed(4));
    };

    const handleBuyChange = (value) => {
        setBuyAmount(value);
        const amount = reversed ? value * currentRate : value / currentRate;
        setSellAmount(amount.toFixed(4));
    };

    useEffect(() => {
        setCurrentSymbolIn(symbolIn);
        setCurrentSymbolOut(symbolOut);
        setSellAmount(0);
        setBuyAmount(0);
    }, [symbolIn, symbolOut])

    return (
        <div className="flex flex-col gap-2 bg-primary p-4 rounded-md w-full h-full relative">
            <div className="flex flex-col items-start gap-2 rounded-lg p-4 border-washed hover:border-active">
                <div className="text-washed">Sell</div>
                <div className="flex items-center justify-between">
                    <input
                        type="number"
                        value={sellAmount}
                        onChange={(e) => handleSellChange(parseFloat(e.target.value) || 0)}
                        className="p-2 rounded-md text-white w-full text-2xl"
                        placeholder="0"
                    />
                    <TokenIcon symbol={currentSymbolIn.toLowerCase()} size={32} color="#fff" variant="branded" />
                    <span className="ml-2 text-white font-semibold">{currentSymbolIn}</span>
                </div>
                {/* <div className="text-sm text-gray-400">${(sellAmount * currentRate).toFixed(2)}</div> */}
            </div>

            <button
                onClick={() => handleChangeSymbols(currentSymbolOut, currentSymbolIn, buyAmount, sellAmount, true)}
                className="flex items-center justify-center bg-secondary p-2 rounded-md text-white"
            >
                <svg.Swap />
            </button>

            <div className="flex flex-col items-start gap-2 rounded-lg p-4 border-washed hover:border-active">
                <div className="text-washed">Buy</div>
                <div className="flex items-center justify-between">
                    <input
                        type="number"
                        value={buyAmount}
                        onChange={(e) => handleBuyChange(parseFloat(e.target.value) || 0)}
                        className="p-2 rounded-md text-white w-full text-2xl"
                        placeholder="0"
                    />
                    <TokenIcon symbol={currentSymbolOut.toLowerCase()} size={32} color="#fff" variant="branded" />
                    <span className="ml-2 text-white font-semibold">{currentSymbolOut}</span>
                </div>
                {/* <div className="text-sm text-gray-400">${(buyAmount).toFixed(2)}</div> */}
            </div>

            {!address && <Login setLogState={setloginState} />}
            {address && <button className="bg-accent p-3 rounded-md text-primary font-semibold">Swap</button>}

            <button
                onClick={() => window.open(`${network.poolURL}${PoolAddress[network.name][symbolOut][symbolIn]}`, "_blank")}
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
