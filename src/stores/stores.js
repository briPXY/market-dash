import { loadState, saveState } from "../idb/stateDB";
import { create } from "zustand";
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
    src: null,
    data: null,
    setSaved: (bool) => { set({ saved: bool }) },
    setSrc: async (value, sourceConstObj) => { // Now must include source constant obj to prevent access init error
        await saveState(`savedSource`, value);
        await saveState(`savedSource.data`, sourceConstObj[value]);
        const savedPairData = await loadState(`savedPairStore-${value}`);
        usePoolStore.getState().onSourceChange(value, savedPairData, sourceConstObj[value].initPairs[0]);
        set({ src: value, init: false, saved: true, data: sourceConstObj[value] });
    },
}));

export const useTradingPlatformStore = create(() => ({
    trader: "Uniswap"
}));

export const usePoolStore = create((set, get) => ({
    address: null, // address of pool (case like uniswap) not each symbol
    symbols: "init",
    token0: initToken[0].token0,
    token1: initToken[0].token1,
    feeTier: null,

    getAll: () => {
        return Object.entries(get())
            // eslint-disable-next-line no-unused-vars
            .filter(([_, value]) => typeof value !== 'function')
            .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
    },

    setPairFromPairObj: async (obj) => {
        const currentState = get();
        const updatedState = {};

        Object.keys(currentState).forEach((key) => {
            if (typeof currentState[key] !== 'function') { // prevent setter/getter being removed
                updatedState[key] = obj[key] ? obj[key] : null;
            }
        });

        await saveState(`savedPairStore-${useSourceStore.getState().src}`, updatedState);
        set(updatedState);
    },

    setSingleSymbol: (target, value) => {
        set({ [target]: value });
    },

    onSourceChange: async (priceSourceName, savedPairData, initPairs) => {
        let newData = {};
        const currentState = get();
        const updatedState = {};

        if (savedPairData && savedPairData.symbols) {
            newData = savedPairData;
        }
        else { // no pair data saved
            newData = initPairs;
        }

        Object.keys(currentState).forEach((key) => { // prevent shallow copy of props
            if (typeof currentState[key] !== 'function') { // prevent setter/getter being removed
                updatedState[key] = newData[key] ? newData[key] : null;
            }
        });

        await saveState(`savedPairStore-${priceSourceName}`, updatedState);
        set(updatedState);
    },

    setPairFromListDB: async (info) => {
        let newPairInfo;
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

            newPairInfo = { symbols: info.symbols, address: null, feeTier: null, token0: tokenInfo0, token1: tokenInfo1 };
            set(newPairInfo);
        }

        await saveState(`savedPairStore-${useSourceStore.getState().src}`, newPairInfo);
    },

    // internal symbol swapper, only called from setPriceInvert
    swapSymbols: () =>
        set((state) => {
            const s0 = state.token0;
            const s1 = state.token1;
            return { token0: s1, token1: s0, };
        }),
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

    getAll: () => {
        return Object.entries(get())
            // eslint-disable-next-line no-unused-vars
            .filter(([_, value]) => typeof value !== 'function')
            .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
    },

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

// App init states (prevent rapid re-render at init)
export const useAppInitStore = create((set) => ({
    initState: null, // string msg
    initDone: false, // bool only
    setState: (state, status) => set({ [state]: status }),
}));

export default usePriceStore;
