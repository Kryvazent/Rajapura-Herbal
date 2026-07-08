import { Outlet } from "react-router";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

export default function Root() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#FAF6EE" }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
