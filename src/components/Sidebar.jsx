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
    { name: "Pengguna", icon: <FaUsers />, path: "/users" },
    { name: "Ulasan Produk", icon: <FaStar />, path: "/reviews" },
    { name: "Laporan Penjualan", icon: <FaChartLine />, path: "/report" },
    { name: "Admin", icon: <FaUserShield />, path: "/admins" },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 md:sticky md:top-16 md:block z-40 bg-gray-900 w-64 transition-transform transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="h-full flex flex-col">
          {/* Mobile header */}
          <div className="md:hidden flex justify-between items-center bg-gray-800 p-4">
            <h2 className="text-white font-semibold text-lg">Menu</h2>
            <button onClick={() => setIsOpen(false)} className="text-white">
              <FaTimes className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto mt-2">
            {menuItems.map((item, index) => (
              <NavLink
                key={index}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-gray-800 text-white"
                      : "text-gray-300 hover:bg-gray-800"
                  }`
                }
              >
                <span className="text-lg">{item.icon}</span>
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
