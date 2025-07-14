import { useState, useRef, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import { FiChevronDown, FiUser, FiLogOut, FiMenu } from "react-icons/fi";
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
    <nav className="fixed top-0 left-0 right-0 z-30 bg-white border-b border-slate-200 h-16 md:left-64">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between md:justify-end">
        <button
          onClick={() => setIsSidebarOpen((prev) => !prev)}
          className="md:hidden p-2 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Toggle sidebar"
        >
          <FiMenu className="w-6 h-6" />
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-full p-1 pr-2"
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
          >
            <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white font-semibold ring-2 ring-white">
              {userName.charAt(0).toUpperCase()}
            </span>
            <span className="hidden sm:inline">{userName}</span>
            <FiChevronDown
              className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
                dropdownOpen ? "transform rotate-180" : ""
              }`}
            />
          </button>

          {dropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden origin-top-right"
              role="menu"
            >
              <div className="py-1" role="none">
                <Link
                  to="/profil"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                  role="menuitem"
                >
                  <FiUser className="mr-3 h-5 w-5 text-slate-400" />
                  Profil
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setDropdownOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700"
                  role="menuitem"
                >
                  <FiLogOut className="mr-3 h-5 w-5" />
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
