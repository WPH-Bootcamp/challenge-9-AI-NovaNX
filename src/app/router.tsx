import { createBrowserRouter } from "react-router-dom";

import { LoginPage } from "../pages/login/LoginPage.tsx";
import { HomePage } from "../pages/home.tsx";
import { MenuPage } from "../pages/menu/MenuPage";
import { CartPage } from "../pages/cart/CartPage";
import { CheckoutPage } from "../pages/checkout/CheckoutPage";
import { OrdersPage } from "../pages/orders/OrdersPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { QuickNavPage } from "../pages/quicknav/QuickNavPage.tsx";
import { RecommendedRestaurantPage } from "../pages/recommendedrestaurant/RecommendedRestaurant.tsx";
import { DetailPage } from "../pages/detail/detail.tsx";
import { ReviewPage } from "../pages/review/review.tsx";

import { AppLayout } from "../components/layout/AppLayout";
import { RequireAuth } from "../components/layout/RequireAuth";
import { ROUTES } from "../config/routes";

export const router = createBrowserRouter([
  {
    path: ROUTES.login,
    element: <LoginPage />,
  },
  {
    element: <RequireAuth />,
    children: [
      {
        path: ROUTES.home,
        element: <HomePage />,
      },
      {
        path: ROUTES.bestSeller,
        element: <RecommendedRestaurantPage />,
      },
      {
        path: ROUTES.detail,
        element: <DetailPage />,
      },
      {
        element: <AppLayout />,
        children: [
          { path: ROUTES.menu, element: <MenuPage /> },
          { path: ROUTES.review, element: <ReviewPage /> },
          {
            path: ROUTES.allRestaurant,
            element: <QuickNavPage title="All Restaurant" />,
          },
          { path: ROUTES.nearby, element: <QuickNavPage title="Nearby" /> },
          {
            path: ROUTES.discount,
            element: <QuickNavPage title="Discount" />,
          },
          {
            path: ROUTES.delivery,
            element: <QuickNavPage title="Delivery" />,
          },
          { path: ROUTES.lunch, element: <QuickNavPage title="Lunch" /> },
          { path: ROUTES.cart, element: <CartPage /> },
          { path: ROUTES.checkout, element: <CheckoutPage /> },
          { path: ROUTES.orders, element: <OrdersPage /> },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
