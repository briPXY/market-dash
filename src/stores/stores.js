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
export const useWalletStore = create((set) => ({
    address: null,          // string | null
    signature: null,        // string | null
    message: null,          // string | null

    setWalletInfo: ({ address, signature, message }) =>
        set({ address, signature, message }),

    clearWalletInfo: () =>
        set({ address: null, signature: null, message: null }),
}));

// Modal overlay visibility
export const useModalVisibilityStore = create((set) => ({
    wallet: false,
    setModalVisibility: (modal, status) => set({ [modal]: status }),
}));

export default usePriceStore;
