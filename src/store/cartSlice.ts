import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  stock: number;
  variant: string | null;
  quantity: number;
}

interface CartState {
  items: CartItem[];
}

const initialState: CartState = { items: [] };

function sameLine(a: CartItem, productId: string, variant: string | null) {
  return a.productId === productId && a.variant === variant;
}

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<CartItem>) => {
      const incoming = action.payload;
      const existing = state.items.find((i) => sameLine(i, incoming.productId, incoming.variant));
      if (existing) {
        existing.quantity = Math.min(existing.stock, existing.quantity + incoming.quantity);
      } else {
        state.items.push(incoming);
      }
    },
    incrementItem: (state, action: PayloadAction<{ productId: string; variant: string | null }>) => {
      const item = state.items.find((i) => sameLine(i, action.payload.productId, action.payload.variant));
      if (item && item.quantity < item.stock) item.quantity += 1;
    },
    decrementItem: (state, action: PayloadAction<{ productId: string; variant: string | null }>) => {
      const item = state.items.find((i) => sameLine(i, action.payload.productId, action.payload.variant));
      if (item) {
        item.quantity -= 1;
        if (item.quantity <= 0) {
          state.items = state.items.filter((i) => i !== item);
        }
      }
    },
    removeItem: (state, action: PayloadAction<{ productId: string; variant: string | null }>) => {
      state.items = state.items.filter((i) => !sameLine(i, action.payload.productId, action.payload.variant));
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addItem, incrementItem, decrementItem, removeItem, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
