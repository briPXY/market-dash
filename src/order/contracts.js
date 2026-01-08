import { ethers, parseUnits } from "ethers";
// import { PoolManager } from '@uniswap/v4-sdk';
// import { Token } from '@uniswap/sdk-core';
import { formatPriceInternational, getAvailableRPC } from "../utils/utils";
import { usePoolStore, useWalletStore } from "../stores/stores";
// import { getDoubleTokenInfo } from "../idb/tokenListDB";
import { Cacheds } from "../constants/environment";
import { RPC_URLS } from "../constants/constants";
import { decryptAndLoadUserSecret } from "../utils/user";
import { isSavedStateExist } from "../idb/stateDB";

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

export async function getTokenDecimals(tokenAddress, provider) {
    try {
        const contract = new ethers.Contract(tokenAddress, ["function decimals() view returns (uint8)"], provider);
        const decimals = await contract.decimals();
        return Number(decimals);
    } catch (error) {
        console.error("Error fetching decimals:", error);
        return 18; // Fallback to 18 if the call fails
    }
}


export async function cycleEtherProvider() {
    const rpcUrl = await getAvailableRPC(RPC_URLS.default);
    Cacheds.etherProvider = new ethers.JsonRpcProvider(rpcUrl);

    if (useWalletStore.getState().address && useWalletStore.getState().signature && !Cacheds.sepoliaProvider) {
        const savedSepoliaRPC = await isSavedStateExist(`Sepolia RPC_${useWalletStore.getState().address}`);
        if (savedSepoliaRPC) {
            const sepoliaRPC = await decryptAndLoadUserSecret("Sepolia RPC", useWalletStore.getState().address, useWalletStore.getState().signature);
            Cacheds.sepoliaProvider = new ethers.JsonRpcProvider(sepoliaRPC);
        }
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
        console.info("Transaction sent:", tx.hash);

        // Wait for confirmation
        const receipt = await tx.wait();
        console.info("Transaction mined:", receipt.transactionHash);

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

    const decimals0 = pairStoreObj.token0.decimals;
    const decimals1 = pairStoreObj.token1.decimals;

    const safeAmount = truncateToDecimals(amount, inputFrom == "sellInput" ? decimals1 || 18 : decimals0 || 18)
    const amountInBase = parseUnits(safeAmount, Number(inputFrom == "sellInput" ? decimals1 || 18 : decimals0 || 18));
    const decimalRule = { min: 0, max: 4 }

    const quoter = new ethers.Contract("0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6", SWAP_QUOTER_ABI[method], Cacheds.etherProvider);

    // STEP 1: Get Quoter Quote (The amountOut)

    let amountOut;

    try {
        amountOut = await quoter[method].staticCall(pairStoreObj.token1.address, pairStoreObj.token0.address, fee, amountInBase, 0);
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
    const isInputSell = method == "quoteExactInputSingle";
    // If selling, amountInBase is Token1. If buying, amountInBase is Token0.

    // Return the combined result
    const rawToken1Amount = isInputSell ? amountInBase : amountOut;
    const rawToken0Amount = isInputSell ? amountOut : amountInBase;

    const formattedToken1 = Number(ethers.formatUnits(rawToken1Amount, Number(decimals1)));
    const formattedToken0 = Number(ethers.formatUnits(rawToken0Amount, Number(decimals0)));

    const sellText = `Sell (${pairStoreObj.token1.symbol})`;
    const receiveText = `Receive (${pairStoreObj.token0.symbol})`;
    const priceText = `Avg. Price (${pairStoreObj.token0.symbol}/${pairStoreObj.token1.symbol})`;
    const sellValue = formattedToken1; // Always Token 1
    const buyValue = formattedToken0;  // Always Token 0
    const executionPrice = sellValue / buyValue;

    if (!userAddress) {
        return {
            [receiveText]: `${formatPriceInternational(buyValue, decimalRule)}`,
            [sellText]: `${formatPriceInternational(sellValue, decimalRule)}`,
            [priceText]: `${executionPrice.toPrecision(6)}`,
            "Fee tier": `${fee / 10000}%`,
            "Est. Gas (Units)": "login needed",
            "Network Cost (ETH)": "login needed"
        };
    }

    try {
        const estimatedGas = await router[method].estimateGas(swapParams, { from: userAddress });
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
        [receiveText]: `${formatPriceInternational(buyValue, decimalRule)}`,
        [sellText]: `${formatPriceInternational(sellValue, decimalRule)}`,
        [priceText]: `${executionPrice.toPrecision(6)}`,
        "Fee tier": `${fee / 10000}%`,
        "Est. Gas (Units)": gasEstimateUnits,
        "Network Cost (ETH)": formatPriceInternational(gasCostETH, decimalRule)
    };
}

export function initDummy() { return null }
initDummy.props = ["Loading Network", "Loading Pool"]


export async function validateUniswapPoolExist(pairObj, blockchain, chainId) {
    const factories = UNISWAP_FACTORIES[chainId];
    const provider = Cacheds.etherProvider;
    if (!factories) return null;

    // check if already have validatedInfo
    if (usePoolStore.getState().validatedInfo) {
        if (usePoolStore.getState().validatedInfo.v3 || usePoolStore.getState().validatedInfo.v2) {
            return true;
        }
    }

    let address0 = pairObj.token0.address;
    let address1 = pairObj.token1.address;

    // if token addresses from token-list db not available
    if (!address0 || !address1) {
        return false;
    }

    const [addr0, addr1] = address0.toLowerCase() < address1.toLowerCase() ? [address0, address1] : [address1, address0];
    const validatedInfo = {};
    let isValid = false;

    // V3 (multi-fee)
    if (factories.v3) {
        validatedInfo.v3 = {};
        const factory = new ethers.Contract(factories.v3, V3_FACTORY_CHECKER_ABI, provider);
        for (const fee of V3_FEES) {
            try {
                const pool = await factory.getPool(addr0, addr1, fee);
                if (pool !== ethers.ZeroAddress) {
                    isValid = true;
                    validatedInfo.v3[`${fee / 10000}%`] = pool;
                }

            } catch (e) { e }
        }
    }

    // V2
    if (factories.v2) {
        validatedInfo.v2 = {};
        try {
            const factory = new ethers.Contract(factories.v2, V2_FACTORY_CHECKER_ABI, provider)

            const pair = await factory.getPair(addr0, addr1);
            if (pair !== ethers.ZeroAddress) {
                isValid = true;
                validatedInfo.v2["0.3%"] = pair;
            }
        } catch (e) { e }
    }

    if (isValid) {
        await usePoolStore.getState().updatePairData("validatedInfo", validatedInfo);
    }

    // cant get fee/version info then use feeTier from its own list (example case: manually-typed pair-list)
    if (!isValid && pairObj.address) {
        const fee = usePoolStore.getState().feeTier ? `${Number(usePoolStore.getState().feeTier) / 10000}%` : "0.3%";
        await usePoolStore.getState().updatePairData("validatedInfo", { v3: { [fee]: pairObj.address } });
        isValid = true;
    }

    return isValid;
}
