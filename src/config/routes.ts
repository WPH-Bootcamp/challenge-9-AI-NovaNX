export const ROUTES = {
  home: "/",
  menu: "/menu",
  cart: "/cart",
  checkout: "/checkout",
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
