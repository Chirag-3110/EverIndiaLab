import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSidebar } from "../context/SidebarContext";
import { User, Warehouse } from "lucide-react";

const AppHeader: React.FC = () => {
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const navigate = useNavigate();

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-800">
      <div className="flex items-center justify-between px-6 py-3 lg:py-4">
        {/* Sidebar Toggle */}
        <button
          onClick={handleToggle}
          className="flex items-center justify-center w-10 h-10 text-gray-500 border border-gray-200 rounded-lg lg:flex dark:border-gray-800 dark:text-gray-400"
          aria-label="Toggle Sidebar"
        >
          {isMobileOpen ? (
            <span className="text-xl font-bold">✕</span>
          ) : (
            <span className="text-2xl font-bold">☰</span>
          )}
        </button>

        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 text-[#07868D] font-bold text-xl"
        >
          {/* <Warehouse className="h-6 w-6 text-[#07868D]" /> */}
          {/* Show text only on small screens */}
          <span className="lg:hidden">PathLab Admin</span>
        </Link>

        {/* Profile Icon */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/profile-management")}
            className="flex items-center justify-center w-10 h-10 text-white bg-[#07868D] rounded-full hover:opacity-90 transition"
            title="Profile"
          >
            <User className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
