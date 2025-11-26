import { SourceConst } from "../constants/sourceConst";
import { saveState } from "../idb/stateDB";
import { create } from "zustand";

export const usePriceStore = create((set) => ({
    trade: 0,
    index: 0,
    setTradePrice: (price) => set({ trade: price }),
    setIndexPrice: (price) => set({ index: price }),
}));

export const useSourceStore = create((set) => ({
    src: "init",
    init: true,
    saved: true,
    setSaved: (bool) => { set({ saved: bool }) },
    setSrc: async (value) => {
        set({ src: value, init: false, saved: true });
        await saveState(`savedNetwork`, value);
    },
}));

export const usePoolStore = create((set) => ({
    address: "init",
    init: true,
    symbol0: "",
    symbol1: "",

    setAddress: (address) => {
        set({
            address,
            init: false,
            symbol0: SourceConst[useSourceStore.getState().src].info[address].token0.symbol,
            symbol1: SourceConst[useSourceStore.getState().src].info[address].token1.symbol,
        });
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
