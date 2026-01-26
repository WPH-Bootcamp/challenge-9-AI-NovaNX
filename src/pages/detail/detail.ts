export type RestaurantSummary = {
  id: string;
  name: string;
  star?: number;
  place?: string;
  lat?: number;
  long?: number;
  imageUrl?: string;
  images?: string[];
};

export type RestaurantMenuItem = {
  id: string;
  name: string;
  type?: string;
  price?: number;
  imageUrl?: string;
  description?: string;
};

export type RestaurantDetail = {
  id: string;
  name: string;
  star?: number;
  place?: string;
  lat?: number;
  long?: number;
  imageUrl?: string;
  images?: string[];
  menus: RestaurantMenuItem[];
};
