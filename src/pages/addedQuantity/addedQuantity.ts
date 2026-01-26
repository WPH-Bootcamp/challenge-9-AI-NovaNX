export type AddedQuantityItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  restaurantId?: string;
  restaurantName?: string;
};

export type AddedQuantityTotals = {
  itemCount: number;
  totalPrice: number;
};
