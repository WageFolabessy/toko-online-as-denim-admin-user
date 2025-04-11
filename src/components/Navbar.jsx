import { useState, useRef, useEffect, useContext } from "react";
import PropTypes from "prop-types";
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

  const userName = user?.name || "Admin";

  return (
    <nav className="fixed top-0 w-full z-50 bg-indigo-900 shadow-lg h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            className="md:hidden mr-3 p-2 rounded-md text-red-400 hover:text-red-300 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500" // Focus ring merah
            aria-label="Toggle sidebar"
          >
            <FiMenu className="w-6 h-6" />
          </button>

          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center">
            <img
              src={assets.as_denim_logo}
              alt="Logo Perusahaan"
              className="h-8 w-auto"
            />
            {/* <span className="text-white font-bold ml-2 text-xl hidden sm:block">AS Denim</span> */}
          </Link>
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 text-sm font-medium text-indigo-100 hover:text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-900 focus:ring-white rounded-full p-1 pr-2"
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
          >
            <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-red-600 text-white font-semibold ring-2 ring-white">
              {userName.charAt(0).toUpperCase()}
            </span>
            <span className="hidden sm:inline">{userName}</span>
            <FiChevronDown
              className={`w-5 h-5 transition-transform duration-200 ${
                dropdownOpen ? "transform rotate-180" : ""
              }`}
            />
          </button>

          {/* Konten Dropdown */}
          {dropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-48 bg-indigo-800 rounded-md shadow-xl ring-1 ring-black ring-opacity-5 overflow-hidden origin-top-right"
              role="menu"
              aria-orientation="vertical"
            >
              <div className="py-1" role="none">
                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center w-full px-4 py-2 text-sm text-indigo-100 hover:bg-indigo-600 hover:text-white"
                  role="menuitem"
                >
                  <FiUser
                    className="mr-3 h-5 w-5 text-indigo-300"
                    aria-hidden="true"
                  />
                  Profil
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setDropdownOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-red-600 hover:text-white"
                  role="menuitem"
                >
                  <FiLogOut
                    className="mr-3 h-5 w-5 text-red-500"
                    aria-hidden="true"
                  />
                  Keluar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

Navbar.propTypes = {
  setIsSidebarOpen: PropTypes.func.isRequired,
};

export default Navbar;
