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

/**
 * Fetches the current recommended gas price (Wei) using EIP-1559 preferred fees.
 * @param {ethers.Provider} provider The Ethers provider instance.
 * @returns {BigInt} The effective gas price in Wei.
 */
async function getEffectiveGasPrice(provider) {
    const feeData = await provider.getFeeData();
    // Use maxFeePerGas for EIP-1559, or fallback to gasPrice (legacy)
    // The estimateGas function uses the current network conditions to determine
    // the maxFeePerGas and maxPriorityFeePerGas needed for the transaction.
    return feeData.maxFeePerGas || feeData.gasPrice;
}

export async function getUniswapQuoteFromContract({ queryKey }) {
    const [_key, { tokenIn, tokenOut, amount, fee = 3000, userAddress, userBalance, method }] = queryKey;
    _key;

    const GAS_QUOTER_ABI = [
        "function exactInputSingle((address tokenIn,address tokenOut,uint24 fee,address recipient,uint256 amountIn,uint256 amountOutMinimum,uint160 sqrtPriceLimitX96)) external payable returns (uint256)"
    ];

    const SWAP_QUOTER_ABI = {
        quoteExactInputSingle: ["function quoteExactInputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint160 sqrtPriceLimitX96) external view returns (uint256 amountOut)"],
        quoteExactOutputSingle: ["function quoteExactOutputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountOut, uint160 sqrtPriceLimitX96) external view returns (uint256 amountIn)"]
    };

    if (!workingRPC.quoter) {
        workingRPC.quoter = await getAvailableRPC(RPC_URLS.default);
    }

    const provider = new ethers.JsonRpcProvider(workingRPC.quoter);
    const safeAmount = truncateToDecimals(amount, tokenIn.decimals || 18)
    const amountInBase = parseUnits(safeAmount, Number(tokenIn.decimals));

    // 🪄 Setup read-only provider (you can use any RPC endpoint)
    if (!workingRPC.quoter) {
        workingRPC.quoter = await getAvailableRPC(RPC_URLS.default);
    }

    const quoter = new ethers.Contract("0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6", SWAP_QUOTER_ABI[method], provider);
    // ----------------------------------------------------
    // STEP 1: Get Quoter Quote (The amountOut)
    // ----------------------------------------------------
    let amountOut;
    try {
        amountOut = await quoter[method].staticCall(
            tokenIn.id,
            tokenOut.id,
            fee,
            amountInBase,
            0
        );
    } catch (err) {
        console.error(err);
        throw new Error("Failed to fetch on-chain quote");
    }

    // ----------------------------------------------------
    // STEP 2: Estimate Gas Cost (New Logic)
    // ----------------------------------------------------

    const router = new ethers.Contract("0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45", GAS_QUOTER_ABI, provider);

    // Prepare the exact parameters for the real swap transaction.
    // NOTE: For estimation, recipient is typically the user's address.
    const swapParams = {
        tokenIn: tokenIn.id,
        tokenOut: tokenOut.id,
        fee,
        recipient: userAddress,
        amountIn: amountInBase,
        amountOutMinimum: amountOut,
        sqrtPriceLimitX96: 0
    };

    let gasEstimateUnits = "N/A";
    let gasCostETH = "N/A";

    // Calculation for return object (Existing Code)
    const decIn = Number(tokenIn.decimals ?? 18);
    const decOut = Number(tokenOut.decimals ?? 18);

    const isInputSell = method == "quoteExactInputSingle";
    const formattedIn = Number(ethers.formatUnits(amountInBase, decIn));
    const formattedOut = Number(ethers.formatUnits(amountOut, decOut));
    const executionPrice = formattedOut / formattedIn;

    // Return the combined result
    const sellText = `Sell (${tokenIn.symbol})`;
    const receiveText = `Receive (${tokenOut.symbol})`;
    const priceText = `Avg. Price (${tokenIn.symbol}/${tokenOut.symbol})`;
    const sellValue = isInputSell ? formattedIn : formattedOut;
    const buyValue = isInputSell ? formattedOut : formattedIn;

    if (!userAddress) {
        return {
            [sellText]: `${formatPrice(sellValue.toString(), false, swapDecimalRule)}`,
            [receiveText]: `${formatPrice(buyValue.toString(), false, swapDecimalRule)}`,
            [priceText]: `${executionPrice.toPrecision(6)}`,
            "Fee tier": `${fee / 10000}%`,
            "Est. Gas (Units)": "login needed",
            "Network Cost (ETH)": "login needed"
        };
    }

    try {
        // 💡 Use .estimateGas() on the router function. This requires the Router ABI.
        const estimatedGas = await router.exactInputSingle.estimateGas(swapParams, { from: userAddress });
        gasEstimateUnits = estimatedGas.toString();
        // Convert Gas Units to ETH Value (New Logic)  
        // Fetch the current price per gas unit
        const gasPriceWei = await getEffectiveGasPrice(provider);

        if (gasPriceWei) {
            // gasCostWei = estimatedGas * gasPriceWei
            const gasCostWei = estimatedGas * gasPriceWei;

            // Convert Wei to ETH/Base Currency
            gasCostETH = ethers.formatEther(gasCostWei);
        }

    } catch (err) {
        console.error(err);
        gasEstimateUnits = !userBalance ? "No balance" : "ERROR";
        gasCostETH = !userBalance ? "No balance" : "ERROR";
    }

    return {
        [sellText]: `${formatPrice(sellValue.toString(), false, swapDecimalRule)}`,
        [receiveText]: `${formatPrice(buyValue.toString(), false, swapDecimalRule)}`,
        [priceText]: `${executionPrice.toPrecision(6)}`,
        "Fee tier": `${fee / 10000}%`,
        "Est. Gas (Units)": gasEstimateUnits,
        "Network Cost (ETH)": formatPrice(gasCostETH, false, 8)
    };
}

export function initDummy() { return null }
initDummy.props = ["Loading Network", "Loading Pool"]
