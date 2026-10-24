import { createBrowserRouter } from "react-router";
import Root from "./pages/Root";
import Home from "./pages/Home";
import Products from "./pages/Products";
import StoreLocator from "./pages/StoreLocator";
import About from "./pages/About";
import Services from "./pages/Services";
import NotFound from "./pages/NotFound";
import AdminLogin from "./admin/AdminLogin";
import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./admin/AdminDashboard";
import AdminProducts from "./admin/AdminProducts";
import AdminStores from "./admin/AdminStores";
import AdminServices from "./admin/AdminServices";
import AdminUsers from "./admin/AdminUsers";
import AdminProfile from "./admin/AdminProfile";
import AdminTeam from "./admin/AdminTeam";
import { ADMIN_BASE_PATH } from "./admin/adminPaths";
import AdminStock from "./admin/AdminStock";
import AdminOrders from "./admin/AdminOrders";
import Cart from "./pages/Cart";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "products", Component: Products },
      { path: "cart", Component: Cart },
      { path: "services", Component: Services },
      { path: "store-locator", Component: StoreLocator },
      { path: "about", Component: About },
      { path: "*", Component: NotFound },
    ],
  },
  {
    path: ADMIN_BASE_PATH,
    children: [
      { index: true, Component: AdminLogin },
      {
        Component: AdminLayout,
        children: [
          { path: "dashboard", Component: AdminDashboard },
          { path: "products", Component: AdminProducts },
          { path: "stock", Component: AdminStock },
          { path: "orders", Component: AdminOrders },
          { path: "stores", Component: AdminStores },
          { path: "services", Component: AdminServices },
          { path: "team", Component: AdminTeam },
          { path: "users", Component: AdminUsers },
          { path: "profile", Component: AdminProfile },
          { path: "*", Component: NotFound },
        ],
      },
    ],
  },
]);
