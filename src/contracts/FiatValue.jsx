import { useEffect, useState } from 'react';
import { isSavedStateExist, loadStateTimed, saveStateTimed } from '../idb/stateDB';
import { getFiatRate } from '../queries/getFiatRate';

function FiatValue({ symbol, value }) {
    const [rate, setRate] = useState(null);

    useEffect(() => {
        async function fetchAndSaveFiatValue() {
            try {
                const exists = await isSavedStateExist(`fiat_${symbol}`);
                if (!exists) {
                    const newRate = parseFloat(await getFiatRate(symbol));
                    if (!newRate) {
                        return;
                    }
                    await saveStateTimed(`fiat_${symbol}`, newRate, 60);
                    setRate(newRate);
                } else {
                    console.log("has fiat state");
                    setRate(await loadStateTimed(`fiat_${symbol}`)); // Load saved state if exists
                }
            } catch (error) {
                console.error('Error fetching fiat rate:', error);
            }
        }

        fetchAndSaveFiatValue();
    }, [symbol]);

    return <div className="text-xs text-washed">{rate && value ? (rate * value).toFixed(2) : "?"}<span>{' USD'}</span></div>;
}

export default FiatValue;

