import { create } from "zustand";

const usePriceStore = create((set) => ({
	trade: 0,
	index: 0,
	setTradePrice: (price) => set({ trade: price }),
	setIndexPrice: (price) => set({ index: price }),
}));

export const useSymbolStore = create((set) => ({
	symbolIn: 'ETH',
	symbolOut: 'USDT',
	setSymbolIn: (value) => set({ symbolIn: value }),
	setSymbolOut: (value) => set({ symbolOut: value }),
	setAll: (symbolIn, symbolOut) => set({ symbolIn: symbolIn, symbolOut: symbolOut }),
}));

export const useSourceStore = create((set) => ({
	src: 'binance',
	setSrc: (value) => set({ src: value }),
}));

export default usePriceStore;
