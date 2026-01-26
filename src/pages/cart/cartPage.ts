export type CartPageItem = {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  quantity: number;
  restaurantId?: string;
  restaurantName?: string;
};

export type CartPageTotals = {
  itemCount: number;
  totalPrice: number;
};

export type CartRestaurantGroup = {
  restaurantName: string;
  restaurantId?: string;
  items: CartPageItem[];
  subtotal: number;
  itemCount: number;
};
