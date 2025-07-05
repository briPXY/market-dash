import { create } from "zustand";

const usePriceStore = create((set) => ({
	trade: 0,
	index: 0,
	setTradePrice: (price) => set({ trade: price }),
	setIndexPrice: (price) => set({ index: price }),
}));

export const useSymbolStore = create((set) => ({
	symbolIn: null,
	symbolOut: null,
	setSymbolIn: (value) => set({ symbolIn: value }),
	setSymbolOut: (value) => set({ symbolOut: value }),
	setAll: (symbolIn, symbolOut) => set({ symbolIn: symbolIn, symbolOut: symbolOut }),
	resetSymbols: () => set({ symbolIn: null, symbolOut: null }),
}));

export const useSourceStore = create((set) => ({
	src: null,
	setSrc: (value) => {
		set({ src: value });
		useSymbolStore.getState().resetSymbols(); // Reset symbols when source changes
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

export default usePriceStore;
