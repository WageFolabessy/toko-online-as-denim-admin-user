import { useContext, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Login from "./components/Login";
import Dashboard from "./pages/Dashboard";
import Product from "./pages/Product";
import Category from "./pages/Category";
import Order from "./pages/Order";
import Shipment from "./pages/Shipment";
import User from "./pages/User";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
import SalesReport from "./pages/SaleReport";
import { AppContext } from "./context/AppContext";

const App = () => {
  const { token } = useContext(AppContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800">
      <ToastContainer />
      {token ? (
        <>
          <Navbar setIsSidebarOpen={setIsSidebarOpen} />
          <div className="flex">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <main className="flex-1 min-h-screen pt-16 p-6 overflow-y-auto">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/profil" element={<Profile />} />
                <Route path="/produk" element={<Product />} />
                <Route path="/kategori" element={<Category />} />
                <Route path="/pesanan" element={<Order />} />
                <Route path="/pengiriman" element={<Shipment />} />
                <Route path="/pelanggan" element={<User />} />
                <Route path="/laporan" element={<SalesReport />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
          </div>
        </>
      ) : (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      )}
    </div>
  );
};

export default App;
