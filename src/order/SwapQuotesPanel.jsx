import { useQuery } from '@tanstack/react-query';
import { SourceConst } from '../constants/sourceConst';
import { usePoolStore, useSourceStore, useTradingPlatformStore } from '../stores/stores';
import { ExternalLinkIcon } from '../Layout/svg';
import { ExchangeIcon } from '@web3icons/react/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { debounce } from 'lodash';
import { PlaceholderQuoteData } from './contracts';
import { Traders } from '../constants/constants';

export default function SwapQuotesPanel({ amount, inputFrom }) {
    const pairAddress = usePoolStore(state => state.address ?? state.symbols);
    const validatedInfo = usePoolStore(state => state.validatedInfo);
    const [isDebouncing, setIsDebouncing] = useState(false);
    const [debouncedKeyValues, setDebouncedKeyValues] = useState(null);
    const network = useSourceStore.getState().data ?? SourceConst.init;

    const debouncedUpdate = useMemo(() =>
        debounce((values) => {
            setIsDebouncing(false);
            setDebouncedKeyValues(values);
        }, 3000),
        []
    );

    // update query keys after keystroke settled for x-seconds
    useEffect(() => {
        if (amount > 0 && validatedInfo) {
            setIsDebouncing(true);
            debouncedUpdate({ inputAmount: amount, inputIsFrom: inputFrom, address: pairAddress });
        }
        return () => debouncedUpdate.cancel();
    }, [amount, inputFrom, debouncedUpdate, pairAddress, validatedInfo]);

    const { data, error, isError, isFetching } = useQuery({
        queryKey: ['tradeQuoteQuery', debouncedKeyValues],
        queryFn: async ({ queryKey }) => {
            try {
                const [, { inputAmount, inputIsFrom }] = queryKey;
                const traderName = useTradingPlatformStore.getState().trader;
                const result = await Traders[traderName].quoterFn(inputAmount, inputIsFrom);
                return result;
            } catch (e) {
                console.error(e);
                return PlaceholderQuoteData('error');
            }
        },
        enabled: () => Boolean(amount > 0 && debouncedKeyValues && validatedInfo), // Force !! boolean or component (eventually app) crashed from undefined to false transition (tanstack wtf moment)
        retry: 1,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        placeholderData: PlaceholderQuoteData('-'),
    });

    if (!data || isError) {
        console.error(error);
    }

    return (
        <div className="overflow-y-scroll bg-primary-900 p-3">

            <div className='flex justify-between text-xs'>
                <div key={pairAddress} className='text-washed flex flex-col flex-1 items-start gap-2'>
                    {
                        Object.keys(data).map((e, i) => (<div style={{ fontWeight: i < 2 ? "700" : "400" }} key={e} >{e}</div>))
                    }
                </div>
                <div className='flex flex-col flex-1 items-end gap-2'>
                    {
                        Object.keys(data).map((e, i) => (
                            <div
                                style={{ fontStyle: isFetching || isDebouncing ? "italic" : "normal", fontWeight: i < 2 ? "700" : "400" }}
                                key={e}
                            >
                                {isDebouncing ? "..." : isFetching ? "fetching" : data[e]}
                            </div>
                        ))
                    }
                </div>
            </div>
            {error && <div className='w-full text-xs text-washed'>{error.message}</div>}
            <div className='h-4'></div>
            <button
                onClick={() => window.open(network.poolURL(pairAddress))}
                className="bg-transparent text-xs text-washed flex gap-1 items-center"
                title={`Go to ${network.poolURL}${pairAddress}`}
            ><ExternalLinkIcon size={14} />Trade at {network.exchangeIcon.charAt(0).toUpperCase() + network.exchangeIcon.slice(1)} <span><ExchangeIcon id={network.exchangeIcon} variant="mono" size="18" /></span>
            </button>
        </div>
    );
}
