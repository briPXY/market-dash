import { useQuery } from '@tanstack/react-query';
import { SourceConst } from '../constants/sourceConst';
import { usePoolStore, useSourceStore } from '../stores/stores';
import { ExternalLinkIcon } from '../Layout/svg';
import { ExchangeIcon } from '@web3icons/react';

export default function SwapQuotesPanel({ tokenIn, tokenOut, amount, queryEnabled }) {
    const source = useSourceStore(state => state.src);
    const poolAddress = usePoolStore(state => state.address);
    const network = SourceConst[source];
    const { data, isLoading, error } = useQuery({
        queryKey: ['uniswapQuote', { tokenIn, tokenOut, amount }],
        queryFn: SourceConst[source].quoteFunction,
        enabled: queryEnabled,
        retry: 1,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        initialData: {
            Price: "-",
            Liquidity: "-",
            "Fee Tier": "-",
            // whatever shape your quoteFunction normally returns
        },
    });

    if (error) console.error(error.message);

    return (
        <div className="overflow-y-scroll bg-primary-900 p-3">

            <div className='flex justify-between text-xs'>
                <div key={source} className='flex flex-col flex-1 items-start gap-2'>
                    {
                        SourceConst[source].quoteFunction.props.map(e => (<div key={e} >{e}</div>))
                    }
                </div>
                <div key={amount} className='flex flex-col flex-1 items-end gap-2'>
                    {
                        Object.keys(data).map(e => (<div key={e}>{isLoading ? "..." : data[e]}</div>))
                    }
                </div>
            </div>
            {error && <div className='w-full text-xs'>{error.message}</div>}
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
