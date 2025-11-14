import { useEffect, useState } from "react";
import { usePoolStore, usePriceStore, useSourceStore } from "../stores/stores";
import SwapForm from "./SwapForm";
import { formatPrice } from "../utils/utils";
import { swapDecimalRule } from "../constants/constants";
import SwapQuotesPanel from "./SwapQuotesPanel"; 
import { SourceConst } from "../constants/sourceConst";

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

export default function Swap({ token0, token1, isDEX }) {
    const source = useSourceStore(state => state.src);
    const poolAddress = usePoolStore(state => state.address);
    const [sellAmount, setSellAmount] = useState('');
    const [buyAmount, setBuyAmount] = useState(0);
    const [currentTokenIn, setcurrentTokenIn] = useState(token1);
    const [currentTokenOut, setcurrentTokenOut] = useState(token0);
    const [reversed, setReversed] = useState(false);
    const currentRate = usePriceStore((state) => state.trade);

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

    return (
        <div className="flex flex-col gap-1">
            <SwapForm
                currentTokenIn={currentTokenIn}
                currentTokenOut={currentTokenOut}
                handleBuyChange={handleBuyChange}
                handleSellChange={handleSellChange}
                buyAmount={buyAmount}
                sellAmount={sellAmount}
                handleChangeSymbols={handleChangeSymbols}
                isDEX={isDEX}
            />
            <SwapQuotesPanel
                queryFn={SourceConst[source].quoteFunction}
                tokenIn={currentTokenIn}
                tokenOut={currentTokenOut}
                amount={sellAmount}
                enabled={currentTokenIn.id != null && sellAmount > 0}
            />
        </div>
    );
}