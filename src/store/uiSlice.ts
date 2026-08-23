import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface UiState {
  cartOpen: boolean;
}

const initialState: UiState = { cartOpen: false };

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    openCart: (state) => {
      state.cartOpen = true;
    },
    closeCart: (state) => {
      state.cartOpen = false;
    },
    setCartOpen: (state, action: PayloadAction<boolean>) => {
      state.cartOpen = action.payload;
    },
  },
});

export const { openCart, closeCart, setCartOpen } = uiSlice.actions;
export default uiSlice.reducer;
