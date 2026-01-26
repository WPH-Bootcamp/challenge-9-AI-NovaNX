import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./cart/cartSlice";
import filtersReducer from "./filters/filtersSlice";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    filters: filtersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
