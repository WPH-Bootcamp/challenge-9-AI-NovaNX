export type CheckoutCartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  restaurantId?: string;
  restaurantName?: string;
};

export type CheckoutRestaurantGroup = {
  restaurantName: string;
  restaurantId?: string;
  items: CheckoutCartItem[];
  subtotal: number;
  itemCount: number;
};

export type CheckoutTotals = {
  itemCount: number;
  itemsTotal: number;
};

export type DeliveryAddress = {
  label: string;
  addressLine: string;
  phone: string;
};

export type PaymentMethod = {
  id: "bca" | "bni" | "bri" | "mandiri";
  label: string;
  abbr: string;
};

export type PaymentSummary = {
  price: number;
  deliveryFee: number;
  serviceFee: number;
  total: number;
};
