import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSidebar } from "../context/SidebarContext";
import { Badge, BellIcon, User, Warehouse } from "lucide-react";
import { useGetnotificationQuery } from "../redux/api/notificationApi";
import NotificationsModal from "../components/NotificationsModal/NotificationsModal";

const AppHeader: React.FC = () => {
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const navigate = useNavigate();
    const [open, setOpen] = useState(false);

  const { data, isLoading } = useGetnotificationQuery({});
  const notifications = data?.response?.notifications || [];
  const unseenCount =
    notifications?.filter((n) => n.status === "unseen").length || 0;

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
          <div style={{ position: "relative", display: "inline-block" }}>
            <div
              className="border px-1.5 py-1.5 rounded-md cursor-pointer"
              onClick={() => setOpen(true)}
              style={{ position: "relative", fontSize: 20 }}
            >
              <BellIcon style={{ fontSize: 20 }} />

              {/* Custom red badge */}
              {unseenCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: 2,
                    right: 2,
                    backgroundColor: "red",
                    borderRadius: "50%",
                    width: 16,
                    height: 16,
                    color: "white",
                    fontSize: 10,
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    pointerEvents: "none",
                    userSelect: "none",
                  }}
                >
                  {unseenCount}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => navigate("/profile-management")}
            className="flex items-center justify-center w-10 h-10 text-white bg-[#07868D] rounded-full hover:opacity-90 transition"
            title="Profile"
          >
            <User className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>
      <NotificationsModal open={open} onClose={() => setOpen(false)} />
    </header>
  );
};

export default AppHeader;
