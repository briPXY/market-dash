import { useEffect, useState } from "react";
import usePriceStore from "../stores/stores";
import { TokenIcon } from "@web3icons/react";

function Swap({ symbolIn, symbolOut, onConnectWallet, onSwap }) {
    const [sellAmount, setSellAmount] = useState(0);
    const [buyAmount, setBuyAmount] = useState(0);
    const [currentSymbolIn, setCurrentSymbolIn] = useState(symbolIn);
    const [currentSymbolOut, setCurrentSymbolOut] = useState(symbolOut);
    const [reversed, setReversed] = useState(false);
    const currentRate = usePriceStore((state) => state.trade);

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
        <div className="flex flex-col gap-2 bg-primary p-4 rounded-md w-full h-full">
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
                <svg width="20px" height="20px" viewBox="0 3 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="rgba(255, 255, 255, 0.65)"><path d="M19.4834 5.71191C19.0879 5.29883 18.4727 5.30762 18.0859 5.71191L13.6562 10.2471C13.4805 10.4229 13.3662 10.6953 13.3662 10.9326C13.3662 11.4863 13.7529 11.8643 14.2979 11.8643C14.5615 11.8643 14.7725 11.7764 14.9482 11.5918L16.7588 9.71094L17.9189 8.375L17.8486 10.2383L17.8486 21.6465C17.8486 22.1914 18.2441 22.5869 18.7891 22.5869C19.334 22.5869 19.7207 22.1914 19.7207 21.6465L19.7207 10.2383L19.6592 8.375L20.8105 9.71094L22.6211 11.5918C22.7969 11.7764 23.0166 11.8643 23.2803 11.8643C23.8164 11.8643 24.2031 11.4863 24.2031 10.9326C24.2031 10.6953 24.0889 10.4229 23.9131 10.2471L19.4834 5.71191ZM7.84668 22.2793C8.24218 22.6924 8.85742 22.6836 9.24414 22.2793L13.6738 17.7529C13.8496 17.5684 13.9639 17.2959 13.9639 17.0586C13.9639 16.5137 13.5771 16.1357 13.0322 16.1357C12.7773 16.1357 12.5576 16.2236 12.3818 16.3994L10.5713 18.2803L9.41992 19.6162L9.48144 17.7529L9.48144 6.34473C9.48144 5.80859 9.08594 5.4043 8.54101 5.4043C8.00488 5.4043 7.60937 5.80859 7.60937 6.34473L7.60937 17.7529L7.6709 19.6162L6.51953 18.2803L4.70898 16.3994C4.5332 16.2236 4.31347 16.1357 4.05859 16.1357C3.51367 16.1357 3.12695 16.5137 3.12695 17.0586C3.12695 17.2959 3.24121 17.5684 3.41699 17.7529L7.84668 22.2793Z" fill="currentColor"></path></svg>
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
            <button
                onClick={onConnectWallet}
                className="bg-accent p-2 rounded-md text-primary font-semibold"
            >
                Connect Wallet
            </button>
            <button
                onClick={() => onSwap(sellAmount, currentSymbolIn, currentSymbolOut)}
                className="bg-secondary p-2 rounded-md text-white font-semibold"
            >
                Swap on Uniswap
            </button>
        </div>
    );
}

export default Swap;
