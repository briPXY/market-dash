import { ethers, parseUnits } from "ethers";
// import { PoolManager } from '@uniswap/v4-sdk';
// import { Token } from '@uniswap/sdk-core';
import { formatPriceInternational, getAvailableRPC } from "../utils/utils";
import { usePoolStore, useWalletStore } from "../stores/stores";
import { get2AddressBySymbolsChain } from "../idb/tokenListDB";
import { Cacheds } from "../constants/environment";
import { RPC_URLS } from "../constants/constants";
import { decryptAndLoadUserSecret } from "../utils/user";

const GAS_QUOTER_ABI = [
    "function exactInputSingle((address tokenIn,address tokenOut,uint24 fee,address recipient,uint256 amountIn,uint256 amountOutMinimum,uint160 sqrtPriceLimitX96)) external payable returns (uint256)"
];

const SWAP_QUOTER_ABI = {
    quoteExactInputSingle: ["function quoteExactInputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint160 sqrtPriceLimitX96) external view returns (uint256 amountOut)"],
    quoteExactOutputSingle: ["function quoteExactOutputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountOut, uint160 sqrtPriceLimitX96) external view returns (uint256 amountIn)"]
};

export const UNISWAP_FACTORIES = {
    1: { // Ethereum
        v3: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
        v2: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f"
    },
    42161: { // Arbitrum
        v3: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
        v2: "0xc35DADB65012eC5796536bD9864eD8773aBc74C4" // Sushi
    },
    8453: { // Base
        v3: "0x33128a8fC17869897dcE68Ed026d694621f6FDfD",
        v2: null
    },
    10: { // Optimism
        v3: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
        v2: null
    },
    137: { // Polygon
        v3: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
        v2: "0x5757371414417b8c6caad45baef941abc7d3ab32"
    }
}

const V3_FEES = [500, 3000, 10000];

const V3_FACTORY_CHECKER_ABI = [
    "function getPool(address,address,uint24) view returns (address)"
]

const V2_FACTORY_CHECKER_ABI = [
    "function getPair(address,address) view returns (address)"
]

export async function cycleEtherProvider() {
    const rpcUrl = await getAvailableRPC(RPC_URLS.default);
    Cacheds.etherProvider = new ethers.JsonRpcProvider(rpcUrl);

    if (useWalletStore.getState().address && useWalletStore.getState().signature && !Cacheds.sepoliaProvider) {
        const sepoliaRPC = await decryptAndLoadUserSecret("Sepolia RPC", useWalletStore.getState().address, useWalletStore.getState().signature);
        Cacheds.sepoliaProvider = new ethers.JsonRpcProvider(sepoliaRPC);
    }
    else {
        return;
    }
}

/**
 * Calls a read-only function on a smart contract using a custom RPC URL.
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
        console.log("Transaction sent:", tx.hash);

        // Wait for confirmation
        const receipt = await tx.wait();
        console.log("Transaction mined:", receipt.transactionHash);

        return receipt;
    } catch (error) {
        console.error(`Contract write failed: ${error.message}`);
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

export const PlaceholderQuoteData = (val) => ({ "Min. Receive": val, "Avg. Price": val, "Fee Tier": val, "Quoter Address": val, "Network Cost": val });

async function getEffectiveGasPrice(provider) {
    const feeData = await provider.getFeeData();
    // Use maxFeePerGas for EIP-1559, or fallback to gasPrice (legacy) 
    return feeData.maxFeePerGas || feeData.gasPrice;
}

// Uniswap trade panel's quoter function
export async function getUniswapQuoteFromContract(amount, inputFrom) {
    const pairStoreObj = usePoolStore.getState().getAll();
    const fee = pairStoreObj.feeTier ?? 3000;
    const userAddress = useWalletStore.getState().address;

    const method = inputFrom == "sellInput" ? "quoteExactInputSingle" : "quoteExactOutputSingle";

    const safeAmount = truncateToDecimals(amount, pairStoreObj.token1.decimals || 18)
    const amountInBase = parseUnits(safeAmount, Number(pairStoreObj.token1.decimals));

    const quoter = new ethers.Contract("0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6", SWAP_QUOTER_ABI[method], Cacheds.etherProvider);

    // STEP 1: Get Quoter Quote (The amountOut)

    let amountOut;

    try {
        amountOut = await quoter[method].staticCall(
            pairStoreObj.token1.address,
            pairStoreObj.token0.address,
            fee,
            amountInBase,
            0
        );
    } catch (err) {
        console.error(err);
        throw new Error("Failed to fetch on-chain quote");
    }

    // STEP 2: Estimate Gas Cost

    const router = new ethers.Contract("0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45", GAS_QUOTER_ABI, Cacheds.etherProvider);

    const swapParams = {
        tokenIn: pairStoreObj.token1.address,
        tokenOut: pairStoreObj.token0.address,
        fee,
        recipient: useWalletStore.getState().address,
        amountIn: amountInBase,
        amountOutMinimum: amountOut,
        sqrtPriceLimitX96: 0
    };

    let gasEstimateUnits = "N/A";
    let gasCostETH = "N/A";

    // Calculation for return object (Existing Code)
    const decIn = Number(pairStoreObj.token1.decimals ?? 18);
    const decOut = Number(pairStoreObj.token0.decimals ?? 18);

    const isInputSell = method == "quoteExactInputSingle";
    const formattedIn = Number(ethers.formatUnits(amountInBase, decIn));
    const formattedOut = Number(ethers.formatUnits(amountOut, decOut));
    const executionPrice = formattedOut / formattedIn;

    // Return the combined result
    const sellText = `Sell (${pairStoreObj.token1.symbol})`;
    const receiveText = `Receive (${pairStoreObj.token0.symbol})`;
    const priceText = `Avg. Price (${pairStoreObj.token1.symbol}/${pairStoreObj.token0.symbol})`;
    const sellValue = isInputSell ? formattedIn : formattedOut;
    const buyValue = isInputSell ? formattedOut : formattedIn;

    if (!userAddress) {
        return {
            [sellText]: `${formatPriceInternational(sellValue.toString())}`,
            [receiveText]: `${formatPriceInternational(buyValue.toString())}`,
            [priceText]: `${executionPrice.toPrecision(6)}`,
            "Fee tier": `${fee / 100000}%`,
            "Est. Gas (Units)": "login needed",
            "Network Cost (ETH)": "login needed"
        };
    }

    try {
        const estimatedGas = await router.exactInputSingle.estimateGas(swapParams, { from: userAddress });
        gasEstimateUnits = estimatedGas.toString();
        // Convert Gas Units to ETH Value
        const gasPriceWei = await getEffectiveGasPrice(Cacheds.etherProvider);

        if (gasPriceWei) {
            const gasCostWei = estimatedGas * gasPriceWei;
            gasCostETH = ethers.formatEther(gasCostWei);
        }

    } catch (err) {
        err;
        gasEstimateUnits = "No balance"; // for now, usually will fail if user got 0 token balance
        gasCostETH = "No balance";
    }

    return {
        [sellText]: `${formatPriceInternational(sellValue.toString())}`,
        [receiveText]: `${formatPriceInternational(buyValue.toString())}`,
        [priceText]: `${executionPrice.toPrecision(6)}`,
        "Fee tier": `${fee / 10000}%`,
        "Est. Gas (Units)": gasEstimateUnits,
        "Network Cost (ETH)": formatPriceInternational(gasCostETH, false, 8)
    };
}

export function initDummy() { return null }
initDummy.props = ["Loading Network", "Loading Pool"]

// const ONE_DAY = 24 * 60 * 60 * 1000
// const CACHE_NAME = 'uniswap-pool-exists'

/**
 * Check if Uniswap v4 pool exists and cache the result for 24 hours.
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


export async function getPoolVersionInfo(provider, pairObj) {
    const code = await provider.getCode(pairObj.address)
    if (code === "0x") return null

    try {
        const v3Pool = new ethers.Contract(pairObj.address, ["function fee() view returns (uint24)"], provider)
        const [fee] = await Promise.all([v3Pool.fee(), v3Pool.token0(), v3Pool.token1()]);
        if (!pairObj.feeTier) {
            usePoolStore.getState().setSingleState("feeTier", fee);
        }
        if (!pairObj.version) {
            usePoolStore.getState().setSingleState("version", "V3");
        }
        return true;
    } catch (e) { e }

    try {
        const v2Pair = new ethers.Contract(pairObj.address, ["function getReserves() view returns (uint112,uint112,uint32)"], provider)
        await Promise.all([v2Pair.getReserves()])
        if (!pairObj.version) {
            usePoolStore.getState().setSingleState("version", "V2");
        }
        if (!pairObj.feeTier) {
            usePoolStore.getState().setSingleState("feeTier", 3000);
        }
    } catch (e) { e }

    return true;
}

export async function validateUniswapPoolExist(pairObj, blockchain, chainId) {
    const factories = UNISWAP_FACTORIES[chainId]
    if (!factories) return null;
    const provider = Cacheds.etherProvider;

    if (pairObj.address) { // check if it have uniswap pool address
        const poolInfo = await getPoolVersionInfo(provider, pairObj.address);
        return poolInfo;
    }

    let address0 = pairObj.token0.address;
    let address1 = pairObj.token1.address;

    if (!address0 || !address1) {
        const { address0: dbadd0, address1: dbadd1 } = await get2AddressBySymbolsChain(pairObj.token0.symbol, pairObj.token1.symbol, `${blockchain}:${chainId}`);
        !address0 ? address0 = dbadd0 : address0;
        !address1 ? address1 = dbadd1 : address1;
    }
    // if address from db not available
    if (!address0 || !address1) {
        return false;
    }

    const [addr0, addrb] = address0.toLowerCase() < address1.toLowerCase() ? [address0, address1] : [address1, address0];

    // V3 (multi-fee)
    if (factories.v3) {
        const factory = new ethers.Contract(factories.v3, V3_FACTORY_CHECKER_ABI, provider)
        console.log(pairObj)
        for (const fee of V3_FEES) {
            try {
                const pool = await factory.getPool(addr0, addrb, fee)
                if (pool !== ethers.ZeroAddress) {
                    usePoolStore.getState().setSingleState("feeTier", fee);
                    usePoolStore.getState().setSingleState("version", "V3");
                    return true;
                }

            } catch (e) { e }
        }
    }

    // V2
    if (factories.v2) {
        console.log(pairObj)
        try {
            const factory = new ethers.Contract(factories.v2, V2_FACTORY_CHECKER_ABI, provider)

            const pair = await factory.getPair(addr0, addrb)
            if (pair !== ethers.ZeroAddress) {
                usePoolStore.getState().setSingleState("feeTier", 3000);
                usePoolStore.getState().setSingleState("version", "V2");
                return true;
            }
        } catch (e) { e }
    }

    return false;
}
