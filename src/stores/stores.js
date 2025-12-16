import { SourceConst } from "../constants/sourceConst";
import { loadState, saveState } from "../idb/stateDB";
import { create } from "zustand";
import { Trader } from "../constants/constants";
import { initToken } from "../constants/initData";

export const usePriceStore = create((set) => ({
    trade: 0,
    index: 0,
    setTradePrice: (price) => set({ trade: price }),
    setIndexPrice: (price) => set({ index: price }),
}));

export const useNetworkStore = create((set) => ({
    chain: "ethereum", // blockchain 
    chainId: "1", // network (L2 etc)
    setNetwork: async (chain, chainId) => {
        set({ chain: chain, chainId: chainId });
        await saveState(`savedNetwork.chain`, chain);
        await saveState(`savedNetwork.chainId`, chainId);
    },
}));

export const useSourceStore = create((set) => ({
    src: "binance",
    saved: true,
    data: SourceConst.binance,
    setSaved: (bool) => { set({ saved: bool }) },
    setSrc: async (value) => {
        set({ src: value, init: false, saved: true, data: SourceConst[value] });
        await saveState(`savedSource`, value);
        await saveState(`savedSource.data`, SourceConst[value]);
        usePoolStore.getState().onSourceChange(value);
    },
}));

export const useTradingPlatformStore = create((set) => ({
    trader: Trader.Uniswap,
    setPlatform: async (value) => {
        set({ platform: value });
        await saveState(`savedTradingPlatform`, value);
    },
}));

export const usePoolStore = create((set, get) => ({
    address: "0x", // address of pool (case like uniswap) not each symbol
    symbols: "init",
    token0: initToken[0].token0,
    token1: initToken[0].token1,
    feeTier: "",

    setPairFromPairObj: async (obj) => {
        await saveState(`savedPairStore-${useSourceStore.getState().src}`, JSON.stringify(obj));
        set(obj);
    },

    setSingleSymbol: (target, value) => {
        set({ [target]: value });
    },

    onSourceChange: async (priceSourceName) => {
        const savedPairData = await loadState(`savedPairStore-${priceSourceName}`);

        if (savedPairData) {
            set(JSON.parse(savedPairData));
        }
        else { // not pair data saved
            set(SourceConst[priceSourceName].initPairs[0]);
        }
    },

    setPairFromListDB: async (info) => {
        if (info.token0) { // pair entry have additional info 
            set(info);
        }
        else {
            const network = `${useNetworkStore.getState().chain}:${useNetworkStore.getState().chainId}`;
            const symbol0 = useTradingPlatformStore.getState().trader.wrappedMap[info.symbol0] ?? info.symbol0;
            const symbol1 = useTradingPlatformStore.getState().trader.wrappedMap[info.symbol1] ?? info.symbol1;
            let tokenInfo0 = await useTradingPlatformStore.getState().trader.tokenInfoGetter(symbol0, network);
            let tokenInfo1 = await useTradingPlatformStore.getState().trader.tokenInfoGetter(symbol1, network);

            if (!tokenInfo0) {
                tokenInfo0 = { symbol: info.symbol0, address: null, name: "No information", decimals: "18" };
            }
            if (!tokenInfo1) {
                tokenInfo1 = { symbol: info.symbol1, address: null, name: "No information", decimals: "18" };
            }

            set({ symbols: info.symbols, address: null, feeTier: null, token0: tokenInfo0, token1: tokenInfo1 });
        }

        await saveState(`savedPairStore-${useSourceStore.getState().src}`, JSON.stringify(get()));
    },

    // internal symbol swapper, only called from setPriceInvert
    swapSymbols: () =>
        set((state) => ({
            symbol0: state.symbol1,
            symbol1: state.symbol0,
        })),
}));

// This store only tracks priceInvert and proxies its update to PoolStore.
export const usePriceInvertStore = create((set) => ({
    priceInvert: false,
    setPriceInvert: (bool) => {
        set({ priceInvert: bool });
        // When toggled, also swap symbols in pool store
        usePoolStore.getState().swapSymbols();
    },
}));

// User wallet login info 
export const useWalletStore = create((set, get) => ({
    // Common wallet info properties
    address: null,          // string
    signature: null,        // string
    message: null,          // string (the signed message)
    chainId: null,          // number | string
    provider: null,         // "injected" | "walletconnect" | "ledger" | etc.
    connector: null,        // MetaMask / Rabby / OKX / etc.
    blockchain: null,
    networkName: null,      // mainnet, polygon, arbitrum...
    isConnected: false,     // boolean
    loginTime: null,
    approvedAccounts: null,

    /**
     * Update multiple props at once.
     * Only updates keys that exist in the store.
     * Converts string booleans ("true"/"false") to real booleans.
     */
    setWalletInfo: (dataObj) => {
        const validKeys = Object.keys(get());
        const updateObj = {};

        for (const key in dataObj) {
            if (validKeys.includes(key)) {
                let value = dataObj[key];

                // detect boolean strings
                if (value === 'true') value = true;
                else if (value === 'false') value = false;

                updateObj[key] = value;
            }
        }

        set(updateObj);
    },

    /**
     * Set a single property safely.
     * Ignores unknown props.
     */
    setWalletProp: (key, value) => {
        const validKeys = Object.keys(get());

        if (validKeys.includes(key)) {
            set({ [key]: value });
        }
    },

    deleteWalletValue: (key) => {
        const validKeys = Object.keys(get());

        if (validKeys.includes(key)) {
            set({ [key]: null });
        }
    },

    deleteWalletValues: (keys) => {
        const keysArray = [...keys];
        const validKeys = Object.keys(get());

        for (const key of keysArray) {
            if (validKeys.includes(key)) {
                set({ [key]: null });
            }
        }
    },

    /**
     * Clears ALL wallet data — "log off"
     */
    logoutWallet: () => {
        const validKeys = Object.keys(get());
        const cleared = {};

        validKeys.forEach((key) => {
            // keep only functions unmodified
            if (typeof get()[key] !== "function") {
                cleared[key] = null;
            }
        });

        set({ ...cleared, isConnected: false });
    },
}));


// Modal overlay visibility
export const useModalVisibilityStore = create((set) => ({
    wallet: false,
    userSetting: false,
    account: false,
    setModalVisibility: (modal, status) => set({ [modal]: status }),
}));

export default usePriceStore;
