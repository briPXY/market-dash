
import { create } from "zustand";

const usePriceStore = create((set) => ({
	trade: 0,
	index: 0,
	setTradePrice: (price) => set({ trade: price }),
	setIndexPrice: (price) => set({ index: price }),
}));

export const useSymbolStore = create((set) => ({
	symbolIn: 'USDT',
	symbolOut: 'ETH',
	setSymbolIn: (value) => set({ symbolIn: value, }),
	setSymbolOut: (value) => set({ symbolOut: value }),
}));

export default usePriceStore;
