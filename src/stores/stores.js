import { dbUpdateProperty, loadState, saveState } from "../idb/stateDB";
import { create } from "zustand";
import { persist } from 'zustand/middleware';
import { initToken } from "../constants/initData";
import { updateMissingPairInfo } from "../idb/tokenListDB";

export const usePriceStore = create(
    persist(
        (set) => ({
            trade: 0,
            index: 0,
            fiatRateSymbol0: 0,
            fiatRateSymbol1: 0,
            fiatSymbol: "USD",
            decimalCount: 2,

            setTradePrice: (price) => set({ trade: price }),
            setIndexPrice: (price) => set({ index: price }),
            setFiat0: (price) => set({ fiatRateSymbol0: price }),
            setFiat1: (price) => set({ fiatRateSymbol1: price }),
            setSymbol: (symbol) => set({ fiatSymbol: symbol }),
            setDecimalCount: (sample) => {
                let count = 2, leading0 = 0;
                const decimalDigits = String(sample).split('.')[1];

                if (decimalDigits) {
                    leading0 = decimalDigits.match(/^0+/);
                }

                if (leading0) {
                    count = leading0[0].length + 2;
                }

                set({ decimalCount: count });
            }
        }),
        {
            name: 'price-storage',
            partialize: (state) => ({
                fiatSymbol: state.fiatSymbol
            }),
        }
    )
);

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
    setSrc: async (value, oraclesList) => { // Now must include source constant obj to prevent access init error
        await saveState(`savedSource`, value);
        await saveState(`savedSource.data`, oraclesList[value]);
        const savedPairData = await loadState(`savedPairStore-${value}`);
        usePoolStore.getState().onSourceChange(oraclesList[value], savedPairData);
        set({ src: value, init: false, saved: true, data: oraclesList[value] });
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
    // all non-key props are mutable in one batch
    idb_key: null, // read-only
    address: null,
    symbols: "init", // read-only
    token0: initToken[0].token0,
    token1: initToken[0].token1,
    feeTier: null,
    liquidity: null, // read-only?
    validatedInfo: null,
    premutated: null,
    tokenOrderSwapped: null,

    getAll: () => {
        return Object.entries(get())
            // eslint-disable-next-line no-unused-vars
            .filter(([_, value]) => typeof value !== 'function')
            .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
    },

    // Set whole states without shallow set with FRESH data (from db or preloaded pair)
    // set with obj from pair-list db which have object schema similiar to this store's states
    // nullify everything (except setter/getter) that's not match store props
    setPairFromPairObj: async (obj) => {
        if (!obj || obj.premutated) {
            console.error("Only pass original pair object");
            return;
        }

        const currentState = get();
        const updatedState = {};
        // updates missing token infos from token-list db (if exist)

        Object.keys(currentState).forEach((key) => {
            if (typeof currentState[key] !== 'function') { // prevent setter/getter being removed
                updatedState[key] = obj[key] ? obj[key] : null;
            }
        });

        updatedState.premutated = { ...obj };

        const { updatedToken0, updatedToken1 } = await updateMissingPairInfo(obj, useNetworkStore.getState().chain, useNetworkStore.getState().chainId);
        updatedState.token0 = updatedToken0;
        updatedState.token1 = updatedToken1;
        updatedState.orderTokenSwapped = false;

        // Follow web3 standard order (address1 > address0) if live price fetch from web3/smartcontract
        if (updatedState.token0.address && updatedState.token1.address) {
            const ordered = updatedToken0.address.toLowerCase() < updatedToken1.address.toLowerCase();
            const [t0, t1] = ordered ? [updatedToken0, updatedToken1] : [updatedToken1, updatedToken0];

            // only flip if followWeb3TokenOrder explicitly set (true)
            if (useSourceStore.getState().data?.followWeb3TokenOrder) {
                updatedState.token0 = t0;
                updatedState.token1 = t1;
            }
            // still need to set so fiat price follow token order
            updatedState.orderTokenSwapped = ordered ? false : true;
        }

        if (usePriceInvertStore.getState().priceInvert) { // User triggered flip
            const temp = updatedState.token0;
            updatedState.token0 = updatedState.token1;
            updatedState.token1 = temp;
        }
        // Only persist original pair data (db version) because states mutated in runtime 
        await saveState(`savedPairStore-${useSourceStore.getState().src}`, obj);
        set(updatedState);
    },

    setState: (state, value) => {
        if (state != "symbols" && state != "idb_key") {
            set({ [state]: value })
        }
    },

    // Set state that also update original data in db entry 
    updatePairData: async (target, value) => {
        if (get().idb_key) {
            await dbUpdateProperty("pair-list", "pair-list", get().idb_key, [target], value);
        }

        const updatedPremutatedData = { ...get().premutated, [target]: value }; // Since it basically db/original data, value also put in premutated 
        await saveState(`savedPairStore-${useSourceStore.getState().src}`, updatedPremutatedData);
        set({ [target]: value, premutated: updatedPremutatedData });
    },

    onSourceChange: async (oracleData, savedPairData) => {
        if (savedPairData) {
            await get().setPairFromPairObj(savedPairData);
            return;
        }
        else {
            await get().setPairFromPairObj(oracleData.initPairs[0]);
            return;
        }
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
