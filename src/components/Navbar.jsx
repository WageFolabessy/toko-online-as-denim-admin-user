import { useState, useRef, useEffect, useContext } from "react";
import { FiChevronDown, FiUser, FiLogOut, FiMenu } from "react-icons/fi";
import { assets } from "../assets/assets";
import { Link } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const Navbar = ({ setIsSidebarOpen }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { handleLogout, user } = useContext(AppContext);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 w-full z-50 bg-white border-b shadow-sm h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        <div className="flex items-center">
          {/* Sidebar toggle */}
          <button
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            className="md:hidden mr-4 text-gray-700 hover:text-black"
          >
            <FiMenu className="w-6 h-6" />
          </button>

          {/* Logo */}
          <Link to="/">
            <img src={assets.as_denim_logo} alt="Logo" className="h-10 w-10" />
          </Link>
        </div>

        {/* Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-black"
          >
            <span>{user?.name || "Admin"}</span>
            <FiChevronDown className="w-5 h-5" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white rounded-md shadow-lg overflow-hidden">
              <Link
                to="/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <FiUser className="mr-2" /> Profil
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <FiLogOut className="mr-2" /> Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
