import { getTokenBySymbolChainId } from "../idb/tokenListDB";
import { SourceConst } from "../constants/sourceConst";
import { saveState } from "../idb/stateDB";
import { create } from "zustand";

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
        usePoolStore.getState().onSourceChange(value);
        await saveState(`savedSource`, value);
        await saveState(`savedSource.data`, SourceConst[value]);
    },
}));

export const useTradingPlatformStore = create((set) => ({
    platform: "uniswap",
    setPlatform: async (value) => {
        set({ platform: value });
        await saveState(`savedTradingPlatform`, value);
    },
}));

export const usePoolStore = create((set, get) => ({
    address: "0x", // address of pool (case like uniswap) not each symbol
    symbols: "BTCUSDT",
    token0: SourceConst.binance.initPairs[0].token0,
    token1: SourceConst.binance.initPairs[0].token1,
    feeTier: "",

    setPairFromPairObj: (obj) => {
        set(obj);
    },

    setSingleSymbol: (target, value) => {
        set({ [target]: value });
    },

    onSourceChange: async(priceSourceName) => {
        const savedPairData = localStorage.getItem(`savedPairStore-${priceSourceName}`);

        if (savedPairData) {
            set(JSON.parse(savedPairData));
        }
        else { // not pair data saved
            set(SourceConst[priceSourceName].initPairs[0]);
        }
    },

    setPairFromListDB: async (info, notFoundCallback = function () { }) => {
        if (info.token0) { // pair entry have additional info 
            set(info);
        }
        else {
            const network = useNetworkStore.getState().chain + useNetworkStore.getState().chainId;
            const tokenInfo0 = await getTokenBySymbolChainId(info.symbol0.toUppserCase(), network);
            const tokenInfo1 = await getTokenBySymbolChainId(info.symbol1.toUppserCase(), network);
            set({ symbols: info.symbols, address: null, feeTier: null, token0: tokenInfo0, token1: tokenInfo1 });

            if (!tokenInfo0 || !tokenInfo1) {
                notFoundCallback({ tokenInfo0, tokenInfo1 });
            }
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
    account: false,
    setModalVisibility: (modal, status) => set({ [modal]: status }),
}));

export default usePriceStore;
