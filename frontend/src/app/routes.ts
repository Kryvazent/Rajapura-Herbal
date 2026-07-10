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
import { ADMIN_BASE_PATH } from "./admin/adminPaths";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "products", Component: Products },
      { path: "services", Component: Services },
      { path: "store-locator", Component: StoreLocator },
      { path: "about", Component: About },
      { path: "*", Component: NotFound },
    ],
  },
  { path: ADMIN_BASE_PATH, Component: AdminLogin },
  {
    path: ADMIN_BASE_PATH,
    Component: AdminLayout,
    children: [
      { path: "dashboard", Component: AdminDashboard },
      { path: "products", Component: AdminProducts },
      { path: "stores", Component: AdminStores },
      { path: "services", Component: AdminServices },
      { path: "users", Component: AdminUsers },
      { path: "profile", Component: AdminProfile },
      { path: "*", Component: NotFound },
    ],
  },
]);
