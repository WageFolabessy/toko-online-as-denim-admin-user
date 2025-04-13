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
import Payment from "./pages/Payment";
import Shipment from "./pages/Shipment";
import User from "./pages/User";
import Review from "./pages/Review";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
import SalesReport from "./pages/SaleReport";
import { AppContext } from "./context/AppContext";

const App = () => {
  const { token } = useContext(AppContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="bg-indigo-50 min-h-screen">
      <ToastContainer />
      {token ? (
        <>
          <Navbar setIsSidebarOpen={setIsSidebarOpen} />
          <div className="flex pt-16">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <main className="flex-1 min-h-screen p-4 md:p-6 lg:p-8 overflow-y-auto">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/products" element={<Product />} />
                <Route path="/categories" element={<Category />} />
                <Route path="/orders" element={<Order />} />
                <Route path="/payments" element={<Payment />} />
                <Route path="/shipments" element={<Shipment />} />
                <Route path="/users" element={<User />} />
                <Route path="/reviews" element={<Review />} />
                <Route path="/report" element={<SalesReport />} />
                <Route path="/admins" element={<Admin />} />
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
