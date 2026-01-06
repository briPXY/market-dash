const activeIntervals = {};

export async function getCoinGeckoFiatRate(symbol, fiatSymbol){
    const res = await fetch(`https://min-api.cryptocompare.com/data/price?fsym=${symbol.toUpperCase()}&tsyms=${fiatSymbol.toUpperCase()}`); 

    if (!res.ok) throw new Error("Network response was not ok"); 
   
    const data = await res.json();
    return data[fiatSymbol.toUpperCase()];
}

export async function startFiatRateUpdater(symbol, fiatSymbol = "USD", iv = "iv0", callBack = () => { }) {
    if (activeIntervals[iv]) {
        return;
    }

    const fetchPrice = async () => {
        try {
            const price = await getCoinGeckoFiatRate(symbol, fiatSymbol);

            if (price) {
                callBack(parseFloat(price));
            }
        } catch (error) {
            console.error(`Fiat Rate Error (${symbol}):`, error);
            callBack(null);
        } finally {
            activeIntervals[iv] = setTimeout(fetchPrice, 60000);
        }
    };

    activeIntervals[iv] = true; // prevent double call from useStrict mode
    fetchPrice();

}

export function stopFiatRate(iv = "iv0") {
    if (activeIntervals[iv]) {
        clearTimeout(activeIntervals[iv]);
        delete activeIntervals[iv];
    }
}