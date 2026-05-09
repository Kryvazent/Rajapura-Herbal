import { createBrowserRouter } from "react-router";
import Root from "./pages/Root";
import Home from "./pages/Home";
import Products from "./pages/Products";
import StoreLocator from "./pages/StoreLocator";
import About from "./pages/About";
import Services from "./pages/Services";
import AdminLogin from "./admin/AdminLogin";
import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./admin/AdminDashboard";
import AdminProducts from "./admin/AdminProducts";
// import AdminLogin from "./admin/AdminLogin";
// import AdminLayout from "./admin/AdminLayout";
// import AdminDashboard from "./admin/AdminDashboard";
// import AdminProducts from "./admin/AdminProducts";
import AdminStores from "./admin/AdminStores";
import AdminServices from "./admin/AdminServices";

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
    ],
  },
  { path: "/admin", Component: AdminLogin },
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
      { path: "dashboard", Component: AdminDashboard },
      { path: "products", Component: AdminProducts },
      { path: "stores", Component: AdminStores },
      { path: "services", Component: AdminServices },
    ],
  },
]);