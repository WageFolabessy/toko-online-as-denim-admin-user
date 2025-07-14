import PropTypes from "prop-types";
import { NavLink, Link } from "react-router-dom";
import { assets } from "../assets/assets";
import {
  FaTimes,
  FaTachometerAlt,
  FaBoxOpen,
  FaTags,
  FaShoppingCart,
  FaMoneyBillWave,
  FaTruck,
  FaUsers,
  FaStar,
  FaUserShield,
  FaChartLine,
} from "react-icons/fa";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const menuItems = [
    { name: "Dashboard", icon: <FaTachometerAlt />, path: "/" },
    { name: "Kategori", icon: <FaTags />, path: "/categories" },
    { name: "Produk", icon: <FaBoxOpen />, path: "/products" },
    { name: "Pesanan", icon: <FaShoppingCart />, path: "/orders" },
    { name: "Pembayaran", icon: <FaMoneyBillWave />, path: "/payments" },
    { name: "Pengiriman", icon: <FaTruck />, path: "/shipments" },
    { name: "Ulasan Produk", icon: <FaStar />, path: "/reviews" },
    { name: "Laporan Penjualan", icon: <FaChartLine />, path: "/report" },
    { name: "Manajemen Pengguna", icon: <FaUsers />, path: "/users" },
    { name: "Manajemen Admin", icon: <FaUserShield />, path: "/admins" },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-zinc-900 w-64 transition-transform transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:sticky md:translate-x-0 md:z-40`}
        style={{ height: "100vh" }}
        aria-label="Sidebar"
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between h-16 px-4 border-b border-zinc-800 flex-shrink-0">
            <Link to="/" className="flex items-center gap-2">
              <img
                src={assets.as_denim_logo}
                alt="Logo"
                className="h-8 w-auto"
              />
              <span className="text-white font-bold text-xl">AS Denim</span>
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="md:hidden text-zinc-400 hover:text-white"
              aria-label="Close sidebar"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>

          <nav
            className="flex-1 overflow-y-auto py-4 space-y-1"
            role="navigation"
          >
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
              >
                {({ isActive }) => (
                  <div
                    className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-md text-sm font-medium transition-colors duration-150 group ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    {item.name}
                  </div>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};

Sidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  setIsOpen: PropTypes.func.isRequired,
};

export default Sidebar;
