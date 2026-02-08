// src/router.tsx
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { FaHome } from "react-icons/fa";
import { ScreenLayout } from "./components/layout/MainScreenLayout";
import { LoginForm } from "./components/login/loginForm";
import { PrivateRoute } from "./components/routing/PrivateRoute";
import { Dashboard } from "./components/dashboard/Dashboard";
import { OrdersList } from "./components/orders/OrdersList";
import { NotFound } from "./components/routing/NotFound";
import { UsersList } from "./components/users/UsersList";
import { BillingList } from "./components/billing/BillingList";
import { CustomerList } from "./components/customers/CustomerList";
import { ActionList } from "./components/actions/ActionList";
import { ProductList } from "./components/products/ProductList";
// ⬇️ IMPORTA ScrollToTop
import ScrollToTop from "./components/layout/ScrollToTop";
import { CreateOrderPage } from "./components/orders/CreateOrderPage";
  
export const router = createBrowserRouter(
  [
    // RUTAS PÚBLICAS
    {
      path: "/",
      element: <Navigate to="/login" replace />,
    },
    {
      path: "/login",
      element: <LoginForm />,
      handle: { crumb: (t: any) => ({ label: t("breadcrumb:login") }) },
    },

    // RUTAS PROTEGIDAS
    {
      element: <PrivateRoute />,
      errorElement: <NotFound />,
      children: [
        {
          path: "/",
          // ⬇️ ENVUELVE EL LAYOUT CON ScrollToTop (así useLocation tiene contexto de Router)
          element: (
            <ScrollToTop>
              <ScreenLayout />
            </ScrollToTop>
          ),
          handle: {
            crumb: () => ({ key: "breadcrumb:home", icon: FaHome, to: "/user/dashboard" }),
            titleKey: "titles:dashboard",
          },
          children: [
            {
              path: "user/dashboard",
              element: <Dashboard />,
              handle: { crumb: () => ({ key: "breadcrumb:dashboard" }), titleKey: "titles:dashboard" },
            },
            {
              path: "user/orders",
              element: <OrdersList />,
              handle: { crumb: () => ({ key: "breadcrumb:orders.list" }), titleKey: "titles:orderList" },
            },
            {
              path: "user/create-order",
              element: <CreateOrderPage />,
              handle: { crumb: () => ({ key: "breadcrumb:orders.new" }), titleKey: "titles:orderEntry" },
            },
            {
              path: "user/user-list",
              element: <Outlet />,
              handle: {
                breadcrumbKey: "breadcrumb:users.label",
                titleKey: "breadcrumb:users.label",
              },
              children: [
                {
                  index: true,
                  element: <UsersList />,
                  handle: {
                    breadcrumbKey: "breadcrumb:users.usersList",
                    titleKey: "titles:userManagement",
                  },
                },
              ],
            },
            {
              path: "user/billing",
              element: <BillingList />,
              handle: { crumb: () => ({ key: "breadcrumb:billing.list" }), titleKey: "titles:billingList" },
            },
            {
              path: "user/customers",
              element: <CustomerList />,
              handle: { crumb: () => ({ key: "breadcrumb:customers.list" }), titleKey: "titles:customersList" },
            },
            {
              path: "user/actions",
              element: <ActionList />,
              handle: { crumb: () => ({ key: "breadcrumb:actions.list" }), titleKey: "titles:actionsList" },
            },
            {
              path: "user/products",
              element: <ProductList />,
              handle: { crumb: () => ({ key: "breadcrumb:products.list" }), titleKey: "titles:productsList" },
            },
            { path: "*", element: <NotFound /> },
          ],
        },
      ],
    },

    { path: "*", element: <NotFound /> },
  ]
  // TODO: Add v7_startTransition flag when React Router v7 is released
  // See: https://reactrouter.com/v6/upgrading/future#v7_starttransition
);

