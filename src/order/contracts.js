import { ethers, parseUnits } from "ethers";
// import { PoolManager } from '@uniswap/v4-sdk';
// import { Token } from '@uniswap/sdk-core';
import { formatPrice, getAvailableRPC } from "../utils/utils";
import { RPC_URLS, swapDecimalRule } from "../constants/constants";
const workingRPC = {};

/**
 * Calls a read-only function on a smart contract using a custom RPC URL.
 * 
 * @param abi - The contract ABI.
 * @param contractAddress - The address of the deployed smart contract.
 * @param rpcUrl - RPC endpoint to use (e.g., Infura, Alchemy, or public RPC).
 * @param method - The name of the contract method to call.
 * @param params - Optional array of parameters to pass to the method.
 * @returns The result of the contract method call, or null if it fails.
 */
export async function contractCallRead({ abi, contractAddress, rpcUrl, method, params = [] }) {
    try {
        const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
        const contract = new ethers.Contract(contractAddress, abi, provider);

        if (!contract[method]) {
            throw new Error(`Method "${method}" not found in contract`);
        }

        const result = await contract[method](...params);
        return result;
    } catch (error) {
        console.error(`❌ Contract call failed: ${error.message}`);
        return null;
    }
}

/**
 * Sends a write (mutating) transaction to a contract method.
 * 
 * @param abi - Contract ABI
 * @param contractAddress - Deployed contract address
 * @param rpcUrl - RPC URL for network context
 * @param method - Contract method to call
 * @param params - Parameters to pass to the method
 * @returns Transaction receipt or null if failed
 */
export async function contractCallWrite({ abi, contractAddress, rpcUrl, method, params = [] }) {
    try {
        // Ensure wallet is connected
        if (!window.ethereum) throw new Error("No wallet (window.ethereum) found");

        // Setup provider & signer from wallet
        const browserProvider = new ethers.providers.Web3Provider(window.ethereum);
        await browserProvider.send("eth_requestAccounts", []); // Trigger wallet connect
        const signer = browserProvider.getSigner();

        // Optional: check wallet is on same network as rpcUrl
        const targetProvider = new ethers.providers.JsonRpcProvider(rpcUrl);
        const expectedChainId = (await targetProvider.getNetwork()).chainId;
        const walletChainId = (await browserProvider.getNetwork()).chainId;
        if (walletChainId !== expectedChainId) {
            throw new Error(`Wallet is on wrong network (expected chainId ${expectedChainId}, got ${walletChainId})`);
        }

        // Create contract with signer
        const contract = new ethers.Contract(contractAddress, abi, signer);

        if (!contract[method]) {
            throw new Error(`Method "${method}" not found in contract`);
        }

        // Call the method with parameters
        const tx = await contract[method](...params);
        console.log("📤 Transaction sent:", tx.hash);

        // Wait for confirmation
        const receipt = await tx.wait();
        console.log("✅ Transaction mined:", receipt.transactionHash);

        return receipt;
    } catch (error) {
        console.error(`❌ Contract write failed: ${error.message}`);
        return null;
    }
}

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
 

async function getEffectiveGasPrice(provider) {
    const feeData = await provider.getFeeData();
    // Use maxFeePerGas for EIP-1559, or fallback to gasPrice (legacy) 
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

// const ONE_DAY = 24 * 60 * 60 * 1000
// const CACHE_NAME = 'uniswap-pool-exists'

/**
 * Check if Uniswap v4 pool exists and cache the result for 24 hours.
 * @param {object} provider - ethers provider instance
 * @param {string} tokenAAddr - token A contract address
 * @param {string} tokenBAddr - token B contract address
 * @param {number} fee - fee tier (default: 3000)
 * @param {number} decimalsA - token A decimals
 * @param {number} decimalsB - token B decimals
 */
// export async function poolExists(provider, tokenAAddr, tokenBAddr, decimalsA = 18, decimalsB = 18, fee = 3000) {
//     const cacheKey = `${tokenAAddr}-${tokenBAddr}-${fee}`.toLowerCase()

//     // 1) Try cache
//     const cache = await caches.open(CACHE_NAME)
//     const cached = await cache.match(cacheKey)

//     if (cached) {
//         const data = await cached.json()
//         if (Date.now() - data.timestamp < ONE_DAY) {
//             return data.exists // return cached result
//         }
//         // expired cache → delete entry
//         await cache.delete(cacheKey)
//     }

//     // 2) Run Uniswap SDK check
//     const tokenA = new Token(1, tokenAAddr, decimalsA)
//     const tokenB = new Token(1, tokenBAddr, decimalsB)

//     const poolManager = new PoolManager(provider)

//     let exists = false
//     try {
//         const poolId = await poolManager.getPoolId({
//             currency0: tokenA,
//             currency1: tokenB,
//             fee,
//             tickSpacing: 60,
//             hooks: ethers.ZeroAddress
//         })

//         const liquidity = await poolManager.getLiquidity(poolId)
//         exists = liquidity > 0n // bigint compare
//     } catch {
//         exists = false
//     }

//     // 3) Save to cache
//     await cache.put(
//         cacheKey,
//         new Response(JSON.stringify({ exists, timestamp: Date.now() }), {
//             headers: { 'Content-Type': 'application/json' }
//         })
//     )

//     return exists
// }

