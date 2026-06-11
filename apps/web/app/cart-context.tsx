"use client";

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import type { CartItem } from "@/types";

type State = { items: CartItem[] };
type Action =
  | { type: "ADD"; item: CartItem }
  | { type: "REMOVE"; id: string }
  | { type: "UPDATE_QTY"; id: string; qty: number }
  | { type: "CLEAR" }
  | { type: "HYDRATE"; items: CartItem[] };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "HYDRATE":
      return { items: action.items };
    case "ADD": {
      const existing = state.items.find((i) => i.id === action.item.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === action.item.id
              ? { ...i, quantity: i.quantity + action.item.quantity }
              : i,
          ),
        };
      }
      return { items: [...state.items, action.item] };
    }
    case "REMOVE":
      return { items: state.items.filter((i) => i.id !== action.id) };
    case "UPDATE_QTY":
      return {
        items: state.items
          .map((i) => (i.id === action.id ? { ...i, quantity: action.qty } : i))
          .filter((i) => i.quantity > 0),
      };
    case "CLEAR":
      return { items: [] };
    default:
      return state;
  }
}

type CartCtx = {
  items: CartItem[];
  count: number;
  totalCents: number;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addItem: (item: Omit<CartItem, "id" | "quantity"> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartCtx>({
  items: [], count: 0, totalCents: 0,
  drawerOpen: false, openDrawer: () => {}, closeDrawer: () => {},
  addItem: () => {}, removeItem: () => {}, updateQty: () => {}, clearCart: () => {},
});

const STORAGE_KEY = "flex-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [] });
  const [drawerOpen, setDrawerOpen] = useState(false);

  // hydrate from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) dispatch({ type: "HYDRATE", items: JSON.parse(raw) as CartItem[] });
    } catch {}
  }, []);

  // persist to localStorage on every change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
  }, [state.items]);

  function addItem(raw: Omit<CartItem, "id" | "quantity"> & { quantity?: number }) {
    const id = `${raw.productId}--${raw.size ?? "_"}--${raw.colorName ?? "_"}`;
    dispatch({ type: "ADD", item: { ...raw, id, quantity: raw.quantity ?? 1 } });
    setDrawerOpen(true);
  }

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        count: state.items.reduce((s, i) => s + i.quantity, 0),
        totalCents: state.items.reduce((s, i) => s + i.priceCents * i.quantity, 0),
        drawerOpen,
        openDrawer: () => setDrawerOpen(true),
        closeDrawer: () => setDrawerOpen(false),
        addItem,
        removeItem: (id) => dispatch({ type: "REMOVE", id }),
        updateQty: (id, qty) => dispatch({ type: "UPDATE_QTY", id, qty }),
        clearCart: () => dispatch({ type: "CLEAR" }),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
