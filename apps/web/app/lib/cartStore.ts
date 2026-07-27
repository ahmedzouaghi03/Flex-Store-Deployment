import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types";

type CartState = {
  items: CartItem[];
  _hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  changeVariant: (oldVariantId: string, next: CartItem) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      _hasHydrated: false,
      setHasHydrated: (v) => set({ _hasHydrated: v }),

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.variantId === item.variantId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.variantId === item.variantId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i,
              ),
            };
          }
          return { items: [...state.items, item] };
        }),

      removeItem: (variantId) =>
        set((state) => ({
          items: state.items.filter((i) => i.variantId !== variantId),
        })),

      updateQuantity: (variantId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return { items: state.items.filter((i) => i.variantId !== variantId) };
          }
          return {
            items: state.items.map((i) =>
              i.variantId === variantId ? { ...i, quantity } : i,
            ),
          };
        }),

      changeVariant: (oldVariantId, next) =>
        set((state) => {
          const withoutOld = state.items.filter((i) => i.variantId !== oldVariantId);
          const existing = withoutOld.find((i) => i.variantId === next.variantId);
          if (existing) {
            return {
              items: withoutOld.map((i) =>
                i.variantId === next.variantId
                  ? { ...i, quantity: i.quantity + next.quantity }
                  : i,
              ),
            };
          }
          return { items: [...withoutOld, next] };
        }),

      clearCart: () => set({ items: [] }),
    }),
    {
      name: "flex-cart",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
