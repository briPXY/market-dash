// quoteQueryFn.js
export async function getUniswapQuoteQueryFn({ queryKey }) {
    // eslint-disable-next-line no-unused-vars
    const [_key, { tokenIn, tokenOut, amount, protocols = 'v3' }] = queryKey;

    const url = `https://api.uniswap.org/v1/quote?` +
        new URLSearchParams({
            tokenIn,
            tokenOut,
            amount,
            protocols
        });

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Uniswap quote error: ${res.statusText}`);

    const data = await res.json();

    const q = data.quote;
    if (!q) throw new Error('Invalid quote response');

    // Parse and return only relevant values
    return {
        amountIn: q.amountIn,
        amountOut: q.amountOut,
        executionPrice: q.executionPrice?.numerator && q.executionPrice?.denominator
            ? Number(q.executionPrice.numerator) / Number(q.executionPrice.denominator)
            : null,
        priceImpact: q.priceImpact,
        estimatedNetworkFee: q.estimatedNetworkFee,
        gasUseEstimate: q.gasUseEstimate,
        gasUseEstimateQuote: q.gasUseEstimateQuote,
        feeTier: q.route?.[0]?.feeTier || null,
    };
}
