import PropTypes from "prop-types";
import { NavLink } from "react-router-dom";
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
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 md:sticky md:top-16 md:block z-40 bg-red-900 w-64 transition-transform transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
        aria-label="Sidebar"
      >
        <div className="h-full flex flex-col">
          <div className="md:hidden flex justify-between items-center p-4 bg-red-800 border-b border-red-700">
            <h2 className="text-red-100 font-semibold text-lg">Menu</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-red-200 hover:text-white"
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
                    className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out group ${
                      // Kelas diterapkan di sini
                      isActive
                        ? "bg-indigo-700 text-white font-semibold"
                        : "text-red-100 hover:bg-indigo-700 hover:text-white"
                    }`}
                  >
                    <span
                      className={`text-lg ${
                        isActive
                          ? "text-white"
                          : "text-red-300 group-hover:text-indigo-100"
                      }`}
                    >
                      {item.icon}
                    </span>
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
