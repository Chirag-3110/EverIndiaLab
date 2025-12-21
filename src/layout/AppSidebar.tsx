import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  File,
  Grid2X2Icon,
  NotebookPenIcon,
  NotebookTextIcon,
  Package2,
  TablePropertiesIcon,
  UsersRound,
  UsersRoundIcon,
} from "lucide-react";

import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const navItems: any = [
  {
    name: "Dashboard",
    path: "/",
    icon: <Grid2X2Icon />,
    permission: "view-dashboard",
  },
  // {
  //   name: "Category Management",
  //   path: "/category-management",
  //   icon: <TablePropertiesIcon />,
  //   permission: "manage-category",
  // },
  {
    icon: <File />,
    name: "Create Booking",
    path: "/manual-booking",
    permission: "manualbookings",
  },
  {
    name: "Phlebotomist",
    path: "/staff",
    icon: <UsersRound />,
    permission: "manage-phlebotomist",
  },
  {
    name: "Staff",
    path: "/employee-staff",
    icon: <UsersRound />,
    permission: "manage-staff",
  },

  {
    name: "Package Management",
    icon: <Package2 />,
    permission: "manage-package",
    subItems: [{ name: "Packages", path: "/packages" }],
  },
  {
    name: "Test Management",
    icon: <NotebookPenIcon />,
    permission: "manage-test",
    subItems: [{ name: "Test", path: "/test-form" }],
  },
  {
    name: "Booking Management",
    icon: <NotebookTextIcon />,
    permission: "manage-bookings",
    subItems: [{ name: "Booking", path: "/booking-list" }],
  },
  {
    name: "Inquiry",
    path: "/inquiry",
    icon: <UsersRoundIcon />,
    permission: "manage-inquiry",
  },
];

export default function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, accessPermissions } = useAuth();
  const { isExpanded, isHovered, isMobileOpen, setIsHovered } = useSidebar();
  const [openMenu, setOpenMenu] = useState(null);

  const isOwner = accessPermissions.length === 0;

  const permittedItems = isOwner
    ? navItems
    : navItems.filter(
        (item) =>
          !item.permission || accessPermissions.includes(item.permission)
      );

  const isActive = (path) => path && location.pathname === path;

  /** Auto-open sub menu if current route matches */
  useEffect(() => {
    permittedItems.forEach((item, i) => {
      if (item.subItems?.some((s) => isActive(s.path))) {
        setOpenMenu(i);
      }
    });
  }, [location.pathname]);

  /** Redirect if route is not permitted */
  useEffect(() => {
    if (isOwner) return;

    const allowed = permittedItems.flatMap((i) =>
      i.subItems ? i.subItems.map((s) => s.path) : i.path
    );

    const isAllowedRoute = allowed.some((allowedPath) =>
      location.pathname.startsWith(allowedPath)
    );

    if (!isAllowedRoute) {
      const first = permittedItems[0];
      const firstPath = first?.subItems?.[0]?.path || first?.path;
      if (firstPath) navigate(firstPath, { replace: true });
    }
  }, [permittedItems, isOwner]);

  const toggleMenu = (index) => {
    if (openMenu === index) return setOpenMenu(null);
    setOpenMenu(index);

    const item = permittedItems[index];
    if (item.subItems) navigate(item.subItems[0].path);
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out Successfully!");
    navigate("/signin");
  };

  const sidebarOpen = isExpanded || isHovered || isMobileOpen;

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-white dark:bg-gray-900 border-r transition-all duration-300 z-50
      ${sidebarOpen ? "w-[290px]" : "w-[90px]"}
      ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* FULL FLEX LAYOUT */}
      <div className="flex flex-col h-full">
        {/* LOGO */}
        <div className="py-6 px-4">
          {sidebarOpen ? (
            <img src="/logo.png" className="w-[180px]" />
          ) : (
            <img src="/lo.png" className="w-[40px]" />
          )}
        </div>

        {/* MENU SCROLLABLE AREA */}
        <nav className="px-4 flex-1 overflow-y-auto no-scrollbar">
          <h2 className="text-xs uppercase text-gray-400 mb-4">
            {sidebarOpen ? "Menu" : "..."}
          </h2>

          <ul className="space-y-3">
            {permittedItems.map((item, index) => (
              <li key={index}>
                {item.subItems ? (
                  <>
                    {/* Parent Item */}
                    <button
                      onClick={() => toggleMenu(index)}
                      className={`menu-item group ${
                        openMenu === index
                          ? "menu-item-active"
                          : "menu-item-inactive"
                      }`}
                    >
                      <span className="menu-item-icon-size">{item.icon}</span>
                      {sidebarOpen && <span>{item.name}</span>}
                      {sidebarOpen && (
                        <ChevronDown
                          className={`ml-auto transition-transform ${
                            openMenu === index ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </button>

                    {/* Dropdown */}
                    {sidebarOpen && (
                      <ul
                        className={`ml-10 mt-2 space-y-1 transition-all overflow-hidden ${
                          openMenu === index ? "max-h-[500px]" : "max-h-0"
                        }`}
                      >
                        {item.subItems.map((sub) => (
                          <li key={sub.path}>
                            <Link
                              to={sub.path}
                              className={`menu-dropdown-item ${
                                isActive(sub.path)
                                  ? "menu-dropdown-item-active"
                                  : "menu-dropdown-item-inactive"
                              }`}
                            >
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link
                    to={item.path}
                    className={`menu-item group ${
                      isActive(item.path)
                        ? "menu-item-active"
                        : "menu-item-inactive"
                    }`}
                  >
                    <span className="menu-item-icon-size">{item.icon}</span>
                    {sidebarOpen && <span>{item.name}</span>}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* LOGOUT ALWAYS AT BOTTOM */}
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className={`menu-item w-full border rounded-lg hover:bg-red-500 hover:text-white transition 
            ${sidebarOpen ? "justify-start" : "justify-center"}`}
          >
            <span className="menu-item-icon-size">
              <svg
                className="size-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15" />
                <path d="M18 9l3 3m0 0l-3 3m3-3H9" />
              </svg>
            </span>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
