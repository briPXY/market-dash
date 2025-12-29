import { dbUpdateProperty, loadState, saveState } from "../idb/stateDB";
import { create } from "zustand";
import { initToken } from "../constants/initData";
import { updateMissingPairInfo } from "../idb/tokenListDB";

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

export const useTradingPlatformStore = create((set) => ({
    trader: "Uniswap",
    props: {},
    setTrader: (traderObjName, traderObj) => {
        set({ trader: traderObjName, props: traderObj[traderObjName] });
    }
}));

export const usePoolStore = create((set, get) => ({
    idb_key: null, // read-only
    address: null, // 
    symbols: "init", // read-only
    token0: initToken[0].token0, // switchable
    token1: initToken[0].token1, // switchable
    feeTier: null,
    liquidity: null, // read-only unless updating from null
    validatedInfo: null,

    getAll: () => {
        return Object.entries(get())
            // eslint-disable-next-line no-unused-vars
            .filter(([_, value]) => typeof value !== 'function')
            .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
    },

    // pair changes, set whole prop without shallow set
    // get extra tokens infos from token-list db (if exist)
    // set with obj from pair-list db which have object schema similiar to this store's states
    // nullify everything (except setter/getter) that's not match store props
    setPairFromPairObj: async (obj) => {
        const currentState = get();
        const updatedState = {};
        // updates missing token infos
        const { updatedToken0, updatedToken1 } = await updateMissingPairInfo(obj, useNetworkStore.getState().chain, useNetworkStore.getState().chainId);
        obj.token0 = updatedToken0;
        obj.token1 = updatedToken1;
        
        Object.keys(currentState).forEach((key) => {
            if (typeof currentState[key] !== 'function') { // prevent setter/getter being removed
                updatedState[key] = obj[key] ? obj[key] : null;
            }
        });
        
        await saveState(`savedPairStore-${useSourceStore.getState().src}`, updatedState);
        set(updatedState);
    },

    setState: (state, value) => set({ [state]: value }),

    // set a store state and update a db entry with idb_key key, usage only for missing data in the entry
    updatePairData: (target, value) => {
        if (get().idb_key) {
            dbUpdateProperty("pair-list", "pair-list", get().idb_key, [target], value);
            set({ [target]: value });
            return;
        }
        
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
