import { useQuery } from '@tanstack/react-query';
import { SourceConst } from '../constants/sourceConst';
import { useSourceStore } from '../stores/stores';

export default function SwapQuotesPanel({ tokenIn, tokenOut, amount }) {
    const source = useSourceStore(state => state.src);
    const { data, isLoading, error } = useQuery({
        queryKey: ['uniswapQuote', { tokenIn, tokenOut, amount }],
        queryFn: SourceConst[source].quoteFunction,
        enabled: !!tokenIn && !!tokenOut && amount <= 0,
    });

    if (isLoading) return <p>Loading quote...</p>;
    if (error) return <p>Error: {error.message}</p>;
    if (!data) return null;

    return (
        <div className="p-3 rounded-lg bg-gray-900 text-white">
            <p><b>Expected Output:</b> {data.amountOut}</p>
            <p><b>Execution Price:</b> {data.executionPrice}</p>
            <p><b>Price Impact:</b> {data.priceImpact}%</p>
            <p><b>Fee Tier:</b> {data.feeTier}</p>
            <p><b>Network Fee (est):</b> {data.estimatedNetworkFee}</p>
        </div>
    );
}
