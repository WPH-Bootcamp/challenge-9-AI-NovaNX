import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  restaurantId?: string;
  restaurantName?: string;
  quantity: number;
};

type CartState = {
  itemsById: Record<string, CartItem>;
};

const initialState: CartState = {
  itemsById: {},
};

type AddToCartPayload = Omit<CartItem, "quantity"> & { quantity?: number };

type SetQuantityPayload = {
  id: string;
  quantity: number;
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<AddToCartPayload>) {
      const { id, name, price, imageUrl, restaurantId, restaurantName } =
        action.payload;
      const quantityToAdd = action.payload.quantity ?? 1;

      const existing = state.itemsById[id];
      if (existing) {
        existing.quantity += quantityToAdd;
        if (!existing.restaurantId && restaurantId)
          existing.restaurantId = restaurantId;
        if (!existing.restaurantName && restaurantName)
          existing.restaurantName = restaurantName;
        return;
      }

      state.itemsById[id] = {
        id,
        name,
        price,
        imageUrl,
        restaurantId,
        restaurantName,
        quantity: quantityToAdd,
      };
    },
    removeFromCart(state, action: PayloadAction<{ id: string }>) {
      delete state.itemsById[action.payload.id];
    },
    setQuantity(state, action: PayloadAction<SetQuantityPayload>) {
      const item = state.itemsById[action.payload.id];
      if (!item) return;

      item.quantity = Math.max(0, Math.floor(action.payload.quantity));
      if (item.quantity === 0) {
        delete state.itemsById[action.payload.id];
      }
    },
    clearCart(state) {
      state.itemsById = {};
    },
  },
});

export const { addToCart, removeFromCart, setQuantity, clearCart } =
  cartSlice.actions;
export default cartSlice.reducer;
