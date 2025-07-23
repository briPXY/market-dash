import { initPoolsInfo } from "../idb/init";
import { create } from "zustand";

const usePriceStore = create((set) => ({
	trade: 0,
	index: 0,
	setTradePrice: (price) => set({ trade: price }),
	setIndexPrice: (price) => set({ index: price }),
}));

export const usePoolStore = create((set) => ({
	address: null,
	setAddress: (address) => set({ address: address }),
}));

export const useSourceStore = create((set) => ({
	src: null,
	setSrc: async (value) => {
		const address = await initPoolsInfo(value);
		set({ src: value });
		usePoolStore.setState({ address: address });
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
