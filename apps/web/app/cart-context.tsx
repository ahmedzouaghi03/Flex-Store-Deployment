"use client";

import { createContext, useContext, useState } from "react";
import { useCartStore } from "@/lib/cartStore";
import type { CartItem } from "@/types";

type CartCtx = {
  items: CartItem[];
  count: number;
  total: number;
  isHydrated: boolean;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addItem: (item: Omit<CartItem, "id"> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  changeVariant: (oldId: string, next: Omit<CartItem, "id"> & { quantity: number }) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartCtx>({
  items: [],
  count: 0,
  total: 0,
  isHydrated: false,
  drawerOpen: false,
  openDrawer: () => {},
  closeDrawer: () => {},
  addItem: () => {},
  removeItem: () => {},
  updateQty: () => {},
  changeVariant: () => {},
  clearCart: () => {},
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const store = useCartStore();
  const [drawerOpen, setDrawerOpen] = useState(false);

  function addItem(raw: Omit<CartItem, "id"> & { quantity?: number }) {
    store.addItem({ ...raw, id: raw.variantId, quantity: raw.quantity ?? 1 });
    setDrawerOpen(true);
  }

  function changeVariant(oldId: string, next: Omit<CartItem, "id"> & { quantity: number }) {
    store.changeVariant(oldId, { ...next, id: next.variantId });
  }

  const total = store.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items: store.items,
        count: store.items.reduce((s, i) => s + i.quantity, 0),
        total,
        isHydrated: store._hasHydrated,
        drawerOpen,
        openDrawer: () => setDrawerOpen(true),
        closeDrawer: () => setDrawerOpen(false),
        addItem,
        removeItem: store.removeItem,
        updateQty: store.updateQuantity,
        changeVariant,
        clearCart: store.clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
