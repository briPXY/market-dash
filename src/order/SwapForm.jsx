
import { TokenIcon } from "@web3icons/react";
import { SwapIcon } from "../Layout/svg";
import { WalletLogin } from "./Login";
import FiatValue from "./FiatValue";
import { SwapTokenInfo } from "./components/SwapTokenInfo";
import { SvgMemo } from "../Layout/Layout";
import { useWalletStore } from "../stores/stores";
import { stdSymbol } from "../utils/utils";
import { useState } from "react";


function SwapForm({ currentTokenIn, currentTokenOut, handleSellChange, sellAmount, buyAmount, handleBuyChange, handleChangeSymbols, reversed, isDEX }) {
    const accountAddress = useWalletStore(state => state.address); // Real logged-in/off state  
    const [loginState, setloginState] = useState(null); // For displaying login process status text only  

    if (!isDEX) return null;

    return (
        <div className="flex flex-col p-3 gap-2 bg-primary-900 w-full h-full relative">
            <div className="flex gap-0 flex-col items-center">
                <div className="flex flex-col items-start gap-2 rounded-lg p-4 bg-primary-500 hover:border-active w-full">
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
                    className="flex items-center justify-center bg-primary-100 p-2.5 rounded-lg w-fit text-white -my-4.5 z-10"
                    title="Switch currency"
                >
                    <SvgMemo>
                        <SwapIcon className="scale-110" color={reversed ? "#ffffff" : "#00000095"} />
                    </SvgMemo>
                </button>

                <div className="flex flex-col items-start gap-2 rounded-lg p-4 bg-primary-500 hover:border-active w-full">
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


            {loginState &&
                <div className="h-full w-full bg-transparent-blur absolute left-0 top-0">
                    <div className="mx-auto max-w-[80%] p-4 bg-primary-900 rounded-md border-washed text-sm">{loginState}</div>
                </div>
            }
        </div>
    );
}

export default SwapForm;
