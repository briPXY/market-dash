import { ethers, parseUnits } from "ethers"; 
import { formatPrice, getAvailableRPC } from "../utils/utils";
import { RPC_URLS, swapDecimalRule } from "../constants/constants";

const workingRPC = {};

function truncateToDecimals(value, decimals) {
    const decIn = Number(decimals);
    const [integer, fraction = ""] = value.toString().split(".");
    return fraction.length > decIn
        ? `${integer}.${fraction.slice(0, decIn)}`
        : value.toString();
}

// quoteQueryFn.js
export async function getUniswapQuoteQueryFn({ queryKey }) {
    // eslint-disable-next-line no-unused-vars
    const [_key, { tokenIn, tokenOut, amount, protocols = 'v3' }] = queryKey;

    const addressIn = tokenIn.id;
    const addressOut = tokenOut.id;
    const amountInETH = parseUnits(amount.toString(), Number(tokenIn.decimals)).toString();

    const url = `https://api.uniswap.org/v3/quote?` +
        new URLSearchParams({
            addressIn,
            addressOut,
            amountInETH,
            protocols
        });

    const res = await fetch(url);
    if (!res.ok) {
        console.error(res.statusText);
        throw new Error(`Uniswap quote error: ${res.statusText}`);
    }

    const data = await res.json();
    const q = data.quote;

    if (!q) {
        console.error();
        throw new Error('Invalid quote response');
    }

    // Parse and return only relevant values
    return {
        "Amount-In": q.amountIn,
        "Amount-Out": q.amountOut,
        "Execution Price": q.executionPrice?.numerator && q.executionPrice?.denominator
            ? Number(q.executionPrice.numerator) / Number(q.executionPrice.denominator)
            : null,
        "Price Impact": q.priceImpact,
        "Estimated Network Fee": q.estimatedNetworkFee,
        "Gas Use Estimate": q.gasUseEstimate,
        "Gas Use Estimate Quote": q.gasUseEstimateQuote,
        "Fee Tier": q.route?.[0]?.feeTier || null,
    };
}

export async function getUniswapQuoteFromContract({ queryKey }) {

    const QUOTER_ADDRESS = "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6";

    const QUOTER_ABI = [
        "function quoteExactInputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint160 sqrtPriceLimitX96) external returns (uint256 amountOut)"
    ];
    // eslint-disable-next-line no-unused-vars
    const [_key, { tokenIn, tokenOut, amount, fee = 3000 }] = queryKey; 
    // 🧮 Prepare input
    const addressIn = tokenIn.id;
    const addressOut = tokenOut.id;
    const safeAmount = truncateToDecimals(amount, tokenIn.decimals || 18)
    const amountInBase = parseUnits(safeAmount, Number(tokenIn.decimals));

    // 🪄 Setup read-only provider (you can use any RPC endpoint)
    if (!workingRPC.quoter){
        workingRPC.quoter = await getAvailableRPC(RPC_URLS.default);
    }

    const provider = new ethers.JsonRpcProvider(workingRPC.quoter);  
    const quoter = new ethers.Contract(QUOTER_ADDRESS, QUOTER_ABI, provider);

    // 🔍 Call contract read (no gas, no CORS)
    let amountOut; 
    try {
        amountOut = await quoter.quoteExactInputSingle.staticCall(
            addressIn,
            addressOut,
            fee,
            amountInBase,
            0
        );
    } catch (err) {
        console.error(err);
        throw new Error("Failed to fetch on-chain quote");
    }

    const decIn = Number(tokenIn.decimals ?? 18);
    const decOut = Number(tokenOut.decimals ?? 18);
    const formattedIn = Number(ethers.formatUnits(amountInBase, decIn));
    const formattedOut = Number(ethers.formatUnits(amountOut, decOut));
    const executionPrice = formattedOut / formattedIn;

    return {
        "Amount-In": `${formatPrice(formattedIn.toString(), false, swapDecimalRule)} ${tokenIn.symbol}`,
        "Amount-Out": `${formatPrice(formattedOut.toString(), false, swapDecimalRule)} ${tokenOut.symbol}`,
        "Execution Price": executionPrice.toPrecision(6),
        "Fee Tier": `${fee / 10000}%`,
        "Quoter Contract": `${QUOTER_ADDRESS.slice(0, 12)}...`
    };
}

getUniswapQuoteFromContract.props = ["Amount-In", "Amount-Out", "Execution Price", "Fee Tier", "Quoter Contract"];

export function initDummy() { return null }
initDummy.props = ["Loading Network", "Loading Pool"]
