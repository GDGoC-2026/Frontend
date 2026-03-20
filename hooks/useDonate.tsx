import {create} from "zustand";
import {Donate} from "@/types/donate";

export const useDonate = create<Donate>()((set) => ({
  count: 0,
  donate: () => set((state) => ({ count: state.count + 1})),
}));
