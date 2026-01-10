import { useEffect, useRef, useState } from "react";
import { usePoolStore, usePriceInvertStore, usePriceStore, useSourceStore } from "../stores/stores";
import SwapForm from "./SwapForm";
import { formatPrice } from "../utils/utils";
import { swapDecimalRule } from "../constants/constants";
import SwapQuotesPanel from "./SwapQuotesPanel";
import { TraderPlatform } from "./TraderPlatform";

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

export default function Swap() {
    const symbols = usePoolStore(state => state.symbols);
    const [sellAmount, setSellAmount] = useState(0);
    const [buyAmount, setBuyAmount] = useState(0);
    const inputFrom = useRef(null);

    const handleChangeSymbols = (buy, sell) => {
        setSellAmount(buy);
        setBuyAmount(sell);
        const isReversed = usePriceInvertStore.getState().priceInvert;
        usePriceInvertStore.getState().setPriceInvert(!isReversed);
    };

    const handleSellChange = (value) => {
        inputFrom.current = "sellInput";
        const currentRate = usePriceStore.getState().trade;
        let cleaned = removeNonNumeric(value);
        const numeric = parseFloat(cleaned.replace(',', '.'));
        setSellAmount(cleaned);

        if (!isNaN(numeric)) {
            const formatted = formatPrice((numeric / currentRate).toFixed(24).toString(), false, swapDecimalRule);
            setBuyAmount(formatted);
        } else {
            setBuyAmount(0); // fallback
        }

    };

    const handleBuyChange = (value) => {
        inputFrom.current = "buyInput";
        const currentRate = usePriceStore.getState().trade;
        let cleaned = removeNonNumeric(value);
        const numeric = parseFloat(cleaned.replace(',', '.'));
        setBuyAmount(cleaned);

        if (!isNaN(numeric)) {
            const formatted = formatPrice((numeric * currentRate).toFixed(24).toString(), false, swapDecimalRule);
            setSellAmount(formatted);
        } else {
            setSellAmount(0); // fallback
        }
    };

    useEffect(() => { // Reset form when pool address changed 
        setSellAmount(0);
        setBuyAmount(0);
    }, [symbols]);

    return (
        <div className="flex flex-col grow">
            <SwapForm
                handleBuyChange={handleBuyChange}
                handleSellChange={handleSellChange}
                buyAmount={buyAmount}
                sellAmount={sellAmount}
                handleChangeSymbols={handleChangeSymbols}
                isDEX={useSourceStore.getState().isDEX ?? null}
            />
            <TraderPlatform />
            <SwapQuotesPanel
                amount={inputFrom.current == "sellInput" ? sellAmount : buyAmount}
                inputFrom={inputFrom.current}
            />
        </div>
    );
}