import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type SortBy = "price" | "rating" | "name";
export type SortOrder = "asc" | "desc";

export type FiltersState = {
  categoryId: string | null;
  search: string;
  sortBy: SortBy | null;
  sortOrder: SortOrder;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
};

const initialState: FiltersState = {
  categoryId: null,
  search: "",
  sortBy: null,
  sortOrder: "asc",
};

const filtersSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    setCategoryId(state, action: PayloadAction<string | null>) {
      state.categoryId = action.payload;
    },
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },
    setSort(
      state,
      action: PayloadAction<{ sortBy: SortBy | null; sortOrder?: SortOrder }>,
    ) {
      state.sortBy = action.payload.sortBy;
      if (action.payload.sortOrder) state.sortOrder = action.payload.sortOrder;
    },
    setMinPrice(state, action: PayloadAction<number | undefined>) {
      state.minPrice = action.payload;
    },
    setMaxPrice(state, action: PayloadAction<number | undefined>) {
      state.maxPrice = action.payload;
    },
    setMinRating(state, action: PayloadAction<number | undefined>) {
      state.minRating = action.payload;
    },
    resetFilters() {
      return initialState;
    },
  },
});

export const {
  setCategoryId,
  setSearch,
  setSort,
  setMinPrice,
  setMaxPrice,
  setMinRating,
  resetFilters,
} = filtersSlice.actions;

export default filtersSlice.reducer;
