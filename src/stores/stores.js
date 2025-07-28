import { saveState } from "../idb/stateDB";
import { create } from "zustand";

const usePriceStore = create((set) => ({
	trade: 0,
	index: 0,
	setTradePrice: (price) => set({ trade: price }),
	setIndexPrice: (price) => set({ index: price }),
}));

export const usePoolStore = create((set) => ({
	address: "init",
	init: true,
	setAddress: (address) => set({ address: address, init: false }),
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
