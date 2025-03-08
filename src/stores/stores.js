import { create } from "zustand";

const usePriceStore = create((set) => ({
  trade: 0,
  index: 0,
  setTradePrice: (price) => set({ trade: price }),
  setIndexPrice: (price) => set({ index: price }),
}));

export default usePriceStore;
