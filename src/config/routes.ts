export const ROUTES = {
  home: "/",
  menu: "/menu",
  cart: "/cart",
  addedQuantity: "/added-quantity",
  checkout: "/checkout",
  paymentSuccess: "/payment-success",
  deliveryAddress: "/delivery-address",
  orders: "/orders",
  login: "/login",

  detail: "/detail/:id",

  review: "/review/:restaurantId",

  allRestaurant: "/all-restaurant",
  nearby: "/nearby",
  discount: "/discount",
  bestSeller: "/best-seller",
  delivery: "/delivery",
  lunch: "/lunch",
} as const;
