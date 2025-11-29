import { useQuery } from '@tanstack/react-query';
import { SourceConst } from '../constants/sourceConst';
import { usePoolStore, useSourceStore, useWalletStore } from '../stores/stores';
import { ExternalLinkIcon } from '../Layout/svg';
import { ExchangeIcon } from '@web3icons/react/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { debounce } from 'lodash';


const initProps = { "Min. Receive": '-', "Avg. Price": '-', "Fee Tier": '-', "Quoter Address": '-', "Network Cost": '-' };

export default function SwapQuotesPanel({ queryKeys, enabled, queryFn }) {
    const source = useSourceStore(state => state.src);
    const poolAddress = usePoolStore(state => state.address);
    const [isDebouncing, setIsDebouncing] = useState(false);
    const [debouncedKey, setDebouncedKey] = useState(null);
    const network = SourceConst[source];
    const userAddress = useWalletStore(state => state.address);

    // Create a stable debounced function ONCE
    const debouncedUpdate = useMemo(() =>
        debounce((values) => {
            if (enabled) {
                setIsDebouncing(false);
                setDebouncedKey(values);
                // console.log("debounced:", values.amount);
            }
        }, 3000), [enabled]);

    // Call debounced function when inputs change
    useEffect(() => {
        if (enabled) {
            // Set the pending state immediately
            setIsDebouncing(true);
        }

        debouncedUpdate({ ...queryKeys, userAddress });
        return () => debouncedUpdate.cancel();
    }, [debouncedUpdate, enabled, queryKeys, userAddress]);

    const { data, error, isFetching } = useQuery({
        queryKey: ['uniswapQuote', debouncedKey],
        queryFn: queryFn,
        enabled: enabled && !!debouncedKey,
        retry: 1,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        initialData: initProps
    });

    if (error) console.error(error);

    return (
        <div className="overflow-y-scroll bg-primary-900 p-3">

            <div className='flex justify-between text-xs'>
                <div key={source} className='text-washed flex flex-col flex-1 items-start gap-2'>
                    {
                        Object.keys(data).map(e => (<div key={e} >{e}</div>))
                    }
                </div>
                <div key={queryKeys.amount} className='flex flex-col flex-1 items-end gap-2'>
                    {
                        Object.keys(data).map(e => (<div style={{ fontStyle: isFetching || isDebouncing ? "italic" : "normal" }} key={e}>{isDebouncing ? "pending" : isFetching ? "fetching" : data[e]}</div>))
                    }
                </div>
            </div>
            {error && <div className='w-full text-xs text-washed'>{error.message}</div>}
            <div className='h-4'></div>
            <button
                onClick={() => window.open(`${network.poolURL}${poolAddress}`, "_blank")}
                className="bg-transparent text-xs flex gap-1 items-center"
                title={`Go to ${network.poolURL}${poolAddress}`}
            ><ExternalLinkIcon size={14} /> Swap at {network.exchangeIcon.charAt(0).toUpperCase() + network.exchangeIcon.slice(1)} <span><ExchangeIcon id={network.exchangeIcon} variant="mono" size="18" /></span>
            </button>
        </div>
    );
}
